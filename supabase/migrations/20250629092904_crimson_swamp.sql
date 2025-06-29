/*
  # Client Onboarding Flow

  1. New Tables
    - `onboarding_progress` table to track client onboarding status
      - Tracks current step, completed steps, form data
      - Links to client and user
      - Stores completion status and timestamps

  2. Functions
    - `create_onboarding_progress()` function to automatically create onboarding record when client is created
    - `complete_client_onboarding()` function to mark onboarding as complete

  3. Security
    - Enable RLS on onboarding_progress table
    - Add policies for user access control
*/

-- Create onboarding_progress table if it doesn't exist
CREATE TABLE IF NOT EXISTS onboarding_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  current_step text DEFAULT 'client-info',
  completed_steps jsonb DEFAULT '[]'::jsonb,
  form_data jsonb DEFAULT '{}'::jsonb,
  is_completed boolean DEFAULT false,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own onboarding progress"
  ON onboarding_progress
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS onboarding_progress_client_id_idx ON onboarding_progress(client_id);
CREATE INDEX IF NOT EXISTS onboarding_progress_user_id_idx ON onboarding_progress(user_id);
CREATE INDEX IF NOT EXISTS onboarding_progress_is_completed_idx ON onboarding_progress(is_completed);

-- Create function to automatically create onboarding progress when a client is created
CREATE OR REPLACE FUNCTION create_onboarding_progress()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO onboarding_progress (client_id, user_id)
  VALUES (NEW.id, NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to create onboarding progress on client creation
DROP TRIGGER IF EXISTS on_client_created ON clients;
CREATE TRIGGER on_client_created
  AFTER INSERT ON clients
  FOR EACH ROW
  EXECUTE FUNCTION create_onboarding_progress();

-- Add function to update onboarding progress
CREATE OR REPLACE FUNCTION update_onboarding_progress(
  client_id_param uuid,
  current_step_param text,
  completed_steps_param jsonb,
  form_data_param jsonb
)
RETURNS void AS $$
BEGIN
  UPDATE onboarding_progress
  SET 
    current_step = current_step_param,
    completed_steps = completed_steps_param,
    form_data = form_data_param,
    updated_at = now()
  WHERE client_id = client_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to mark onboarding as complete
CREATE OR REPLACE FUNCTION complete_client_onboarding(client_id_param uuid)
RETURNS void AS $$
BEGIN
  UPDATE onboarding_progress
  SET 
    is_completed = true,
    completed_at = now(),
    updated_at = now()
  WHERE client_id = client_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION update_onboarding_progress(uuid, text, jsonb, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION complete_client_onboarding(uuid) TO authenticated;