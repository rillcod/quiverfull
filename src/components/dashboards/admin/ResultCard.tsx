import React from 'react';
import { Printer } from 'lucide-react';

/* ─── Nigerian Grading Scale ────────────────────────────────── */
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

function ordinal(n: number): string {
  if (!n || n <= 0) return '—';
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function calcAge(dob: string): string {
  if (!dob) return '—';
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age > 0 ? `${age} yrs` : '—';
}

function fmtDate(d: string): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
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
    classLevel?: string;
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
  @page { size: A4 portrait; margin: 12mm 14mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 10pt; color: #000; background: #fff; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #000; padding: 3px 5px; }
  img { max-width: 100%; }
  .no-border td, .no-border th { border: none; }
  .bg-navy { background-color: #1a237e !important; color: #fff !important; }
  .bg-light { background-color: #e8eaf6 !important; }
  .bg-yellow { background-color: #fffff0 !important; }
  .grade-a { color: #1b5e20; font-weight: bold; }
  .grade-b { color: #0d47a1; font-weight: bold; }
  .grade-c { color: #e65100; font-weight: bold; }
  .grade-f { color: #b71c1c; font-weight: bold; }
  .text-center { text-align: center; }
  .text-left { text-align: left; }
  .font-bold { font-weight: bold; }
  .dotted-line { border-bottom: 1px dotted #555; display: inline-block; min-width: 180px; vertical-align: bottom; }
  .sig-line { border-top: 1px solid #000; min-width: 120px; display: inline-block; text-align: center; padding-top: 2px; font-size: 9pt; }
</style>
</head><body>${el.innerHTML}</body></html>`);
  win.document.close();
  setTimeout(() => { win.print(); }, 500);
}

/* ─── Shared styles (inline, for both screen + print) ───────── */
const S = {
  th: (extra?: React.CSSProperties): React.CSSProperties => ({
    border: '1px solid #000', padding: '4px 5px', textAlign: 'center',
    background: '#1a237e', color: '#fff', fontWeight: 'bold', fontSize: '9pt', ...extra,
  }),
  thLight: (extra?: React.CSSProperties): React.CSSProperties => ({
    border: '1px solid #000', padding: '4px 6px', textAlign: 'center',
    background: '#e8eaf6', color: '#000', fontWeight: 'bold', fontSize: '9pt', ...extra,
  }),
  thYellow: (extra?: React.CSSProperties): React.CSSProperties => ({
    border: '1px solid #000', padding: '5px 7px', textAlign: 'left',
    background: '#fffff0', color: '#000', fontWeight: 'bold', fontSize: '9.5pt',
    ...extra,
  }),
  td: (extra?: React.CSSProperties): React.CSSProperties => ({
    border: '1px solid #000', padding: '4px 5px', textAlign: 'center', fontSize: '9pt', ...extra,
  }),
  tdLeft: (extra?: React.CSSProperties): React.CSSProperties => ({
    border: '1px solid #000', padding: '4px 6px', textAlign: 'left', fontSize: '9pt', ...extra,
  }),
};

/* ─── Header (shared) ───────────────────────────────────────── */
function TQSHeader({ address }: { address: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
      <img src="/tqs-logo.jpeg" alt="TQS" style={{ width: 72, height: 72, objectFit: 'contain', flexShrink: 0 }} />
      <div style={{ textAlign: 'center', flex: 1 }}>
        <div style={{ fontSize: '18pt', fontWeight: 'bold', color: '#1a237e', letterSpacing: '0.5px', lineHeight: 1.2 }}>
          THE QUIVERFULL SCHOOL
        </div>
        <div style={{ fontSize: '8.5pt', color: '#c62828', fontWeight: 'bold', marginTop: '3px' }}>
          {address || '2, AKPOFA AVENUE, OFF 2ND UGBOR ROAD, GRA, BENIN CITY, EDO STATE, NIGERIA.'}
        </div>
        <div style={{ fontSize: '8.5pt', color: '#c62828', fontWeight: 'bold' }}>
          TEL: +2348036790886
        </div>
      </div>
      <img src="/tqs-logo.jpeg" alt="TQS" style={{ width: 72, height: 72, objectFit: 'contain', flexShrink: 0 }} />
    </div>
  );
}

/* ─── PRIMARY / BASIC Result Card ───────────────────────────── */
function PrimaryResultCard({ data }: { data: ResultCardData }) {
  const { student, term, academicYear, subjects, classStats, behavior, attendance, comments, nextTerm } = data;

  const grandTotal = subjects.reduce((s, r) => s + r.total, 0);
  const subjectAvg = subjects.length > 0 ? (grandTotal / subjects.length) : 0;
  const avgPercent = subjects.length > 0
    ? ((grandTotal / (subjects.length * 100)) * 100).toFixed(1)
    : '0.0';
  const overallGrade = subjects.length > 0 ? getNigerianGrade(Math.round(subjectAvg)) : { grade: '—', remark: '—' };

  const gradeColor = (g: string): string => {
    if (g.startsWith('A')) return '#1b5e20';
    if (g.startsWith('B')) return '#0d47a1';
    if (g.startsWith('C')) return '#e65100';
    if (g.startsWith('F')) return '#b71c1c';
    return '#000';
  };

  const BEHAVIOR_LETTER: Record<number, string> = { 5: 'A', 4: 'B', 3: 'C', 2: 'D', 1: 'E' };
  const BEHAVIOR_WORD: Record<number, string> = { 5: 'Excellent', 4: 'Very Good', 3: 'Good', 2: 'Fair', 1: 'Poor' };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '9.5pt', color: '#000', background: '#fff', padding: '14px 16px' }}>

      {/* ── Header ── */}
      <TQSHeader address={data.schoolAddress} />
      <div style={{ textAlign: 'center', fontSize: '13pt', fontWeight: 'bold', textDecoration: 'underline', marginBottom: '8px', color: '#000' }}>
        TERMINAL REPORT SHEET
      </div>

      {/* ── Student info (2-column) ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
        <tbody>
          {[
            [['Student Name:', student.name], ['Student ID:', student.studentId]],
            [['Class:', student.className], ['Academic Session:', academicYear]],
            [['Term:', term], ['Gender:', student.gender ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1) : '—']],
            [['Date of Birth:', student.dob ? fmtDate(student.dob) : '—'], ['Age:', calcAge(student.dob)]],
          ].map((row, ri) => (
            <tr key={ri}>
              {row.map(([label, val], ci) => (
                <React.Fragment key={ci}>
                  <td style={{ border: 'none', padding: '2px 5px', fontWeight: 'bold', width: '14%', whiteSpace: 'nowrap', fontSize: '9pt' }}>{label}</td>
                  <td style={{ padding: '2px 5px', borderBottom: '1px solid #555', width: '36%', fontSize: '9pt' }}>{val}</td>
                  {ci === 0 && <td style={{ border: 'none', width: '4px' }} />}
                </React.Fragment>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── Academic Performance ── */}
      <div style={{ background: '#1a237e', color: '#fff', textAlign: 'center', fontWeight: 'bold', padding: '4px', fontSize: '9.5pt', marginBottom: 0 }}>
        ACADEMIC PERFORMANCE
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={S.th({ textAlign: 'left', width: '26%' })}>SUBJECTS</th>
            <th style={S.th()}>H/WORK<br /><span style={{ fontWeight: 'normal', fontSize: '8pt' }}></span></th>
            <th style={S.th()}>1ST C.A<br /><span style={{ fontWeight: 'normal', fontSize: '8pt' }}>/20</span></th>
            <th style={S.th()}>2ND C.A<br /><span style={{ fontWeight: 'normal', fontSize: '8pt' }}>/20</span></th>
            <th style={S.th()}>EXAM<br /><span style={{ fontWeight: 'normal', fontSize: '8pt' }}>/60</span></th>
            <th style={S.th({ fontWeight: 'bold' })}>TOTAL<br /><span style={{ fontWeight: 'normal', fontSize: '8pt' }}>/100</span></th>
            <th style={S.th()}>GRADE</th>
            <th style={S.th()}>REMARK</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((s, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f7f8ff' }}>
              <td style={S.tdLeft({ textTransform: 'uppercase', fontWeight: 600 })}>{s.subject}</td>
              <td style={S.td()}>{s.homework ? s.homework : ''}</td>
              <td style={S.td()}>{s.ca1 > 0 ? s.ca1 : ''}</td>
              <td style={S.td()}>{s.ca2 > 0 ? s.ca2 : ''}</td>
              <td style={S.td()}>{s.exam > 0 ? s.exam : ''}</td>
              <td style={S.td({ fontWeight: 'bold', fontSize: '10pt' })}>{s.total > 0 ? s.total : ''}</td>
              <td style={S.td({ color: gradeColor(s.grade), fontWeight: 'bold' })}>{s.grade}</td>
              <td style={S.td()}>{s.remark}</td>
            </tr>
          ))}
          {/* Fill to at least 10 rows */}
          {subjects.length < 10 && Array.from({ length: 10 - subjects.length }).map((_, i) => (
            <tr key={`e${i}`}>
              <td style={S.tdLeft()}>&nbsp;</td>
              {Array(7).fill(0).map((__, j) => <td key={j} style={S.td()}></td>)}
            </tr>
          ))}
          {/* Grand Total row */}
          <tr style={{ background: '#e8eaf6' }}>
            <td style={S.tdLeft({ fontWeight: 'bold' })} colSpan={5}>GRAND TOTAL / AVERAGE</td>
            <td style={S.td({ fontWeight: 'bold', fontSize: '11pt', color: '#1a237e' })}>{grandTotal}</td>
            <td style={S.td({ fontWeight: 'bold', color: gradeColor(overallGrade.grade) })}>{overallGrade.grade}</td>
            <td style={S.td({ fontWeight: 'bold' })}>{avgPercent}%</td>
          </tr>
        </tbody>
      </table>

      {/* ── Class Statistics ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0', borderTop: 'none' }}>
        <tbody>
          <tr>
            <td style={S.td({ background: '#e8eaf6', textAlign: 'left' })}>
              <b>No. of Subjects:</b> {subjects.length}
            </td>
            <td style={S.td({ background: '#e8eaf6', textAlign: 'left' })}>
              <b>Subject Average:</b> {subjectAvg.toFixed(1)}
            </td>
            <td style={S.td({ background: '#e8eaf6', textAlign: 'left' })}>
              <b>% Average:</b> {avgPercent}%
            </td>
            <td style={S.td({ background: '#e8eaf6', textAlign: 'left' })}>
              <b>Overall Grade:</b> <span style={{ color: gradeColor(overallGrade.grade), fontWeight: 'bold' }}>{overallGrade.grade} – {overallGrade.remark}</span>
            </td>
          </tr>
          <tr>
            <td style={S.td({ background: '#fff', textAlign: 'left' })}>
              <b>Position:</b> <span style={{ color: '#1a237e', fontWeight: 'bold' }}>{ordinal(classStats.position)}</span> {classStats.totalStudents > 0 ? `/ ${classStats.totalStudents}` : ''}
            </td>
            <td style={S.td({ background: '#fff', textAlign: 'left' })}>
              <b>Highest in Class:</b> {classStats.highestInClass > 0 ? classStats.highestInClass : '—'}
            </td>
            <td style={S.td({ background: '#fff', textAlign: 'left' })}>
              <b>Lowest in Class:</b> {classStats.lowestInClass > 0 ? classStats.lowestInClass : '—'}
            </td>
            <td style={S.td({ background: '#fff', textAlign: 'left' })}>
              <b>Class Average:</b> {classStats.classAverage > 0 ? classStats.classAverage : '—'}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── Attendance ── */}
      <div style={{ background: '#1a237e', color: '#fff', textAlign: 'center', fontWeight: 'bold', padding: '3px', fontSize: '9.5pt', marginTop: '6px', marginBottom: 0 }}>
        ATTENDANCE RECORD
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td style={S.td({ textAlign: 'left' })}><b>Total Days School Opened:</b> {attendance.totalDays || '—'}</td>
            <td style={S.td({ textAlign: 'left' })}><b>Days Present:</b> {attendance.daysPresent || '—'}</td>
            <td style={S.td({ textAlign: 'left' })}><b>Days Absent:</b> {attendance.daysAbsent || '—'}</td>
            <td style={S.td({ textAlign: 'left' })}>
              <b>Punctuality Rate:</b>{' '}
              {attendance.totalDays > 0
                ? `${Math.round((attendance.daysPresent / attendance.totalDays) * 100)}%`
                : '—'}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── Affective / Psychomotor Domain ── */}
      <div style={{ background: '#1a237e', color: '#fff', textAlign: 'center', fontWeight: 'bold', padding: '3px', fontSize: '9.5pt', marginTop: '6px', marginBottom: 0 }}>
        AFFECTIVE / PSYCHOMOTOR DOMAIN
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={S.thLight({ textAlign: 'left', width: '22%' })}>TRAIT</th>
            <th style={S.thLight({ width: '9%' })}>RATING</th>
            <th style={S.thLight({ width: '13%' })}>REMARK</th>
            <th style={S.thLight({ textAlign: 'left', width: '22%' })}>TRAIT</th>
            <th style={S.thLight({ width: '9%' })}>RATING</th>
            <th style={S.thLight({ width: '13%' })}>REMARK</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Punctuality', behavior.punctuality, 'Neatness', behavior.neatness],
            ['Honesty', behavior.honesty, 'Cooperation', behavior.cooperation],
            ['Attentiveness', behavior.attentiveness, 'Politeness', behavior.politeness],
          ].map(([l1, v1, l2, v2], i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f7f8ff' }}>
              <td style={S.tdLeft({ fontWeight: 500 })}>{l1 as string}</td>
              <td style={S.td({ fontWeight: 'bold', color: '#1a237e' })}>{BEHAVIOR_LETTER[v1 as number] || '—'}</td>
              <td style={S.td()}>{BEHAVIOR_WORD[v1 as number] || '—'}</td>
              <td style={S.tdLeft({ fontWeight: 500 })}>{l2 as string}</td>
              <td style={S.td({ fontWeight: 'bold', color: '#1a237e' })}>{BEHAVIOR_LETTER[v2 as number] || '—'}</td>
              <td style={S.td()}>{BEHAVIOR_WORD[v2 as number] || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ fontSize: '8pt', color: '#333', padding: '2px 4px', border: '1px solid #000', borderTop: 'none', marginBottom: '6px' }}>
        <b>Key:</b> A = Excellent (5) &nbsp;|&nbsp; B = Very Good (4) &nbsp;|&nbsp; C = Good (3) &nbsp;|&nbsp; D = Fair (2) &nbsp;|&nbsp; E = Poor (1)
      </div>

      {/* ── Grading Scale ── */}
      <div style={{ background: '#1a237e', color: '#fff', textAlign: 'center', fontWeight: 'bold', padding: '3px', fontSize: '9.5pt', marginBottom: 0 }}>
        GRADING SCALE
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px', fontSize: '8.5pt' }}>
        <thead>
          <tr>
            {[['A1','75–100','Excellent'],['B2','70–74','Very Good'],['B3','65–69','Good'],['C4','60–64','Credit'],['C5','55–59','Credit'],['C6','50–54','Credit'],['D7','45–49','Pass'],['E8','40–44','Pass'],['F9','0–39','Failure']].map(([g, r, w]) => (
              <th key={g} style={{ border: '1px solid #000', padding: '2px 1px', textAlign: 'center', background: '#e8eaf6', fontWeight: 'bold', fontSize: '8pt' }}>
                {g}<br /><span style={{ fontWeight: 'normal' }}>{r}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {[['A1','75–100','Excellent'],['B2','70–74','Very Good'],['B3','65–69','Good'],['C4','60–64','Credit'],['C5','55–59','Credit'],['C6','50–54','Credit'],['D7','45–49','Pass'],['E8','40–44','Pass'],['F9','0–39','Failure']].map(([g, , w]) => (
              <td key={g} style={{ border: '1px solid #000', padding: '2px 1px', textAlign: 'center', fontSize: '8pt' }}>{w}</td>
            ))}
          </tr>
        </tbody>
      </table>

      {/* ── Remarks ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
        <tbody>
          <tr>
            <td style={S.tdLeft({ verticalAlign: 'top', width: '50%', paddingBottom: '12px' })}>
              <b>Class Teacher's Remark:</b><br />
              <span style={{ fontStyle: 'italic' }}>{comments.teacher || '——————————————————————————'}</span>
            </td>
            <td style={S.tdLeft({ verticalAlign: 'top', paddingBottom: '12px' })}>
              <b>Proprietress' Remark:</b><br />
              <span style={{ fontStyle: 'italic' }}>{comments.principal || '——————————————————————————'}</span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── Next Term / Resumption ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
        <tbody>
          <tr>
            <td style={S.tdLeft({ background: '#e8eaf6', width: '50%' })}>
              <b>Date of Resumption (Next Term):</b>&nbsp;
              <span style={{ color: '#c62828', fontWeight: 'bold' }}>
                {nextTerm.begins ? fmtDate(nextTerm.begins) : '——————————————'}
              </span>
            </td>
            <td style={S.tdLeft({ background: '#e8eaf6' })}>
              <b>School Fees for Next Term:</b>&nbsp;
              <span style={{ color: '#1b5e20', fontWeight: 'bold' }}>
                {nextTerm.fees || '——————————————'}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── Signatures ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td style={{ border: 'none', padding: '4px 8px', width: '50%', textAlign: 'center' }}>
              <div style={{ borderTop: '1px solid #000', marginTop: '30px', paddingTop: '3px', fontSize: '9pt', fontWeight: 'bold' }}>
                Class Teacher's Signature
              </div>
            </td>
            <td style={{ border: 'none', padding: '4px 8px', width: '50%', textAlign: 'center' }}>
              <div style={{ borderTop: '1px solid #000', marginTop: '30px', paddingTop: '3px', fontSize: '9pt', fontWeight: 'bold' }}>
                Proprietress' Signature
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ textAlign: 'center', fontSize: '7.5pt', color: '#888', marginTop: '6px', fontStyle: 'italic' }}>
        This is a computer-generated result sheet — The Quiverfull School, Benin City.
      </div>
    </div>
  );
}

/* ─── NURSERY / CRECHE Result Card ──────────────────────────── */
function NurseryResultCard({ data }: { data: ResultCardData }) {
  const { student, term, academicYear, behavior, attendance, comments, nextTerm } = data;

  const BEHAVIOR_COMMENT: Record<number, string> = {
    5: 'Excellent', 4: 'Very Good', 3: 'Good', 2: 'Fair', 1: 'Needs Improvement',
  };

  const nurserySkills = ['NUMBERS', 'ALPHABETS', 'SPEAKING', 'WRITING', 'ARTS'];

  const personalityTraits = [
    { trait: 'Friendly and courteous', value: behavior.politeness },
    { trait: 'Punctual', value: behavior.punctuality },
    { trait: 'Says "Please", "Thank you", "Sorry"', value: behavior.honesty },
    { trait: 'Shares and takes turns', value: behavior.cooperation },
    { trait: 'Cooperates with others in the classroom', value: behavior.attentiveness },
    { trait: 'Interacts with a smile, wave, a nod', value: behavior.neatness },
  ];

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '10pt', color: '#000', background: '#fff', padding: '14px 16px' }}>

      <TQSHeader address={data.schoolAddress} />
      <div style={{ textAlign: 'center', fontSize: '13pt', fontWeight: 'bold', textDecoration: 'underline', marginBottom: '10px' }}>
        RESULT SHEET
      </div>

      {/* Student info as labelled lines */}
      <div style={{ marginBottom: '12px' }}>
        {([
          ['NAME OF STUDENT', student.name],
          ['CLASS', student.className],
          ['SESSION', academicYear],
          ['TERM', term],
          ['AGE', calcAge(student.dob)],
        ] as [string, string][]).map(([label, value]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'baseline', marginBottom: '6px' }}>
            <span style={{ fontWeight: 'bold', minWidth: '190px', fontSize: '10pt' }}>{label}:</span>
            <span style={{ flex: 1, borderBottom: '1px solid #000', minHeight: '18px', paddingBottom: '1px', paddingLeft: '4px' }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Skills & Abilities */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
        <thead>
          <tr>
            <th style={S.thYellow({ width: '45%' })}>SKILLS &amp; ABILITIES</th>
            <th style={S.thYellow()}>COMMENTS</th>
          </tr>
        </thead>
        <tbody>
          {nurserySkills.map((skill) => {
            const match = data.subjects.find(s => s.subject.toUpperCase().includes(skill.split(' ')[0]));
            const comment = match ? getNigerianGrade(match.total).remark : '';
            return (
              <tr key={skill}>
                <td style={S.tdLeft({ padding: '7px 8px' })}>{skill}</td>
                <td style={S.tdLeft({ padding: '7px 8px' })}>{comment}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Personality & Character */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
        <thead>
          <tr>
            <th style={S.thYellow({ width: '60%' })}>PERSONALITY AND CHARACTER</th>
            <th style={S.thYellow()}>COMMENTS</th>
          </tr>
        </thead>
        <tbody>
          {personalityTraits.map(({ trait, value }) => (
            <tr key={trait}>
              <td style={S.tdLeft({ padding: '7px 8px' })}>{trait}</td>
              <td style={S.tdLeft({ padding: '7px 8px' })}>{value ? BEHAVIOR_COMMENT[value] || '' : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Attendance */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
        <tbody>
          <tr>
            <td style={S.td({ textAlign: 'left', background: '#e8eaf6' })}><b>Total Days:</b> {attendance.totalDays || '—'}</td>
            <td style={S.td({ textAlign: 'left', background: '#e8eaf6' })}><b>Days Present:</b> {attendance.daysPresent || '—'}</td>
            <td style={S.td({ textAlign: 'left', background: '#e8eaf6' })}><b>Days Absent:</b> {attendance.daysAbsent || '—'}</td>
          </tr>
        </tbody>
      </table>

      {/* Remarks */}
      <div style={{ marginBottom: '8px', fontSize: '10pt' }}>
        <b>Class teachers remark:</b>&nbsp;
        <span style={{ display: 'inline-block', minWidth: '320px', borderBottom: '1px dotted #555', verticalAlign: 'bottom' }}>
          {comments.teacher}
        </span>
      </div>
      <div style={{ marginBottom: '12px', fontSize: '10pt' }}>
        <b>Proprietress Remark:</b>&nbsp;
        <span style={{ display: 'inline-block', minWidth: '330px', borderBottom: '1px dotted #555', verticalAlign: 'bottom' }}>
          {comments.principal}
        </span>
      </div>

      {/* Resumption */}
      <div style={{ marginBottom: '10px', fontSize: '10pt', padding: '6px 8px', border: '1px solid #000', background: '#e8eaf6' }}>
        <b>Date of Resumption (Next Term):</b>&nbsp;
        <span style={{ color: '#c62828', fontWeight: 'bold' }}>
          {nextTerm.begins ? fmtDate(nextTerm.begins) : '——————————————'}
        </span>
        {nextTerm.fees && (
          <span style={{ marginLeft: '24px' }}>
            <b>School Fees:</b>&nbsp;
            <span style={{ color: '#1b5e20', fontWeight: 'bold' }}>{nextTerm.fees}</span>
          </span>
        )}
      </div>

      {/* Signatures */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td style={{ border: 'none', padding: '4px 8px', width: '50%', textAlign: 'center' }}>
              <div style={{ borderTop: '1px solid #000', marginTop: '28px', paddingTop: '3px', fontSize: '9pt', fontWeight: 'bold' }}>
                Class Teacher's Signature
              </div>
            </td>
            <td style={{ border: 'none', padding: '4px 8px', width: '50%', textAlign: 'center' }}>
              <div style={{ borderTop: '1px solid #000', marginTop: '28px', paddingTop: '3px', fontSize: '9pt', fontWeight: 'bold' }}>
                Proprietress' Signature
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/* ─── Main Export ────────────────────────────────────────────── */
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
          <Printer className="w-4 h-4" /> Print / Save as PDF
        </button>
      </div>

      {/* A4 preview wrapper */}
      <div style={{ background: '#f0f0f0', padding: '16px', borderRadius: '4px' }}>
        <div
          id="tqs-result-card"
          style={{
            width: '210mm',
            minHeight: '297mm',
            background: '#fff',
            margin: '0 auto',
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
          }}
        >
          {isNursery
            ? <NurseryResultCard data={data} />
            : <PrimaryResultCard data={data} />
          }
        </div>
      </div>
    </>
  );
}
