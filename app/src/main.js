import { drawCover, getPanelDescriptors } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const captionInput = document.getElementById('caption');
const status = document.getElementById('status');
const zoomSlider = document.getElementById('zoom-slider');
const zoomValue = document.getElementById('zoom-value');
const sizeButtons = Array.from(document.querySelectorAll('.size-button'));
const layoutButtons = Array.from(document.querySelectorAll('.layout-button'));
const panelStatus = document.getElementById('panel-status');

let layout = 'single';
let panels = [];
let selectedPanel = 0;
let isPointerDown = false;
let lastPointer = { x: 0, y: 0 };

const sizePresets = {
  '1080x1080': { width: 1080, height: 1080 },
  '1080x1350': { width: 1080, height: 1350 },
  '1920x1080': { width: 1920, height: 1080 }
};

function getPanelCount() {
  if (layout === 'tri') return 3;
  if (layout === 'grid') return 4;
  return 1;
}

function updatePanelControls() {
  const panel = panels[selectedPanel] ?? { zoom: 1 };
  zoomSlider.value = panel.zoom;
  zoomValue.textContent = `${Math.round(panel.zoom * 100)}%`;
  panelStatus.textContent = `Panel ${selectedPanel + 1} of ${panels.length}`;
}

function ensurePanels() {
  const targetCount = getPanelCount();
  if (panels.length > targetCount) {
    panels = panels.slice(0, targetCount);
  }
  while (panels.length < targetCount) {
    panels.push({ img: null, zoom: 1, x: 0, y: 0 });
  }
  if (selectedPanel >= panels.length) {
    selectedPanel = panels.length - 1;
  }
  updatePanelControls();
}

function redraw() {
  ensurePanels();
  drawCover(canvas, panels, captionInput.value, layout);
}

function setActiveButton(buttons, target) {
  buttons.forEach((button) => button.classList.toggle('active', button === target));
}

layoutButtons.forEach((button) => {
  button.addEventListener('click', () => {
    layout = button.dataset.layout;
    setActiveButton(layoutButtons, button);
    ensurePanels();
    redraw();
  });
});

sizeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const size = sizePresets[button.dataset.size];
    if (!size) return;
    canvas.width = size.width;
    canvas.height = size.height;
    setActiveButton(sizeButtons, button);
    redraw();
  });
});

const fillButton = document.getElementById('fill-panels');
fillButton?.addEventListener('click', () => {
  const current = panels[selectedPanel];
  if (!current?.img) return;
  panels = panels.map((panel) => ({ ...panel, img: current.img }));
  redraw();
});

const resetButton = document.getElementById('reset');
resetButton?.addEventListener('click', () => {
  ensurePanels();
  panels = panels.map(() => ({ img: null, zoom: 1, x: 0, y: 0 }));
  selectedPanel = 0;
  captionInput.value = 'Sunset Heist';
  redraw();
});

function handlePanelSelection(event) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const descriptors = getPanelDescriptors(canvas.width, canvas.height, layout);
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
  const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
  const hit = descriptors.findIndex((descriptor) => ctx.isPointInPath(descriptor.path, x, y));
  if (hit >= 0 && hit < panels.length) {
    selectedPanel = hit;
  }
  updatePanelControls();
}

canvas.addEventListener('pointerdown', (event) => {
  isPointerDown = true;
  lastPointer = { x: event.clientX, y: event.clientY };
  handlePanelSelection(event);
  canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener('pointermove', (event) => {
  if (!isPointerDown) return;
  const scaleX = canvas.width / canvas.clientWidth;
  const scaleY = canvas.height / canvas.clientHeight;
  const dx = (event.clientX - lastPointer.x) * scaleX;
  const dy = (event.clientY - lastPointer.y) * scaleY;
  lastPointer = { x: event.clientX, y: event.clientY };
  const panel = panels[selectedPanel];
  if (!panel) return;
  panel.x += dx;
  panel.y += dy;
  redraw();
});

canvas.addEventListener('pointerup', (event) => {
  isPointerDown = false;
  canvas.releasePointerCapture?.(event.pointerId);
});

canvas.addEventListener('pointerleave', () => {
  isPointerDown = false;
});

canvas.addEventListener('wheel', (event) => {
  event.preventDefault();
  const panel = panels[selectedPanel];
  if (!panel) return;
  const delta = event.deltaY > 0 ? -0.05 : 0.05;
  panel.zoom = Math.max(0.6, Math.min(3, panel.zoom + delta));
  updatePanelControls();
  redraw();
});

zoomSlider.addEventListener('input', () => {
  const panel = panels[selectedPanel];
  if (!panel) return;
  panel.zoom = parseFloat(zoomSlider.value);
  updatePanelControls();
  redraw();
});

captionInput.addEventListener('input', redraw);

document.getElementById('photo').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const image = await loadImage(URL.createObjectURL(file));
  panels[selectedPanel] = { ...panels[selectedPanel], img: image };
  redraw();
});

const exportButton = document.getElementById('export');
exportButton.addEventListener('click', () => {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = `${canvas.width}x${canvas.height}-cover.png`;
    anchor.click();
    status.textContent = `Saved ${anchor.download}`;
  }, 'image/png');
});

window.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === 'r') {
    event.preventDefault();
    resetButton?.click();
    return;
  }
  if (event.key === 'Escape') {
    event.preventDefault();
    ensurePanels();
    selectedPanel = 0;
    updatePanelControls();
    redraw();
  }
});

/** Loads an image from a URL, resolving to the image once it can be drawn. */
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

const shot = new URLSearchParams(location.search).get('shot');
if (shot) {
  runShot(shot, new URLSearchParams(location.search), async (sample, text) => {
    ensurePanels();
    const image = await loadImage(sample);
    panels[selectedPanel] = { ...panels[selectedPanel], img: image };
    captionInput.value = text;
    redraw();
  });
} else {
  redraw();
}
