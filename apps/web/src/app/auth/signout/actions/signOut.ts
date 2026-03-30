'use server'

import { redirect } from 'next/navigation'
import { clearSessionCookie, getSession, revokeUserSessions } from '../../../../libs/auth/session'

export async function signOut() {
  const session = await getSession()

  if (session) {
    try {
      await revokeUserSessions(session.uid)
    } catch {
      // Firebase Admin SDK failure should not block sign-out
    }
  }

  await clearSessionCookie()

  redirect('/auth/signin')
}
