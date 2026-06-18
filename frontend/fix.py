import re
file_path = 'C:/Users/Ara/RESUMEFORGE/frontend/src/components/ResumeTemplates.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace(
    "style={{overflowWrap:'break-word', wordBreak:'break-word'}}",
    "style={{overflowWrap:'break-word', wordBreak:'break-word', whiteSpace:'pre-wrap'}}"
)

text = text.replace(
    "style={{overflowWrap:'break-word'}}",
    "style={{overflowWrap:'break-word', whiteSpace:'pre-wrap'}}"
)

text = text.replace(
    "border-slate-200 mt-1",
    "border-slate-200 mt-2"
)

text = text.replace(
    "border-orange-200 text-slate-700\"",
    "border-orange-200 text-slate-700 mt-2\""
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)

print('Done')
