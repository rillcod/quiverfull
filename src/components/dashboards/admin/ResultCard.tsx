import React from 'react';
import { Printer } from 'lucide-react';

/* ─── Nigerian Grading Scale ─────────────────────────────── */
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
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const BEHAVIOR_LETTER: Record<number, string> = { 5: 'A', 4: 'B', 3: 'C', 2: 'D', 1: 'E' };
const BEHAVIOR_WORD: Record<number, string> = { 5: 'Excellent', 4: 'Very Good', 3: 'Good', 2: 'Fair', 1: 'Poor' };

/* ─── Types ──────────────────────────────────────────────── */
export interface SubjectResult {
  subject: string;
  ca1: number;
  ca2: number;
  exam: number;
  total: number;
  grade: string;
  remark: string;
}

export interface ResultCardData {
  student: {
    name: string;
    studentId: string;
    className: string;
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

/* ─── Print helper ───────────────────────────────────────── */
export function printResultCard(studentName: string, term: string) {
  const el = document.getElementById('ng-result-card');
  if (!el) return;

  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) return;

  win.document.write(`<!DOCTYPE html><html><head>
<meta charset="utf-8"/>
<title>Result Card – ${studentName}</title>
<style>
  @page { size: A4; margin: 12mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; color: #000; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #000; padding: 3px 5px; text-align: center; }
  th { background: #1a5276; color: #fff; font-weight: bold; }
  .left { text-align: left; }
  .header-band { background: #1a5276; color: #fff; padding: 6px 10px; text-align: center; font-size: 9pt; font-weight: bold; letter-spacing: 0.5px; }
  .school-name { font-size: 16pt; font-weight: bold; text-align: center; text-transform: uppercase; letter-spacing: 1px; margin: 4px 0; }
  .school-tag { font-size: 8pt; text-align: center; font-style: italic; color: #555; margin-bottom: 4px; }
  .title { font-size: 13pt; font-weight: bold; text-align: center; text-transform: uppercase; border: 2px solid #000; padding: 4px; margin: 6px 0; letter-spacing: 2px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border: 1px solid #000; margin-bottom: 6px; }
  .info-cell { padding: 3px 6px; border-right: 1px solid #000; border-bottom: 1px solid #000; font-size: 10pt; }
  .info-cell:nth-child(even) { border-right: none; }
  .info-label { font-weight: bold; display: inline-block; min-width: 110px; }
  .section-title { font-size: 10pt; font-weight: bold; text-align: center; background: #d5e8f0; border: 1px solid #000; padding: 3px; margin: 4px 0 0; }
  .grade-a { color: #1a6b1a; font-weight: bold; }
  .grade-b { color: #1a4a8a; font-weight: bold; }
  .grade-c { color: #7a5900; font-weight: bold; }
  .grade-f { color: #8a1a1a; font-weight: bold; }
  .behavior-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; border: 1px solid #000; border-top: none; }
  .beh-cell { padding: 3px 6px; border-right: 1px solid #000; border-bottom: 1px solid #000; font-size: 10pt; display: flex; justify-content: space-between; }
  .beh-cell:nth-child(3n) { border-right: none; }
  .comment-box { border: 1px solid #000; border-top: none; padding: 5px 8px; min-height: 30px; font-size: 10pt; }
  .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 8px; }
  .sig-line { border-top: 1px solid #000; padding-top: 2px; text-align: center; font-size: 9pt; margin-top: 20px; }
  .stat-row { display: flex; justify-content: space-between; border: 1px solid #000; border-top: none; padding: 3px 8px; font-size: 10pt; flex-wrap: wrap; gap: 4px; }
  .stat-item { display: flex; gap: 4px; }
  .stat-label { font-weight: bold; }
  .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%) rotate(-45deg); font-size: 80pt; color: rgba(0,0,0,0.04); pointer-events: none; white-space: nowrap; z-index: 0; }
</style>
</head><body>
${el.innerHTML}
</body></html>`);
  win.document.close();
  setTimeout(() => { win.print(); }, 400);
}

/* ─── Component ──────────────────────────────────────────── */
interface Props {
  data: ResultCardData;
  onPrint: () => void;
}

export default function ResultCard({ data, onPrint }: Props) {
  const { student, term, academicYear, subjects, classStats, behavior, attendance, comments, nextTerm, schoolName, schoolAddress } = data;

  const gradeColor = (g: string) => {
    if (g.startsWith('A')) return 'text-green-700 font-bold';
    if (g.startsWith('B')) return 'text-blue-700 font-bold';
    if (g.startsWith('C')) return 'text-yellow-700 font-bold';
    if (g.startsWith('D') || g.startsWith('E')) return 'text-orange-600 font-bold';
    return 'text-red-700 font-bold';
  };

  return (
    <>
      {/* Print trigger button (outside the printable area) */}
      <div className="flex justify-end mb-3 print:hidden">
        <button
          onClick={onPrint}
          className="flex items-center gap-2 px-5 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800"
        >
          <Printer className="w-4 h-4" /> Print Result Card
        </button>
      </div>

      {/* ─── Printable Card ───────────────────────────────── */}
      <div id="ng-result-card" className="bg-white border border-gray-300 p-4 text-xs font-serif" style={{ minWidth: 640 }}>

        {/* Header */}
        <div className="text-center mb-2">
          <div className="flex items-center justify-center gap-4 mb-1">
            {/* School crest placeholder */}
            <div className="w-14 h-14 rounded-full border-4 border-green-800 flex items-center justify-center flex-shrink-0 bg-green-50">
              <span className="text-green-800 font-black text-lg">QFS</span>
            </div>
            <div>
              <div className="text-base font-black uppercase tracking-wide text-green-900">{schoolName}</div>
              <div className="text-[10px] text-gray-600 italic">{schoolAddress || 'Abuja, Nigeria'}</div>
              <div className="text-[10px] text-gray-600 italic font-semibold mt-0.5">
                "Training the mind, shaping the future"
              </div>
            </div>
            <div className="w-14 h-14 rounded-full border-4 border-green-800 flex items-center justify-center flex-shrink-0 bg-green-50">
              <span className="text-green-800 font-black text-lg">QFS</span>
            </div>
          </div>

          <div className="border-2 border-green-800 bg-green-800 text-white font-bold uppercase tracking-widest py-1 text-[11px] mt-1">
            TERMINAL REPORT CARD
          </div>
        </div>

        {/* Student info grid */}
        <table className="w-full border border-gray-800 text-[10px] mb-2">
          <tbody>
            <tr>
              <td className="border border-gray-800 px-2 py-1 w-[25%]"><span className="font-bold">Student Name:</span></td>
              <td className="border border-gray-800 px-2 py-1 w-[30%] font-semibold uppercase">{student.name}</td>
              <td className="border border-gray-800 px-2 py-1 w-[20%]"><span className="font-bold">Student ID:</span></td>
              <td className="border border-gray-800 px-2 py-1 font-mono">{student.studentId}</td>
            </tr>
            <tr>
              <td className="border border-gray-800 px-2 py-1"><span className="font-bold">Class:</span></td>
              <td className="border border-gray-800 px-2 py-1 font-semibold">{student.className}</td>
              <td className="border border-gray-800 px-2 py-1"><span className="font-bold">Academic Year:</span></td>
              <td className="border border-gray-800 px-2 py-1">{academicYear}</td>
            </tr>
            <tr>
              <td className="border border-gray-800 px-2 py-1"><span className="font-bold">Term:</span></td>
              <td className="border border-gray-800 px-2 py-1">{term}</td>
              <td className="border border-gray-800 px-2 py-1"><span className="font-bold">Gender:</span></td>
              <td className="border border-gray-800 px-2 py-1 capitalize">{student.gender || '—'}</td>
            </tr>
          </tbody>
        </table>

        {/* Academic Performance */}
        <div className="bg-green-800 text-white text-center font-bold text-[10px] py-0.5 uppercase tracking-wider mb-0">
          Academic Performance
        </div>
        <table className="w-full border border-gray-800 text-[10px] mb-0">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-800 px-2 py-1 text-left w-[28%]">Subject</th>
              <th className="border border-gray-800 px-1 py-1">1st CA<br/><span className="font-normal text-[9px]">/20</span></th>
              <th className="border border-gray-800 px-1 py-1">2nd CA<br/><span className="font-normal text-[9px]">/20</span></th>
              <th className="border border-gray-800 px-1 py-1">Exam<br/><span className="font-normal text-[9px]">/60</span></th>
              <th className="border border-gray-800 px-1 py-1 font-black">Total<br/><span className="font-normal text-[9px]">/100</span></th>
              <th className="border border-gray-800 px-1 py-1">Grade</th>
              <th className="border border-gray-800 px-2 py-1">Remark</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((s, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-gray-800 px-2 py-1 font-medium">{s.subject}</td>
                <td className="border border-gray-800 px-1 py-1 text-center">{s.ca1 > 0 ? s.ca1 : '—'}</td>
                <td className="border border-gray-800 px-1 py-1 text-center">{s.ca2 > 0 ? s.ca2 : '—'}</td>
                <td className="border border-gray-800 px-1 py-1 text-center">{s.exam > 0 ? s.exam : '—'}</td>
                <td className="border border-gray-800 px-1 py-1 text-center font-black">{s.total}</td>
                <td className={`border border-gray-800 px-1 py-1 text-center ${gradeColor(s.grade)}`}>{s.grade}</td>
                <td className="border border-gray-800 px-2 py-1 text-center">{s.remark}</td>
              </tr>
            ))}
            {/* Summary row */}
            <tr className="bg-green-50 font-bold">
              <td className="border border-gray-800 px-2 py-1">TOTAL / AVERAGE</td>
              <td className="border border-gray-800 px-1 py-1 text-center" colSpan={3}></td>
              <td className="border border-gray-800 px-1 py-1 text-center font-black text-green-800">
                {classStats.grandTotal}
              </td>
              <td className="border border-gray-800 px-1 py-1 text-center">
                {subjects.length > 0 ? getNigerianGrade(Math.round(classStats.grandTotal / subjects.length)).grade : '—'}
              </td>
              <td className="border border-gray-800 px-2 py-1 text-center">
                {subjects.length > 0 ? getNigerianGrade(Math.round(classStats.grandTotal / subjects.length)).remark : '—'}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Class statistics */}
        <table className="w-full border border-gray-800 border-t-0 text-[10px] mb-2">
          <tbody>
            <tr>
              <td className="border border-gray-800 px-2 py-1"><span className="font-bold">No. of Subjects:</span> {subjects.length}</td>
              <td className="border border-gray-800 px-2 py-1"><span className="font-bold">Grand Total:</span> {classStats.grandTotal}</td>
              <td className="border border-gray-800 px-2 py-1">
                <span className="font-bold">Position:</span>{' '}
                <span className="text-green-800 font-black">{ordinal(classStats.position)}</span>
                {' '}/ {classStats.totalStudents}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-800 px-2 py-1"><span className="font-bold">Highest in Class:</span> {classStats.highestInClass}</td>
              <td className="border border-gray-800 px-2 py-1"><span className="font-bold">Lowest in Class:</span> {classStats.lowestInClass}</td>
              <td className="border border-gray-800 px-2 py-1"><span className="font-bold">Class Average:</span> {classStats.classAverage}</td>
            </tr>
          </tbody>
        </table>

