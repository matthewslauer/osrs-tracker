import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { fetchPlayer } from '@/lib/wom'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: players, error } = await supabaseAdmin.from('players').select('*')
  if (error) return NextResponse.json({ error: 'Failed to load players' }, { status: 500 })

  const results = await Promise.allSettled(
    players.map(async (player) => {
      const womPlayer = await fetchPlayer(player.username)
      if (!womPlayer.latestSnapshot) return

      await supabaseAdmin.from('snapshots').insert({
        player_id: player.id,
        data: womPlayer.latestSnapshot,
      })

      // Update display name in case it changed
      await supabaseAdmin
        .from('players')
        .update({ display_name: womPlayer.displayName })
        .eq('id', player.id)

      return player.username
    })
  )

  const succeeded = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length

  return NextResponse.json({ succeeded, failed })
}
