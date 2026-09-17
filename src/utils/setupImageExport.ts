import { CarSetup } from '../types';

/**
 * Utility to generate and download a clean, high-resolution, graphic Setup Sheet image
 * (PNG format) displaying all parameters, metadata, and visual setup screenshots (Coach Dave Academy Style).
 */

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number = 8,
  fillColor?: string,
  strokeColor?: string,
  lineWidth: number = 1
) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();

  if (fillColor) {
    ctx.fillStyle = fillColor;
    ctx.fill();
  }
  if (strokeColor) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
  ctx.restore();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

export async function generateSetupSheetCanvas(
  setup: CarSetup,
  trackName: string,
  gameName: string
): Promise<HTMLCanvasElement> {
  const width = 1600;
  const hasScreenshots = Boolean(setup.setupScreenshots && setup.setupScreenshots.length > 0);
  const height = hasScreenshots ? 1280 : 1180;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // 1. BACKGROUND GRADIENT
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#0a0f1d');
  bgGrad.addColorStop(0.5, '#070b14');
  bgGrad.addColorStop(1, '#05070c');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle grid overlay
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Outer Decorative Border
  roundRect(ctx, 24, 24, width - 48, height - 48, 16, undefined, '#1e293b', 2);
  // Red/Cyan racing corner accents
  ctx.fillStyle = hasScreenshots ? '#f59e0b' : '#38bdf8';
  ctx.fillRect(24, 24, 48, 4);
  ctx.fillRect(24, 24, 4, 48);
  ctx.fillRect(width - 72, height - 28, 48, 4);
  ctx.fillRect(width - 28, height - 72, 4, 48);

  // 2. HEADER CONTAINER (y: 36 to 140)
  roundRect(ctx, 44, 44, width - 88, 100, 12, '#0f172a', '#334155', 1.5);

  // Top Left: Game Badge & Car/Track
  roundRect(ctx, 60, 60, 180, 28, 6, hasScreenshots ? '#d97706' : '#0284c7', undefined);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(gameName.toUpperCase(), 72, 78);

  // Circuit & Session
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(`${trackName.toUpperCase()}  •  ${setup.type.toUpperCase()}  •  ${setup.condition.toUpperCase()} CONDITIONS`, 255, 78);

  // Main Title
  ctx.fillStyle = '#f8fafc';
  ctx.font = '900 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  const displayTitle = setup.title.length > 55 ? setup.title.substring(0, 52) + '...' : setup.title;
  ctx.fillText(displayTitle, 60, 122);

  // Top Right: Best Lap Time Pill & Creator Info
  roundRect(ctx, width - 360, 56, 300, 76, 10, '#1e293b', '#0ea5e9', 1.5);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('BEST LAP TIME', width - 344, 76);

  ctx.fillStyle = '#10b981';
  ctx.font = '900 26px "SFMono-Regular", Consolas, Menlo, monospace';
  ctx.fillText(setup.bestLapTime, width - 344, 106);

  // Creator Badge
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`By @${setup.creatorUsername}`, width - 76, 80);
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(setup.creatorBadge ? `[${setup.creatorBadge} Creator]` : '[Community]', width - 76, 96);
  ctx.textAlign = 'left';

  // ---------------------------------------------------------------------------
  // IF HAS SCREENSHOTS: RENDER COACH DAVE ACADEMY STYLE VISUAL SETUP PACK
  // ---------------------------------------------------------------------------
  if (hasScreenshots && setup.setupScreenshots && setup.setupScreenshots.length > 0) {
    const screenshots = setup.setupScreenshots.slice(0, 4);
    const gridX = 44;
    const gridY = 160;
    const gridWidth = width - 88;
    const cellWidth = (gridWidth - 24) / 2;
    const cellHeight = 440;

    // Load images asynchronously
    const loadedImages: (HTMLImageElement | null)[] = await Promise.all(
      screenshots.map(async (s) => {
        try {
          return await loadImage(s.imageUrl);
        } catch {
          return null;
        }
      })
    );

    // Render Subtitle Header
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('⚡ IN-GAME SETUP PAGES & TELEMETRY TUNING (COACH DAVE ACADEMY ARCHITECTURE)', gridX, gridY - 8);

    for (let i = 0; i < screenshots.length; i++) {
      const item = screenshots[i];
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cellX = gridX + col * (cellWidth + 24);
      const cellY = gridY + row * (cellHeight + 20);

      // Outer panel card
      roundRect(ctx, cellX, cellY, cellWidth, cellHeight, 12, '#0c1322', '#1e293b', 1.5);

      // Header strip for this page
      roundRect(ctx, cellX + 12, cellY + 12, cellWidth - 24, 36, 8, '#131d31', '#334155', 1);
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(item.category.toUpperCase(), cellX + 24, cellY + 34);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(`PAGE ${i + 1} OF ${screenshots.length}`, cellX + cellWidth - 24, cellY + 34);
      ctx.textAlign = 'left';

      // Screenshot Viewport
      const imgX = cellX + 12;
      const imgY = cellY + 54;
      const imgW = cellWidth - 24;
      const imgH = cellHeight - 110;

      roundRect(ctx, imgX, imgY, imgW, imgH, 8, '#05070c', '#334155', 1);

      const img = loadedImages[i];
      if (img) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(imgX, imgY, imgW, imgH);
        ctx.clip();
        ctx.drawImage(img, imgX, imgY, imgW, imgH);
        ctx.restore();
      }

      // Page Notes Footer
      roundRect(ctx, cellX + 12, cellY + cellHeight - 46, cellWidth - 24, 34, 6, '#131d31', '#1e293b', 1);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'italic 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const pageNote = item.notes || setup.notes || 'Official sim tuning page capture.';
      const shortNote = pageNote.length > 80 ? pageNote.substring(0, 77) + '...' : pageNote;
      ctx.fillText(`"${shortNote}"`, cellX + 22, cellY + cellHeight - 24);
    }

    // FOOTER (y: 1220)
    roundRect(ctx, 44, height - 70, width - 88, 44, 10, '#0c1322', '#1e293b', 1);
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`DDLSETUPMARKET • ${gameName.toUpperCase()} ESPORTS TUNING SPEC`, 60, height - 42);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('ddlsetupmarket.com • VISUAL TELEMETRY CERTIFIED', width - 60, height - 42);
    ctx.textAlign = 'left';

    return canvas;
  }

  // ---------------------------------------------------------------------------
  // DEFAULT 2-COLUMN NUMERICAL FORMULA SPEC SHEET
  // ---------------------------------------------------------------------------
  const colGap = 28;
  const panelWidth = (width - 88 - colGap) / 2;
  const panelLeftX = 44;
  const panelRightX = 44 + panelWidth + colGap;

  let leftY = 160;
  let rightY = 160;

  // SECTION 1: AERODYNAMICS
  roundRect(ctx, panelLeftX, leftY, panelWidth, 120, 12, '#0c1322', '#1e293b', 1);
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('1. AERODYNAMICS', panelLeftX + 16, leftY + 26);
  ctx.fillStyle = '#64748b';
  ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('DOWNFORCE RATIO', panelLeftX + 160, leftY + 26);

  roundRect(ctx, panelLeftX + 16, leftY + 40, (panelWidth - 44) / 2, 64, 8, '#131d31', '#334155', 1);
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('FRONT WING', panelLeftX + 28, leftY + 60);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 24px "SFMono-Regular", Consolas, Menlo, monospace';
  ctx.fillText(`${setup.specs.frontWing}`, panelLeftX + 28, leftY + 92);

  roundRect(ctx, panelLeftX + 24 + (panelWidth - 44) / 2, leftY + 40, (panelWidth - 44) / 2, 64, 8, '#131d31', '#334155', 1);
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('REAR WING', panelLeftX + 36 + (panelWidth - 44) / 2, leftY + 60);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 24px "SFMono-Regular", Consolas, Menlo, monospace';
  ctx.fillText(`${setup.specs.rearWing}`, panelLeftX + 36 + (panelWidth - 44) / 2, leftY + 92);

  leftY += 136;

  // SECTION 2: TRANSMISSION / DIFFERENTIAL
  roundRect(ctx, panelLeftX, leftY, panelWidth, 120, 12, '#0c1322', '#1e293b', 1);
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('2. TRANSMISSION / DIFFERENTIAL', panelLeftX + 16, leftY + 26);

  roundRect(ctx, panelLeftX + 16, leftY + 40, (panelWidth - 44) / 2, 64, 8, '#131d31', '#334155', 1);
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('DIFF ON-THROTTLE', panelLeftX + 28, leftY + 60);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 24px "SFMono-Regular", Consolas, Menlo, monospace';
  ctx.fillText(`${setup.specs.diffOnThrottle}%`, panelLeftX + 28, leftY + 92);

  roundRect(ctx, panelLeftX + 24 + (panelWidth - 44) / 2, leftY + 40, (panelWidth - 44) / 2, 64, 8, '#131d31', '#334155', 1);
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('DIFF OFF-THROTTLE', panelLeftX + 36 + (panelWidth - 44) / 2, leftY + 60);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 24px "SFMono-Regular", Consolas, Menlo, monospace';
  ctx.fillText(`${setup.specs.diffOffThrottle}%`, panelLeftX + 36 + (panelWidth - 44) / 2, leftY + 92);

  leftY += 136;

  // SECTION 3: SUSPENSION GEOMETRY (CAMBER & TOE)
  roundRect(ctx, panelLeftX, leftY, panelWidth, 185, 12, '#0c1322', '#1e293b', 1);
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('3. SUSPENSION GEOMETRY (CAMBER & TOE)', panelLeftX + 16, leftY + 26);

  const quadW = (panelWidth - 44) / 2;
  const quadH = 60;

  roundRect(ctx, panelLeftX + 16, leftY + 44, quadW, quadH, 8, '#131d31', '#1e293b', 1);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('FRONT CAMBER', panelLeftX + 28, leftY + 62);
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 18px "SFMono-Regular", Consolas, Menlo, monospace';
  ctx.fillText(`${setup.specs.frontCamber}°`, panelLeftX + 28, leftY + 90);

  roundRect(ctx, panelLeftX + 24 + quadW, leftY + 44, quadW, quadH, 8, '#131d31', '#1e293b', 1);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('REAR CAMBER', panelLeftX + 36 + quadW, leftY + 62);
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 18px "SFMono-Regular", Consolas, Menlo, monospace';
  ctx.fillText(`${setup.specs.rearCamber}°`, panelLeftX + 36 + quadW, leftY + 90);

  roundRect(ctx, panelLeftX + 16, leftY + 112, quadW, quadH, 8, '#131d31', '#1e293b', 1);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('FRONT TOE', panelLeftX + 28, leftY + 130);
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 18px "SFMono-Regular", Consolas, Menlo, monospace';
  ctx.fillText(`${setup.specs.frontToe}°`, panelLeftX + 28, leftY + 158);

  roundRect(ctx, panelLeftX + 24 + quadW, leftY + 112, quadW, quadH, 8, '#131d31', '#1e293b', 1);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('REAR TOE', panelLeftX + 36 + quadW, leftY + 130);
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 18px "SFMono-Regular", Consolas, Menlo, monospace';
  ctx.fillText(`${setup.specs.rearToe}°`, panelLeftX + 36 + quadW, leftY + 158);

  leftY += 201;

  // SECTION 4: SUSPENSION & ANTI-ROLL BARS
  roundRect(ctx, panelLeftX, leftY, panelWidth, 230, 12, '#0c1322', '#1e293b', 1);
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('4. SUSPENSION, ARB & RIDE HEIGHT', panelLeftX + 16, leftY + 26);

  const statItems = [
    { label: 'FRONT SUSPENSION', val: setup.specs.frontSuspension },
    { label: 'REAR SUSPENSION', val: setup.specs.rearSuspension },
    { label: 'FRONT ANTI-ROLL BAR', val: setup.specs.frontAntiRollBar },
    { label: 'REAR ANTI-ROLL BAR', val: setup.specs.rearAntiRollBar },
    { label: 'FRONT RIDE HEIGHT', val: setup.specs.frontRideHeight },
    { label: 'REAR RIDE HEIGHT', val: setup.specs.rearRideHeight },
  ];

  const tripleW = (panelWidth - 56) / 3;
  statItems.forEach((st, idx) => {
    const r = Math.floor(idx / 3);
    const c = idx % 3;
    const sx = panelLeftX + 16 + c * (tripleW + 12);
    const sy = leftY + 44 + r * 82;

    roundRect(ctx, sx, sy, tripleW, 72, 8, '#131d31', '#1e293b', 1);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(st.label, sx + 10, sy + 22);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px "SFMono-Regular", Consolas, Menlo, monospace';
    ctx.fillText(`${st.val}`, sx + 10, sy + 54);
  });

  // SECTION 5: BRAKES
  roundRect(ctx, panelRightX, rightY, panelWidth, 120, 12, '#0c1322', '#1e293b', 1);
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('5. BRAKES & STOPPING POWER', panelRightX + 16, rightY + 26);

  roundRect(ctx, panelRightX + 16, rightY + 40, (panelWidth - 44) / 2, 64, 8, '#131d31', '#334155', 1);
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('BRAKE PRESSURE', panelRightX + 28, rightY + 60);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 24px "SFMono-Regular", Consolas, Menlo, monospace';
  ctx.fillText(`${setup.specs.brakePressure}%`, panelRightX + 28, rightY + 92);

  roundRect(ctx, panelRightX + 24 + (panelWidth - 44) / 2, rightY + 40, (panelWidth - 44) / 2, 64, 8, '#131d31', '#334155', 1);
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('FRONT BRAKE BIAS', panelRightX + 36 + (panelWidth - 44) / 2, rightY + 60);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 24px "SFMono-Regular", Consolas, Menlo, monospace';
  ctx.fillText(`${setup.specs.brakeBias}%`, panelRightX + 36 + (panelWidth - 44) / 2, rightY + 92);

  rightY += 136;

  // SECTION 6: 4-CORNER TYRE PRESSURES
  roundRect(ctx, panelRightX, rightY, panelWidth, 226, 12, '#0c1322', '#1e293b', 1);
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('6. TYRE PRESSURES (PSI / HOT TARGET)', panelRightX + 16, rightY + 26);

  const chassisCenterX = panelRightX + panelWidth / 2;
  const chassisCenterY = rightY + 124;

  roundRect(ctx, chassisCenterX - 45, chassisCenterY - 75, 90, 150, 16, '#0f172a', '#334155', 1.5);
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('FRONT', chassisCenterX, chassisCenterY - 30);
  ctx.fillText('CHASSIS', chassisCenterX, chassisCenterY);
  ctx.fillText('REAR', chassisCenterX, chassisCenterY + 30);
  ctx.textAlign = 'left';

  const tireCardW = 160;
  const tireCardH = 68;

  roundRect(ctx, chassisCenterX - 55 - tireCardW, chassisCenterY - 65, tireCardW, tireCardH, 8, '#131d31', '#10b981', 1.5);
  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('FRONT LEFT (FL)', chassisCenterX - 45 - tireCardW, chassisCenterY - 45);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 20px "SFMono-Regular", Consolas, Menlo, monospace';
  ctx.fillText(`${setup.specs.flPressure} psi`, chassisCenterX - 45 - tireCardW, chassisCenterY - 16);

  roundRect(ctx, chassisCenterX + 55, chassisCenterY - 65, tireCardW, tireCardH, 8, '#131d31', '#10b981', 1.5);
  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('FRONT RIGHT (FR)', chassisCenterX + 65, chassisCenterY - 45);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 20px "SFMono-Regular", Consolas, Menlo, monospace';
  ctx.fillText(`${setup.specs.frPressure} psi`, chassisCenterX + 65, chassisCenterY - 16);

  roundRect(ctx, chassisCenterX - 55 - tireCardW, chassisCenterY + 12, tireCardW, tireCardH, 8, '#131d31', '#06b6d4', 1.5);
  ctx.fillStyle = '#06b6d4';
  ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('REAR LEFT (RL)', chassisCenterX - 45 - tireCardW, chassisCenterY + 32);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 20px "SFMono-Regular", Consolas, Menlo, monospace';
  ctx.fillText(`${setup.specs.rlPressure} psi`, chassisCenterX - 45 - tireCardW, chassisCenterY + 61);

  roundRect(ctx, chassisCenterX + 55, chassisCenterY + 12, tireCardW, tireCardH, 8, '#131d31', '#06b6d4', 1.5);
  ctx.fillStyle = '#06b6d4';
  ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('REAR RIGHT (RR)', chassisCenterX + 65, chassisCenterY + 32);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 20px "SFMono-Regular", Consolas, Menlo, monospace';
  ctx.fillText(`${setup.specs.rrPressure} psi`, chassisCenterX + 65, chassisCenterY + 61);

  rightY += 242;

  // SECTION 7: CREATOR NOTES & STRATEGY ADVICE
  roundRect(ctx, panelRightX, rightY, panelWidth, 270, 12, '#0c1322', '#1e293b', 1);
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('7. CREATOR NOTES & SETUP ADVICE', panelRightX + 16, rightY + 26);

  roundRect(ctx, panelRightX + 16, rightY + 44, panelWidth - 32, 130, 8, '#131d31', '#1e293b', 1);
  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'italic 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

  const noteLines = wrapText(ctx, `"${setup.notes}"`, panelWidth - 64);
  noteLines.slice(0, 5).forEach((line, lIdx) => {
    ctx.fillText(line, panelRightX + 32, rightY + 74 + lIdx * 22);
  });

  roundRect(ctx, panelRightX + 16, rightY + 184, panelWidth - 32, 70, 8, '#0b1320', '#1e293b', 1);
  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('• PRO RACING TIP:', panelRightX + 28, rightY + 208);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Maintain smooth steering inputs; balance trail-braking to rotate on entry.', panelRightX + 140, rightY + 208);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('• RIG SETTINGS:', panelRightX + 28, rightY + 234);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(`Tested on ${setup.inputDevice || 'Direct Drive'}. Linear FFB response recommended.`, panelRightX + 140, rightY + 234);

  // FOOTER (y: 1110)
  ctx.fillStyle = '#475569';
  ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('DDLSETUPMARKET • OFFICIAL TELEMETRY SPEC SHEET', 48, height - 42);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('ddlsetupmarket.com • VERIFIED ESPORTS ARCHITECTURE', width - 48, height - 42);
  ctx.textAlign = 'left';

  return canvas;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0] || '';

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

export async function downloadSetupAsImage(
  setup: CarSetup,
  trackName: string,
  gameName: string
): Promise<string> {
  const canvas = await generateSetupSheetCanvas(setup, trackName, gameName);

  return new Promise((resolve) => {
    const dataUrl = canvas.toDataURL('image/png', 1.0);

    const safeTitle = (setup.title || 'sim_setup')
      .toLowerCase()
      .replace(/[^a-z0-9]/gi, '_')
      .replace(/_+/g, '_');
    const safeTrack = trackName.toLowerCase().replace(/[^a-z0-9]/gi, '_');
    const filename = `${safeTitle}_${safeTrack}_setup_sheet.png`;

    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataUrl);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    resolve(dataUrl);
  });
}
