import { isManager } from "../utils/perms.js";
import { getGiveaway, updateGiveaway } from "../db.js";
import { CV2 } from "../utils/giveaway.js";
import { ContainerBuilder, TextDisplayBuilder, MessageFlags } from "discord.js";
import { COLOR, EMOJI, PREFIX } from "../constants.js";

export const cmd = {
  name: "gereklirol",
  aliases: ["reqrole", "zorunlurol"],
  desc: "Çekilişe katılım için gerekli rol belirler.",
  usage: `${PREFIX}gereklirol <id> @rol`,
  managerOnly: true,

  async execute(msg, args, client) {
    if (!msg.guild || !msg.member) return;
    if (!isManager(msg.member)) return err(msg, "Yetkin yok.");

    const id = args[0];
    const role = msg.mentions.roles.first();

    if (!id) return err(msg, `Kullanım: \`${PREFIX}gereklirol <id> @rol\` (rol yoksa kaldırır)`);

    const g = getGiveaway(id);
    if (!g || g.guildId !== msg.guild.id) return err(msg, "Çekiliş bulunamadı.");
    if (g.ended) return err(msg, "Bu çekiliş sona erdi.");

    updateGiveaway(g.id, { requiredRole: role ? role.id : null });

    const c = new ContainerBuilder().setAccentColor(COLOR.SUCCESS);
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      role
        ? `🎭 Gerekli rol ayarlandı: ${role} (**${g.prize}**)`
        : `🎭 Gerekli rol kaldırıldı. (**${g.prize}**)`
    ));
    await msg.reply({ flags: CV2, components: [c] });
  },
};

async function err(msg, text) {
  const c = new ContainerBuilder().setAccentColor(COLOR.ERROR);
  c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`${EMOJI.CROSS} ${text}`));
  await msg.reply({ flags: MessageFlags.IsComponentsV2, components: [c] });
}