        {/* Affective Domain */}
        <div className="bg-green-800 text-white text-center font-bold text-[10px] py-0.5 uppercase tracking-wider mb-0">
          Affective / Psychomotor Domain
        </div>
        <table className="w-full border border-gray-800 border-t-0 text-[10px] mb-2">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-800 px-2 py-1 text-left">Trait</th>
              <th className="border border-gray-800 px-2 py-1">Rating</th>
              <th className="border border-gray-800 px-2 py-1">Remark</th>
              <th className="border border-gray-800 px-2 py-1 text-left">Trait</th>
              <th className="border border-gray-800 px-2 py-1">Rating</th>
              <th className="border border-gray-800 px-2 py-1">Remark</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Punctuality', behavior.punctuality, 'Neatness', behavior.neatness],
              ['Honesty', behavior.honesty, 'Cooperation', behavior.cooperation],
              ['Attentiveness', behavior.attentiveness, 'Politeness', behavior.politeness],
            ].map(([l1, v1, l2, v2], i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-gray-800 px-2 py-1 font-medium">{l1 as string}</td>
                <td className="border border-gray-800 px-2 py-1 text-center font-bold">{BEHAVIOR_LETTER[v1 as number] || '—'}</td>
                <td className="border border-gray-800 px-2 py-1 text-center">{BEHAVIOR_WORD[v1 as number] || '—'}</td>
                <td className="border border-gray-800 px-2 py-1 font-medium">{l2 as string}</td>
                <td className="border border-gray-800 px-2 py-1 text-center font-bold">{BEHAVIOR_LETTER[v2 as number] || '—'}</td>
                <td className="border border-gray-800 px-2 py-1 text-center">{BEHAVIOR_WORD[v2 as number] || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Key */}
        <div className="text-[9px] text-gray-600 mb-2">
          <span className="font-bold">Rating Key:</span> A = Excellent (5) &nbsp;|&nbsp; B = Very Good (4) &nbsp;|&nbsp; C = Good (3) &nbsp;|&nbsp; D = Fair (2) &nbsp;|&nbsp; E = Poor (1)
        </div>

        {/* Attendance */}
        <div className="bg-green-800 text-white text-center font-bold text-[10px] py-0.5 uppercase tracking-wider mb-0">
          Attendance Record
        </div>
        <table className="w-full border border-gray-800 border-t-0 text-[10px] mb-2">
          <tbody>
            <tr>
              <td className="border border-gray-800 px-2 py-1"><span className="font-bold">Total Days School Opened:</span> {attendance.totalDays || '—'}</td>
              <td className="border border-gray-800 px-2 py-1"><span className="font-bold">Days Present:</span> {attendance.daysPresent || '—'}</td>
              <td className="border border-gray-800 px-2 py-1"><span className="font-bold">Days Absent:</span> {attendance.daysAbsent || '—'}</td>
            </tr>
          </tbody>
        </table>

        {/* Grading Key */}
        <div className="bg-green-800 text-white text-center font-bold text-[10px] py-0.5 uppercase tracking-wider mb-0">
          Grading Scale
        </div>
        <table className="w-full border border-gray-800 border-t-0 text-[9px] mb-2">
          <thead>
            <tr className="bg-gray-100">
              {['A1 (75–100)', 'B2 (70–74)', 'B3 (65–69)', 'C4 (60–64)', 'C5 (55–59)', 'C6 (50–54)', 'D7 (45–49)', 'E8 (40–44)', 'F9 (0–39)'].map(g => (
                <th key={g} className="border border-gray-800 px-1 py-0.5">{g}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {['Excellent', 'Very Good', 'Good', 'Credit', 'Credit', 'Credit', 'Pass', 'Pass', 'Failure'].map((r, i) => (
                <td key={i} className="border border-gray-800 px-1 py-0.5 text-center">{r}</td>
              ))}
            </tr>
          </tbody>
        </table>

        {/* Comments */}
        <div className="bg-green-800 text-white text-center font-bold text-[10px] py-0.5 uppercase tracking-wider mb-0">
          Remarks
        </div>
        <table className="w-full border border-gray-800 border-t-0 text-[10px] mb-2">
          <tbody>
            <tr>
              <td className="border border-gray-800 px-2 py-2 w-1/2">
                <span className="font-bold">Class Teacher's Remark:</span><br />
                <span className="italic">{comments.teacher || '___________________________________________'}</span>
              </td>
              <td className="border border-gray-800 px-2 py-2 w-1/2">
                <span className="font-bold">Principal's Remark:</span><br />
                <span className="italic">{comments.principal || '___________________________________________'}</span>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Next term + Signatures */}
        <table className="w-full border border-gray-800 text-[10px]">
          <tbody>
            <tr>
              <td className="border border-gray-800 px-2 py-2">
                <span className="font-bold">Next Term Begins:</span>{' '}
                {nextTerm.begins ? new Date(nextTerm.begins).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }) : '_______________'}
              </td>
              <td className="border border-gray-800 px-2 py-2">
                <span className="font-bold">Fees for Next Term:</span>{' '}
                {nextTerm.fees || '_______________'}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-800 px-2 py-4">
                <span className="font-bold">Class Teacher's Signature:</span>
                <span className="ml-2 inline-block w-32 border-b border-black"></span>
              </td>
              <td className="border border-gray-800 px-2 py-4">
                <span className="font-bold">Principal's Signature:</span>
                <span className="ml-2 inline-block w-32 border-b border-black"></span>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="text-center text-[9px] text-gray-500 mt-2 italic">
          This is a computer-generated result card. For queries, contact the school office.
        </div>
      </div>
    </>
  );
}
