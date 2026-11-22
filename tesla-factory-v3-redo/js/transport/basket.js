// TF.basket — cartoony zip-line baskets (FACTORY-MAP round 3: medium parts). A basket hangs from a trolley
// on a ceiling cable; at a stop it drops on its cord (drop in world units). Payload is drawn by a callback.
(function (G) {
  const TF = G.TF, D = TF.draw;
  TF.basket = {
    W: 34, H: 20,
    // cable line (front cable = outbound, rear cable = return, drawn a little higher and lighter)
    cable(ctx, x0, x1, y, lod) {
      D.line(ctx, [[x0, y], [x1, y]], '#7d868f', 1.6);
      if (lod !== 'far') D.line(ctx, [[x0, y - 7], [x1, y - 7]], '#a8b0b8', 1.2);
    },
    // Cargo drone riding the cable rail. (x, y) = rail point; drop = how far the gripper lowers at a stop; tilt = rad.
    // payload(ctx, x, bottomY) is drawn in the gripper (world coords). Returns { bottom, gx, gy } (gripper bottom).
    draw(ctx, x, y, drop, lod, payload, tilt = 0) {
      const gy = y + 26 + drop;                                                    // gripper pad level
      ctx.save(); ctx.translate(x, y + 10); ctx.rotate(tilt * 0.5); ctx.translate(-x, -(y + 10));
      D.rect(ctx, x - 5, y - 4, 10, 5, '#4f5861');                                 // rail shoe
      D.rect(ctx, x - 13, y + 3, 26, 11, '#e8ebee', '#6b737b', 1);                 // body
      D.rect(ctx, x - 8, y + 6, 16, 4, '#2f353b');                                 // sensor band
      if (lod === 'far') { D.rect(ctx, x - 17, y + 1, 34, 2, '#8a929a'); ctx.restore(); if (payload) payload(ctx, x, gy + 12); return { bottom: gy + 12, gx: x, gy: gy + 12 }; }
      D.circle(ctx, x + 6, y + 8, 1.4, '#38bdf8');                                 // status eye
      const ph = Math.floor(x * 0.4) % 2 ? 1 : 0.35;                                // rotor blur (spins as it travels)
      for (const sx of [-1, 1]) {
        D.line(ctx, [[x + sx * 13, y + 6], [x + sx * 19, y + 1]], '#59626b', 1.5);  // arm
        D.rect(ctx, x + sx * 19 - 1, y - 1, 2, 3, '#2f353b');
        D.line(ctx, [[x + sx * 19 - 9 * ph, y - 2], [x + sx * 19 + 9 * ph, y - 2]], 'rgba(60,70,80,0.7)', 1.6);   // rotor
      }
      D.line(ctx, [[x, y + 14], [x, gy]], '#59626b', 1);                           // winch line
      D.rect(ctx, x - 9, gy, 18, 3, '#4f5861');                                    // gripper head
      const top = gy + 3, bot = gy + 12;
      ctx.restore();
      if (payload) payload(ctx, x, bot);                                           // payload in the claws
      D.line(ctx, [[x - 9, top], [x - 9, bot], [x - 5, bot + 1]], '#c98a2b', 1.8); // claws
      D.line(ctx, [[x + 9, top], [x + 9, bot], [x + 5, bot + 1]], '#c98a2b', 1.8);
      return { bottom: bot + 1, gx: x, gy: bot };
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
