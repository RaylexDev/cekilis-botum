import { isManager } from "../utils/perms.js";
import { getGiveaway, updateGiveaway } from "../db.js";
import { updateGiveawayMessage, CV2 } from "../utils/giveaway.js";
import { ContainerBuilder, TextDisplayBuilder, MessageFlags } from "discord.js";
import { COLOR, EMOJI, PREFIX } from "../constants.js";

export const cmd = {
  name: "duraklat",
  aliases: ["pause", "gpause"],
  desc: "Çekilişi duraklatır veya devam ettirir.",
  usage: `${PREFIX}duraklat <id>`,
  managerOnly: true,

  async execute(msg, args, client) {
    if (!msg.guild || !msg.member) return;
    if (!isManager(msg.member)) return err(msg, "Yetkin yok.");

    const id = args[0];
    if (!id) return err(msg, `Kullanım: \`${PREFIX}duraklat <çekiliş-id>\``);

    const g = getGiveaway(id);
    if (!g || g.guildId !== msg.guild.id) return err(msg, "Çekiliş bulunamadı.");
    if (g.ended) return err(msg, "Bu çekiliş zaten sona erdi.");

    const nowPaused = !g.paused;
    updateGiveaway(g.id, { paused: nowPaused ? 1 : 0 });
    await updateGiveawayMessage(client, { ...g, paused: nowPaused });

    const c = new ContainerBuilder().setAccentColor(nowPaused ? COLOR.WARN : COLOR.SUCCESS);
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      nowPaused
        ? `${EMOJI.PAUSE} Çekiliş duraklatıldı. (**${g.prize}**)`
        : `${EMOJI.PLAY} Çekiliş devam ediyor. (**${g.prize}**)`
    ));
    await msg.reply({ flags: CV2, components: [c] });
  },
};

async function err(msg, text) {
  const c = new ContainerBuilder().setAccentColor(COLOR.ERROR);
  c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`${EMOJI.CROSS} ${text}`));
  await msg.reply({ flags: MessageFlags.IsComponentsV2, components: [c] });
}
