// Vice Coast Cover Studio — cover renderer.
// Draws a multi-panel GTA-style poster onto any canvas at any size, from the
// user's photos (or the procedural sample scenes) plus their caption.
// No network, no fonts to load: titles use the system condensed stack only.

export const TITLE_FONT =
  '"Arial Narrow", "Helvetica Neue Condensed Bold", Impact, "Franklin Gothic Medium", sans-serif';
export const SCRIPT_FONT =
  '"Brush Script MT", "Segoe Script", "Lucida Handwriting", cursive';

export const LAYOUTS = [
  { id: 'vice-grid', name: 'Vice Grid', note: '2 × 2 panels' },
  { id: 'hero-strip', name: 'Hero Strip', note: 'Hero + 3 stacked' },
  { id: 'sunset-bands', name: 'Sunset Bands', note: '3 wide bands' },
  { id: 'tilted-snaps', name: 'Tilted Snaps', note: 'Overlapping polaroids' },
];

export const GRADES = [
  {
    id: 'neon-sunset', name: 'Neon Sunset', swatch: 'linear-gradient(90deg,#ff2e88,#ff8a3d,#ffd166)',
    sky: ['#ff2e88', '#ff8a3d'], tint: 'rgba(255, 110, 60, 0.16)',
    title: '#ffffff', titleStroke: '#1c0b2e', accent: '#2ee6c8', band: '#170a26',
  },
  {
    id: 'vice-nights', name: 'Vice Nights', swatch: 'linear-gradient(90deg,#8b5cf6,#ff2e88,#2ee6c8)',
    sky: ['#8b5cf6', '#ff2e88'], tint: 'rgba(139, 92, 246, 0.20)',
    title: '#ffffff', titleStroke: '#0d0518', accent: '#ffd166', band: '#0d0518',
  },
  {
    id: 'golden-hour', name: 'Golden Hour', swatch: 'linear-gradient(90deg,#ffb020,#ff8a3d,#fff3c4)',
    sky: ['#ff8a3d', '#ffd166'], tint: 'rgba(255, 176, 32, 0.14)',
    title: '#fff8e6', titleStroke: '#3d1c05', accent: '#ff2e88', band: '#2b1206',
  },
  {
    id: 'pastel-dusk', name: 'Pastel Dusk', swatch: 'linear-gradient(90deg,#ff9ecf,#b388ff,#7ee8fa)',
    sky: ['#ff9ecf', '#7ee8fa'], tint: 'rgba(255, 158, 207, 0.14)',
    title: '#ffffff', titleStroke: '#2b1040', accent: '#ff2e88', band: '#241038',
  },
];

export const SIZES = [
  { id: 'square', name: 'Square', note: '1080 × 1080', w: 1080, h: 1080 },
  { id: 'portrait', name: 'Portrait', note: '1080 × 1350', w: 1080, h: 1350 },
  { id: 'wide', name: 'Wide', note: '1920 × 1080', w: 1920, h: 1080 },
];

// Panel rectangles as fractions of the cover, per layout. The title band
// always sits at the bottom; panels fill the space above it.
function panelRects(layoutId, W, H) {
  const bandH = H * 0.26;
  const top = 0;
  const ph = H - bandH;
  const g = Math.max(6, W * 0.006); // gutter
  switch (layoutId) {
    case 'hero-strip': {
      const heroW = W * 0.58;
      const sideX = heroW + g;
      const sideW = W - sideX;
      const sh = (ph - g * 2) / 3;
      return [
        { x: 0, y: top, w: heroW, h: ph },
        { x: sideX, y: top, w: sideW, h: sh },
        { x: sideX, y: top + sh + g, w: sideW, h: sh },
        { x: sideX, y: top + (sh + g) * 2, w: sideW, h: sh },
      ];
    }
    case 'sunset-bands': {
      const bh = (ph - g * 2) / 3;
      return [
        { x: 0, y: top, w: W, h: bh },
        { x: 0, y: top + bh + g, w: W, h: bh },
        { x: 0, y: top + (bh + g) * 2, w: W, h: bh },
      ];
    }
    case 'tilted-snaps': {
      const pw = W * 0.52;
      const ph2 = ph * 0.62;
      return [
        { x: W * 0.03, y: ph * 0.03, w: pw, h: ph2, tilt: -3 },
        { x: W * 0.45, y: ph * 0.06, w: pw, h: ph2, tilt: 2.5 },
        { x: W * 0.1, y: ph * 0.4, w: pw, h: ph2, tilt: 2 },
        { x: W * 0.42, y: ph * 0.38, w: pw, h: ph2, tilt: -2 },
      ];
    }
    case 'vice-grid':
    default: {
      const cw = (W - g) / 2;
      const ch = (ph - g) / 2;
      return [
        { x: 0, y: top, w: cw, h: ch },
        { x: cw + g, y: top, w: cw, h: ch },
        { x: 0, y: top + ch + g, w: cw, h: ch },
        { x: cw + g, y: top + ch + g, w: cw, h: ch },
      ];
    }
  }
}

