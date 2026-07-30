export default function EducationCard({ edu }) {
  return (
    <div className="edu-card">
      <div className="edu-school">{edu.school}</div>
      <div className="edu-degree">{edu.degree}</div>
      <div className="edu-meta">
        <span>{edu.period}</span>
        {edu.gpa && <span>GPA: {edu.gpa}</span>}
      </div>
    </div>
  );
}
