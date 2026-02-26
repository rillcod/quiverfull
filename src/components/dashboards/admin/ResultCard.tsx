import React from 'react';
import { Printer } from 'lucide-react';

/* ─── Nigerian Grading Scale ───────────────────────────────── */
export function getNigerianGrade(total: number): { grade: string; remark: string } {
  if (total >= 75) return { grade: 'A1', remark: 'Excellent' };
  if (total >= 70) return { grade: 'B2', remark: 'Very Good' };
  if (total >= 65) return { grade: 'B3', remark: 'Good' };
  if (total >= 60) return { grade: 'C4', remark: 'Credit' };
  if (total >= 55) return { grade: 'C5', remark: 'Credit' };
  if (total >= 50) return { grade: 'C6', remark: 'Credit' };
  if (total >= 45) return { grade: 'D7', remark: 'Pass' };
  if (total >= 40) return { grade: 'E8', remark: 'Pass' };
  return { grade: 'F9', remark: 'Failure' };
}

/* ─── Types ─────────────────────────────────────────────────── */
export interface SubjectResult {
  subject: string;
  ca1: number;
  ca2: number;
  exam: number;
  total: number;
  grade: string;
  remark: string;
  homework?: number;
}

export interface ResultCardData {
  student: {
    name: string;
    studentId: string;
    className: string;
    classLevel?: string; // 'creche' | 'basic1' ... 'basic6'
    gender: string;
    dob: string;
  };
  term: string;
  academicYear: string;
  subjects: SubjectResult[];
  classStats: {
    position: number;
    totalStudents: number;
    grandTotal: number;
    highestInClass: number;
    lowestInClass: number;
    classAverage: number;
  };
  behavior: {
    punctuality: number;
    neatness: number;
    honesty: number;
    cooperation: number;
    attentiveness: number;
    politeness: number;
  };
  attendance: {
    daysPresent: number;
    daysAbsent: number;
    totalDays: number;
  };
  comments: { teacher: string; principal: string };
  nextTerm: { begins: string; fees: string };
  schoolName: string;
  schoolAddress: string;
}

