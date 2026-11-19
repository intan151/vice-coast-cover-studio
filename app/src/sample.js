// Procedural sample art for Vice Coast Cover Studio.
// Draws a stylised Vice City boulevard at sunset — gradient sky, low sun, palm
// silhouettes, art-deco towers and a convertible — entirely with canvas paths,
// so the app ships no photo files at all. Returns a canvas the cover engine
// can use exactly like an uploaded photo.

export function makeSampleScene(width = 1600, height = 1000) {
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  const x = c.getContext('2d');

  // --- Sunset sky ---------------------------------------------------------
  const sky = x.createLinearGradient(0, 0, 0, height * 0.62);
  sky.addColorStop(0, '#2b1055');
  sky.addColorStop(0.35, '#7597de');
  sky.addColorStop(0.55, '#ff7e5f');
  sky.addColorStop(0.75, '#feb47b');
  sky.addColorStop(1, '#ffd166');
  x.fillStyle = sky;
  x.fillRect(0, 0, width, height * 0.62);

  // Sun with glow.
  const sunX = width * 0.68;
  const sunY = height * 0.42;
  const sunR = height * 0.16;
  const glow = x.createRadialGradient(sunX, sunY, sunR * 0.2, sunX, sunY, sunR * 2.4);
  glow.addColorStop(0, 'rgba(255, 214, 120, 0.95)');
  glow.addColorStop(0.4, 'rgba(255, 140, 90, 0.45)');
  glow.addColorStop(1, 'rgba(255, 140, 90, 0)');
  x.fillStyle = glow;
  x.fillRect(sunX - sunR * 2.4, sunY - sunR * 2.4, sunR * 4.8, sunR * 4.8);
  x.fillStyle = '#fff3c4';
  x.beginPath();
  x.arc(sunX, sunY, sunR, 0, Math.PI * 2);
  x.fill();
  // Retro sun slats.
  x.fillStyle = '#ff7e5f';
  for (let i = 0; i < 4; i += 1) {
    const sy = sunY + sunR * (0.15 + i * 0.22);
    x.fillRect(sunX - sunR, sy, sunR * 2, sunR * 0.055);
  }

  // Thin clouds.
  x.fillStyle = 'rgba(255, 190, 200, 0.35)';
  for (const [cx, cy, cw] of [
    [width * 0.08, height * 0.16, width * 0.22],
    [width * 0.5, height * 0.1, width * 0.18],
    [width * 0.82, height * 0.24, width * 0.16],
  ]) {
    x.beginPath();
    x.ellipse(cx, cy, cw / 2, height * 0.014, 0, 0, Math.PI * 2);
    x.fill();
  }

  // --- Distant skyline ----------------------------------------------------
  const base = height * 0.62;
  const towers = [
    [0.02, 0.30, 0.10], [0.13, 0.42, 0.13], [0.27, 0.34, 0.09],
    [0.37, 0.48, 0.12], [0.5, 0.38, 0.10], [0.83, 0.44, 0.11],
    [0.95, 0.32, 0.09],
  ];
  x.fillStyle = '#3a1c5e';
  for (const [tx, th, tw] of towers) {
    const bx = tx * width;
    const bw = tw * width;
    const bh = th * height;
    x.fillRect(bx, base - bh, bw, bh);
    // Stepped art-deco crown.
    x.fillRect(bx + bw * 0.2, base - bh - bh * 0.12, bw * 0.6, bh * 0.12);
    x.fillRect(bx + bw * 0.38, base - bh - bh * 0.22, bw * 0.24, bh * 0.1);
  }
  // Lit windows.
  x.fillStyle = 'rgba(255, 214, 120, 0.9)';
  for (let i = 0; i < 90; i += 1) {
    const wx = (i * 97) % width;
    const wy = base - ((i * 53) % Math.floor(height * 0.4)) - 8;
    if (wy < base - 6) x.fillRect(wx, wy, 5, 7);
  }

  // --- Street and wet reflections -----------------------------------------
  const street = x.createLinearGradient(0, base, 0, height);
  street.addColorStop(0, '#4a235a');
  street.addColorStop(0.5, '#2c1238');
  street.addColorStop(1, '#12081f');
  x.fillStyle = street;
  x.fillRect(0, base, width, height - base);
  // Neon reflections.
  for (const [rx, rw, col] of [
    [0.18, 0.05, 'rgba(255, 46, 136, 0.5)'],
    [0.55, 0.08, 'rgba(255, 138, 61, 0.45)'],
    [0.78, 0.04, 'rgba(46, 230, 200, 0.5)'],
  ]) {
    const rg = x.createLinearGradient(0, base, 0, height);
    rg.addColorStop(0, col);
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = rg;
    x.fillRect(rx * width, base, rw * width, height - base);
  }
  // Centre line.
  x.fillStyle = 'rgba(255, 209, 102, 0.85)';
  for (let i = 0; i < 5; i += 1) {
    x.fillRect(width * 0.485, base + 12 + i * ((height - base) / 5), width * 0.03, (height - base) / 11);
  }

  // --- Palm trees -----------------------------------------------------------
  function palm(px, py, s, lean) {
    x.save();
    x.translate(px, py);
    x.rotate(lean);
    x.strokeStyle = '#1a0b2e';
    x.lineWidth = 10 * s;
    x.lineCap = 'round';
    x.beginPath();
    x.moveTo(0, 0);
    x.quadraticCurveTo(6 * s, -90 * s, 26 * s, -170 * s);
    x.stroke();
    x.translate(26 * s, -170 * s);
    x.fillStyle = '#160826';
    for (let f = 0; f < 7; f += 1) {
      const a = (-0.15 - f * 0.42) * Math.PI;
      x.save();
      x.rotate(a);
      x.beginPath();
      x.moveTo(0, 0);
      x.quadraticCurveTo(52 * s, -16 * s, 96 * s, 6 * s);
      x.quadraticCurveTo(52 * s, 4 * s, 0, 8 * s);
      x.closePath();
      x.fill();
      x.restore();
    }
    // Coconuts.
    x.fillStyle = '#241038';
    x.beginPath(); x.arc(-6 * s, 4 * s, 7 * s, 0, Math.PI * 2); x.fill();
    x.beginPath(); x.arc(8 * s, 8 * s, 6 * s, 0, Math.PI * 2); x.fill();
    x.restore();
  }
  palm(width * 0.1, base + 8, 0.9, -0.06);
  palm(width * 0.9, base + 4, 1.05, 0.08);
  palm(width * 0.38, base + 2, 0.62, 0.04);

  // --- Convertible silhouette ----------------------------------------------
  x.save();
  x.translate(width * 0.52, height * 0.86);
  x.scale(1.15, 1);
  x.fillStyle = '#ff2e5e';
  x.beginPath();
  x.moveTo(-260, 0);
  x.lineTo(-240, -46);
  x.quadraticCurveTo(-120, -58, -60, -46);
  x.lineTo(30, -40);
  x.quadraticCurveTo(150, -44, 230, -8);
  x.lineTo(258, 0);
  x.lineTo(250, 18);
  x.lineTo(-250, 18);
  x.closePath();
  x.fill();
  // Cabin + windshield.
  x.fillStyle = '#1a0b2e';
  x.beginPath();
  x.moveTo(-150, -46);
  x.lineTo(-120, -96);
  x.lineTo(20, -96);
  x.lineTo(52, -44);
  x.closePath();
  x.fill();
  x.fillStyle = 'rgba(255, 190, 220, 0.75)';
  x.beginPath();
  x.moveTo(-112, -52);
  x.lineTo(-92, -88);
  x.lineTo(8, -88);
  x.lineTo(34, -50);
  x.closePath();
  x.fill();
  // Wheels.
  for (const wx of [-168, 168]) {
    x.fillStyle = '#0d0518';
    x.beginPath(); x.arc(wx, 16, 34, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#e8e4f2';
    x.beginPath(); x.arc(wx, 16, 16, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#0d0518';
    x.beginPath(); x.arc(wx, 16, 6, 0, Math.PI * 2); x.fill();
  }
  // Headlight glow.
  const hl = x.createRadialGradient(252, -6, 2, 252, -6, 60);
  hl.addColorStop(0, 'rgba(255, 240, 180, 0.9)');
  hl.addColorStop(1, 'rgba(255, 240, 180, 0)');
  x.fillStyle = hl;
  x.beginPath(); x.arc(252, -6, 60, 0, Math.PI * 2); x.fill();
  x.restore();

  // --- Birds ----------------------------------------------------------------
  x.strokeStyle = 'rgba(30, 10, 50, 0.85)';
  x.lineWidth = 3;
  for (const [bx, by, bs] of [[0.3, 0.14, 14], [0.36, 0.18, 10], [0.44, 0.11, 12]]) {
    const px = bx * width;
    const py = by * height;
    x.beginPath();
    x.moveTo(px - bs, py);
    x.quadraticCurveTo(px - bs / 2, py - bs / 1.6, px, py);
    x.quadraticCurveTo(px + bs / 2, py - bs / 1.6, px + bs, py);
    x.stroke();
  }

  return c;
}

// A second procedural scene: neon night street, for panel variety.
export function makeNeonScene(width = 1600, height = 1000) {
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  const x = c.getContext('2d');

  const sky = x.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, '#0b0620');
  sky.addColorStop(0.55, '#2a0f4d');
  sky.addColorStop(1, '#12081f');
  x.fillStyle = sky;
  x.fillRect(0, 0, width, height);

  // Neon sign blocks, two rows so the scene stays busy at any crop.
  const signs = [
    [0.06, 0.16, 0.2, 0.1, '#ff2e88'], [0.32, 0.08, 0.16, 0.16, '#2ee6c8'],
    [0.56, 0.14, 0.22, 0.09, '#ffb020'], [0.82, 0.1, 0.13, 0.18, '#8b5cf6'],
    [0.12, 0.38, 0.14, 0.07, '#2ee6c8'], [0.36, 0.44, 0.18, 0.06, '#ff2e88'],
    [0.62, 0.36, 0.12, 0.08, '#8b5cf6'], [0.84, 0.42, 0.11, 0.06, '#ffb020'],
  ];
  for (const [sx, sy, sw, sh, col] of signs) {
    x.shadowColor = col;
    x.shadowBlur = 42;
    x.fillStyle = col;
    x.fillRect(sx * width, sy * height, sw * width, sh * height);
    x.shadowBlur = 0;
    x.fillStyle = 'rgba(255,255,255,0.85)';
    for (let i = 0; i < 3; i += 1) {
      x.fillRect(sx * width + 14, sy * height + 16 + i * (sh * height) / 3.4, sw * width - 28, 6);
    }
  }

  // Mid-town towers with lit windows, filling the middle of the frame.
  const midTowers = [
    [0.0, 0.34, 0.09], [0.1, 0.42, 0.08], [0.2, 0.36, 0.1],
    [0.44, 0.46, 0.09], [0.66, 0.38, 0.1], [0.9, 0.44, 0.1],
  ];
  x.fillStyle = '#170a2e';
  for (const [tx, th, tw] of midTowers) {
    x.fillRect(tx * width, height * 0.62 - th * height, tw * width, th * height);
  }
  x.fillStyle = 'rgba(255, 214, 120, 0.9)';
  for (let i = 0; i < 120; i += 1) {
    const wx = (i * 113) % width;
    const wy = height * 0.62 - ((i * 71) % Math.floor(height * 0.42)) - 8;
    if (wy > height * 0.2 && wy < height * 0.62 - 6) x.fillRect(wx, wy, 5, 7);
  }

  // String lights across the street.
  x.strokeStyle = 'rgba(255, 209, 102, 0.7)';
  x.lineWidth = 2;
  x.beginPath();
  x.moveTo(0, height * 0.58);
  x.quadraticCurveTo(width / 2, height * 0.66, width, height * 0.58);
  x.stroke();
  x.fillStyle = '#ffd166';
  for (let i = 0; i <= 24; i += 1) {
    const t = i / 24;
    const lx = t * width;
    const ly = height * 0.58 + Math.sin(t * Math.PI) * height * 0.08;
    x.beginPath(); x.arc(lx, ly, 4, 0, Math.PI * 2); x.fill();
  }

  // Wet street with neon streaks.
  const wet = x.createLinearGradient(0, height * 0.62, 0, height);
  wet.addColorStop(0, '#1c0b33');
  wet.addColorStop(1, '#07030f');
  x.fillStyle = wet;
  x.fillRect(0, height * 0.62, width, height * 0.38);
  for (const [rx, col] of [[0.12, '#ff2e88'], [0.38, '#2ee6c8'], [0.62, '#ffb020'], [0.86, '#8b5cf6']]) {
    const g = x.createLinearGradient(0, height * 0.62, 0, height);
    g.addColorStop(0, col);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    x.globalAlpha = 0.55;
    x.fillStyle = g;
    x.fillRect(rx * width, height * 0.62, width * 0.05, height * 0.38);
    x.globalAlpha = 1;
  }

  // Silhouetted figures walking.
  function figure(fx, fy, s, col) {
    x.fillStyle = col;
    x.beginPath(); x.arc(fx, fy - 52 * s, 11 * s, 0, Math.PI * 2); x.fill();
    x.beginPath();
    x.moveTo(fx - 13 * s, fy - 40 * s);
    x.lineTo(fx + 13 * s, fy - 40 * s);
    x.lineTo(fx + 10 * s, fy + 8 * s);
    x.lineTo(fx - 10 * s, fy + 8 * s);
    x.closePath(); x.fill();
    x.fillRect(fx - 12 * s, fy + 8 * s, 9 * s, 46 * s);
    x.fillRect(fx + 3 * s, fy + 8 * s, 9 * s, 46 * s);
  }
  figure(width * 0.42, height * 0.88, 1.5, '#0d0518');
  figure(width * 0.58, height * 0.9, 1.3, '#140a24');

  return c;
}
