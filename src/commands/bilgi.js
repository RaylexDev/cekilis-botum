import { getGiveaway } from "../db.js";
import { CV2 } from "../utils/giveaway.js";
import { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags } from "discord.js";
import { COLOR, EMOJI, PREFIX, FOOTER } from "../constants.js";
import { formatRelative, formatFull } from "../utils/time.js";

export const cmd = {
  name: "bilgi",
  aliases: ["info", "ginfo", "durum"],
  desc: "Çekiliş hakkında detaylı bilgi gösterir.",
  usage: `${PREFIX}bilgi <id>`,

  async execute(msg, args, client) {
    if (!msg.guild) return;

    const id = args[0];
    if (!id) return err(msg, `Kullanım: \`${PREFIX}bilgi <çekiliş-id>\``);

    const g = getGiveaway(id);
    if (!g || g.guildId !== msg.guild.id) return err(msg, "Çekiliş bulunamadı.");

    const c = new ContainerBuilder().setAccentColor(g.ended ? COLOR.END : COLOR.PRIMARY);
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `# ${EMOJI.STATS} Çekiliş Bilgisi`
    ));
    c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));

    const lines = [
      `${EMOJI.GIFT} **Ödül:** ${g.prize}`,
      `🆔 **ID:** \`${g.id}\``,
      `👤 **Düzenleyen:** <@${g.hostId}>`,
      `📢 **Kanal:** <#${g.channelId}>`,
      `${EMOJI.CROWN} **Kazanan Sayısı:** ${g.winnerCount}`,
      `${EMOJI.TICKET} **Katılımcı:** ${g.entries.length}`,
      `${EMOJI.CLOCK} **Başlangıç:** ${formatFull(g.createdAt)}`,
      `${EMOJI.CLOCK} **Bitiş:** ${formatFull(g.endsAt)}`,
      `📌 **Durum:** ${g.ended ? "Sona erdi" : g.paused ? `${EMOJI.PAUSE} Duraklatıldı` : `Devam ediyor — ${formatRelative(g.endsAt)}`}`,
    ];

    if (g.requiredRole) lines.push(`🎭 **Gerekli Rol:** <@&${g.requiredRole}>`);
    if (g.minMessages > 0) lines.push(`💬 **Min. Mesaj:** ${g.minMessages}`);
    if (g.bonusRoles?.length) {
      lines.push(`${EMOJI.BOLT} **Bonus Roller:**\n${g.bonusRoles.map((b) => `> <@&${b.roleId}> — +${b.bonus}x`).join("\n")}`);
    }
    if (g.ended && g.winners.length) {
      lines.push(`${EMOJI.CROWN} **Kazananlar:** ${g.winners.map((w) => `<@${w}>`).join(", ")}`);
    }

    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(lines.join("\n")));
    c.addSeparatorComponents(new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# ${FOOTER}`));
    await msg.reply({ flags: CV2, components: [c] });
  },
};

async function err(msg, text) {
  const c = new ContainerBuilder().setAccentColor(COLOR.ERROR);
  c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`${EMOJI.CROSS} ${text}`));
  await msg.reply({ flags: MessageFlags.IsComponentsV2, components: [c] });
}
