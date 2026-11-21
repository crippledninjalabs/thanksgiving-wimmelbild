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
    // (x, y) = trolley on the cable; drop = cord length beyond the rest length; tilt = rad (tipping)
    draw(ctx, x, y, drop, lod, payload, tilt = 0) {
      const W = this.W, H = this.H, by = y + 4 + drop;
      D.rect(ctx, x - 6, y - 4, 12, 7, '#4f5861');                                 // trolley
      if (lod !== 'far') { D.circle(ctx, x - 3, y - 4, 2.4, '#2f353b'); D.circle(ctx, x + 3, y - 4, 2.4, '#2f353b'); }
      D.line(ctx, [[x, y + 3], [x, by]], '#59626b', 1);                            // cord
      ctx.save(); ctx.translate(x, by); ctx.rotate(tilt);
      D.line(ctx, [[0, 0], [-W / 2, 6]], '#59626b', 1); D.line(ctx, [[0, 0], [W / 2, 6]], '#59626b', 1);
      if (payload) payload(ctx, 0, 6 + H - 3);                                     // payload sits on the basket floor
      D.poly(ctx, [[-W / 2, 6], [W / 2, 6], [W / 2 - 3, 6 + H], [-W / 2 + 3, 6 + H]], 'rgba(235,170,60,0.25)', '#c98a2b', 1.6);
      if (lod !== 'far') for (let i = 1; i < 4; i++) D.line(ctx, [[-W / 2 + i * W / 4, 6], [-W / 2 + i * W / 4 + (i - 2) * 0.8, 6 + H]], '#d9a54d', 0.8);
      ctx.restore();
      return { bottom: by + 6 + H };
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