/* ─── Print helper ──────────────────────────────────────────── */
export function printResultCard(studentName: string) {
  const el = document.getElementById('tqs-result-card');
  if (!el) return;
  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head>
<meta charset="utf-8"/>
<title>Result Sheet – ${studentName}</title>
<style>
  @page { size: A4; margin: 10mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 11pt; color: #000; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #000; padding: 4px 6px; }
  .text-center { text-align: center; }
  .text-left { text-align: left; }
  .font-bold { font-weight: bold; }
  img { display: block; }
</style>
</head><body>${el.innerHTML}</body></html>`);
  win.document.close();
  setTimeout(() => { win.print(); }, 400);
}

/* ─── Shared Header ─────────────────────────────────────────── */
function TQSHeader({ address }: { address: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
      <img src="/tqs-logo.jpeg" alt="TQS" style={{ width: 70, height: 70, objectFit: 'contain', flexShrink: 0 }} />
      <div style={{ textAlign: 'center', flex: 1 }}>
        <div style={{ fontSize: '20pt', fontWeight: 'bold', color: '#1a237e', fontFamily: 'Arial, sans-serif', letterSpacing: '1px' }}>
          THE QUIVERFULL SCHOOL
        </div>
        <div style={{ fontSize: '9pt', color: '#c62828', fontWeight: 'bold', marginTop: '2px' }}>
          {address || '2, AKPOFA AVENUE, OFF 2ND UGBOR ROAD, GRA, BENIN CITY, EDO STATE, NIGERIA. - TEL+2348036790886'}
        </div>
        <div style={{ fontSize: '13pt', fontWeight: 'bold', textDecoration: 'underline', marginTop: '6px', color: '#000' }}>
          RESULT SHEET
        </div>
      </div>
    </div>
  );
}

/* ─── PRIMARY / BASIC Template ─────────────────────────────── */
function PrimaryResultCard({ data }: { data: ResultCardData }) {
  const { student, term, academicYear, subjects, classStats, comments } = data;

  const grandTotal = subjects.reduce((s, r) => s + r.total, 0);
  const maxPossible = subjects.length * 100;
  const avgPercent = maxPossible > 0 ? ((grandTotal / maxPossible) * 100).toFixed(1) : '0.0';

  const overallGrade = subjects.length > 0
    ? getNigerianGrade(Math.round(grandTotal / subjects.length))
    : { grade: '—', remark: '—' };

  const tdStyle: React.CSSProperties = { border: '1px solid #000', padding: '5px 6px', textAlign: 'center' };
  const tdLeft: React.CSSProperties = { ...tdStyle, textAlign: 'left' };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '10pt', color: '#000', background: '#fff', padding: '12px' }}>
      <TQSHeader address={data.schoolAddress} />

      <div style={{ height: '1px', background: '#000', margin: '6px 0' }} />

      {/* Student info */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
        <tbody>
          <tr>
            <td style={{ padding: '2px 4px', width: '130px', fontWeight: 'bold' }}>Student Name:</td>
            <td style={{ padding: '2px 4px', borderBottom: '1px solid #000', minWidth: '200px' }}>{student.name}</td>
            <td style={{ width: '16px' }} />
            <td style={{ padding: '2px 4px', width: '60px', fontWeight: 'bold' }}>Sex:</td>
            <td style={{ padding: '2px 4px', borderBottom: '1px solid #000', minWidth: '80px', textTransform: 'capitalize' }}>{student.gender || '—'}</td>
          </tr>
          <tr>
            <td style={{ padding: '2px 4px', fontWeight: 'bold' }}>Class:</td>
            <td style={{ padding: '2px 4px', borderBottom: '1px solid #000' }}>{student.className}</td>
            <td />
            <td style={{ padding: '2px 4px', fontWeight: 'bold' }}>Session:</td>
            <td style={{ padding: '2px 4px', borderBottom: '1px solid #000' }}>{academicYear}</td>
          </tr>
          <tr>
            <td style={{ padding: '2px 4px', fontWeight: 'bold' }}>Term:</td>
            <td style={{ padding: '2px 4px', borderBottom: '1px solid #000' }}>{term}</td>
            <td colSpan={3} />
          </tr>
        </tbody>
      </table>

      {/* Subjects table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
        <thead>
          <tr style={{ background: '#fff' }}>
            <th style={{ ...tdLeft, width: '26%' }}>Subjects</th>
            <th style={tdStyle}>Attendance</th>
            <th style={tdStyle}>Home Work</th>
            <th style={tdStyle}>1 C.A</th>
            <th style={tdStyle}>2nd C.A</th>
            <th style={tdStyle}>Examination</th>
            <th style={{ ...tdStyle, fontWeight: 'bold' }}>Total</th>
            <th style={tdStyle}>Grade</th>
            <th style={tdStyle}>Remark</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((s, i) => {
            const gradeColor = s.grade.startsWith('A') ? '#1b5e20'
              : s.grade.startsWith('B') ? '#0d47a1'
              : s.grade.startsWith('F') ? '#b71c1c' : '#000';
            return (
              <tr key={i}>
                <td style={{ ...tdLeft, textTransform: 'uppercase', fontWeight: '500' }}>{s.subject}</td>
                <td style={tdStyle}></td>
                <td style={tdStyle}>{s.homework ? s.homework : ''}</td>
                <td style={tdStyle}>{s.ca1 > 0 ? s.ca1 : ''}</td>
                <td style={tdStyle}>{s.ca2 > 0 ? s.ca2 : ''}</td>
                <td style={tdStyle}>{s.exam > 0 ? s.exam : ''}</td>
                <td style={{ ...tdStyle, fontWeight: 'bold' }}>{s.total > 0 ? s.total : ''}</td>
                <td style={{ ...tdStyle, color: gradeColor, fontWeight: 'bold' }}>{s.grade}</td>
                <td style={tdStyle}>{s.remark}</td>
              </tr>
            );
          })}
          {/* Empty rows to fill the sheet if few subjects */}
          {subjects.length < 8 && Array.from({ length: 8 - subjects.length }).map((_, i) => (
            <tr key={`empty-${i}`}>
              <td style={tdLeft}>&nbsp;</td>
              <td style={tdStyle}></td><td style={tdStyle}></td><td style={tdStyle}></td>
              <td style={tdStyle}></td><td style={tdStyle}></td><td style={tdStyle}></td>
              <td style={tdStyle}></td><td style={tdStyle}></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Grand Total / % Average */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
        <table style={{ borderCollapse: 'collapse', minWidth: '220px' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #000', padding: '4px 10px', fontWeight: 'bold' }}>Grand Total</td>
              <td style={{ border: '1px solid #000', padding: '4px 20px', fontWeight: 'bold', textAlign: 'center' }}>{grandTotal}</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '4px 10px', fontWeight: 'bold' }}>% Average</td>
              <td style={{ border: '1px solid #000', padding: '4px 20px', textAlign: 'center' }}>{avgPercent}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Grading Key */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', fontSize: '8.5pt' }}>
        <thead>
          <tr>
            {['A1 (75–100)', 'B2 (70–74)', 'B3 (65–69)', 'C4 (60–64)', 'C5 (55–59)', 'C6 (50–54)', 'D7 (45–49)', 'E8 (40–44)', 'F9 (0–39)'].map(g => (
              <th key={g} style={{ border: '1px solid #000', padding: '3px 2px', textAlign: 'center', background: '#f5f5f5', fontWeight: 'bold' }}>{g}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {['Excellent', 'Very Good', 'Good', 'Credit', 'Credit', 'Credit', 'Pass', 'Pass', 'Failure'].map((r, i) => (
              <td key={i} style={{ border: '1px solid #000', padding: '3px 2px', textAlign: 'center' }}>{r}</td>
            ))}
          </tr>
        </tbody>
      </table>

      {/* Footer info */}
      <div style={{ marginBottom: '4px', fontSize: '10pt' }}>
        <span style={{ fontWeight: 'bold' }}>No of pupils: </span>
        <span style={{ display: 'inline-block', minWidth: '40px', borderBottom: '1px solid #000' }}>{classStats.totalStudents > 0 ? classStats.totalStudents : ''}</span>
        <span style={{ marginLeft: '24px', fontWeight: 'bold' }}>Overall result: </span>
        <span style={{ display: 'inline-block', minWidth: '120px', borderBottom: '1px solid #000' }}>
          {overallGrade.grade} — {overallGrade.remark}
        </span>
      </div>
      <div style={{ marginBottom: '4px', fontSize: '10pt' }}>
        <span style={{ fontWeight: 'bold' }}>Position: </span>
        {classStats.position > 0 ? `${classStats.position}${['th','st','nd','rd'][((classStats.position % 100)-20)%10]||['th','st','nd','rd'][classStats.position%100]||'th'} / ${classStats.totalStudents}` : '—'}
      </div>

      {/* Remarks */}
      <div style={{ marginTop: '10px', marginBottom: '6px', fontSize: '10pt' }}>
        Class teachers Remark:
        <span style={{ display: 'inline-block', minWidth: '300px', borderBottom: '1px dotted #000', marginLeft: '6px' }}>
          {comments.teacher}
        </span>
      </div>
      <div style={{ marginBottom: '6px', fontSize: '10pt' }}>
        Proprietress Remark:
        <span style={{ display: 'inline-block', minWidth: '300px', borderBottom: '1px dotted #000', marginLeft: '6px' }}>
          {comments.principal}
        </span>
      </div>

      {/* Next term */}
      {(data.nextTerm.begins || data.nextTerm.fees) && (
        <div style={{ marginBottom: '6px', fontSize: '10pt' }}>
          <span style={{ fontWeight: 'bold' }}>Next Term Begins: </span>
          <span style={{ borderBottom: '1px solid #000', minWidth: '120px', display: 'inline-block' }}>
            {data.nextTerm.begins ? new Date(data.nextTerm.begins).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
          </span>
          <span style={{ marginLeft: '24px', fontWeight: 'bold' }}>Fees: </span>
          <span style={{ borderBottom: '1px solid #000', minWidth: '100px', display: 'inline-block' }}>{data.nextTerm.fees}</span>
        </div>
      )}

      {/* Signature */}
      <div style={{ textAlign: 'right', marginTop: '20px', fontSize: '10pt' }}>
        <span style={{ borderTop: '1px solid #000', display: 'inline-block', minWidth: '140px', paddingTop: '2px', textAlign: 'center' }}>
          Proprietress
        </span>
      </div>
    </div>
  );
}

/* ─── NURSERY / CRECHE Template ─────────────────────────────── */
function NurseryResultCard({ data }: { data: ResultCardData }) {
  const { student, term, academicYear, behavior, comments } = data;

  const BEHAVIOR_COMMENT: Record<number, string> = {
    5: 'Excellent', 4: 'Very Good', 3: 'Good', 2: 'Fair', 1: 'Needs Improvement',
  };

  const thStyle: React.CSSProperties = { border: '1px solid #000', padding: '5px 8px', background: '#fffff0', fontWeight: 'bold', textAlign: 'left' };
  const tdStyle: React.CSSProperties = { border: '1px solid #000', padding: '6px 8px' };

  const nurserySkills = [
    { skill: 'NUMBERS', score: 0 },
    { skill: 'ALPHABETS', score: 0 },
    { skill: 'SPEAKING', score: 0 },
    { skill: 'WRITING', score: 0 },
    { skill: 'ARTS', score: 0 },
  ];

  const personalityTraits = [
    { trait: 'Friendly and courteous', value: behavior.politeness },
    { trait: 'Punctual', value: behavior.punctuality },
    { trait: 'Says "Please" "Thank you" "Sorry"', value: behavior.honesty },
    { trait: 'Shares and takes turns', value: behavior.cooperation },
    { trait: 'Cooperates with others in the classroom', value: behavior.attentiveness },
    { trait: 'Interacts with a smile, wave, a nod', value: behavior.neatness },
  ];

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '10pt', color: '#000', background: '#fff', padding: '12px' }}>
      <TQSHeader address={data.schoolAddress} />
      <div style={{ height: '1px', background: '#000', margin: '6px 0 10px' }} />

      {/* Student info */}
      <div style={{ marginBottom: '10px' }}>
        {[
          ['NAME OF STUDENT', student.name],
          ['CLASS', student.className],
          ['SESSION', academicYear],
          ['TERM', term],
        ].map(([label, value]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'baseline', marginBottom: '5px' }}>
            <span style={{ fontWeight: 'bold', minWidth: '180px', fontSize: '10pt' }}>{label}:</span>
            <span style={{ flex: 1, borderBottom: '1px solid #000', minHeight: '18px', paddingBottom: '1px' }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Skills & Abilities */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px', borderRadius: '6px', overflow: 'hidden' }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: '40%', background: '#fffff0', border: '1px solid #000' }}>SKILLS &amp; ABILITIES</th>
            <th style={{ ...thStyle, background: '#fffff0', border: '1px solid #000' }}>COMMENTS</th>
          </tr>
        </thead>
        <tbody>
          {nurserySkills.map(({ skill }) => {
            // Try to find matching subject score
            const match = data.subjects.find(s => s.subject.toUpperCase().includes(skill.split(' ')[0]));
            const comment = match ? getNigerianGrade(match.total).remark : '';
            return (
              <tr key={skill}>
                <td style={tdStyle}>{skill}</td>
                <td style={tdStyle}>{comment}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Personality & Character */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: '55%' }}>PERSONALITY AND CHARACTER</th>
            <th style={{ ...thStyle }}>COMMENTS</th>
          </tr>
        </thead>
        <tbody>
          {personalityTraits.map(({ trait, value }) => (
            <tr key={trait}>
              <td style={tdStyle}>{trait}</td>
              <td style={tdStyle}>{value ? BEHAVIOR_COMMENT[value] || '' : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Remarks */}
      <div style={{ marginBottom: '8px', fontSize: '10pt' }}>
        Class teachers remark:
        <span style={{ display: 'inline-block', minWidth: '300px', borderBottom: '1px dotted #000', marginLeft: '6px' }}>
          {comments.teacher}
        </span>
      </div>
      <div style={{ marginBottom: '8px', fontSize: '10pt' }}>
        Proprietress Remark:
        <span style={{ display: 'inline-block', minWidth: '300px', borderBottom: '1px dotted #000', marginLeft: '6px' }}>
          {comments.principal}
        </span>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
interface Props {
  data: ResultCardData;
  onPrint: () => void;
}

export default function ResultCard({ data, onPrint }: Props) {
  const isNursery = data.student.classLevel === 'creche';

  return (
    <>
      <div className="flex justify-end mb-3 print:hidden">
        <button
          onClick={onPrint}
          className="flex items-center gap-2 px-5 py-2 bg-blue-900 text-white rounded-lg text-sm font-medium hover:bg-blue-800"
        >
          <Printer className="w-4 h-4" /> Print Result Sheet
        </button>
      </div>

      <div id="tqs-result-card" className="bg-white border border-gray-300 shadow-sm" style={{ minWidth: 640 }}>
        {isNursery
          ? <NurseryResultCard data={data} />
          : <PrimaryResultCard data={data} />
        }
      </div>
    </>
  );
}
