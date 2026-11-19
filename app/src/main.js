// Vice Coast Cover Studio — editor wiring.
// Owns the app state, photo loading, panel picking and dragging, the layout /
// grade / size pickers, live preview and PNG export. Nothing here reaches
// the network: photos come from the user's file picker or from the procedural
// sample scenes drawn on a canvas by sample.js.

import { drawCover, exportCoverPng, LAYOUTS, GRADES, SIZES, panelCountFor, panelAt } from './cover.js';
import { makeSampleScene, makeNeonScene } from './sample.js';

const $ = (sel) => document.querySelector(sel);

const params = new URLSearchParams(location.search);
const shotMode = params.get('shot'); // "cover" renders one exported cover full-frame
const shotSize = params.get('size') || 'wide';
const shotLayout = params.get('layout') || 'hero-strip';

const state = {
  photos: [], // HTMLImageElement | HTMLCanvasElement
  photoNames: [],
  panels: [], // { photo, zoom, ox, oy } per panel slot
  layout: 'hero-strip',
  grade: 'neon-sunset',
  size: 'square',
  title: 'NEON SHORE',
  subtitle: 'one night in vice city',
  badge: 'VICE COAST',
  grain: true,
  vignette: true,
  frame: true,
  selectedPanel: 0,
  selectedPhoto: 0,
};

const preview = $('#preview');

function currentSize() {
  return SIZES.find((s) => s.id === state.size) ?? SIZES[0];
}

function ensurePanels() {
  const n = panelCountFor(state.layout);
  while (state.panels.length < n) {
    const i = state.panels.length;
    state.panels.push({ photo: i % Math.max(1, state.photos.length), zoom: 1.15, ox: 0, oy: 0 });
  }
  state.panels.length = n;
  if (state.selectedPanel >= n) state.selectedPanel = 0;
}

function render() {
  ensurePanels();
  const size = currentSize();
  if (preview.width !== size.w || preview.height !== size.h) {
    preview.width = size.w;
    preview.height = size.h;
  }
  drawCover(preview, state);
  $('#preview-size').textContent = `${size.w} × ${size.h}`;
  const panel = state.panels[state.selectedPanel];
  if (panel) {
    $('#zoom-slider').value = String(panel.zoom);
    $('#zoom-value').textContent = `${panel.zoom.toFixed(2)}×`;
  }
}

function renderThumbs() {
  const strip = $('#photo-strip');
  strip.innerHTML = '';
  state.photos.forEach((img, i) => {
    const thumb = document.createElement('canvas');
    thumb.className = 'photo-thumb' + (i === state.selectedPhoto ? ' active' : '');
    thumb.width = 144;
    thumb.height = 144;
    thumb.title = state.photoNames[i] || `Photo ${i + 1}`;
    const tx = thumb.getContext('2d');
    const s = Math.max(144 / img.width, 144 / img.height);
    tx.drawImage(img, (144 - img.width * s) / 2, (144 - img.height * s) / 2, img.width * s, img.height * s);
    thumb.addEventListener('click', () => {
      state.selectedPhoto = i;
      const panel = state.panels[state.selectedPanel];
      if (panel) panel.photo = i;
      renderThumbs();
      render();
    });
    strip.appendChild(thumb);
  });
}

function addPhoto(img, name) {
  state.photos.push(img);
  state.photoNames.push(name);
  state.selectedPhoto = state.photos.length - 1;
  // New photos fill empty panel slots first.
  ensurePanels();
  state.panels.forEach((p) => {
    if (p.photo >= state.photos.length - 1 && state.photos.length > 1) { /* keep */ }
  });
  renderThumbs();
  render();
}

// When one photo fills several panels, each panel shows a different crop of
// it, so repeated panels read as different shots instead of clones.
const DEFAULT_CROPS = [
  { zoom: 1.15, ox: 0, oy: 0 },
  { zoom: 1.55, ox: -0.08, oy: 0.06 },
  { zoom: 1.35, ox: 0.1, oy: -0.05 },
  { zoom: 1.7, ox: 0, oy: 0.08 },
];

function applyDefaultCrops() {
  state.panels.forEach((p, i) => {
    const crop = DEFAULT_CROPS[i % DEFAULT_CROPS.length];
    p.zoom = crop.zoom;
    p.ox = crop.ox;
    p.oy = crop.oy;
  });
}

function loadSampleScenes() {
  if (state.photos.length > 0) return;
  addPhoto(makeSampleScene(), 'Sunset boulevard (drawn in-app)');
  addPhoto(makeNeonScene(), 'Neon night street (drawn in-app)');
  // Spread the two scenes across the panels.
  state.panels.forEach((p, i) => { p.photo = i % 2; });
  applyDefaultCrops();
  render();
}

function buildPicker(container, items, getId, onPick, renderItem) {
  const box = $(container);
  box.innerHTML = '';
  items.forEach((item) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'choice';
    btn.dataset.id = getId(item);
    btn.innerHTML = renderItem(item);
    btn.addEventListener('click', () => {
      onPick(item);
      box.querySelectorAll('.choice').forEach((b) => b.classList.toggle('active', b.dataset.id === getId(item)));
      render();
    });
    box.appendChild(btn);
  });
  const active = box.querySelector(`[data-id="${getId(items[0])}"]`);
  if (active) active.classList.add('active');
}

