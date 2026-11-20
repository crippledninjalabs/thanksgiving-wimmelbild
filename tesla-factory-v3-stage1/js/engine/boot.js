// TF.boot — boot checks (FACTORY-MAP §8, §9): periods divide 48, every flow has a source, a connector chain and a
// sink, every built room has an input and an output, every port names a real connector, no actor owned twice.
// Anything orphaned or pending is listed on the console.
(function (G) {
  const TF = G.TF, L = TF.layout;
  TF.boot = () => {
    const problems = [], pending = [], info = [];
    const built = Object.keys(TF.rooms);
    for (const x of [...Object.values(TF.rooms), ...TF.transports])
      if (!x.period || (TF.LOOP / x.period) % 1) problems.push(`period ${x.period} of ${x.id} does not divide ${TF.LOOP}`);
    for (const f of TF.flows) {
      if (!L.exists(f.from)) problems.push(`flow "${f.item}": unknown source ${f.from}`);
      if (!L.exists(f.to)) problems.push(`flow "${f.item}": unknown destination ${f.to}`);
      if (!f.sink) problems.push(`flow "${f.item}": no sink`);
      for (const c of f.via || []) if (!L.conById(c)) problems.push(`flow "${f.item}": unknown connector ${c}`);
      for (const end of [f.from, f.to]) if (L.roomById(end) && !TF.rooms[end]) pending.push(`flow "${f.item}" ${end === f.from ? 'starts in' : 'ends in'} unbuilt room ${end} (shell)`);
    }
    for (const id of built) {
      const m = TF.rooms[id];
      if (!TF.flows.some((f) => f.to === id)) problems.push(`room ${id} has no input flow`);
      if (!TF.flows.some((f) => f.from === id)) problems.push(`room ${id} has no output flow`);
      for (const c in m.ports || {}) if (!L.conById(c)) problems.push(`room ${id}: port ${c} names no connector`);
      // every geometric connector touching a built room must be declared as a port (else orphan)
      for (const c of L.connectors) {
        if (c.type === 'pending' || c.spare) continue;
        const touches = c.a === id || c.b === id || (c.also || []).includes(id);
        if (touches && !(m.ports || {})[c.id]) problems.push(`orphan connector ${c.id} at room ${id} (no port)`);
      }
      for (const c in m.ports || {}) {
        const con = L.conById(c);
        if (!con || m.ports[c] === 'spare' || m.ports[c] === 'pass') continue;
        if (!TF.flows.some((f) => (f.via || []).includes(c))) problems.push(`orphan port ${id}.${c}: no flow uses it`);
      }
    }
    problems.push(...TF.checkPeeks());
    const seen = {};
    for (const id of built) for (const a of TF.rooms[id].actors || []) { if (seen[a]) problems.push(`actor ${a} owned by ${seen[a]} and ${id}`); seen[a] = id; }
    info.push(`${built.length} room modules (${built.join(' ')}), ${TF.transports.length} transports, ${TF.flows.length} flows, ${TF.peeks.length} peeks, ${L.roomList.length - built.length} empty shells`);
    const ok = problems.length === 0;
    console.log(`[boot] ${ok ? 'OK' : 'PROBLEMS'} — ${info[0]}`);
    problems.forEach((p) => console.warn('[boot] ' + p));
    if (pending.length) console.log('[boot] pending (unbuilt neighbours, expected): ' + [...new Set(pending)].join('; '));
    return { ok, problems, pending: [...new Set(pending)], info };
  };
})(typeof window !== 'undefined' ? window : globalThis);
