/*
  # admin_create_user RPC Function
  Allows admin users to create new auth accounts directly via the DB,
  bypassing the need for the edge function.
  Inserts into auth.users + auth.identities and returns the new user UUID.
*/

CREATE OR REPLACE FUNCTION public.admin_create_user(
  user_email    text,
  user_password text,
  user_first_name text,
  user_last_name  text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id    uuid;
  caller_role    user_role;
BEGIN
  -- Verify caller is authenticated admin
  SELECT p.role INTO caller_role
  FROM profiles p
  WHERE p.user_id = auth.uid();

  IF caller_role IS DISTINCT FROM 'admin'::user_role THEN
    RAISE EXCEPTION 'Only admins can create users';
  END IF;

  -- Check email not already taken
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = lower(user_email)) THEN
    RAISE EXCEPTION 'A user with this email already exists';
  END IF;

  new_user_id := gen_random_uuid();

  -- Create the auth user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    lower(user_email),
    crypt(user_password, gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object(
      'first_name', user_first_name,
      'last_name',  user_last_name
    ),
    now(),
    now(),
    '', '', '', ''
  );

  -- Create the identity record (email provider)
  INSERT INTO auth.identities (
    id,
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    lower(user_email),
    new_user_id,
    jsonb_build_object(
      'sub',            new_user_id::text,
      'email',          lower(user_email),
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    now(),
    now(),
    now()
  );

  RETURN new_user_id;
END;
$$;

-- Grant execution to authenticated users (admin check is inside the function)
GRANT EXECUTE ON FUNCTION public.admin_create_user(text, text, text, text) TO authenticated;
