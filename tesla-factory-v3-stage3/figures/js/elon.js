// TF3.elon.draw(ctx, x, y, scale, pose, opts) — side view; TF3.elon.drawFront(ctx, x, y, scale, opts) — front view.
// Renders only. (x, y) = canvas px of the ground point under the hip; scale = px per metre.
(function (G) {
  const TF3 = (G.TF3 = G.TF3 || {});
  const R = TF3.rig, P = TF3.paint;

  function hand(ctx, wrist, ang, grip, curl, st, far) {
    const C = st.col, S = st.shape, col = far ? C.skinFar : C.skin;
    P.at(ctx, wrist, ang, () => {
      const l = S.handLen, w = S.handW, c = grip * 1.4 * curl;
      P.poly(ctx, [[-0.01, -w * 0.5], [l * 0.55, -w * 0.55], [l * 0.6, w * 0.5], [-0.01, w * 0.5]], col, C.outline, 1);
      const a = [l * 0.55, 0], b = R.add(a, R.polar(c * 0.6, l * 0.4)), e = R.add(b, R.polar(c * 1.4, l * 0.3));
      P.line(ctx, [a, b, e], C.outline, w * 0.95 + 0.006);
      P.line(ctx, [a, b, e], col, w * 0.95);
      const t0 = [l * 0.2, -curl * w * 0.4];
      P.line(ctx, [t0, R.add(t0, R.polar(-curl * (0.8 - grip * 0.6), l * 0.38))], C.skinShade, w * 0.38);
    });
  }

  function shoe(ctx, ft, st, far) {
    const C = st.col, L = st.dims.foot.footLen;
    P.at(ctx, ft.heel, ft.p, () => {
      P.poly(ctx, [[-0.015, 0.0], [L * 0.98, 0.0], [L + 0.005, 0.035], [L * 0.7, 0.075], [0.1, 0.105], [0.0, 0.1], [-0.02, 0.05]],
        far ? '#1b1917' : C.shoe, C.outline, 1);
      P.poly(ctx, [[-0.016, 0], [L, 0], [L, 0.014], [-0.016, 0.014]], '#d9d4cc', null);
    });
  }

  function leg(ctx, sk, s, st, far) {
    const C = st.col, S = st.shape, j = far ? C.jeansFar : C.jeans;
    P.capsule(ctx, sk['knee' + s], sk['ankle' + s], S.shin[0], S.shin[1], j, C.outline);
    shoe(ctx, sk['foot' + s], st, far);
    P.capsule(ctx, sk.hipJ, sk['knee' + s], S.thigh[0], S.thigh[1], j, C.outline);
    P.circle(ctx, sk['knee' + s], S.shin[0] * 0.98, j, null);
  }

  function arm(ctx, sk, s, st, far, pose) {
    const C = st.col, S = st.shape;
    const sh = sk.shoulder, el = sk['elbow' + s], wr = sk['wrist' + s];
    const skin = far ? C.skinFar : C.skin, tee = far ? C.teeFar : C.tee;
    P.capsule(ctx, el, wr, S.foreArm[0], S.foreArm[1], skin, C.outline);
    P.capsule(ctx, sh, el, S.upperArm[0] * 0.85, S.upperArm[1], skin, C.outline);
    const sl = R.add(sh, R.mul(R.sub(el, sh), S.sleeve));
    P.capsule(ctx, sh, sl, S.upperArm[0] * 1.25, S.upperArm[0] * 1.1, tee, C.outline);
    const ha = sk['handAng' + s] !== undefined ? sk['handAng' + s] : R.ang(el, wr);
    hand(ctx, wr, ha, sk['grip' + s], pose['curl' + s] || -1, st, far);
  }

  function torso(ctx, sk, st, pose) {
    const C = st.col, b = pose.breath || 0;
    P.at(ctx, sk.hip, -sk.lean, () => {
      // jeans seat / waist
      P.poly(ctx, [[-0.13, 0.1], [0.12, 0.1], [0.12, -0.04], [0.05, -0.1], [-0.08, -0.1], [-0.14, -0.02]], C.jeans, C.outline);
      // black tee: broad chest, slight belly
      P.poly(ctx, [[-0.135, 0.06], [-0.15, 0.3], [-0.135, 0.5], [-0.075, 0.585 + b], [0.05, 0.59 + b], [0.125, 0.53 + b],
        [0.158 + b, 0.4], [0.15, 0.25], [0.15, 0.13], [0.125, 0.06]], C.tee, C.outline);
      P.line(ctx, [[-0.08, 0.2], [0.02, 0.22]], '#2a2b2e', 0.008); // fold
      if (st.occupyMars) P.line(ctx, [[0.13, 0.45], [0.152, 0.43]], C.stripe, 0.01); // tiny print hint
    });
  }

  function head(ctx, sk, st, pose) {
    const C = st.col, jaw = (pose.jaw || 0) * 0.016;
    P.capsule(ctx, sk.neckBase, R.add(sk.headC, R.rot([-0.005, -0.06], -sk.headAng)), 0.06, 0.055, C.skin, C.outline);
    P.at(ctx, sk.headC, -sk.headAng, () => {
      // face + skull profile (facing +x)
      P.poly(ctx, [[-0.075, -0.085], [-0.105, -0.01], [-0.09, 0.08], [-0.02, 0.125], [0.06, 0.11], [0.088, 0.065],
        [0.095, 0.03], [0.093, 0.012], [0.127, -0.028], [0.101, -0.04], [0.104, -0.053], [0.097, -0.062],
        [0.1, -0.072 - jaw], [0.098, -0.1 - jaw], [0.07, -0.124 - jaw], [0.01, -0.112 - jaw * 0.5], [-0.025, -0.09]],
        C.skin, C.outline);
      P.line(ctx, [[0.07, -0.122 - jaw], [0.0, -0.11 - jaw * 0.5]], C.skinShade, 0.006); // jaw line
      P.line(ctx, [[0.085, -0.06 - jaw * 0.3], [0.1, -0.06 - jaw * 0.6]], C.lip, 0.008);
      P.ellipse(ctx, [-0.03, -0.012], 0.02, 0.034, 0.1, C.skinShade, C.outline, 0.8); // ear
      P.ellipse(ctx, [0.062, 0.017], 0.009, 0.007, 0, C.eye, null);                   // eye
      P.line(ctx, [[0.045, 0.04], [0.088, 0.036]], C.hair, 0.011);                     // brow
      // hair: combed back and slightly up, receding at the temple
      P.poly(ctx, [[0.058, 0.098], [0.078, 0.125], [0.07, 0.15], [0.02, 0.163], [-0.05, 0.15], [-0.1, 0.1],
        [-0.115, 0.02], [-0.098, -0.055], [-0.07, -0.06], [-0.06, 0.0], [-0.035, 0.03], [-0.012, 0.05],
        [0.0, 0.025], [0.012, 0.06], [0.035, 0.085]], C.hair, C.outline, 1);
      P.line(ctx, [[0.05, 0.135], [-0.02, 0.145], [-0.08, 0.115]], C.hairHi, 0.007);
      P.line(ctx, [[0.03, 0.115], [-0.04, 0.12], [-0.09, 0.07]], C.hairHi, 0.005);
    });
  }

  TF3.elon = {
    skeleton: (pose) => R.skeleton(pose, TF3.style.elon.dims),
    draw(ctx, x, y, scale, pose, opts = {}) {
      const st = TF3.style.elon, sk = R.skeleton(pose, st.dims), props = pose.props || {};
      P.begin(ctx, x, y, scale, opts.face || 1);
      if (opts.squash) ctx.scale(1 - opts.squash, 1);
      TF3.props.draw(ctx, props, 'behind', sk);
      arm(ctx, sk, 'F', st, true, pose);
      leg(ctx, sk, 'F', st, true);
      leg(ctx, sk, 'N', st, false);
      torso(ctx, sk, st, pose);
      head(ctx, sk, st, pose);
      TF3.props.draw(ctx, props, 'held', sk);
      arm(ctx, sk, 'N', st, false, pose);
      TF3.props.draw(ctx, props, 'front', sk);
      P.end(ctx);
      return sk;
    },
    // Static front view for the sheet (same scale family).
    drawFront(ctx, x, y, scale, opts = {}) {
      const st = TF3.style.elon, C = st.col, d = st.dims;
      P.begin(ctx, x, y, scale, 1);
      const hipY = d.standHip, shY = hipY + d.torso;
      for (const s of [-1, 1]) { // legs + shoes
        P.capsule(ctx, [s * 0.1, hipY - 0.02], [s * 0.11, 0.09], 0.085, 0.06, C.jeans, C.outline);
        P.ellipse(ctx, [s * 0.12, 0.045], 0.065, 0.05, 0, C.shoe, C.outline, 1);
        // arms: sleeve, skin, hand
        P.capsule(ctx, [s * 0.235, shY - 0.04], [s * 0.27, hipY - 0.12], 0.05, 0.04, C.skin, C.outline);
        P.ellipse(ctx, [s * 0.275, hipY - 0.17], 0.042, 0.065, 0, C.skin, C.outline, 1);
        P.capsule(ctx, [s * 0.22, shY - 0.03], [s * 0.245, shY - 0.2], 0.075, 0.068, C.tee, C.outline);
      }
      P.poly(ctx, [[-0.2, hipY + 0.08], [0.2, hipY + 0.08], [0.18, hipY - 0.08], [-0.18, hipY - 0.08]], C.jeans, C.outline);
      P.poly(ctx, [[-0.24, shY - 0.02], [-0.16, shY + 0.03], [0.16, shY + 0.03], [0.24, shY - 0.02], [0.215, hipY + 0.2],
        [0.2, hipY + 0.03], [-0.2, hipY + 0.03], [-0.215, hipY + 0.2]], C.tee, C.outline);
      if (st.occupyMars) { // "OCCUPY MARS" hint: two white text-like stripes
        P.line(ctx, [[-0.09, shY - 0.14], [0.09, shY - 0.14]], C.stripe, 0.022);
        P.line(ctx, [[-0.055, shY - 0.18], [0.055, shY - 0.18]], C.stripe, 0.022);
      }
      // neck + head
      P.poly(ctx, [[-0.05, shY + 0.02], [0.05, shY + 0.02], [0.048, shY + 0.11], [-0.048, shY + 0.11]], C.skin, C.outline);
      P.poly(ctx, [[-0.04, shY + 0.035], [0, shY + 0.0], [0.04, shY + 0.035]], C.skinShade, null);
      const hc = [0, shY + 0.205];
      P.at(ctx, hc, 0, () => {
        for (const s of [-1, 1]) P.ellipse(ctx, [s * 0.083, -0.005], 0.018, 0.032, 0, C.skinShade, C.outline, 0.8);
        // face: wide forehead, defined squarish jaw
        P.poly(ctx, [[-0.08, 0.06], [-0.083, -0.02], [-0.075, -0.075], [-0.045, -0.11], [0, -0.122], [0.045, -0.11],
          [0.075, -0.075], [0.083, -0.02], [0.08, 0.06], [0.06, 0.11], [0, 0.125], [-0.06, 0.11]], C.skin, C.outline);
        // hair: M-shaped hairline (receding temples), volume combed back and up
        P.poly(ctx, [[-0.085, 0.03], [-0.09, 0.1], [-0.06, 0.15], [0, 0.17], [0.06, 0.15], [0.09, 0.1], [0.085, 0.03],
          [0.075, 0.07], [0.055, 0.075], [0.04, 0.095], [0.0, 0.1], [-0.04, 0.095], [-0.055, 0.075], [-0.075, 0.07]],
          C.hair, C.outline, 1);
        P.line(ctx, [[-0.04, 0.135], [0.0, 0.15], [0.045, 0.135]], C.hairHi, 0.007);
        for (const s of [-1, 1]) {
          P.line(ctx, [[s * 0.022, 0.038], [s * 0.062, 0.042]], C.hair, 0.011);
          P.ellipse(ctx, [s * 0.04, 0.017], 0.009, 0.0065, 0, C.eye, null);
        }
        P.line(ctx, [[0.005, 0.01], [0.011, -0.03], [-0.004, -0.035]], C.skinShade, 0.006);
        P.line(ctx, [[-0.025, -0.062], [0.025, -0.062]], C.lip, 0.008);
        P.line(ctx, [[-0.05, -0.1], [0, -0.115], [0.05, -0.1]], C.skinShade, 0.005);
      });
      P.end(ctx);
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
