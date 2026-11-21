// TF.rollers — roller bed / belt conveyor. Rollers turn only while a load moves on them: the caller passes the
// roller angle as a pure function of the load's travel (use whole turns per move so the loop stays seamless).
(function (G) {
  const TF = G.TF, D = TF.draw;
  TF.rollers = {
    // x0..x1 world, yTop = top of the rollers, yFloor = floor surface, ang = roller angle (rad)
    draw(ctx, x0, x1, yTop, yFloor, ang, lod, o = {}) {
      const r = o.r || 4.5, pitch = o.pitch || 15;
      D.rect(ctx, x0, yTop + r - 1, x1 - x0, 5, '#aab1b9');                       // side rail
      if (lod !== 'far') for (let x = x0 + 12; x < x1 - 4; x += 60) D.rect(ctx, x, yTop + r + 4, 4, yFloor - yTop - r - 4, '#b9c0c7');
      if (lod === 'far') return;
      for (let x = x0 + pitch / 2; x < x1; x += pitch) {
        D.circle(ctx, x, yTop + r, r, '#8f979f', '#6d757d', 0.8);
        if (lod === 'near') D.line(ctx, [[x, yTop + r], [x + Math.cos(ang) * r * 0.9, yTop + r + Math.sin(ang) * r * 0.9]], '#d7dce1', 1);
      }
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
