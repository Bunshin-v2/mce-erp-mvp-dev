
-- RBAC Function to extract user role from the Clerk JWT
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS text
LANGUAGE sql STABLE
AS $$
  SELECT coalesce(
    nullif(current_setting('request.jwt.claims', true)::json->>'user_role', ''),
    nullif(current_setting('request.jwt.claims', true)::json->>'https://clerk.com/user_role', ''),
    'viewer' -- Default role if claim is missing
  );
$$;

-- Note: The role claim must be passed by Clerk into the JWT via the "Customize JWT Templates" setting.
-- Example roles: 'viewer', 'engineer', 'pm', 'dept_head', 'super_admin'
