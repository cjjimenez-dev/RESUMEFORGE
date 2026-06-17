from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from io import BytesIO
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_TAB_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

from .database import get_db
from .models import Resume, User
from .auth import get_current_user

router = APIRouter(prefix="/api/resumes", tags=["export"])

# Helper function to add horizontal rule (divider line) in docx
def add_horizontal_rule(paragraph, color_hex="CCCCCC"):
    pPr = paragraph._p.get_or_add_pPr()
    pBdr = parse_xml(f'<w:pBdr {nsdecls("w")}><w:bottom w:val="single" w:sz="6" w:space="4" w:color="{color_hex}"/></w:pBdr>')
    pPr.append(pBdr)

# Helper function to convert HEX color string to RGBColor
def hex_to_rgb(hex_str):
    hex_str = hex_str.lstrip('#')
    return RGBColor(int(hex_str[0:2], 16), int(hex_str[2:4], 16), int(hex_str[4:6], 16))

@router.get("/{resume_id}/export/docx")
def export_docx(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Extract content
    content = resume.content or {}
    personal_info = content.get("personal_info", {})
    experience = content.get("experience", [])
    education = content.get("education", [])
    projects = content.get("projects", [])
    skills = content.get("skills", [])
    
    # Create Document
    doc = Document()
    
    # Set page margins
    for section in doc.sections:
        section.top_margin = Inches(0.75)
        section.bottom_margin = Inches(0.75)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)

    # Determine styles based on template
    template = resume.template_name or "classic"
    
    if template == "modern":
        font_name = "Calibri"
        primary_color_hex = "2B6CB0" # Slate Blue
        text_color_hex = "2D3748"    # Dark Gray
    elif template == "creative":
        font_name = "Arial"
        primary_color_hex = "0D9488" # Teal
        text_color_hex = "1F2937"    # Graphite
    else: # "classic" or default
        font_name = "Times New Roman"
        primary_color_hex = "1A365D" # Deep Navy
        text_color_hex = "111827"    # Jet Black
        
    primary_color = hex_to_rgb(primary_color_hex)
    text_color = hex_to_rgb(text_color_hex)
    
    # Configure default style font
    style = doc.styles['Normal']
    font = style.font
    font.name = font_name
    font.size = Pt(11)
    font.color.rgb = text_color
    
    # --- 1. PERSONAL INFO HEADER ---
    name = personal_info.get("full_name", "") or "Your Name"
    title = personal_info.get("title", "")
    
    # Add Name
    name_p = doc.add_paragraph()
    name_p.alignment = WD_TAB_ALIGNMENT.CENTER if template == "classic" else WD_TAB_ALIGNMENT.LEFT
    name_run = name_p.add_run(name)
    name_run.bold = True
    name_run.size = Pt(22)
    name_run.font.color.rgb = primary_color
    name_p.paragraph_format.space_after = Pt(2)
    
    # Add Professional Headline
    if title:
        title_p = doc.add_paragraph()
        title_p.alignment = WD_TAB_ALIGNMENT.CENTER if template == "classic" else WD_TAB_ALIGNMENT.LEFT
        title_run = title_p.add_run(title)
        title_run.italic = True
        title_run.size = Pt(12)
        title_run.font.color.rgb = hex_to_rgb("4A5568")
        title_p.paragraph_format.space_after = Pt(8)
        
    # Add Contact Information
    contact_parts = []
    
    email = personal_info.get("email", "")
    phone = personal_info.get("phone", "")
    location = personal_info.get("location", "")
    website = personal_info.get("website", "")
    linkedin = personal_info.get("linkedin", "")
    github = personal_info.get("github", "")
    
    if email: contact_parts.append(email)
    if phone: contact_parts.append(phone)
    if location: contact_parts.append(location)
    if website: contact_parts.append(website)
    if linkedin: contact_parts.append(linkedin)
    if github: contact_parts.append(github)
    
    # Join with separator
    contact_text = "  |  ".join(contact_parts)
    if contact_text:
        contact_p = doc.add_paragraph()
        contact_p.alignment = WD_TAB_ALIGNMENT.CENTER if template == "classic" else WD_TAB_ALIGNMENT.LEFT
        contact_run = contact_p.add_run(contact_text)
        contact_run.size = Pt(9.5)
        contact_run.font.color.rgb = hex_to_rgb("4A5568")
        contact_p.paragraph_format.space_after = Pt(18)
        
    # Helper to add section headings
    def add_section_heading(title_text):
        heading_p = doc.add_paragraph()
        heading_p.paragraph_format.space_before = Pt(16)
        heading_p.paragraph_format.space_after = Pt(6)
        heading_run = heading_p.add_run(title_text.upper())
        heading_run.bold = True
        heading_run.size = Pt(13)
        heading_run.font.color.rgb = primary_color
        add_horizontal_rule(heading_p, primary_color_hex)
        
    # --- 2. SUMMARY ---
    summary = personal_info.get("summary", "")
    if summary:
        add_section_heading("Professional Summary")
        summary_p = doc.add_paragraph(summary)
        summary_p.paragraph_format.space_after = Pt(10)
        summary_p.paragraph_format.line_spacing = 1.15
        
    # --- 3. EXPERIENCE ---
    if experience:
        add_section_heading("Work Experience")
        for exp in experience:
            job_title = exp.get("job_title", "")
            company = exp.get("company", "")
            location_exp = exp.get("location", "")
            start = exp.get("start_date", "")
            end = exp.get("end_date", "Present") if not exp.get("current") else "Present"
            desc = exp.get("description", "")
            
            # Job Header (Job Title | Company    Dates / Location)
            job_p = doc.add_paragraph()
            # Set up right tab stop for date/location
            job_p.paragraph_format.tab_stops.add_tab_stop(Inches(7.0), WD_TAB_ALIGNMENT.RIGHT)
            job_p.paragraph_format.space_before = Pt(6)
            job_p.paragraph_format.space_after = Pt(2)
            
            title_part = f"{job_title}"
            title_run = job_p.add_run(title_part)
            title_run.bold = True
            
            company_part = ""
            if company:
                company_part += f" at {company}"
            job_p.add_run(company_part)
            
            # Tab to align dates/location to the right
            date_location_parts = []
            if start or end:
                date_location_parts.append(f"{start} - {end}")
            if location_exp:
                date_location_parts.append(location_exp)
            
            date_location_text = ", ".join(date_location_parts)
            job_p.add_run(f"\t{date_location_text}")
            
            # Description as bullet points or block paragraph
            if desc:
                # If there are newlines, split them into bullet points
                lines = desc.split("\n")
                for line in lines:
                    line_stripped = line.strip()
                    if not line_stripped:
                        continue
                    # Remove leading dash/bullet if user wrote them manually
                    if line_stripped.startswith("-") or line_stripped.startswith("•"):
                        line_stripped = line_stripped[1:].strip()
                    
                    bullet_p = doc.add_paragraph(style='List Bullet')
                    bullet_run = bullet_p.add_run(line_stripped)
                    bullet_p.paragraph_format.space_before = Pt(0)
                    bullet_p.paragraph_format.space_after = Pt(2)
                    bullet_p.paragraph_format.line_spacing = 1.1
                    
    # --- 4. EDUCATION ---
    if education:
        add_section_heading("Education")
        for edu in education:
            degree = edu.get("degree", "")
            school = edu.get("school", "")
            loc = edu.get("location", "")
            start = edu.get("start_date", "")
            end = edu.get("end_date", "")
            gpa = edu.get("gpa", "")
            edu_desc = edu.get("description", "")
            
            edu_p = doc.add_paragraph()
            edu_p.paragraph_format.tab_stops.add_tab_stop(Inches(7.0), WD_TAB_ALIGNMENT.RIGHT)
            edu_p.paragraph_format.space_before = Pt(6)
            edu_p.paragraph_format.space_after = Pt(2)
            
            deg_run = edu_p.add_run(degree)
            deg_run.bold = True
            
            school_part = f" - {school}" if school else ""
            edu_p.add_run(school_part)
            
            date_loc_parts = []
            if start or end:
                date_loc_parts.append(f"{start} - {end}")
            if loc:
                date_loc_parts.append(loc)
            date_loc_text = ", ".join(date_loc_parts)
            
            edu_p.add_run(f"\t{date_loc_text}")
            
            # Additional details (GPA, description)
            detail_parts = []
            if gpa:
                detail_parts.append(f"GPA: {gpa}")
            if edu_desc:
                detail_parts.append(edu_desc)
                
            if detail_parts:
                detail_p = doc.add_paragraph()
                detail_p.paragraph_format.space_before = Pt(0)
                detail_p.paragraph_format.space_after = Pt(4)
                detail_run = detail_p.add_run("; ".join(detail_parts))
                detail_run.size = Pt(9.5)
                detail_run.font.color.rgb = hex_to_rgb("4A5568")

    # --- 5. PROJECTS ---
    if projects:
        add_section_heading("Projects")
        for proj in projects:
            p_title = proj.get("title", "")
            role = proj.get("role", "")
            link = proj.get("link", "")
            p_desc = proj.get("description", "")
            
            proj_p = doc.add_paragraph()
            proj_p.paragraph_format.tab_stops.add_tab_stop(Inches(7.0), WD_TAB_ALIGNMENT.RIGHT)
            proj_p.paragraph_format.space_before = Pt(6)
            proj_p.paragraph_format.space_after = Pt(2)
            
            title_run = proj_p.add_run(p_title)
            title_run.bold = True
            
            if role:
                proj_p.add_run(f" ({role})")
                
            if link:
                proj_p.add_run(f"\t{link}")
                
            if p_desc:
                lines = p_desc.split("\n")
                for line in lines:
                    line_stripped = line.strip()
                    if not line_stripped:
                        continue
                    if line_stripped.startswith("-") or line_stripped.startswith("•"):
                        line_stripped = line_stripped[1:].strip()
                    
                    p_bullet = doc.add_paragraph(style='List Bullet')
                    p_bullet.add_run(line_stripped)
                    p_bullet.paragraph_format.space_before = Pt(0)
                    p_bullet.paragraph_format.space_after = Pt(2)
                    p_bullet.paragraph_format.line_spacing = 1.1

    # --- 6. SKILLS ---
    if skills:
        add_section_heading("Skills")
        
        # Group skills by category
        grouped_skills = {}
        for skill in skills:
            cat = skill.get("category", "") or "General"
            name = skill.get("name", "")
            if not name:
                continue
            if cat not in grouped_skills:
                grouped_skills[cat] = []
            grouped_skills[cat].append(name)
            
        for cat, names in grouped_skills.items():
            skill_p = doc.add_paragraph()
            skill_p.paragraph_format.space_after = Pt(4)
            skill_p.paragraph_format.line_spacing = 1.15
            
            cat_run = skill_p.add_run(f"{cat}: ")
            cat_run.bold = True
            
            skill_p.add_run(", ".join(names))
            
    # Save document to BytesIO
    file_stream = BytesIO()
    doc.save(file_stream)
    file_stream.seek(0)
    
    filename = f"{name.replace(' ', '_')}_Resume.docx"
    
    return StreamingResponse(
        file_stream,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
