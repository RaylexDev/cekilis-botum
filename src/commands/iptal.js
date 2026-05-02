import { isManager } from "../utils/perms.js";
import { getGiveaway, deleteGiveaway } from "../db.js";
import { CV2 } from "../utils/giveaway.js";
import { ContainerBuilder, TextDisplayBuilder, MessageFlags } from "discord.js";
import { COLOR, EMOJI, PREFIX } from "../constants.js";

export const cmd = {
  name: "iptal",
  aliases: ["cancel", "sil", "gdelete"],
  desc: "Çekilişi iptal eder ve mesajı siler.",
  usage: `${PREFIX}iptal <id>`,
  managerOnly: true,

  async execute(msg, args, client) {
    if (!msg.guild || !msg.member) return;
    if (!isManager(msg.member)) return err(msg, "Yetkin yok.");

    const id = args[0];
    if (!id) return err(msg, `Kullanım: \`${PREFIX}iptal <çekiliş-id>\``);

    const g = getGiveaway(id);
    if (!g || g.guildId !== msg.guild.id) return err(msg, "Çekiliş bulunamadı.");

    try {
      const ch = await client.channels.fetch(g.channelId).catch(() => null);
      if (ch && g.messageId) {
        const gMsg = await ch.messages.fetch(g.messageId).catch(() => null);
        if (gMsg) await gMsg.delete().catch(() => {});
      }
    } catch {}

    deleteGiveaway(g.id);

    const c = new ContainerBuilder().setAccentColor(COLOR.SUCCESS);
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `${EMOJI.TRASH} Çekiliş iptal edildi. (**${g.prize}**)`
    ));
    await msg.reply({ flags: CV2, components: [c] });
  },
};

async function err(msg, text) {
  const c = new ContainerBuilder().setAccentColor(COLOR.ERROR);
  c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`${EMOJI.CROSS} ${text}`));
  await msg.reply({ flags: MessageFlags.IsComponentsV2, components: [c] });
}
