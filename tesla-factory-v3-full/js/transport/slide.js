// TF.slide — spiral slide (drawn as a zig-zag chute in side view). Items ride it by distance s.
(function (G) {
  const TF = G.TF, D = TF.draw;
  TF.slide = {
    // build a zig-zag path between xs[0]..xs[1] from yTop down to yBot, one turn every `turn` units
    path(xs, yTop, yBot, turn = 90) {
      const pts = [[xs[1], yTop]];
      let y = yTop, k = 0;
      while (y < yBot - 1) { y = Math.min(yBot, y + turn / 2); k++; pts.push([k % 2 ? xs[0] : xs[1], y]); }
      return TF.track.path(pts);
    },
    draw(ctx, path, lod) {
      D.line(ctx, path.pts, '#e9d9a8', 7);
      if (lod !== 'far') D.line(ctx, path.pts.map((p) => [p[0], p[1] + 3]), '#c9b071', 1.2);
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
