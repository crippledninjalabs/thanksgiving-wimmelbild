// TF.peek — reusable easter-egg "peek" pop-ups for the upper space of any room (owner request, Reid 5:05 AM).
// Each peek runs on its own prime period P with its own offset (never a multiple of 24/48, never shared), is a
// pure function of t, and draws its neutral pose (hidden, or resting for props) outside its short active window.
// Usage (from a room module): TF.peek({ id, owner, kind, P, offset, dur, x, y, face?, hatch? })
//   kind: 'shiba' (head pops out of a hatch/vent at y), 'wave' (Optimus climbs up through a catwalk hatch at y and
//   waves), 'drone' (flies up to a high window at x, y and peeks in), 'hardhat' (rests on a pipe at x, y, wobbles).
// Boot checks: P prime and distinct, P >= dur + 6, neutral at t = 0 and t = 48 (so the 48 s loop seam stays clean).
(function (G) {
  const TF = G.TF, D = TF.draw, A = TF.act;
  TF.peeks = [];
  TF.peekKinds = {};
  TF.peek = (cfg) => { TF.peeks.push(Object.assign({ dur: 5, face: 1, layer: 'front' }, cfg)); return cfg; };
  // local time inside the active window, or null when neutral
  TF.peekU = (p, t) => { const u = TF.mod(t - p.offset, p.P); return u < p.dur ? u : null; };
  TF.peekBox = (p) => ({ x: p.x - 90, y: p.y - 140, w: 180, h: 200 });

  const K = TF.peekKinds;
  // Shiba head rising out of a hatch whose lip is at (x, y); hatch flap is drawn by the owner (or here if p.hatch)
  K.shiba = (ctx, p, u, t, lod) => {
    if (p.hatch) { const open = u === null ? 0 : TF.pulse(u, 0, p.dur, 0.35); D.rect(ctx, p.x - 13, p.y - 2 - open * 10, 26, 3, '#7b848c'); }
    if (u === null) return;
    const rise = TF.pulse(u, 0.2, p.dur - 0.2, 0.7), look = Math.sin((u - 1) * 1.6) * TF.pulse(u, 1, p.dur - 1, 0.4);
    const blink = TF.mod(u, 1.7) < 0.12;
    ctx.save(); ctx.beginPath(); ctx.rect(p.x - 40, p.y - 60, 80, 60); ctx.clip();
    ctx.translate(p.x + look * 3, p.y + 20 - rise * 30); ctx.scale(p.face * (1 - 0.25 * Math.abs(look)), 1);
    const fur = '#d98a3d', cream = '#f6e7cf';
    D.poly(ctx, [[-10, -8], [-7, -19], [-2, -9]], fur, '#8a5222', 0.8); D.poly(ctx, [[10, -8], [7, -19], [2, -9]], fur, '#8a5222', 0.8);
    D.poly(ctx, [[-8.5, -9], [-7, -15], [-4, -9]], '#f3c9a0'); D.poly(ctx, [[8.5, -9], [7, -15], [4, -9]], '#f3c9a0');
    ctx.beginPath(); ctx.ellipse(0, 0, 11, 10, 0, 0, Math.PI * 2); ctx.fillStyle = fur; ctx.fill(); ctx.strokeStyle = '#8a5222'; ctx.lineWidth = 0.8; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, 4.5, 7.5, 5.5, 0, 0, Math.PI * 2); ctx.fillStyle = cream; ctx.fill();
    D.circle(ctx, -4, -2, 1.3, '#f6e7cf'); D.circle(ctx, 4, -2, 1.3, '#f6e7cf');      // eyebrow dots
    if (blink) { D.line(ctx, [[-5.5, 0.5], [-2.5, 0.5]], '#222', 1); D.line(ctx, [[2.5, 0.5], [5.5, 0.5]], '#222', 1); }
    else { D.circle(ctx, -4, 0.8, 1.6, '#222'); D.circle(ctx, 4, 0.8, 1.6, '#222'); }
    D.circle(ctx, 0, 3.5, 1.6, '#222'); D.line(ctx, [[0, 5], [-2, 7], [-3.5, 6.5]], '#222', 0.7); D.line(ctx, [[0, 5], [2, 7], [3.5, 6.5]], '#222', 0.7);
    ctx.restore();
  };
  // Optimus climbs up through a catwalk floor hatch at (x, y = deck top), waves, climbs back down
  K.wave = (ctx, p, u, t, lod) => {
    const flap = u === null ? 0 : TF.pulse(u, 0, p.dur, 0.4);
    D.rect(ctx, p.x - 14, p.y - 2 - flap * 12, 4, 2 + flap * 12, '#7b848c');
    if (u === null || lod === 'far') return;
    const rise = TF.pulse(u, 0.3, p.dur - 0.2, 1.0), w = Math.sin(u * 9) * TF.pulse(u, 1.3, p.dur - 1.2, 0.3);
    const pose = A.reach([0.12 + 0.12 * w, 1.72 + 0.05 * Math.abs(w)], null, { gripN: 0, angN: 1.4 + 0.5 * w, head: -0.1 });
    ctx.save(); ctx.beginPath(); ctx.rect(p.x - 60, p.y - 140, 120, 140); ctx.clip();
    A.draw(ctx, { id: p.id, peek: true, x: p.x, face: p.face, pose }, p.y + (1 - rise) * 95);
    ctx.restore();
  };
  // quadcopter flies in from outside (from the side p.face points away from) and peeks through a high window
  K.drone = (ctx, p, u, t, lod) => {
    if (u === null) return;
    const k = TF.pulse(u, 0, p.dur, 1.6), x = p.x + p.face * (1 - k) * 160 + Math.sin(u * 2.3) * 2, y = p.y - (1 - k) * 60 + Math.sin(u * 3.1) * 2;
    D.rect(ctx, x - 11, y - 3, 22, 7, '#3a3f45', '#1d2125', 0.8);
    D.circle(ctx, x - p.face * 9, y + 1, 2.6, '#1d2125'); D.circle(ctx, x - p.face * 9.5, y + 0.6, 1, '#4da3ff');   // camera eye
    for (const s of [-1, 1]) {
      D.line(ctx, [[x + s * 9, y - 3], [x + s * 13, y - 7]], '#3a3f45', 1.6);
      const r = 7 * Math.abs(Math.cos(t * 37.69911184307752 + s));
      D.line(ctx, [[x + s * 13 - r, y - 8], [x + s * 13 + r, y - 8]], '#5d656d', 1.4);
    }
  };
  // hard hat resting on a pipe; rocks and settles during its window
  K.hardhat = (ctx, p, u, t, lod) => {
    const a = u === null ? 0 : 0.35 * Math.sin(u * 7) * TF.pulse(u, 0, p.dur, 0.3) * (1 - u / p.dur);
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(a);
    ctx.beginPath(); ctx.arc(0, -1, 8, Math.PI, 0); ctx.closePath(); ctx.fillStyle = '#f2c230'; ctx.fill(); ctx.strokeStyle = '#9c7a12'; ctx.lineWidth = 0.8; ctx.stroke();
    D.rect(ctx, -11, -1.5, 22, 2.5, '#e0b020', '#9c7a12', 0.6); D.line(ctx, [[0, -9], [0, -2]], '#e0b020', 1.5);
    ctx.restore();
  };

  // Long gag hooks (FACTORY-MAP §7): registered with their prime timer and room now, animated in a later stage.
  // Outside its active cycles a hook is in its neutral pose (for 'diablo': sign off, PC parts not assembled).
  TF.gagHooks = [];
  TF.gagHook = (cfg) => { TF.gagHooks.push(cfg); return cfg; };
  TF.gagActive = (g, t) => !TF.GAGS_OFF && TF.mod(t - g.offset, g.P) < 24 * g.cycles;
  TF.drawPeeks = (ctx, t, lod, vb) => {
    if (lod === 'far') return;
    for (const p of TF.peeks) if (TF.boxHit(TF.peekBox(p), vb)) K[p.kind](ctx, p, TF.peekU(p, t), t, lod);
  };
  const prime = (n) => { if (n < 2) return false; for (let k = 2; k * k <= n; k++) if (n % k === 0) return false; return true; };
  TF.checkPeeks = () => {
    const problems = [], seen = {};
    for (const p of TF.peeks) {
      if (!prime(p.P)) problems.push(`peek ${p.id}: period ${p.P} is not prime`);
      if (seen[p.P]) problems.push(`peek ${p.id}: period ${p.P} shared with ${seen[p.P]}`); seen[p.P] = p.id;
      if (p.P < p.dur + 6) problems.push(`peek ${p.id}: period too short for its window`);
      for (const tt of [0, TF.LOOP]) if (TF.peekU(p, tt) !== null) problems.push(`peek ${p.id}: active at t=${tt} (loop seam)`);
      if (!K[p.kind]) problems.push(`peek ${p.id}: unknown kind ${p.kind}`);
    }
    // Peek primes already in use must stay unique; gag primes (FACTORY-MAP §7) may be used by exactly one gag.
    const peekP = TF.peeks.map((p) => p.P);
    const gagReserved = [53, 61, 67, 71, 89, 127, 193];
    for (const p of TF.peeks) if (gagReserved.includes(p.P)) problems.push(`peek ${p.id}: period ${p.P} is reserved for a gag`);
    const gagP = {};
    for (const g of TF.gagHooks) {
      if (!prime(g.P)) problems.push(`gag ${g.id}: period ${g.P} is not prime`);
      if (peekP.includes(g.P)) problems.push(`gag ${g.id}: period ${g.P} is used by a peek`);
      if (gagP[g.P]) problems.push(`gag ${g.id}: period ${g.P} shared with ${gagP[g.P]}`);
      gagP[g.P] = g.id;
      if (g.P < 24 * (g.cycles + 1)) problems.push(`gag ${g.id}: P >= 24 (k + 1) violated`);
      // gags sit on prime periods, so they may legally be mid-cycle at t=0 or t=48; the 48 s machine loop is checked with TF.GAGS_OFF.
    }
    return problems;
  };
})(typeof window !== 'undefined' ? window : globalThis);