export function panelCountFor(layoutId) {
  return panelRects(layoutId, 100, 100).length;
}

// Which panel (if any) contains point (px, py) on a W x H cover.
export function panelAt(layoutId, W, H, px, py) {
  const rects = panelRects(layoutId, W, H);
  for (let i = rects.length - 1; i >= 0; i -= 1) {
    const r = rects[i];
    if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) return i;
  }
  return -1;
}

// Draw one photo into a panel rect, cover-fit, with the panel's pan/zoom.
function drawPhotoInto(ctx, img, rect, pan) {
  const zoom = pan?.zoom ?? 1.15;
  const ox = pan?.ox ?? 0;
  const oy = pan?.oy ?? 0;
  const iw = img.width;
  const ih = img.height;
  const scale = Math.max(rect.w / iw, rect.h / ih) * zoom;
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = rect.x + (rect.w - dw) / 2 + ox * rect.w;
  const dy = rect.y + (rect.h - dh) / 2 + oy * rect.h;
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

function fitFont(ctx, text, maxWidth, startPx, fontStack, weight = 900) {
  let px = startPx;
  ctx.font = `${weight} ${px}px ${fontStack}`;
  while (px > 12 && ctx.measureText(text).width > maxWidth) {
    px -= 2;
    ctx.font = `${weight} ${px}px ${fontStack}`;
  }
  return px;
}

// Pre-rendered grain tile, shared across renders.
let grainTile = null;
function getGrainTile() {
  if (grainTile) return grainTile;
  const t = document.createElement('canvas');
  t.width = 140;
  t.height = 140;
  const tx = t.getContext('2d');
  const data = tx.createImageData(140, 140);
  for (let i = 0; i < data.data.length; i += 4) {
    const v = Math.floor(Math.random() * 255);
    data.data[i] = v;
    data.data[i + 1] = v;
    data.data[i + 2] = v;
    data.data[i + 3] = 255;
  }
  tx.putImageData(data, 0, 0);
  grainTile = t;
  return t;
}

// state: { photos: HTMLCanvasElement|HTMLImageElement[], panels: [{photo, zoom, ox, oy}],
//           layout, grade, title, subtitle, badge, grain, vignette, frame }
export function drawCover(canvas, state) {
  const W = canvas.width;
  const H = canvas.height;
  const ctx = canvas.getContext('2d');
  const grade = GRADES.find((g) => g.id === state.grade) ?? GRADES[0];
  const rects = panelRects(state.layout, W, H);
  const bandH = H * 0.26;
  const bandY = H - bandH;

  // Backdrop: deep violet so tilted panels have something to sit on.
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#1b0f33');
  bg.addColorStop(1, '#0d0518');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Panels.
  rects.forEach((rect, i) => {
    const panel = state.panels[i] ?? { photo: 0, zoom: 1.15, ox: 0, oy: 0 };
    const img = state.photos[panel.photo] ?? state.photos[0];
    ctx.save();
    if (rect.tilt) {
      ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
      ctx.rotate((rect.tilt * Math.PI) / 180);
      ctx.translate(-(rect.x + rect.w / 2), -(rect.y + rect.h / 2));
    }
    if (img) drawPhotoInto(ctx, img, rect, panel);
    // Warm sunset tint over each photo.
    ctx.fillStyle = grade.tint;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    // Thin white polaroid edge on tilted snaps.
    if (rect.tilt) {
      ctx.strokeStyle = 'rgba(255,255,255,0.92)';
      ctx.lineWidth = Math.max(3, W * 0.006);
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    }
    ctx.restore();
  });

  // Sunset wash across the whole panel area.
  const wash = ctx.createLinearGradient(0, 0, W, bandY);
  wash.addColorStop(0, 'rgba(255, 46, 136, 0.10)');
  wash.addColorStop(0.6, 'rgba(255, 138, 61, 0.05)');
  wash.addColorStop(1, 'rgba(46, 230, 200, 0.08)');
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, W, bandY);

  // --- Title band ---------------------------------------------------------
  const bandGrad = ctx.createLinearGradient(0, bandY, 0, H);
  bandGrad.addColorStop(0, grade.band);
  bandGrad.addColorStop(1, '#0a0514');
  ctx.fillStyle = bandGrad;
  ctx.fillRect(0, bandY, W, bandH);
  // Neon rule above the band.
  const rule = ctx.createLinearGradient(0, 0, W, 0);
  rule.addColorStop(0, grade.sky[0]);
  rule.addColorStop(0.5, '#ff8a3d');
  rule.addColorStop(1, grade.sky[1]);
  ctx.fillStyle = rule;
  ctx.fillRect(0, bandY, W, Math.max(4, H * 0.006));

  // Badge ribbon, top-left of the band.
  const badge = (state.badge || 'VICE COAST').toUpperCase();
  const badgePadX = W * 0.035;
  const badgeY = bandY + bandH * 0.14;
  ctx.font = `900 ${Math.round(H * 0.028)}px ${TITLE_FONT}`;
  const badgeW = ctx.measureText(badge).width + W * 0.03;
  const badgeH = H * 0.052;
  ctx.fillStyle = grade.sky[0];
  ctx.beginPath();
  ctx.moveTo(badgePadX, badgeY);
  ctx.lineTo(badgePadX + badgeW, badgeY);
  ctx.lineTo(badgePadX + badgeW - badgeH * 0.45, badgeY + badgeH);
  ctx.lineTo(badgePadX, badgeY + badgeH);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText(badge, badgePadX + W * 0.015, badgeY + badgeH / 2 + 1);

  // Heat meter: five stars at the band's top-right.
  const starR = H * 0.02;
  const starGap = starR * 2.5;
  let sx = W - W * 0.035 - starR * 2;
  ctx.fillStyle = grade.accent;
  for (let s = 0; s < 5; s += 1) {
    drawStar(ctx, sx - s * starGap, badgeY + badgeH / 2, starR, s < 4);
    sx -= 0;
  }

  // Main title.
  const title = (state.title || 'NEON SHORE').toUpperCase();
  const titleMax = W * 0.93;
  const titlePx = fitFont(ctx, title, titleMax, H * 0.115, TITLE_FONT, 900);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const titleY = bandY + bandH * 0.68;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = grade.titleStroke;
  ctx.lineWidth = Math.max(3, titlePx * 0.09);
  ctx.strokeText(title, W / 2, titleY);
  // Sunset gradient fill on the title.
  const titleGrad = ctx.createLinearGradient(0, titleY - titlePx, 0, titleY);
  titleGrad.addColorStop(0, '#ffffff');
  titleGrad.addColorStop(0.55, '#ffd166');
  titleGrad.addColorStop(1, grade.sky[0]);
  ctx.fillStyle = titleGrad;
  ctx.fillText(title, W / 2, titleY);

  // Subtitle in script, centred under the title.
  const subtitle = state.subtitle || '';
  if (subtitle) {
    const subPx = fitFont(ctx, subtitle, titleMax, H * 0.042, SCRIPT_FONT, 700);
    ctx.font = `italic 700 ${subPx}px ${SCRIPT_FONT}`;
    ctx.fillStyle = grade.accent;
    ctx.textAlign = 'center';
    ctx.fillText(subtitle, W / 2, bandY + bandH * 0.9);
  }

  // Halftone dots along the band's bottom edge.
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  const dotR = Math.max(1.5, H * 0.0022);
  const dotGap = dotR * 5;
  for (let dx = dotGap; dx < W; dx += dotGap) {
    ctx.beginPath();
    ctx.arc(dx, H - dotR * 3, dotR, 0, Math.PI * 2);
    ctx.fill();
  }

  // Vignette.
  if (state.vignette !== false) {
    const vg = ctx.createRadialGradient(
      W / 2, H / 2, Math.min(W, H) * 0.42,
      W / 2, H / 2, Math.max(W, H) * 0.75,
    );
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(10,4,20,0.42)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);
  }

  // Film grain.
  if (state.grain !== false) {
    const tile = getGrainTile();
    const pattern = ctx.createPattern(tile, 'repeat');
    ctx.save();
    ctx.globalAlpha = 0.07;
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  // White poster frame.
  if (state.frame !== false) {
    ctx.strokeStyle = 'rgba(255,255,255,0.95)';
    ctx.lineWidth = Math.max(4, W * 0.008);
    ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, W - ctx.lineWidth, H - ctx.lineWidth);
  }
}

function drawStar(ctx, cx, cy, r, filled) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const rr = i % 2 === 0 ? r : r * 0.45;
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const px = Math.cos(a) * rr;
    const py = Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  if (filled) ctx.fill();
  else {
    ctx.globalAlpha = 0.35;
    ctx.fill();
  }
  ctx.restore();
}

// Render the cover at an export size and return a PNG blob.
export function exportCoverPng(state, size) {
  const off = document.createElement('canvas');
  off.width = size.w;
  off.height = size.h;
  drawCover(off, state);
  return new Promise((resolve) => off.toBlob(resolve, 'image/png'));
}
