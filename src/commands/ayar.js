import { isManager } from "../utils/perms.js";
import { getSettings, saveSettings } from "../db.js";
import { CV2 } from "../utils/giveaway.js";
import { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags } from "discord.js";
import { COLOR, EMOJI, PREFIX, FOOTER } from "../constants.js";

export const cmd = {
  name: "ayar",
  aliases: ["settings", "config", "gconfig"],
  desc: "Bot ayarlarını görüntüler veya değiştirir.",
  usage: `${PREFIX}ayar`,
  managerOnly: true,

  async execute(msg, args, client) {
    if (!msg.guild || !msg.member) return;
    if (!isManager(msg.member)) return err(msg, "Yetkin yok.");

    const s = getSettings(msg.guild.id);
    const sub = args[0]?.toLowerCase();

    if (sub === "yoneticirol") {
      const role = msg.mentions.roles.first();
      if (!role) return err(msg, `Kullanım: \`${PREFIX}ayar yoneticirol @rol\``);
      const roles = s.managerRoles.includes(role.id)
        ? s.managerRoles.filter((r) => r !== role.id)
        : [...s.managerRoles, role.id];
      saveSettings(msg.guild.id, { managerRoles: roles });
      const c = new ContainerBuilder().setAccentColor(COLOR.SUCCESS);
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
        s.managerRoles.includes(role.id)
          ? `${EMOJI.CROSS} Yönetici rolü kaldırıldı: ${role}`
          : `${EMOJI.CHECK} Yönetici rolü eklendi: ${role}`
      ));
      return msg.reply({ flags: CV2, components: [c] });
    }

    if (sub === "logkanal") {
      const ch = msg.mentions.channels.first();
      saveSettings(msg.guild.id, { logChannel: ch ? ch.id : null });
      const c = new ContainerBuilder().setAccentColor(COLOR.SUCCESS);
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
        ch ? `${EMOJI.CHECK} Log kanalı: ${ch}` : `${EMOJI.CHECK} Log kanalı kaldırıldı.`
      ));
      return msg.reply({ flags: CV2, components: [c] });
    }

    const c = new ContainerBuilder().setAccentColor(COLOR.INFO);
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`# ⚙️ Bot Ayarları`));
    c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `🎭 **Yönetici Rolleri:** ${s.managerRoles.length ? s.managerRoles.map((r) => `<@&${r}>`).join(", ") : "Yok"}\n` +
      `📋 **Log Kanalı:** ${s.logChannel ? `<#${s.logChannel}>` : "Yok"}\n\n` +
      `-# \`${PREFIX}ayar yoneticirol @rol\` • \`${PREFIX}ayar logkanal #kanal\``
    ));
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
