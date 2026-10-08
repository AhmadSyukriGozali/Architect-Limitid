import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Membuat Supabase client untuk server.
export async function createClient() {
  // Mengambil cookie session dari request.
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        // Mengambil seluruh cookie Supabase.
        getAll() {
          return cookieStore.getAll();
        },

        // Menyimpan cookie hasil refresh session.
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Component tidak selalu boleh menulis cookie.
            // Proxy akan menangani refresh session.
          }
        },
      },
    }
  );
}