// Default theme. Motion and gag code call TF.slot(theme, name); only this file (or another theme file)
// decides what the slot looks like. Parts, vehicles and Optimus never change.
(function (G) {
  const D = G.TF.draw, P = G.TF3 && G.TF3.paint, M = G.TF.M;
  const shiba = (ctx, x, y, face, pose) => {
    if (!P) return;
    const wag = (pose && pose.wag) || 0, peek = (pose && pose.peek) || 0;
    P.begin(ctx, x, y, M * (pose && pose.scale || 1), face || -1);
    P.ellipse(ctx, [0, 0.18 + peek], 0.32, 0.15, 0, '#d98a3d', '#8a5222', 0.8);
    P.circle(ctx, [0.32, 0.3 + peek], 0.13, '#d98a3d', '#8a5222', 0.8);
    P.ellipse(ctx, [0.38, 0.27 + peek], 0.07, 0.05, 0, '#f6e7cf', null);
    P.poly(ctx, [[0.26, 0.4 + peek], [0.29, 0.52 + peek], [0.34, 0.42 + peek]], '#d98a3d', null);
    P.circle(ctx, [0.37, 0.33 + peek], 0.018, '#222', null);
    P.at(ctx, [-0.3, 0.25 + peek], 0.6 + wag, () => P.ellipse(ctx, [0.07, 0], 0.09, 0.04, 0, '#d98a3d', null));
    P.end(ctx);
  };
  G.TF.theme({
    name: 'default',
    food: ['burger', 'fries', 'pizza'],
    decor: { garland: null, capsuleDecal: null, lawn: null },
    slots: {
      feastMain: (ctx, x, y) => { D.circle(ctx, x, y - 6, 6, '#9aa3ab', '#57534e', 0.6); D.circle(ctx, x - 4, y - 4, 3, '#78716c'); D.circle(ctx, x + 4, y - 5, 3, '#78716c'); },
      tableJumper: (ctx, x, y, pose) => shiba(ctx, x, y, (pose && pose.face) || -1, pose),
      windowPet: (ctx, x, y, pose) => shiba(ctx, x, y, -1, pose),
      flock: (ctx, lawn, t, lod) => {},
      lawnDecor: (ctx, lawn, t, lod) => {},
      treeTopper: (ctx, x, y) => {},
      platterFood: (ctx, x, y) => { D.circle(ctx, x - 4, y - 3, 3, '#f97316'); D.rect(ctx, x + 1, y - 5, 8, 3, '#facc15', '#a16207', 0.5); },
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
