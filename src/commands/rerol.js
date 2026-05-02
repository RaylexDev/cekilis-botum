import { isManager } from "../utils/perms.js";
import { getGiveaway, updateGiveaway } from "../db.js";
import { pickWinners, CV2 } from "../utils/giveaway.js";
import { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags } from "discord.js";
import { COLOR, EMOJI, PREFIX } from "../constants.js";

export const cmd = {
  name: "rerol",
  aliases: ["reroll", "yenikazan"],
  desc: "Çekilişte kazananı yeniden seçer.",
  usage: `${PREFIX}rerol <id> [kazanan sayısı]`,
  managerOnly: true,

  async execute(msg, args, client) {
    if (!msg.guild || !msg.member) return;
    if (!isManager(msg.member)) return err(msg, "Yetkin yok.");

    const id = args[0];
    const count = parseInt(args[1]) || null;
    if (!id) return err(msg, `Kullanım: \`${PREFIX}rerol <çekiliş-id> [kazanan sayısı]\``);

    const g = getGiveaway(id);
    if (!g || g.guildId !== msg.guild.id) return err(msg, "Çekiliş bulunamadı.");
    if (!g.ended) return err(msg, "Çekiliş henüz bitmedi. Önce `bitir` kullan.");

    const winCount = count ?? g.winnerCount;
    const members = await msg.guild.members.fetch().catch(() => new Map());
    const newWinners = pickWinners(g.entries, g.bonusRoles, winCount, members);

    updateGiveaway(g.id, { winners: newWinners });

    const ch = await client.channels.fetch(g.channelId).catch(() => null);
    if (ch) {
      const c = new ContainerBuilder().setAccentColor(COLOR.PRIMARY);
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`# ${EMOJI.REROLL} Rerol Yapıldı!`));
      c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
        `${EMOJI.GIFT} **Ödül:** ${g.prize}\n` +
        `${EMOJI.CROWN} **Yeni Kazanan${newWinners.length > 1 ? "lar" : ""}:** ${newWinners.length ? newWinners.map((w) => `<@${w}>`).join(", ") : "Uygun katılımcı yok."}`
      ));
      c.addSeparatorComponents(new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small));
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# ID: \`${g.id}\``));
      await ch.send({ flags: CV2, components: [c] });
    }

    const res = new ContainerBuilder().setAccentColor(COLOR.SUCCESS);
    res.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `${EMOJI.CHECK} Rerol tamamlandı! Yeni kazananlar: ${newWinners.length ? newWinners.map((w) => `<@${w}>`).join(", ") : "Yok"}`
    ));
    await msg.reply({ flags: CV2, components: [res] });
  },
};

async function err(msg, text) {
  const c = new ContainerBuilder().setAccentColor(COLOR.ERROR);
  c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`${EMOJI.CROSS} ${text}`));
  await msg.reply({ flags: MessageFlags.IsComponentsV2, components: [c] });
}
