import type { DigestContent } from "../llm/gemini.js";

export function renderText(d: DigestContent): string {
  const lines: string[] = [];
  lines.push(d.intro, "");
  d.items.forEach((it, idx) => {
    lines.push(`${idx + 1}. ${it.title}`);
    lines.push(`   TL;DR: ${it.tldr}`);
    it.bullets.forEach(b => lines.push(`   - ${b}`));
    if (it.link) lines.push(`   Link: ${it.link}`);
    lines.push("");
  });
  lines.push(d.outro);
  lines.push("");
  lines.push("—");
  lines.push("Demo email. Reply STOP to unsubscribe (placeholder).");
  return lines.join("\n");
}

export function renderHtml(d: DigestContent): string {
  const itemsHtml = d.items.map(it => {
    const bullets = it.bullets.map(b => `<li>${escapeHtml(b)}</li>`).join("");
    const link = it.link ? `<p><a href="${escapeHtml(it.link)}">Read more</a></p>` : "";
    return `
      <div style="padding:12px 0;border-bottom:1px solid #eee;">
        <h3 style="margin:0 0 6px 0;">${escapeHtml(it.title)}</h3>
        <p style="margin:0 0 8px 0;"><b>TL;DR:</b> ${escapeHtml(it.tldr)}</p>
        <ul style="margin:0 0 8px 18px;">${bullets}</ul>
        ${link}
      </div>
    `;
  }).join("");

  return `
  <div style="font-family:Arial, sans-serif; max-width:680px; margin:0 auto; line-height:1.5;">
    <h2 style="margin:16px 0;">${escapeHtml(d.subject)}</h2>
    <p>${escapeHtml(d.intro)}</p>
    ${itemsHtml}
    <p style="margin-top:14px;">${escapeHtml(d.outro)}</p>
    <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
    <p style="font-size:12px;color:#666;">
      Demo email. Reply STOP to unsubscribe (placeholder).
    </p>
  </div>
  `;
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
