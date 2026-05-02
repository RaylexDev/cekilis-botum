import { isManager } from "../utils/perms.js";
import { getGiveaway, updateGiveaway } from "../db.js";
import { pickWinners, updateGiveawayMessage, CV2 } from "../utils/giveaway.js";
import { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags } from "discord.js";
import { COLOR, EMOJI, PREFIX } from "../constants.js";

function sep() {
  return new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small);
}

export const cmd = {
  name: "bitir",
  aliases: ["end", "gend"],
  desc: "Çekilişi erken bitirir ve kazananı seçer.",
  usage: `${PREFIX}bitir <id>`,
  managerOnly: true,

  async execute(msg, args, client) {
    if (!msg.guild || !msg.member) return;
    if (!isManager(msg.member)) return err(msg, "Yetkin yok.");

    const id = args[0];
    if (!id) return err(msg, `Kullanım: \`${PREFIX}bitir <çekiliş-id>\``);

    const g = getGiveaway(id);
    if (!g || g.guildId !== msg.guild.id) return err(msg, "Çekiliş bulunamadı.");
    if (g.ended) return err(msg, "Bu çekiliş zaten sona erdi.");

    const members = await msg.guild.members.fetch().catch(() => new Map());
    const winners = pickWinners(g.entries, g.bonusRoles, g.winnerCount, members);

    updateGiveaway(g.id, { ended: 1, winners });
    const updated = { ...g, ended: true, winners };
    await updateGiveawayMessage(client, updated);

    const ch = await client.channels.fetch(g.channelId).catch(() => null);
    if (ch) {
      const mention = winners.length ? winners.map((w) => `<@${w}>`).join(", ") : "Kimse";
      await ch.send({
        flags: CV2,
        components: [buildResult(g.prize, winners, g.id)],
      });
    }

    const c = new ContainerBuilder().setAccentColor(COLOR.SUCCESS);
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `${EMOJI.CHECK} Çekiliş sonlandırıldı.\n${EMOJI.CROWN} **Kazananlar:** ${winners.length ? winners.map((w) => `<@${w}>`).join(", ") : "Yok"}`
    ));
    await msg.reply({ flags: CV2, components: [c] });
  },
};

function buildResult(prize, winners, id) {
  const c = new ContainerBuilder().setAccentColor(COLOR.PRIMARY);
  c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`# ${EMOJI.CONFETTI} Çekiliş Bitti!`));
  c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
  c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
    `${EMOJI.GIFT} **Ödül:** ${prize}\n` +
    `${EMOJI.CROWN} **Kazanan${winners.length > 1 ? "lar" : ""}:** ${winners.length ? winners.map((w) => `<@${w}>`).join(", ") : "Katılımcı yoktu."}`
  ));
  c.addSeparatorComponents(new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small));
  c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# ID: \`${id}\``));
  return c;
}

async function err(msg, text) {
  const c = new ContainerBuilder().setAccentColor(COLOR.ERROR);
  c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`${EMOJI.CROSS} ${text}`));
  await msg.reply({ flags: MessageFlags.IsComponentsV2, components: [c] });
}


