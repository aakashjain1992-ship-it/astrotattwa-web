export const dynamic = 'force-dynamic'

import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
   const userId = request.headers.get('x-user-id')

  if (!userId) {
    return NextResponse.json({ user: null })
  }

  return NextResponse.json({
    user: {
      id: userId,
      email: request.headers.get('x-user-email') ?? '',
      fullName: request.headers.get('x-user-name') || null,
      avatarUrl: request.headers.get('x-user-avatar') || null,
    }
  })
}
