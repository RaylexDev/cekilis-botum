import {
  ContainerBuilder, TextDisplayBuilder, SeparatorBuilder,
  SeparatorSpacingSize, ActionRowBuilder, ButtonBuilder,
  ButtonStyle, MessageFlags, AttachmentBuilder,
} from "discord.js";
import { COLOR, EMOJI, FOOTER } from "../constants.js";
import { formatRelative, formatFull } from "./time.js";
import { generateBanner } from "../canvas/banner.js";

export const CV2 = MessageFlags.IsComponentsV2;

function sep(divider = true) {
  return new SeparatorBuilder()
    .setDivider(divider)
    .setSpacing(SeparatorSpacingSize.Small);
}

function txt(content) {
  return new TextDisplayBuilder().setContent(content);
}

export function buildGiveawayComponents(g, ended = false) {
  const remaining = g.endsAt - Date.now();
  const c = new ContainerBuilder().setAccentColor(ended ? COLOR.END : COLOR.PRIMARY);

  c.addTextDisplayComponents(txt(
    `# ${EMOJI.CONFETTI} ${g.prize}`
  ));
  c.addSeparatorComponents(sep());
  c.addTextDisplayComponents(txt(
    `-# ${EMOJI.GIFT} **${g.winnerCount}** kazanan • ${EMOJI.TICKET} Düğmeye bas katıl`
  ));
  c.addSeparatorComponents(sep());

  const lines = [];
  lines.push(`${EMOJI.CLOCK} **Bitiş:** ${ended ? "Sona erdi" : formatRelative(g.endsAt)} (${formatFull(g.endsAt)})`);
  lines.push(`👤 **Düzenleyen:** <@${g.hostId}>`);
  lines.push(`${EMOJI.TICKET} **Katılımcı:** ${g.entries.length}`);
  if (g.requiredRole) lines.push(`🎭 **Gerekli Rol:** <@&${g.requiredRole}>`);
  if (g.minMessages > 0) lines.push(`💬 **Min. Mesaj:** ${g.minMessages}`);
  if (g.bonusRoles?.length) {
    const br = g.bonusRoles.map((b) => `<@&${b.roleId}> → **+${b.bonus}x**`).join(" • ");
    lines.push(`${EMOJI.BOLT} **Bonus Roller:** ${br}`);
  }
  if (g.paused) lines.push(`\n${EMOJI.PAUSE} **Çekiliş duraklatıldı.**`);

  c.addTextDisplayComponents(txt(lines.join("\n")));

  if (ended && g.winners.length > 0) {
    c.addSeparatorComponents(sep());
    c.addTextDisplayComponents(txt(
      `${EMOJI.CROWN} **Kazananlar:** ${g.winners.map((w) => `<@${w}>`).join(", ")}`
    ));
  }

  c.addSeparatorComponents(sep(false));
  c.addTextDisplayComponents(txt(`-# ${FOOTER} • ID: ${g.id}`));

  if (!ended && !g.paused) {
    c.addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`giveaway:join:${g.id}`)
          .setLabel("Katıl")
          .setEmoji(EMOJI.CONFETTI)
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`giveaway:leave:${g.id}`)
          .setLabel("Ayrıl")
          .setEmoji("🚪")
          .setStyle(ButtonStyle.Secondary),
      )
    );
  }

  return [c];
}

export async function postGiveaway(channel, g) {
  const buf = await generateBanner(g);
  const att = new AttachmentBuilder(buf, { name: "cekilis.png" });
  const components = buildGiveawayComponents(g);

  const msg = await channel.send({
    flags: CV2,
    components: components,
    files: [att],
  });
  return msg;
}

export async function updateGiveawayMessage(client, g) {
  try {
    const ch = await client.channels.fetch(g.channelId).catch(() => null);
    if (!ch) return;
    const msg = await ch.messages.fetch(g.messageId).catch(() => null);
    if (!msg) return;

    const ended = g.ended || Date.now() >= g.endsAt;
    const components = buildGiveawayComponents(g, ended);

    if (ended) {
      const buf = await generateBanner(g, true);
      const att = new AttachmentBuilder(buf, { name: "cekilis.png" });
      await msg.edit({ flags: CV2, components, files: [att] });
    } else {
      await msg.edit({ flags: CV2, components });
    }
  } catch (e) {
    console.error("[updateGiveawayMessage]", e.message);
  }
}

export function pickWinners(entries, bonusRoles, count, members) {
  const pool = [];
  for (const uid of entries) {
    const member = members.get(uid);
    if (!member) continue;
    let weight = 1;
    for (const br of bonusRoles ?? []) {
      if (member.roles.cache.has(br.roleId)) weight += br.bonus;
    }
    for (let i = 0; i < weight; i++) pool.push(uid);
  }
  if (!pool.length) return [];

  const winners = [];
  const used = new Set();
  const shuffled = pool.sort(() => Math.random() - 0.5);

  for (const uid of shuffled) {
    if (used.has(uid)) continue;
    winners.push(uid);
    used.add(uid);
    if (winners.length >= count) break;
  }
  return winners;
}
