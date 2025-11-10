/*
  # Add source_client_id to playbooks table
  
  1. Changes
    - Add `source_client_id` column to playbooks table
    - Add foreign key constraint to clients table
    - Add index for performance
  
  2. Purpose
    - Link playbooks to the client they were generated for
    - Enable filtering playbooks by client
    - Support client-specific playbook generation tracking
*/

-- Add source_client_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'playbooks' 
    AND column_name = 'source_client_id'
  ) THEN
    ALTER TABLE playbooks ADD COLUMN source_client_id uuid REFERENCES clients(id) ON DELETE SET NULL;
    
    -- Add index for better query performance
    CREATE INDEX IF NOT EXISTS idx_playbooks_source_client_id ON playbooks(source_client_id);
    
    -- Add index on user_id if not exists
    CREATE INDEX IF NOT EXISTS idx_playbooks_user_id ON playbooks(user_id);
  END IF;
END $$;