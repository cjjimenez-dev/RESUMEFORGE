import React from 'react';

// ==========================================
// TEMPLATE COMPONENT 1: CLASSIC PROFESSIONAL
// ==========================================
export function ClassicTemplate({ content }) {
  const info = content?.personal_info || {};
  const experience = content?.experience || [];
  const education = content?.education || [];
  const projects = content?.projects || [];
  const skills = content?.skills || [];


  const imgSize = info.image_size || 'medium';
  const sizeClass = imgSize === 'small' ? 'w-20 h-20' : imgSize === 'large' ? 'w-36 h-36' : 'w-28 h-28';
  const imgPos = info.image_position || 'center';
  const imgShape = info.image_shape || 'circle';
  const shapeClass = imgShape === 'square' ? 'rounded-md' : 'rounded-full';

  return (
    <div className="font-serif bg-white text-slate-900 p-10 min-h-full w-full">
      <div className="flex justify-between items-center border-b-2 border-slate-900 pb-4 mb-6">
        <div className="flex-1 flex justify-start">
          {info.image && imgPos === 'left' && (
            <div className={`${sizeClass} ${shapeClass} overflow-hidden border-2 border-slate-300 shrink-0`}>
              <img src={info.image} alt="Profile" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
        <div className="shrink-0 flex flex-col items-center text-center px-4">
          {info.image && imgPos === 'center' && (
            <div className={`${sizeClass} ${shapeClass} overflow-hidden mb-3 border-2 border-slate-300 shrink-0`}>
              <img src={info.image} alt="Profile" className="w-full h-full object-cover" />
            </div>
          )}
          <h1 className="text-4xl font-bold uppercase tracking-widest text-slate-900 mb-1">{info.full_name || "Your Name"}</h1>
          {info.title && <div className="text-lg text-slate-700 tracking-wide mb-2">{info.title}</div>}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-slate-600 text-center">
            {info.email && <span>{info.email}</span>}
            {info.phone && <span>{info.phone}</span>}
            {info.location && <span>{info.location}</span>}
            {info.website && <span>{info.website}</span>}
            {info.linkedin && <span>{info.linkedin}</span>}
            {info.github && <span>{info.github}</span>}
          </div>
        </div>
        <div className="flex-1 flex justify-end">
          {info.image && imgPos === 'right' && (
            <div className={`${sizeClass} ${shapeClass} overflow-hidden border-2 border-slate-300 shrink-0`}>
              <img src={info.image} alt="Profile" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>

      {info.summary && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b border-slate-300 text-slate-800 mb-2 pb-1 tracking-wider">Professional Summary</h2>
          <div className="text-sm leading-relaxed text-slate-800">{info.summary}</div>
        </div>
      )}

      {experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b border-slate-300 text-slate-800 mb-2 pb-1 tracking-wider">Experience</h2>
          {experience.map((exp, idx) => (
            <div key={idx} className="mb-4">
              <div className="flex justify-between font-bold text-slate-900 text-[15px]">
                <span>{exp.job_title}</span>
                <span className="font-normal text-sm">{exp.start_date} – {exp.current ? 'Present' : exp.end_date}</span>
              </div>
              <div className="flex justify-between text-slate-700 italic text-sm mb-1">
                <span>{exp.company}</span>
                <span>{exp.location}</span>
              </div>
              {exp.description && (
                <div className="text-sm text-slate-800 whitespace-pre-wrap pl-4 border-l-2 border-slate-200 mt-1">
                  {exp.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b border-slate-300 text-slate-800 mb-2 pb-1 tracking-wider">Education</h2>
          {education.map((edu, idx) => (
            <div key={idx} className="mb-3">
              <div className="flex justify-between font-bold text-slate-900 text-[15px]">
                <span>{edu.degree}</span>
                <span className="font-normal text-sm">{edu.start_date} – {edu.end_date}</span>
              </div>
              <div className="flex justify-between text-slate-700 italic text-sm mb-1">
                <span>{edu.school}</span>
                <span>{edu.location}</span>
              </div>
              <div className="text-sm text-slate-600">
                {edu.gpa && <span className="font-semibold text-slate-700">GPA: {edu.gpa} </span>}
                {edu.description && <span> • {edu.description}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {projects.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b border-slate-300 text-slate-800 mb-2 pb-1 tracking-wider">Projects</h2>
          {projects.map((proj, idx) => (
            <div key={idx} className="mb-3">
              <div className="flex justify-between font-bold text-slate-900 text-[15px]">
                <span>{proj.title} {proj.role && <span className="font-normal text-slate-500 italic">({proj.role})</span>}</span>
                {proj.link && <span className="font-normal text-sm text-slate-500">{proj.link}</span>}
              </div>
              {proj.description && (
                <div className="text-sm text-slate-800 whitespace-pre-wrap pl-4 border-l-2 border-slate-200 mt-1">
                  {proj.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b border-slate-300 text-slate-800 mb-2 pb-1 tracking-wider">Skills</h2>
          <div className="flex flex-col gap-1">
            {Object.entries(
              skills.reduce((acc, curr) => {
                const cat = curr.category || 'General';
                if (!acc[cat]) acc[cat] = [];
                if (curr.name) acc[cat].push(curr.name);
                return acc;
              }, {})
            ).map(([cat, list]) => {
              const skillTags = list.flatMap(item => item.split(',').map(s => s.trim()).filter(Boolean));
              return (
                <div key={cat} className="text-sm text-slate-800">
                  <span className="font-bold mr-2 text-slate-900">{cat}:</span> {skillTags.map((tag, i) => (
                    <span key={i} className="inline-block px-2 py-0.5 mr-1 mb-1 bg-slate-100 border border-slate-200 rounded text-xs">{tag}</span>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// TEMPLATE COMPONENT 2: MODERN TWO-COLUMN
// ==========================================
export function ModernTemplate({ content }) {
  const info = content?.personal_info || {};
  const experience = content?.experience || [];
  const education = content?.education || [];
  const projects = content?.projects || [];
  const skills = content?.skills || [];

  const imgSize = info.image_size || 'medium';
  const sizeClass = imgSize === 'small' ? 'w-24 h-24' : imgSize === 'large' ? 'w-40 h-40' : 'w-32 h-32';
  const imgPos = info.image_position || 'center';
  const posClass = imgPos === 'left' ? 'mr-auto' : imgPos === 'right' ? 'ml-auto' : 'mx-auto';
  const imgShape = info.image_shape || 'circle';
  const shapeClass = imgShape === 'square' ? 'rounded-xl' : 'rounded-full';

  return (
    <div 
      className="font-sans grid grid-cols-[280px_1fr] min-h-full w-full"
      style={{ background: 'linear-gradient(to right, #1e293b 0%, #1e293b 280px, white 280px, white 100%)' }}
    >
      {/* Sidebar (Left) */}
      <div className="text-slate-100 p-10 flex flex-col gap-8 break-words print:text-slate-100">
        {info.image && (
          <div className={`${sizeClass} ${shapeClass} overflow-hidden ${posClass} border-4 border-slate-600 shadow-lg shrink-0`}>
            <img src={info.image} alt="Profile" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="text-center">
          <h1 className="text-3xl font-light text-white leading-tight">{info.full_name || "Your Name"}</h1>
          {info.title && <div className="text-orange-400 font-medium tracking-wide mt-2">{info.title}</div>}
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-600 pb-2">Contact</h2>
          <div className="flex flex-col gap-3 text-sm">
            {info.email && <div><div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Email</div><div className="break-words">{info.email}</div></div>}
            {info.phone && <div><div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Phone</div><div>{info.phone}</div></div>}
            {info.location && <div><div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Location</div><div>{info.location}</div></div>}
            {info.website && <div><div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Website</div><div className="break-words">{info.website}</div></div>}
            {info.linkedin && <div><div className="text-xs text-slate-400 uppercase tracking-wider mb-1">LinkedIn</div><div className="break-words">{info.linkedin}</div></div>}
            {info.github && <div><div className="text-xs text-slate-400 uppercase tracking-wider mb-1">GitHub</div><div className="break-words">{info.github}</div></div>}
          </div>
        </div>

        {skills.length > 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-600 pb-2">Skills</h2>
            <div className="flex flex-col gap-4">
              {Object.entries(
                skills.reduce((acc, curr) => {
                  const cat = curr.category || 'General';
                  if (!acc[cat]) acc[cat] = [];
                  if (curr.name) acc[cat].push(curr.name);
                  return acc;
                }, {})
              ).map(([cat, list]) => {
                const skillTags = list.flatMap(item => item.split(',').map(s => s.trim()).filter(Boolean));
                return (
                  <div key={cat} className="text-sm">
                    <div className="text-xs text-orange-400 uppercase tracking-wider mb-2">{cat}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {skillTags.map((tag, i) => (
                        <span key={i} className="px-2 py-1 bg-slate-700/50 text-slate-200 text-[11px] font-medium tracking-wide rounded border border-slate-600/50">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Column (Right) */}
      <div className="p-10 flex flex-col gap-8 text-slate-800">
        {info.summary && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 border-b-2 border-slate-200 pb-2 mb-4 tracking-wide">Profile</h2>
            <div className="text-[15px] leading-relaxed">{info.summary}</div>
          </div>
        )}

        {experience.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 border-b-2 border-slate-200 pb-2 mb-4 tracking-wide">Work Experience</h2>
            <div className="flex flex-col gap-6">
              {experience.map((exp, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-baseline mb-1">
                    <div className="text-[17px] font-bold text-slate-900">{exp.job_title}</div>
                    <div className="text-sm font-medium text-orange-600">{exp.start_date} – {exp.current ? 'Present' : exp.end_date}</div>
                  </div>
                  <div className="flex justify-between text-[15px] text-slate-600 font-medium mb-2">
                    <div>{exp.company}</div>
                    <div>{exp.location}</div>
                  </div>
                  {exp.description && (
                    <div className="text-[14px] leading-relaxed whitespace-pre-wrap pl-4 border-l-2 border-orange-200 text-slate-700">
                      {exp.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {education.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 border-b-2 border-slate-200 pb-2 mb-4 tracking-wide">Education</h2>
            <div className="flex flex-col gap-5">
              {education.map((edu, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-baseline mb-1">
                    <div className="text-[17px] font-bold text-slate-900">{edu.degree}</div>
                    <div className="text-sm font-medium text-orange-600">{edu.start_date} – {edu.end_date}</div>
                  </div>
                  <div className="flex justify-between text-[15px] text-slate-600 font-medium mb-1">
                    <div>{edu.school}</div>
                    <div>{edu.location}</div>
                  </div>
                  <div className="text-[14px] text-slate-500">
                    {edu.gpa && <span className="font-semibold text-slate-700">GPA: {edu.gpa} • </span>}
                    {edu.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {projects.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 border-b-2 border-slate-200 pb-2 mb-4 tracking-wide">Projects</h2>
            <div className="flex flex-col gap-5">
              {projects.map((proj, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-baseline mb-1">
                    <div className="text-[17px] font-bold text-slate-900">{proj.title} {proj.role && <span className="text-slate-500 font-normal text-[15px]">({proj.role})</span>}</div>
                    {proj.link && <div className="text-sm text-orange-600 break-all">{proj.link}</div>}
                  </div>
                  {proj.description && (
                    <div className="text-[14px] leading-relaxed whitespace-pre-wrap pl-4 border-l-2 border-orange-200 text-slate-700 mt-2">
                      {proj.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// TEMPLATE COMPONENT 3: SLEEK CREATIVE
// ==========================================
export function CreativeTemplate({ content }) {
  const info = content?.personal_info || {};
  const experience = content?.experience || [];
  const education = content?.education || [];
  const projects = content?.projects || [];
  const skills = content?.skills || [];

  const imgSize = info.image_size || 'medium';
  const sizeClass = imgSize === 'small' ? 'w-24 h-24' : imgSize === 'large' ? 'w-40 h-40' : 'w-32 h-32';
  const imgPos = info.image_position || 'center';
  const imgShape = info.image_shape || 'circle';
  const shapeClass = imgShape === 'square' ? 'rounded-2xl' : 'rounded-full';

  const getCreativeLayout = () => {
    if (imgPos === 'left') {
      return { container: "mb-10 flex flex-row-reverse justify-end items-center gap-8", textWrapper: "flex-1 text-left", contactWrapper: "flex flex-wrap justify-start gap-4 text-sm font-medium text-slate-500 uppercase tracking-wider" };
    } else if (imgPos === 'right') {
      return { container: "mb-10 flex flex-row justify-between items-center gap-8", textWrapper: "flex-1 text-left", contactWrapper: "flex flex-wrap justify-start gap-4 text-sm font-medium text-slate-500 uppercase tracking-wider" };
    } else {
      return { container: "mb-10 flex flex-col items-center text-center gap-6", textWrapper: "flex flex-col items-center", contactWrapper: "flex flex-wrap justify-center gap-4 text-sm font-medium text-slate-500 uppercase tracking-wider" };
    }
  };
  const layout = getCreativeLayout();

  return (
    <div className="font-display bg-white text-slate-800 p-12 min-h-full w-full">
      <div className={layout.container}>
        <div className={layout.textWrapper}>
          <h1 className="text-5xl font-black tracking-tight text-slate-900 mb-2">{info.full_name || "Your Name"}</h1>
          {info.title && <div className="text-2xl text-teal-600 font-light mb-6">// {info.title}</div>}
          
          <div className={layout.contactWrapper}>
            {info.email && <span>[ {info.email} ]</span>}
            {info.phone && <span>[ {info.phone} ]</span>}
            {info.location && <span>[ {info.location} ]</span>}
            {info.website && <span>[ {info.website} ]</span>}
            {info.linkedin && <span>[ {info.linkedin} ]</span>}
            {info.github && <span>[ {info.github} ]</span>}
          </div>
        </div>
        {info.image && (
          <div className={`${sizeClass} ${shapeClass} overflow-hidden border-4 border-slate-100 shadow-md rotate-3 shrink-0`}>
            <img src={info.image} alt="Profile" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {info.summary && (
        <div className="mb-10">
          <h2 className="text-sm font-bold uppercase tracking-widest text-teal-600 mb-4 border-b-2 border-slate-100 pb-2">01. Summary</h2>
          <div className="text-[15px] leading-relaxed text-slate-700 font-light">{info.summary}</div>
        </div>
      )}

      {experience.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm font-bold uppercase tracking-widest text-teal-600 mb-6 border-b-2 border-slate-100 pb-2">02. Work History</h2>
          <div className="flex flex-col gap-8">
            {experience.map((exp, idx) => (
              <div key={idx} className="grid grid-cols-[180px_1fr] gap-6">
                <div className="text-sm font-medium text-slate-900">
                  {exp.start_date} – {exp.current ? 'Present' : exp.end_date}
                  <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">{exp.location}</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900 leading-tight">{exp.job_title}</div>
                  <div className="text-[15px] text-teal-600 font-medium mb-3">{exp.company}</div>
                  {exp.description && (
                    <div className="text-[14px] leading-relaxed whitespace-pre-wrap text-slate-600 font-light">
                      {exp.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {education.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm font-bold uppercase tracking-widest text-teal-600 mb-6 border-b-2 border-slate-100 pb-2">03. Education</h2>
          <div className="flex flex-col gap-6">
            {education.map((edu, idx) => (
              <div key={idx} className="grid grid-cols-[180px_1fr] gap-6">
                <div className="text-sm font-medium text-slate-900">
                  {edu.start_date} – {edu.end_date}
                  <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">{edu.location}</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900 leading-tight">{edu.degree}</div>
                  <div className="text-[15px] text-teal-600 font-medium mb-2">{edu.school}</div>
                  <div className="text-[14px] text-slate-500 font-light">
                    {edu.gpa && <span className="font-semibold text-slate-700">GPA: {edu.gpa} • </span>}
                    {edu.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {projects.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm font-bold uppercase tracking-widest text-teal-600 mb-6 border-b-2 border-slate-100 pb-2">04. Selected Works</h2>
          <div className="flex flex-col gap-8">
            {projects.map((proj, idx) => (
              <div key={idx} className="grid grid-cols-[180px_1fr] gap-6">
                <div className="text-sm font-medium text-slate-900">
                  {proj.role || 'Project'}
                  {proj.link && <div className="text-xs text-slate-400 mt-1 break-all uppercase tracking-wider">{proj.link}</div>}
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900 leading-tight mb-3">{proj.title}</div>
                  {proj.description && (
                    <div className="text-[14px] leading-relaxed whitespace-pre-wrap text-slate-600 font-light">
                      {proj.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {skills.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm font-bold uppercase tracking-widest text-teal-600 mb-6 border-b-2 border-slate-100 pb-2">05. Capabilities</h2>
          <div className="flex flex-col gap-4">
            {Object.entries(
              skills.reduce((acc, curr) => {
                const cat = curr.category || 'General';
                if (!acc[cat]) acc[cat] = [];
                if (curr.name) acc[cat].push(curr.name);
                return acc;
              }, {})
            ).map(([cat, list]) => {
              const skillTags = list.flatMap(item => item.split(',').map(s => s.trim()).filter(Boolean));
              return (
                <div key={cat} className="grid grid-cols-[180px_1fr] gap-6 items-start">
                  <div className="text-sm font-bold text-slate-900">{cat}</div>
                  <div className="flex flex-wrap gap-2">
                    {skillTags.map((n, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full border border-slate-200">
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
