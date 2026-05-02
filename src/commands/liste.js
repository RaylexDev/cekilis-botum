import { isManager } from "../utils/perms.js";
import { getActiveGiveaways } from "../db.js";
import { CV2 } from "../utils/giveaway.js";
import { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags } from "discord.js";
import { COLOR, EMOJI, PREFIX, FOOTER } from "../constants.js";
import { formatRelative } from "../utils/time.js";

export const cmd = {
  name: "liste",
  aliases: ["list", "glist", "aktif"],
  desc: "Aktif çekilişleri listeler.",
  usage: `${PREFIX}liste`,
  managerOnly: false,

  async execute(msg, args, client) {
    if (!msg.guild) return;

    const giveaways = getActiveGiveaways(msg.guild.id);

    const c = new ContainerBuilder().setAccentColor(COLOR.INFO);
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`# ${EMOJI.LIST} Aktif Çekilişler`));
    c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));

    if (!giveaways.length) {
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
        `Şu an aktif çekiliş yok.\n-# \`${PREFIX}baslat\` ile yeni çekiliş başlat.`
      ));
    } else {
      for (const g of giveaways) {
        const ch = `<#${g.channelId}>`;
        const link = g.messageId ? `[Git](https://discord.com/channels/${g.guildId}/${g.channelId}/${g.messageId})` : "";
        const status = g.paused ? `${EMOJI.PAUSE} Duraklatıldı` : `${EMOJI.CLOCK} ${formatRelative(g.endsAt)}`;
        c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
          `${EMOJI.GIFT} **${g.prize}** ${link}\n` +
          `${EMOJI.TICKET} ${g.entries.length} katılımcı • ${EMOJI.CROWN} ${g.winnerCount} kazanan • ${status} • ${ch}\n` +
          `-# ID: \`${g.id}\``
        ));
        c.addSeparatorComponents(new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small));
      }
    }

    c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# ${FOOTER} • Toplam: ${giveaways.length}`));
    await msg.reply({ flags: CV2, components: [c] });
  },
};
