import { isManager } from "../utils/perms.js";
import { getGiveaway, updateGiveaway } from "../db.js";
import { updateGiveawayMessage, CV2 } from "../utils/giveaway.js";
import { parseTime, formatTime } from "../utils/time.js";
import { ContainerBuilder, TextDisplayBuilder, MessageFlags } from "discord.js";
import { COLOR, EMOJI, PREFIX } from "../constants.js";

export const cmd = {
  name: "sure",
  aliases: ["extend", "uzat", "gsure"],
  desc: "Çekiliş süresini uzatır veya kısaltır.",
  usage: `${PREFIX}sure <id> <+/-süre>`,
  managerOnly: true,

  async execute(msg, args, client) {
    if (!msg.guild || !msg.member) return;
    if (!isManager(msg.member)) return err(msg, "Yetkin yok.");

    const id = args[0];
    const timeArg = args[1];
    if (!id || !timeArg) return err(msg, `Kullanım: \`${PREFIX}sure <id> <+10dk>\` veya \`${PREFIX}sure <id> <-5dk>\``);

    const g = getGiveaway(id);
    if (!g || g.guildId !== msg.guild.id) return err(msg, "Çekiliş bulunamadı.");
    if (g.ended) return err(msg, "Bu çekiliş sona erdi.");

    const negative = timeArg.startsWith("-");
    const clean = timeArg.replace(/^[+-]/, "");
    const delta = parseTime(clean);
    if (!delta) return err(msg, "Geçersiz süre formatı.");

    const newEnd = g.endsAt + (negative ? -delta : delta);
    if (newEnd <= Date.now()) return err(msg, "Yeni bitiş zamanı geçmişte olamaz.");

    updateGiveaway(g.id, { endsAt: newEnd });
    await updateGiveawayMessage(client, { ...g, endsAt: newEnd });

    const c = new ContainerBuilder().setAccentColor(COLOR.SUCCESS);
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `${EMOJI.CLOCK} Çekiliş süresi ${negative ? "kısaltıldı" : "uzatıldı"}: **${formatTime(Math.abs(delta))}**\n` +
      `Yeni bitiş: <t:${Math.floor(newEnd / 1000)}:F>`
    ));
    await msg.reply({ flags: CV2, components: [c] });
  },
};

async function err(msg, text) {
  const c = new ContainerBuilder().setAccentColor(COLOR.ERROR);
  c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`${EMOJI.CROSS} ${text}`));
  await msg.reply({ flags: MessageFlags.IsComponentsV2, components: [c] });
}
