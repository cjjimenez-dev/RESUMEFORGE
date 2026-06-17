from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from io import BytesIO
from typing import Optional
import re

from .auth import get_current_user
from .models import User

router = APIRouter(prefix="/api", tags=["parse"])

# ─── Text Extraction ──────────────────────────────────────────────────────────

def extract_text_pdf(content: bytes) -> str:
    try:
        from pypdf import PdfReader
        reader = PdfReader(BytesIO(content))
        parts = []
        for page in reader.pages:
            txt = page.extract_text()
            if txt:
                parts.append(txt)
        return "\n".join(parts)
    except Exception as e:
        raise HTTPException(400, detail=f"Cannot read PDF: {str(e)}")


def extract_text_docx(content: bytes) -> str:
    try:
        from docx import Document
        doc = Document(BytesIO(content))
        return "\n".join(p.text for p in doc.paragraphs)
    except Exception as e:
        raise HTTPException(400, detail=f"Cannot read DOCX: {str(e)}")


# ─── Regex Patterns ──────────────────────────────────────────────────────────

EMAIL_RE    = re.compile(r'[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}')
PHONE_RE    = re.compile(r'(\+?\d[\d\s\-().]{5,13}\d)')
LINKEDIN_RE = re.compile(r'linkedin\.com/in/[\w\-]+', re.I)
GITHUB_RE   = re.compile(r'github\.com/[\w\-]+', re.I)
URL_RE      = re.compile(r'https?://[\S]+|www\.[\S]+', re.I)

DATE_RANGE_RE = re.compile(
    r'(?:'
        r'(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|'
        r'Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)'
        r'\.?\s*\d{4}|\d{4}'
    r')'
    r'\s*[-–—to]+\s*'
    r'(?:'
        r'(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|'
        r'Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)'
        r'\.?\s*\d{4}|\d{4}|[Pp]resent|[Cc]urrent|[Nn]ow'
    r')',
    re.I
)

SECTION_MAP = {
    'summary':    ['summary', 'profile', 'about', 'objective', 'professional summary',
                   'career objective', 'overview', 'about me'],
    'experience': ['experience', 'work experience', 'employment', 'employment history',
                   'work history', 'professional experience', 'career history', 'relevant experience'],
    'education':  ['education', 'academic background', 'qualifications', 'academic', 'schooling', 'degrees'],
    'skills':     ['skills', 'technical skills', 'competencies', 'technologies', 'tools',
                   'capabilities', 'tech stack', 'core skills', 'key skills', 'proficiencies'],
    'projects':   ['projects', 'personal projects', 'portfolio', 'selected works', 'side projects', 'key projects'],
}


# ─── Section Splitting ───────────────────────────────────────────────────────

def detect_section(line: str) -> Optional[str]:
    cleaned = line.strip().lower().rstrip(':').strip()
    if len(cleaned) > 45:
        return None
    for key, aliases in SECTION_MAP.items():
        for alias in aliases:
            if cleaned == alias or cleaned == alias + 's':
                return key
    return None


def split_sections(lines: list[str]) -> dict:
    buckets: dict = {k: [] for k in SECTION_MAP}
    buckets['header'] = []
    current = 'header'
    for line in lines:
        sec = detect_section(line)
        if sec:
            current = sec
        else:
            buckets[current].append(line)
    return buckets


# ─── Contact Info Extraction ─────────────────────────────────────────────────

