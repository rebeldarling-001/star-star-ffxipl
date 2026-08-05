// ffxipl-presence.js
// Shared "who's in the room" tracker using Supabase Realtime Presence.
// Include with <script src="ffxipl-presence.js"></script> AFTER the
// Supabase client (`sb`) has been created, then call:
//
//   ffxiplJoinPresence(sb, 'admin', {}, (summary) => { ...update UI... });
//   ffxiplJoinPresence(sb, 'captain', { team: 'RR' }, (summary) => { ... });
//   ffxiplJoinPresence(sb, 'viewer', {}, (summary) => { ... });
//
// `summary` is: { adminOnline: bool, teamsOnline: Set<string>, viewerCount: number, all: array }

function ffxiplJoinPresence(sb, role, meta, onUpdate) {
  const key = role + '-' + Math.random().toString(36).slice(2, 10);
  const channel = sb.channel('ffxipl-presence', { config: { presence: { key } } });

  channel.on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState();
    onUpdate(ffxiplSummarizePresence(state));
  });

  channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track(Object.assign({ role, online_at: new Date().toISOString() }, meta));
    }
  });

  return channel;
}

function ffxiplSummarizePresence(state) {
  const all = Object.values(state).flat();
  const adminOnline = all.some(p => p.role === 'admin');
  const teamsOnline = new Set(all.filter(p => p.role === 'captain' && p.team).map(p => p.team));
  const viewerCount = all.filter(p => p.role === 'viewer').length;
  return { adminOnline, teamsOnline, viewerCount, all };
}