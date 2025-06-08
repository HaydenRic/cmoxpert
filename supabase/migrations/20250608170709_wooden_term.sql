/*
  # Add source client ID to playbooks table

  1. Schema Changes
    - Add `source_client_id` column to `playbooks` table
    - This links AI-generated playbooks to specific clients
    - Column is nullable as not all playbooks are client-specific

  2. Security
    - Foreign key constraint ensures data integrity
    - Existing RLS policies will continue to work
*/

-- Add source_client_id column to playbooks table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'playbooks' AND column_name = 'source_client_id'
  ) THEN
    ALTER TABLE playbooks ADD COLUMN source_client_id uuid;
  END IF;
END $$;

-- Add foreign key constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'playbooks_source_client_id_fkey'
  ) THEN
    ALTER TABLE playbooks 
    ADD CONSTRAINT playbooks_source_client_id_fkey 
    FOREIGN KEY (source_client_id) REFERENCES clients(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS playbooks_source_client_id_idx ON playbooks(source_client_id);