// TF3.style — LOOKS ONLY: colours, proportions (metres), line widths. Tweak here, not in clips.js.
// Limb lengths are shared with the motion clips (they read them for reach), so keep them plausible.
(function (G) {
  const TF3 = (G.TF3 = G.TF3 || {});
  TF3.style = {
    outlinePx: 1.4,          // outline width in px at scale 250 px/m (scaled down when smaller, min 0.6 px)
    optimus: {               // Tesla Optimus Gen 2, ~1.73 m
      dims: {
        torso: 0.50, neckUp: 0.53, neck: 0.15, shoulderFwd: -0.005, hipFwd: 0,
        upperArm: 0.29, foreArm: 0.27, thigh: 0.42, shin: 0.42, standHip: 0.9,
        foot: { heelToAnkle: [0.05, 0.075], footLen: 0.24 },
      },
      shape: {
        head: { rx: 0.098, ry: 0.122, faceFrom: -0.005 },  // egg head, black face plate from x>faceFrom
        thigh: [0.086, 0.062], shin: [0.066, 0.044], upperArm: [0.046, 0.04], foreArm: [0.052, 0.034],
        joint: { shoulder: 0.058, elbow: 0.036, hip: 0.06, knee: 0.046, wrist: 0.026 },
        palm: 0.085, finger: 0.075, handW: 0.06,
      },
      col: {
        shell: '#f3f4f5', shellFar: '#d7dade', panel: '#c4c9ce', joint: '#16181b', jointFar: '#2a2d31',
        visor: '#0b0d10', visorHi: '#4b5a68', hand: '#141619', handFar: '#2b2e33', outline: '#2c3136',
        dot: '#4da3ff', waist: '#24272b', sole: '#1a1c1f',
      },
      blueDots: true, chestT: true,
    },
    elon: {                  // ~1.88 m, slightly heavier build
      dims: {
        torso: 0.555, neckUp: 0.6, neck: 0.165, shoulderFwd: -0.01, hipFwd: 0,
        upperArm: 0.32, foreArm: 0.285, thigh: 0.465, shin: 0.46, standHip: 0.995,
        foot: { heelToAnkle: [0.055, 0.08], footLen: 0.28 },
      },
      shape: {
        thigh: [0.088, 0.064], shin: [0.064, 0.05], upperArm: [0.06, 0.045], foreArm: [0.044, 0.033],
        sleeve: 0.5,   // fraction of upper arm covered by the T-shirt sleeve
        handLen: 0.1, handW: 0.05,
      },
      col: {
        skin: '#f1c9a8', skinShade: '#ddac88', skinFar: '#e0b694', hair: '#3b2a1f', hairHi: '#55402f',
        tee: '#17181a', teeFar: '#0d0d0e', stripe: '#e9e9e9', jeans: '#1f2a44', jeansFar: '#18213a',
        shoe: '#262321', outline: '#2a2522', lip: '#b57a68', eye: '#2a2522',
      },
      occupyMars: true,
    },
    cybercab: {             // traced from ref photos, see ref/cybercab/MEASUREMENTS.md (length 4.3 m assumed)
      len: 4.3, height: 1.45, wheelR: 0.40, wheelbase: 2.74, frontAxle: 0.765, doorMax: 1.4,
      col: {
        body: '#d6a964', bodyHi: '#ecc98f', shade: '#c39352', crease: '#b8894a', outline: '#7a5a2a',
        glass: '#15181b', glassHi: '#2c343c', trim: '#262625', arch: '#1d1b19', tyre: '#2c2724',
        cover: '#e4c286', coverShade: '#bf9a5e', cap: '#b98d4f', light: '#f4f6f6', tail: '#d8323a',
        seam: '#8f6a33', cabin: '#24211f', seat: '#3d3935', doorEdge: '#3a3128', shadow: 'rgba(0,0,0,0.12)',
      },
    },
    vehicles: {
      modelY: { len: 4.75, height: 1.62, wheelR: 0.37, wheelbase: 2.89, frontAxle: 0.92 },
      cybertruck: { len: 5.68, height: 1.79, wheelR: 0.44, wheelbase: 3.81, frontAxle: 0.93 },
      semi: { len: 7.0, height: 4.0, wheelR: 0.52, frontAxle: 1.35, drive: [4.85, 6.2] },
      paints: { red: '#c8202e', white: '#eef0f2', black: '#1d1f22', blue: '#2453a5', grey: '#7d8389' },
      col: { glass: '#1e2328', tyre: '#1b1c1e', rim: '#9aa1a8', steel: '#c3c8cc', steelShade: '#9ca2a8',
             steelHi: '#e3e6e8', light: '#f4f1e6', tail: '#d8323a', outline: '#2a2e33', semiCab: '#eef0f2',
             trim: '#2b2f34', shadow: 'rgba(0,0,0,0.12)' },
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
