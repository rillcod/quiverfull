/*
  # CBT Security Hardening

  Problems fixed:
  1. "Students can manage own cbt_sessions" used FOR ALL, allowing students to
     directly UPDATE total_score to any value via the Supabase client.
  2. Score was calculated client-side using correct_option, which was sent to
     the browser. A student could read the answers from JS memory or DevTools.

  Solution:
  - Replace FOR ALL policy with separate FOR SELECT + FOR INSERT policies.
    Students can no longer UPDATE cbt_sessions directly.
  - Add submit_cbt_exam(p_session_id) SECURITY DEFINER function that:
      * Verifies the session belongs to the calling student and is not yet submitted
      * Calculates the score server-side (correct_option never leaves the DB)
      * Updates the session atomically
      * Returns { score, correct_count, total_questions } to the client
*/

-- ─── Fix cbt_sessions RLS ─────────────────────────────────────────────────────

-- Drop the overly-broad FOR ALL policy
DROP POLICY IF EXISTS "Students can manage own cbt_sessions" ON cbt_sessions;

-- Students may only SELECT their own sessions
CREATE POLICY "Students can select own cbt_sessions"
  ON cbt_sessions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN profiles pr ON s.profile_id = pr.id
      WHERE s.id = cbt_sessions.student_id AND pr.user_id = auth.uid()
    )
  );

-- Students may INSERT a new session (startExam)
CREATE POLICY "Students can insert own cbt_sessions"
  ON cbt_sessions FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM students s
      JOIN profiles pr ON s.profile_id = pr.id
      WHERE s.id = cbt_sessions.student_id AND pr.user_id = auth.uid()
    )
  );

-- No UPDATE policy for students — submission is done via RPC (submit_cbt_exam)

-- ─── Server-side scoring function ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION submit_cbt_exam(p_session_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_id    uuid;
  v_exam_id       uuid;
  v_score         integer := 0;
  v_correct_count integer := 0;
  v_total_q       integer := 0;
BEGIN
  -- Verify session belongs to the calling user and has not been submitted yet
  SELECT cs.student_id, cs.exam_id
    INTO v_student_id, v_exam_id
    FROM cbt_sessions cs
    JOIN students s   ON cs.student_id = s.id
    JOIN profiles pr  ON s.profile_id  = pr.id
   WHERE cs.id = p_session_id
     AND pr.user_id = auth.uid()
     AND cs.is_submitted = false;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Session not found or already submitted';
  END IF;

  -- Calculate score entirely on the server (correct_option never leaves DB)
  SELECT
    COUNT(*)::integer,
    COALESCE(SUM(CASE WHEN ca.selected_option = cq.correct_option THEN cq.marks ELSE 0 END)::integer, 0),
    COUNT(CASE WHEN ca.selected_option = cq.correct_option THEN 1 END)::integer
  INTO v_total_q, v_score, v_correct_count
  FROM cbt_questions cq
  LEFT JOIN cbt_answers ca
    ON ca.question_id = cq.id AND ca.session_id = p_session_id
  WHERE cq.exam_id = v_exam_id;

  -- Persist the result
  UPDATE cbt_sessions
     SET total_score  = v_score,
         is_submitted = true,
         submitted_at = now()
   WHERE id = p_session_id;

  RETURN jsonb_build_object(
    'score',           v_score,
    'correct_count',   v_correct_count,
    'total_questions', v_total_q
  );
END;
$$;

-- Grant execute to authenticated users (RLS inside the function enforces ownership)
GRANT EXECUTE ON FUNCTION submit_cbt_exam(uuid) TO authenticated;
