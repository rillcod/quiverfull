/*
  # Messages Table
  In-app messaging between admin, teachers, and parents.
  Supports:
    - Direct messages (sender → recipient)
    - Broadcast (recipient_id IS NULL, target_role filters by role)
    - Thread replies (parent_message_id references parent)
*/

CREATE TABLE IF NOT EXISTS messages (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id      uuid REFERENCES profiles(id) ON DELETE CASCADE,
  target_role       text,   -- 'parent' | 'teacher' | 'all' for broadcasts
  subject           text NOT NULL DEFAULT '',
  body              text NOT NULL,
  is_read           boolean NOT NULL DEFAULT false,
  parent_message_id uuid REFERENCES messages(id) ON DELETE SET NULL,
  created_at        timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Senders can see messages they sent
CREATE POLICY "Senders can see own messages"
  ON messages FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND id = messages.sender_id)
  );

-- Recipients can see messages sent to them
CREATE POLICY "Recipients can see own messages"
  ON messages FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND id = messages.recipient_id)
  );

-- Role-based broadcast: users with matching role can see
CREATE POLICY "Broadcast role messages visible to target role"
  ON messages FOR SELECT TO authenticated
  USING (
    recipient_id IS NULL AND target_role IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
        AND (target_role = 'all' OR role::text = target_role)
    )
  );

-- Any authenticated user can insert (send) messages
CREATE POLICY "Authenticated can send messages"
  ON messages FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND id = sender_id)
  );

-- Recipients can mark messages as read
CREATE POLICY "Recipients can update is_read"
  ON messages FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND id = messages.recipient_id)
  )
  WITH CHECK (true);
