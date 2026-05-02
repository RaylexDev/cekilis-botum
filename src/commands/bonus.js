import { isManager } from "../utils/perms.js";
import { getGiveaway, updateGiveaway } from "../db.js";
import { CV2 } from "../utils/giveaway.js";
import { ContainerBuilder, TextDisplayBuilder, MessageFlags } from "discord.js";
import { COLOR, EMOJI, PREFIX } from "../constants.js";

export const cmd = {
  name: "bonus",
  aliases: ["bonusrol", "gbonus"],
  desc: "Çekilişe bonus rol çarpanı ekler.",
  usage: `${PREFIX}bonus <id> @rol <çarpan>`,
  managerOnly: true,

  async execute(msg, args, client) {
    if (!msg.guild || !msg.member) return;
    if (!isManager(msg.member)) return err(msg, "Yetkin yok.");

    const id = args[0];
    const role = msg.mentions.roles.first();
    const bonus = parseInt(args[2] ?? args[1]);

    if (!id || !role || isNaN(bonus) || bonus < 1) {
      return err(msg, `Kullanım: \`${PREFIX}bonus <id> @rol <çarpan>\`\nÖrnek: \`${PREFIX}bonus abc123 @Nitro 3\``);
    }
    if (bonus > 10) return err(msg, "Maksimum çarpan 10'dur.");

    const g = getGiveaway(id);
    if (!g || g.guildId !== msg.guild.id) return err(msg, "Çekiliş bulunamadı.");
    if (g.ended) return err(msg, "Bu çekiliş sona erdi.");

    const existing = g.bonusRoles.findIndex((b) => b.roleId === role.id);
    let newBonusRoles;
    if (existing >= 0) {
      newBonusRoles = g.bonusRoles.map((b, i) => i === existing ? { roleId: role.id, bonus } : b);
    } else {
      newBonusRoles = [...g.bonusRoles, { roleId: role.id, bonus }];
    }

    updateGiveaway(g.id, { bonusRoles: newBonusRoles });

    const c = new ContainerBuilder().setAccentColor(COLOR.SUCCESS);
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `${EMOJI.BOLT} ${role} rolüne **+${bonus}x** bonus eklendi. (**${g.prize}**)`
    ));
    await msg.reply({ flags: CV2, components: [c] });
  },
};

async function err(msg, text) {
  const c = new ContainerBuilder().setAccentColor(COLOR.ERROR);
  c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`${EMOJI.CROSS} ${text}`));
  await msg.reply({ flags: MessageFlags.IsComponentsV2, components: [c] });
}
