import { WOMPlayer, WOMSnapshot } from '@/types'

const WOM_BASE = 'https://api.wiseoldman.net/v2'

export async function fetchPlayer(username: string): Promise<WOMPlayer> {
  await fetch(`${WOM_BASE}/players/${encodeURIComponent(username)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
  const res = await fetch(`${WOM_BASE}/players/${encodeURIComponent(username)}`)
  if (!res.ok) throw new Error(`Player not found: ${username}`)
  return res.json()
}

export async function fetchSnapshots(username: string, limit = 30): Promise<WOMSnapshot[]> {
  const res = await fetch(`${WOM_BASE}/players/${encodeURIComponent(username)}/snapshots?limit=${limit}`)
  if (!res.ok) throw new Error(`Could not fetch snapshots for: ${username}`)
  return res.json()
}

export const SKILLS = [
  'overall', 'attack', 'defence', 'strength', 'hitpoints', 'ranged',
  'prayer', 'magic', 'cooking', 'woodcutting', 'fletching', 'fishing',
  'firemaking', 'crafting', 'smithing', 'mining', 'herblore', 'agility',
  'thieving', 'slayer', 'farming', 'runecrafting', 'hunter', 'construction',
  'sailing',
]

export const SKILL_ICONS: Record<string, string> = {
  overall:      'https://oldschool.runescape.wiki/images/Stats_icon.png',
  attack:       'https://oldschool.runescape.wiki/images/Attack_icon.png',
  defence:      'https://oldschool.runescape.wiki/images/Defence_icon.png',
  strength:     'https://oldschool.runescape.wiki/images/Strength_icon.png',
  hitpoints:    'https://oldschool.runescape.wiki/images/Hitpoints_icon.png',
  ranged:       'https://oldschool.runescape.wiki/images/Ranged_icon.png',
  prayer:       'https://oldschool.runescape.wiki/images/Prayer_icon.png',
  magic:        'https://oldschool.runescape.wiki/images/Magic_icon.png',
  cooking:      'https://oldschool.runescape.wiki/images/Cooking_icon.png',
  woodcutting:  'https://oldschool.runescape.wiki/images/Woodcutting_icon.png',
  fletching:    'https://oldschool.runescape.wiki/images/Fletching_icon.png',
  fishing:      'https://oldschool.runescape.wiki/images/Fishing_icon.png',
  firemaking:   'https://oldschool.runescape.wiki/images/Firemaking_icon.png',
  crafting:     'https://oldschool.runescape.wiki/images/Crafting_icon.png',
  smithing:     'https://oldschool.runescape.wiki/images/Smithing_icon.png',
  mining:       'https://oldschool.runescape.wiki/images/Mining_icon.png',
  herblore:     'https://oldschool.runescape.wiki/images/Herblore_icon.png',
  agility:      'https://oldschool.runescape.wiki/images/Agility_icon.png',
  thieving:     'https://oldschool.runescape.wiki/images/Thieving_icon.png',
  slayer:       'https://oldschool.runescape.wiki/images/Slayer_icon.png',
  farming:      'https://oldschool.runescape.wiki/images/Farming_icon.png',
  runecrafting: 'https://oldschool.runescape.wiki/images/Runecraft_icon.png',
  hunter:       'https://oldschool.runescape.wiki/images/Hunter_icon.png',
  construction: 'https://oldschool.runescape.wiki/images/Construction_icon.png',
  sailing:      'https://oldschool.runescape.wiki/images/Sailing_icon.png',
}

export const BOSS_GROUPS: Record<string, string[]> = {
  Wilderness: ['chaos_elemental', 'chaos_fanatic', 'crazy_archaeologist', 'deranged_archaeologist', 'scorpia', 'venenatis', 'vetion', 'callisto', 'artio', 'spindel', 'calvarion'],
  GWD: ['commander_zilyana', 'general_graardor', 'kreearra', 'kril_tsutsaroth', 'nex'],
  Slayer: ['abyssal_sire', 'alchemical_hydra', 'cerberus', 'grotesque_guardians', 'kraken', 'thermonuclear_smoke_devil'],
  Raids: ['chambers_of_xeric', 'chambers_of_xeric_challenge_mode', 'theatre_of_blood', 'theatre_of_blood_hard_mode', 'tombs_of_amascut', 'tombs_of_amascut_expert_mode'],
  Newer: ['duke_sucellus', 'the_leviathan', 'the_whisperer', 'vardorvis', 'phantom_muspah', 'scurrius', 'sol_heredit', 'amoxliatl', 'araxxor', 'the_hueycoatl'],
  Other: ['barrows_chests', 'bryophyta', 'corporeal_beast', 'dagannoth_prime', 'dagannoth_rex', 'dagannoth_supreme', 'giant_mole', 'hespori', 'kalphite_queen', 'king_black_dragon', 'lunar_chests', 'mimic', 'nightmare', 'phosanis_nightmare', 'obor', 'sarachnis', 'skotizo', 'tempoross', 'the_gauntlet', 'the_corrupted_gauntlet', 'tzkal_zuk', 'tztok_jad', 'vorkath', 'wintertodt', 'zalcano', 'zulrah'],
}

export const ACTIVITIES = [
  'league_points', 'deadman_points', 'bounty_hunter_hunter', 'bounty_hunter_rogue',
  'clue_scrolls_all', 'clue_scrolls_beginner', 'clue_scrolls_easy', 'clue_scrolls_medium',
  'clue_scrolls_hard', 'clue_scrolls_elite', 'clue_scrolls_master',
  'last_man_standing', 'pvp_arena', 'soul_wars_zeal', 'guardians_of_the_rift',
  'colosseum_glory', 'collections_logged',
]

export function formatXP(xp: number): string {
  if (xp >= 1_000_000_000) return `${(xp / 1_000_000_000).toFixed(2)}B`
  if (xp >= 1_000_000) return `${(xp / 1_000_000).toFixed(2)}M`
  if (xp >= 1_000) return `${(xp / 1_000).toFixed(1)}K`
  return xp.toString()
}

export function formatNumber(n: number): string {
  return n.toLocaleString()
}

export function skillLabel(metric: string): string {
  return metric.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

// XP table: index 0 = XP needed for level 1 (0), index 125 = XP for level 126
export const XP_TABLE: number[] = (() => {
  const table = [0]
  let points = 0
  for (let level = 1; level <= 126; level++) {
    points += Math.floor(level + 300 * Math.pow(2, level / 7))
    table.push(Math.floor(points / 4))
  }
  return table
})()

export function getVirtualLevel(xp: number): number {
  let level = 1
  for (let i = 1; i < XP_TABLE.length; i++) {
    if (XP_TABLE[i] > xp) break
    level = i + 1
  }
  return Math.min(level, 126)
}

export function getLevelProgress(xp: number): {
  level: number
  virtualLevel: number
  progressPct: number
  xpToNext: number | null
} {
  const virtualLevel = getVirtualLevel(xp)
  const level = Math.min(virtualLevel, 99)
  if (virtualLevel >= 126) return { level, virtualLevel, progressPct: 1, xpToNext: null }
  const xpCurrent = XP_TABLE[virtualLevel - 1]
  const xpNext = XP_TABLE[virtualLevel]
  const progressPct = (xp - xpCurrent) / (xpNext - xpCurrent)
  return { level, virtualLevel, progressPct, xpToNext: xpNext - xp }
}
