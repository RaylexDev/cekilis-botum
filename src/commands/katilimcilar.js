import { getGiveaway } from "../db.js";
import { CV2 } from "../utils/giveaway.js";
import { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags } from "discord.js";
import { COLOR, EMOJI, PREFIX, FOOTER } from "../constants.js";

export const cmd = {
  name: "katilimcilar",
  aliases: ["participants", "girenler", "gkatil"],
  desc: "Çekilişe katılan kişileri gösterir.",
  usage: `${PREFIX}katilimcilar <id>`,

  async execute(msg, args, client) {
    if (!msg.guild) return;

    const id = args[0];
    if (!id) return err(msg, `Kullanım: \`${PREFIX}katilimcilar <çekiliş-id>\``);

    const g = getGiveaway(id);
    if (!g || g.guildId !== msg.guild.id) return err(msg, "Çekiliş bulunamadı.");

    const c = new ContainerBuilder().setAccentColor(COLOR.INFO);
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `# ${EMOJI.TICKET} Katılımcılar — ${g.prize}`
    ));
    c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));

    if (!g.entries.length) {
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent("Henüz kimse katılmadı."));
    } else {
      const chunks = chunkArray(g.entries.map((u) => `<@${u}>`), 20);
      for (const chunk of chunks) {
        c.addTextDisplayComponents(new TextDisplayBuilder().setContent(chunk.join(" ")));
      }
    }

    c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `-# ${FOOTER} • Toplam: **${g.entries.length}** katılımcı`
    ));
    await msg.reply({ flags: CV2, components: [c] });
  },
};

function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function err(msg, text) {
  const c = new ContainerBuilder().setAccentColor(COLOR.ERROR);
  c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`${EMOJI.CROSS} ${text}`));
  await msg.reply({ flags: MessageFlags.IsComponentsV2, components: [c] });
}
