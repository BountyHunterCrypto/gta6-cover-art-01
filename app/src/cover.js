// Paints the poster.
const layoutGenerators = {
  single: (width, height) => [{
    points: [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: width, y: height },
      { x: 0, y: height }
    ]
  }],
  tri: (width, height) => {
    const lean = width * 0.08;
    const sliceA = height * 0.25;
    const sliceB = height * 0.63;
    return [
      {
        points: [
          { x: -lean, y: 0 },
          { x: width + lean, y: 0 },
          { x: width + lean, y: sliceA },
          { x: -lean, y: sliceA * 0.7 }
        ]
      },
      {
        points: [
          { x: -lean, y: sliceA * 0.7 },
          { x: width + lean, y: sliceA },
          { x: width + lean, y: sliceB },
          { x: -lean, y: sliceB * 0.9 }
        ]
      },
      {
        points: [
          { x: -lean, y: sliceB * 0.9 },
          { x: width + lean, y: sliceB },
          { x: width + lean, y: height },
          { x: -lean, y: height }
        ]
      }
    ];
  },
  grid: (width, height) => {
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    return [
      {
        points: [
          { x: 0, y: 0 },
          { x: halfWidth, y: 0 },
          { x: halfWidth, y: halfHeight },
          { x: 0, y: halfHeight }
        ]
      },
      {
        points: [
          { x: halfWidth, y: 0 },
          { x: width, y: 0 },
          { x: width, y: halfHeight },
          { x: halfWidth, y: halfHeight }
        ]
      },
      {
        points: [
          { x: 0, y: halfHeight },
          { x: halfWidth, y: halfHeight },
          { x: halfWidth, y: height },
          { x: 0, y: height }
        ]
      },
      {
        points: [
          { x: halfWidth, y: halfHeight },
          { x: width, y: halfHeight },
          { x: width, y: height },
          { x: halfWidth, y: height }
        ]
      }
    ];
  }
};

function buildPath(points) {
  const path = new Path2D();
  if (!points.length) return path;
  path.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i += 1) {
    path.lineTo(points[i].x, points[i].y);
  }
  path.closePath();
  return path;
}

function getBounds(points) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const point of points) {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  }
  return {
    left: minX,
    top: minY,
    width: maxX - minX,
    height: maxY - minY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2
  };
}

export function getPanelDescriptors(width, height, layout = 'single') {
  const generator = layoutGenerators[layout] || layoutGenerators.single;
  const shapes = generator(width, height);
  return shapes.map((shape) => ({
    points: shape.points,
    path: buildPath(shape.points),
    bounds: getBounds(shape.points)
  }));
}

function drawHalftone(ctx, width, height) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  const spacing = Math.max(18, Math.min(width, height) / 26);
  const radius = spacing * 0.28;
  for (let y = -spacing; y < height + spacing; y += spacing) {
    const offset = ((y / spacing) % 2) ? spacing / 2 : 0;
    for (let x = -spacing; x < width + spacing; x += spacing) {
      ctx.beginPath();
      ctx.arc(x + offset, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawNeonRim(ctx, width, height) {
  ctx.save();
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#ff34e4');
  gradient.addColorStop(0.6, '#40f6ff');
  gradient.addColorStop(1, '#f9db66');
  ctx.strokeStyle = gradient;
  const lineWidth = Math.max(30, Math.min(width, height) * 0.04);
  ctx.lineWidth = lineWidth;
  ctx.shadowColor = '#ff58d8';
  ctx.shadowBlur = 60;
  ctx.strokeRect(lineWidth / 2, lineWidth / 2, width - lineWidth, height - lineWidth);
  ctx.restore();
}

function drawPanelImage(ctx, image, bounds, zoom = 1, offsetX = 0, offsetY = 0) {
  if (!image) return;
  const clampedZoom = Math.min(3, Math.max(0.6, zoom));
  const baseScale = Math.max(bounds.width / image.width, bounds.height / image.height);
  const scale = baseScale * clampedZoom;
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const drawX = bounds.centerX - drawWidth / 2 + offsetX;
  const drawY = bounds.centerY - drawHeight / 2 + offsetY;
  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

function drawScrimAndCaption(ctx, caption, width, height) {
  const scrimHeight = height * 0.28;
  const gradient = ctx.createLinearGradient(0, height - scrimHeight, 0, height);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, height - scrimHeight, width, scrimHeight);
  const text = (caption ?? '').toUpperCase();
  if (!text) return;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 20;
  const maxWidth = width * 0.9;
  let fontSize = Math.floor(height * 0.15);
  while (fontSize > 24) {
    ctx.font = `700 ${fontSize}px Cover, 'Archivo Black', sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) break;
    fontSize -= 2;
  }
  ctx.fillStyle = '#fff';
  ctx.fillText(text, width / 2, height - scrimHeight / 2 - 10);
  ctx.restore();
}

function drawPanels(ctx, descriptors, panels) {
  descriptors.forEach((descriptor, index) => {
    const panel = panels[index] || { zoom: 1, x: 0, y: 0 };
    ctx.save();
    ctx.clip(descriptor.path);
    const overlayGradient = ctx.createLinearGradient(
      descriptor.bounds.left,
      descriptor.bounds.top,
      descriptor.bounds.left,
      descriptor.bounds.top + descriptor.bounds.height
    );
    overlayGradient.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
    overlayGradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
    ctx.fillStyle = overlayGradient;
    ctx.fillRect(descriptor.bounds.left, descriptor.bounds.top, descriptor.bounds.width, descriptor.bounds.height);
    if (panel.img) {
      drawPanelImage(ctx, panel.img, descriptor.bounds, panel.zoom, panel.x, panel.y);
    }
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = Math.max(2, Math.min(descriptor.bounds.width, descriptor.bounds.height) * 0.02);
    ctx.stroke(descriptor.path);
    ctx.restore();
  });
}

export function drawCover(canvas, panels, caption, layout = 'single') {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);
  const background = ctx.createLinearGradient(0, 0, 0, height);
  background.addColorStop(0, '#0b0a2c');
  background.addColorStop(0.45, '#ff6875');
  background.addColorStop(1, '#ffd56b');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);
  drawHalftone(ctx, width, height);
  const descriptors = getPanelDescriptors(width, height, layout);
  drawPanels(ctx, descriptors, panels);
  drawNeonRim(ctx, width, height);
  drawScrimAndCaption(ctx, caption, width, height);
}
