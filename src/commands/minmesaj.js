import { isManager } from "../utils/perms.js";
import { getGiveaway, updateGiveaway } from "../db.js";
import { CV2 } from "../utils/giveaway.js";
import { ContainerBuilder, TextDisplayBuilder, MessageFlags } from "discord.js";
import { COLOR, EMOJI, PREFIX } from "../constants.js";

export const cmd = {
  name: "minmesaj",
  aliases: ["minmsg", "mesajsarti"],
  desc: "Çekilişe katılmak için minimum mesaj sayısı belirler.",
  usage: `${PREFIX}minmesaj <id> <sayı>`,
  managerOnly: true,

  async execute(msg, args, client) {
    if (!msg.guild || !msg.member) return;
    if (!isManager(msg.member)) return err(msg, "Yetkin yok.");

    const id = args[0];
    const count = parseInt(args[1]);

    if (!id || isNaN(count) || count < 0) {
      return err(msg, `Kullanım: \`${PREFIX}minmesaj <id> <sayı>\`\nÖrnek: \`${PREFIX}minmesaj abc123 50\``);
    }

    const g = getGiveaway(id);
    if (!g || g.guildId !== msg.guild.id) return err(msg, "Çekiliş bulunamadı.");
    if (g.ended) return err(msg, "Bu çekiliş sona erdi.");

    updateGiveaway(g.id, { minMessages: count });

    const c = new ContainerBuilder().setAccentColor(COLOR.SUCCESS);
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `💬 Minimum mesaj sayısı: **${count}** (**${g.prize}**)`
    ));
    await msg.reply({ flags: CV2, components: [c] });
  },
};

async function err(msg, text) {
  const c = new ContainerBuilder().setAccentColor(COLOR.ERROR);
  c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`${EMOJI.CROSS} ${text}`));
  await msg.reply({ flags: MessageFlags.IsComponentsV2, components: [c] });
}