function initPickers() {
  buildPicker('#layout-picker', LAYOUTS, (l) => l.id, (l) => { state.layout = l.id; }, (l) => `${l.name}<small>${l.note}</small>`);
  buildPicker('#grade-picker', GRADES, (g) => g.id, (g) => { state.grade = g.id; },
    (g) => `<span class="grade-swatch" style="background:${g.swatch}"></span>${g.name}`);
  buildPicker('#size-picker', SIZES, (s) => s.id, (s) => { state.size = s.id; }, (s) => `${s.name}<small>${s.note}</small>`);
  // Restore the default actives (square / hero-strip / neon-sunset).
  document.querySelectorAll('#layout-picker .choice').forEach((b) => b.classList.toggle('active', b.dataset.id === state.layout));
  document.querySelectorAll('#grade-picker .choice').forEach((b) => b.classList.toggle('active', b.dataset.id === state.grade));
  document.querySelectorAll('#size-picker .choice').forEach((b) => b.classList.toggle('active', b.dataset.id === state.size));
}

function bindInputs() {
  $('#file-input').addEventListener('change', (e) => {
    for (const file of e.target.files) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        addPhoto(img, file.name);
      };
      img.src = url;
    }
    e.target.value = '';
  });

  $('#title-input').addEventListener('input', (e) => { state.title = e.target.value; render(); });
  $('#subtitle-input').addEventListener('input', (e) => { state.subtitle = e.target.value; render(); });
  $('#badge-input').addEventListener('input', (e) => { state.badge = e.target.value; render(); });

  $('#zoom-slider').addEventListener('input', (e) => {
    const panel = state.panels[state.selectedPanel];
    if (!panel) return;
    panel.zoom = Number(e.target.value);
    $('#zoom-value').textContent = `${panel.zoom.toFixed(2)}×`;
    render();
  });

  $('#btn-fill-all').addEventListener('click', () => {
    state.panels.forEach((p) => { p.photo = state.selectedPhoto; });
    render();
  });
  $('#btn-shuffle').addEventListener('click', () => {
    const order = state.panels.map((p) => p.photo);
    for (let i = order.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    state.panels.forEach((p, i) => { p.photo = order[i]; });
    render();
  });

  $('#toggle-grain').addEventListener('change', (e) => { state.grain = e.target.checked; render(); });
  $('#toggle-vignette').addEventListener('change', (e) => { state.vignette = e.target.checked; render(); });
  $('#toggle-frame').addEventListener('change', (e) => { state.frame = e.target.checked; render(); });

  $('#btn-sample').addEventListener('click', loadSampleScenes);
  $('#btn-export').addEventListener('click', exportCurrent);
}

function canvasPoint(e) {
  const r = preview.getBoundingClientRect();
  return {
    x: ((e.clientX - r.left) / r.width) * preview.width,
    y: ((e.clientY - r.top) / r.height) * preview.height,
  };
}

function bindCanvas() {
  let drag = null;
  preview.addEventListener('pointerdown', (e) => {
    const p = canvasPoint(e);
    const idx = panelAt(state.layout, preview.width, preview.height, p.x, p.y);
    if (idx < 0) return;
    state.selectedPanel = idx;
    const panel = state.panels[idx];
    drag = { x: p.x, y: p.y, ox: panel.ox, oy: panel.oy, moved: false };
    preview.setPointerCapture(e.pointerId);
    render();
  });
  preview.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const p = canvasPoint(e);
    const panel = state.panels[state.selectedPanel];
    const dx = (p.x - drag.x) / preview.width;
    const dy = (p.y - drag.y) / preview.height;
    if (Math.abs(dx) + Math.abs(dy) > 0.002) drag.moved = true;
    panel.ox = Math.max(-0.4, Math.min(0.4, drag.ox + dx));
    panel.oy = Math.max(-0.4, Math.min(0.4, drag.oy + dy));
    render();
  });
  preview.addEventListener('pointerup', () => { drag = null; });
}

async function exportCurrent() {
  const size = currentSize();
  const blob = await exportCoverPng(state, size);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const slug = (state.title || 'cover').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'cover';
  a.href = url;
  a.download = `vice-coast-${slug}-${size.w}x${size.h}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

// Shot mode: draw one exported cover full-frame, for screenshots.
// ?shot=cover&size=wide|square|portrait&layout=hero-strip&grade=neon-sunset
function runShotMode() {
  document.body.innerHTML = '';
  document.body.style.margin = '0';
  document.body.style.background = '#0d0518';
  const size = SIZES.find((s) => s.id === shotSize) ?? SIZES[2];
  const canvas = document.createElement('canvas');
  canvas.width = size.w;
  canvas.height = size.h;
  canvas.style.display = 'block';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.objectFit = 'contain';
  document.body.appendChild(canvas);
  state.layout = LAYOUTS.some((l) => l.id === shotLayout) ? shotLayout : 'hero-strip';
  state.size = size.id;
  const gradeParam = params.get('grade');
  if (GRADES.some((g) => g.id === gradeParam)) state.grade = gradeParam;
  const titleParam = params.get('title');
  if (titleParam) state.title = titleParam;
  // Shot mode has no editor DOM, so load the scenes directly instead of
  // going through the editor's addPhoto/render path.
  state.photos = [makeSampleScene(), makeNeonScene()];
  state.photoNames = ['Sunset boulevard (drawn in-app)', 'Neon night street (drawn in-app)'];
  ensurePanels();
  state.panels.forEach((p, i) => { p.photo = i % 2; });
  applyDefaultCrops();
  drawCover(canvas, state);
  document.title = `Vice Coast cover — ${size.w}x${size.h}`;
  window.__viceCoastReady = true;
}

if (shotMode === 'cover') {
  runShotMode();
} else {
  initPickers();
  bindInputs();
  bindCanvas();
  loadSampleScenes();
  render();
  window.__viceCoastReady = true;
}