def extract_contact(header_lines: list[str], full_text: str) -> dict:
    info = dict(full_name='', title='', email='', phone='', location='',
                website='', linkedin='', github='', summary='')
    search = full_text[:3000]

    m = EMAIL_RE.search(search)
    if m:
        info['email'] = m.group()

    m = PHONE_RE.search(search)
    if m:
        cand = m.group().strip()
        if 7 <= len(re.sub(r'\D', '', cand)) <= 15:
            info['phone'] = cand

    m = LINKEDIN_RE.search(search)
    if m:
        info['linkedin'] = m.group()

    m = GITHUB_RE.search(search)
    if m:
        info['github'] = m.group()

    # Name: first short line without contact fragments
    for line in header_lines[:6]:
        line = line.strip()
        if not line:
            continue
        if EMAIL_RE.search(line) or PHONE_RE.search(line):
            continue
        if LINKEDIN_RE.search(line) or GITHUB_RE.search(line) or URL_RE.search(line):
            continue
        if 2 < len(line) < 65 and not line.startswith('|') and not line.startswith('#'):
            info['full_name'] = line
            break

    # Title: next qualifying line after name
    if info['full_name']:
        past_name = False
        for line in header_lines[:10]:
            line = line.strip()
            if not line:
                continue
            if line == info['full_name']:
                past_name = True
                continue
            if past_name:
                if not EMAIL_RE.search(line) and not PHONE_RE.search(line) and not URL_RE.search(line):
                    if 3 < len(line) < 80:
                        info['title'] = line
                        break

    # Location: City, ST or City, Country pattern
    loc_re = re.compile(r'[A-Z][a-zA-Z\s\-]+,\s*(?:[A-Z]{2}|[A-Z][a-z]+(?:\s[A-Z][a-z]+)?)')
    for line in header_lines[:12]:
        m = loc_re.search(line)
        if m and not EMAIL_RE.search(line):
            info['location'] = m.group().strip()
            break

    # Website (non-linkedin/github URL)
    for line in header_lines[:12]:
        m = URL_RE.search(line)
        if m:
            url = m.group()
            if 'linkedin' not in url.lower() and 'github' not in url.lower():
                info['website'] = url
                break

    return info


# ─── Experience ───────────────────────────────────────────────────────────────

def parse_experience(lines: list[str]) -> list[dict]:
    entries = []
    cur = None
    bullets: list[str] = []

    def flush():
        nonlocal cur, bullets
        if cur:
            cur['description'] = '\n'.join(f'• {b}' for b in bullets if b).strip()
            entries.append(cur)
        cur = None
        bullets = []

    for line in lines:
        line = line.strip()
        if not line:
            continue

        dr = DATE_RANGE_RE.search(line)
        if dr:
            flush()
            date_str = dr.group()
            parts = re.split(r'\s*[-–—to]+\s*', date_str, 1)
            start = parts[0].strip() if parts else ''
            end   = parts[1].strip() if len(parts) > 1 else ''
            is_cur = bool(re.search(r'present|current|now', end, re.I))

            rest = line.replace(date_str, ' ').strip(' ·|•–—')
            seg  = [s.strip() for s in re.split(r'\s*[|·•–—]\s*', rest) if s.strip()]
            cur = {
                'job_title':  seg[0] if seg else '',
                'company':    seg[1] if len(seg) > 1 else '',
                'location':   seg[2] if len(seg) > 2 else '',
                'start_date': start,
                'end_date':   'Present' if is_cur else end,
                'current':    is_cur,
                'description': ''
            }
        elif cur:
            clean = line.lstrip('•·▪▸►-–— ').strip()
            if not cur['company'] and len(line) < 60 and not line.startswith(('•', '·', '-')):
                cur['company'] = line
            elif clean:
                bullets.append(clean)

    flush()
    return entries


# ─── Education ────────────────────────────────────────────────────────────────

