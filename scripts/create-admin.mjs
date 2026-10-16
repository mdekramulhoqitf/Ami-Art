// One-time helper to create the first (and only) admin login for Ami Art.
// This is the ONLY place the service-role key is ever used — never ship it
// to the browser or reference it from application code.
//
// Usage:
//   node --env-file=.env.local scripts/create-admin.mjs owner@example.com "a-strong-password"

import { createClient } from "@supabase/supabase-js";

const [, , email, password] = process.argv;

if (!email || !password) {
  console.error(
    'Usage: node --env-file=.env.local scripts/create-admin.mjs <email> <password>'
  );
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Run with --env-file=.env.local."
  );
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (error) {
  console.error("Failed to create admin user:", error.message);
  process.exit(1);
}

console.log(`Admin user created: ${data.user.email} (${data.user.id})`);
console.log("You can now log in at /admin/login with this email and password.");
