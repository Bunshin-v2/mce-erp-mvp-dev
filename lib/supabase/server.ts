
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Define a function for the standard, RLS-secured client
export const createClient = async (
    url: string = process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
) => {
  if (!url || !anonKey) {
    throw new Error('Supabase URL or Anon Key is missing. Please check your .env.local file.');
  }

  const cookieStore = await cookies()

  // Create a server's supabase client with newly configured cookie
  return createServerClient(
    url,
    anonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Error handling for Server Components (expected)
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Error handling for Server Components (expected)
          }
        },
      },
    }
  )
}
