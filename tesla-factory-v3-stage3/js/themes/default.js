// Default theme. Themes only swap themed payloads and decor (FACTORY-MAP §7); parts, vehicles, Optimus never change.
(function (G) {
  G.TF.theme({
    name: 'default',
    food: ['burger', 'fries', 'pizza'],   // themed payloads on the food line only (1D/1E)
    decor: {
      garland: null,       // (ctx, x0, x1, yCeil, t, lod) ceiling decor along a floor
      capsuleDecal: null,  // (ctx) drawn on pneumatic-tube capsules, local coords (capsule 16 x 9)
    },
  });
})(typeof window !== 'undefined' ? window : globalThis);
