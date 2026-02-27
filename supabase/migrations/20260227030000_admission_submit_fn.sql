-- ── Public admission submission RPC ──────────────────────────────────────
-- SECURITY DEFINER function callable by anon/authenticated without RLS issues.
-- The calling user never touches the table directly; the function owner does.

CREATE OR REPLACE FUNCTION public.submit_admission_application(
  p_parent_name       text,
  p_email             text,
  p_phone             text,
  p_address           text,
  p_child_name        text,
  p_program           text,
  p_emergency_contact text,
  p_emergency_phone   text,
  p_child_age         text     DEFAULT NULL,
  p_date_of_birth     date     DEFAULT NULL,
  p_gender            text     DEFAULT NULL,
  p_previous_school   text     DEFAULT NULL,
  p_medical_conditions text    DEFAULT NULL,
  p_message           text     DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  -- Basic validation
  IF length(trim(p_parent_name)) = 0 THEN RAISE EXCEPTION 'parent_name is required'; END IF;
  IF length(trim(p_email)) = 0 THEN RAISE EXCEPTION 'email is required'; END IF;
  IF length(trim(p_phone)) = 0 THEN RAISE EXCEPTION 'phone is required'; END IF;
  IF length(trim(p_child_name)) = 0 THEN RAISE EXCEPTION 'child_name is required'; END IF;
  IF length(trim(p_program)) = 0 THEN RAISE EXCEPTION 'program is required'; END IF;

  INSERT INTO admission_applications (
    parent_name, email, phone, address,
    child_name, child_age, date_of_birth, gender, program,
    previous_school, medical_conditions,
    emergency_contact, emergency_phone,
    message
  ) VALUES (
    p_parent_name, p_email, p_phone, p_address,
    p_child_name, p_child_age, p_date_of_birth, p_gender, p_program,
    p_previous_school, p_medical_conditions,
    p_emergency_contact, p_emergency_phone,
    p_message
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- Allow anyone (website visitors + logged-in parents) to submit
GRANT EXECUTE ON FUNCTION public.submit_admission_application(
  text, text, text, text, text, text, text, text,
  text, date, text, text, text, text
) TO anon, authenticated;
