import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  if (!await isAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { username } = await params

  const { data: player } = await supabaseAdmin
    .from('players')
    .select('*')
    .eq('username', username)
    .single()

  if (!player) return NextResponse.json({ error: 'Player not found' }, { status: 404 })

  const { data: snapshots } = await supabaseAdmin
    .from('snapshots')
    .select('*')
    .eq('player_id', player.id)
    .order('taken_at', { ascending: false })
    .limit(90)

  return NextResponse.json({ player, snapshots })
}
