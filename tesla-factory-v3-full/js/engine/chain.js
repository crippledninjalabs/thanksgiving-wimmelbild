// TF.chain — generic product chain (cars, cabs, trucks, semis, packs...) as a pure function of t. Floor 6 keeps its
// own tuned line (line6.js); every later line uses this. cfg: {id, period, t0, life, keys: [[age, x], ...] eased,
// lift?: [[age, dy], ...] (world units, + = down), extra?: (age) -> {...stage flags}}.
// Item k is born at t0 + k * period; cars(t) returns every live item with its age, x, dy and stage flags.
(function (G) {
  const TF = G.TF;
  TF.chain = (cfg) => {
    const c = Object.assign({ t0: 0, lift: null, extra: () => ({}) }, cfg);
    c.at = (age) => Object.assign({ age, x: TF.keys(age, c.keys), dy: c.lift ? TF.keys(age, c.lift) : 0 }, c.extra(age));
    c.cars = (t) => {
      const out = [], k1 = Math.floor((t - c.t0) / c.period), k0 = Math.floor((t - c.t0 - c.life) / c.period);
      for (let k = k0; k <= k1; k++) { const age = t - c.t0 - k * c.period; if (age >= 0 && age < c.life) out.push(Object.assign({ k }, c.at(age))); }
      return out;
    };
    c.inWindow = (t, a0, a1) => c.cars(t).find((car) => car.age >= a0 && car.age < a1);   // the car in an age window (a station)
    return c;
  };
})(typeof window !== 'undefined' ? window : globalThis);
