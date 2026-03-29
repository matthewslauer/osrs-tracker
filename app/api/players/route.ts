import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { fetchPlayer } from '@/lib/wom'

export async function GET() {
  if (!await isAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('players')
    .select('*, snapshots(data, taken_at)')
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (!await isAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { username } = await req.json()
  if (!username?.trim()) return NextResponse.json({ error: 'Username required' }, { status: 400 })

  // Verify player exists on WOM/hiscores
  let womPlayer
  try {
    womPlayer = await fetchPlayer(username.trim())
  } catch {
    return NextResponse.json({ error: 'Player not found on hiscores' }, { status: 404 })
  }

  const { data, error } = await supabaseAdmin
    .from('players')
    .insert({ username: womPlayer.username, display_name: womPlayer.displayName })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Player already tracked' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Store initial snapshot
  await supabaseAdmin.from('snapshots').insert({
    player_id: data.id,
    data: womPlayer.latestSnapshot,
  })

  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  if (!await isAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  await supabaseAdmin.from('snapshots').delete().eq('player_id', id)
  await supabaseAdmin.from('players').delete().eq('id', id)
  return NextResponse.json({ success: true })
}
