#!/bin/bash
# Fix all edge functions to use RLS-safe authentication

for func_dir in supabase/functions/*/; do
  index_file="${func_dir}index.ts"
  if [ -f "$index_file" ]; then
    echo "Checking $index_file..."
    # Check if file contains SERVICE_ROLE_KEY
    if grep -q "SUPABASE_SERVICE_ROLE_KEY" "$index_file"; then
      echo "  Fixing $index_file"
      # Create backup
      cp "$index_file" "${index_file}.bak"
      # Replace SERVICE_ROLE_KEY with ANON_KEY
      sed -i 's/SUPABASE_SERVICE_ROLE_KEY/SUPABASE_ANON_KEY/g' "$index_file"
    fi
  fi
done

echo "Done! Review changes and manually add authHeader extraction."
