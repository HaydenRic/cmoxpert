import os
import re

def fix_edge_function(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Check if already has authHeader extraction
    if 'req.headers.get' in content and 'Authorization' in content:
        print(f"  Already has authHeader extraction, skipping")
        return False
    
    # Find the createClient call
    pattern = r'(const supabase = createClient\(\s*Deno\.env\.get\(["\']SUPABASE_URL["\']\)[^,]*,\s*Deno\.env\.get\(["\']SUPABASE_ANON_KEY["\']\)[^)]*)(\)\s*;)'
    
    match = re.search(pattern, content)
    if not match:
        print(f"  Could not find createClient pattern")
        return False
    
    # Add authHeader extraction before createClient
    insertion_point = content.find(match.group(0))
    before = content[:insertion_point]
    after = content[insertion_point:]
    
    auth_header_code = "    // Extract user's JWT from Authorization header for RLS\n    const authHeader = req.headers.get('Authorization')!;\n\n    "
    
    # Replace createClient to add third parameter
    new_client_call = match.group(1) + ',\n    { global: { headers: { Authorization: authHeader } } }' + match.group(2)
    after = after.replace(match.group(0), new_client_call)
    
    new_content = before + auth_header_code + after
    
    # Write back
    with open(filepath, 'w') as f:
        f.write(new_content)
    
    return True

# Process all edge functions
functions_dir = 'supabase/functions'
for func_name in os.listdir(functions_dir):
    index_path = os.path.join(functions_dir, func_name, 'index.ts')
    if os.path.isfile(index_path):
        print(f"Processing {index_path}...")
        try:
            if fix_edge_function(index_path):
                print(f"  ✓ Fixed!")
        except Exception as e:
            print(f"  ✗ Error: {e}")

print("\nAll edge functions processed!")
