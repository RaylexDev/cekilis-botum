import { createCanvas, GlobalFonts } from "@napi-rs/canvas";

const W = 900;
const H = 280;

function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawStars(ctx, count) {
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  for (let i = 0; i < count; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = Math.random() * 1.8 + 0.4;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export async function generateBanner(g, ended = false) {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  const bg = ctx.createLinearGradient(0, 0, W, H);
  if (ended) {
    bg.addColorStop(0, "#1a1a2e");
    bg.addColorStop(0.5, "#16213e");
    bg.addColorStop(1, "#0f3460");
  } else {
    bg.addColorStop(0, "#1e0533");
    bg.addColorStop(0.4, "#2d1b69");
    bg.addColorStop(1, "#11009e");
  }
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  drawStars(ctx, 120);

  ctx.save();
  ctx.globalAlpha = 0.12;
  for (let i = 0; i < 5; i++) {
    const r = 60 + i * 40;
    ctx.beginPath();
    ctx.arc(W - 80, 80, r, 0, Math.PI * 2);
    ctx.strokeStyle = ended ? "#99aab5" : "#7c3aed";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  rrect(ctx, 20, 20, W - 40, H - 40, 20);
  ctx.strokeStyle = ended ? "rgba(153,170,181,0.35)" : "rgba(124,58,237,0.5)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  const glowGrad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 220);
  glowGrad.addColorStop(0, ended ? "rgba(99,110,114,0.18)" : "rgba(124,58,237,0.22)");
  glowGrad.addColorStop(1, "transparent");
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, W, H);

  const emoji = ended ? "🏆" : "🎉";
  ctx.font = "72px sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, 52, H / 2 - 20);

  const prize = g.prize.length > 28 ? g.prize.slice(0, 27) + "…" : g.prize;
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold 42px sans-serif`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(prize, 148, H / 2 + 6);

  ctx.font = "20px sans-serif";
  ctx.fillStyle = ended ? "rgba(153,170,181,0.9)" : "rgba(196,167,255,0.9)";
  const sub = ended
    ? `Kazanan: ${g.winners.length > 0 ? g.winners.length + " kişi" : "Katılımcı yoktu"}`
    : `${g.winnerCount} Kazanan • ${g.entries.length} Katılımcı`;
  ctx.fillText(sub, 148, H / 2 + 38);

  const badge = ended ? "SONA ERDİ" : "ÇEKİLİŞ";
  const bw = 130;
  const bh = 34;
  const bx = W - bw - 36;
  const by = 30;
  ctx.save();
  rrect(ctx, bx, by, bw, bh, 8);
  ctx.fillStyle = ended ? "rgba(153,170,181,0.25)" : "rgba(124,58,237,0.5)";
  ctx.fill();
  ctx.fillStyle = ended ? "#99aab5" : "#c4a7ff";
  ctx.font = "bold 15px sans-serif";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText(badge, bx + bw / 2, by + bh / 2);
  ctx.restore();
  ctx.textAlign = "left";

  ctx.fillStyle = "rgba(255,255,255,0.28)";
  ctx.font = "13px sans-serif";
  ctx.textBaseline = "bottom";
  ctx.fillText("RaylexDev", W - 105, H - 26);

  return canvas.toBuffer("image/png");
}