def parse_education(lines: list[str]) -> list[dict]:
    entries = []
    cur = None

    def flush():
        nonlocal cur
        if cur:
            entries.append(cur)
        cur = None

    for line in lines:
        line = line.strip()
        if not line:
            continue

        dr = DATE_RANGE_RE.search(line)
        yr = re.search(r'\b(19|20)\d{2}\b', line)

        if dr or yr:
            flush()
            date_str = dr.group() if dr else (yr.group() if yr else '')
            parts = re.split(r'\s*[-–—to]+\s*', date_str, 1)
            start = parts[0].strip() if parts else ''
            end   = parts[1].strip() if len(parts) > 1 else ''

            rest = line.replace(date_str, ' ').strip(' ·|•–—')
            seg  = [s.strip() for s in re.split(r'\s*[|·•–—]\s*', rest) if s.strip()]

            gpa_m = re.search(r'GPA[:\s]+(\d[\.\d]+(?:/\d[\.\d]+)?)', line, re.I)
            cur = {
                'degree':      seg[0] if seg else '',
                'school':      seg[1] if len(seg) > 1 else '',
                'location':    seg[2] if len(seg) > 2 else '',
                'start_date':  start,
                'end_date':    end,
                'gpa':         gpa_m.group(1) if gpa_m else '',
                'description': ''
            }
        elif cur:
            if not cur['school'] and len(line) < 80:
                cur['school'] = line
            elif not cur['description']:
                cur['description'] = line

    flush()
    return entries


# ─── Skills ───────────────────────────────────────────────────────────────────

def parse_skills(lines: list[str]) -> list[dict]:
    result = []
    for line in lines:
        line = line.strip()
        if not line:
            continue
        # "Category: skill1, skill2, skill3"
        m = re.match(r'^([^:]{2,35}):\s*(.+)$', line)
        if m:
            cat = m.group(1).strip()
            for name in re.split(r'[,|•·/]+', m.group(2)):
                name = name.strip().lstrip('-•·').strip()
                if 1 < len(name) < 40:
                    result.append({'name': name, 'category': cat})
        else:
            for name in re.split(r'[,|•·/]+', line):
                name = name.strip().lstrip('-•·').strip()
                if 1 < len(name) < 40:
                    result.append({'name': name, 'category': 'General'})
    return result


# ─── Projects ─────────────────────────────────────────────────────────────────

def parse_projects(lines: list[str]) -> list[dict]:
    entries = []
    cur = None
    bullets: list[str] = []

    def flush():
        nonlocal cur, bullets
        if cur:
            cur['description'] = '\n'.join(f'• {b}' for b in bullets if b).strip()
            entries.append(cur)
        cur = None
        bullets = []

    for line in lines:
        line = line.strip()
        if not line:
            continue
        is_bullet = line.startswith(('•', '·', '▪', '-', '–'))
        clean = line.lstrip('•·▪▸►-–— ').strip()

        if not is_bullet and len(line) < 70:
            flush()
            seg  = [s.strip() for s in re.split(r'\s*[|·•–—]\s*', line) if s.strip()]
            link = next((s for s in seg if 'github' in s.lower() or 'http' in s.lower() or '.com/' in s.lower()), '')
            cur  = {'title': seg[0] if seg else line, 'role': seg[1] if len(seg) > 1 else '', 'link': link, 'description': ''}
        elif cur:
            bullets.append(clean)

    flush()
    return entries


# ─── Endpoint ────────────────────────────────────────────────────────────────

@router.post("/parse-resume")
async def parse_resume_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    fname   = (file.filename or '').lower()
    content = await file.read()

    if fname.endswith('.pdf'):
        text = extract_text_pdf(content)
    elif fname.endswith('.docx'):
        text = extract_text_docx(content)
    else:
        raise HTTPException(400, detail="Only PDF (.pdf) and Word (.docx) files are supported.")

    if not text.strip():
        raise HTTPException(400, detail="No readable text found — the file may be scanned or image-based.")

    lines   = [l.strip() for l in text.splitlines() if l.strip()]
    buckets = split_sections(lines)

    personal = extract_contact(buckets['header'], text)

    if buckets.get('summary'):
        personal['summary'] = ' '.join(buckets['summary'][:10])

    experience = parse_experience(buckets.get('experience', []))
    education  = parse_education(buckets.get('education',  []))
    skills     = parse_skills(buckets.get('skills',    []))
    projects   = parse_projects(buckets.get('projects',  []))

    name = personal.get('full_name') or 'Imported'
    return {
        'personal_info':   personal,
        'experience':      experience,
        'education':       education,
        'skills':          skills,
        'projects':        projects,
        'suggested_title': f"{name}'s Resume",
    }
