import { parseTime } from "../utils/time.js";
import { postGiveaway, CV2 } from "../utils/giveaway.js";
import { createGiveaway, updateGiveaway } from "../db.js";
import { isManager } from "../utils/perms.js";
import { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, MessageFlags } from "discord.js";
import { COLOR, EMOJI, FOOTER, PREFIX } from "../constants.js";

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function sep() {
  return new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small);
}

export const cmd = {
  name: "baslat",
  aliases: ["start", "gcreate", "çekiliş"],
  desc: "Yeni bir çekiliş başlatır.",
  usage: `${PREFIX}baslat <süre> <kazanan> <ödül>`,
  managerOnly: true,

  async execute(msg, args, client) {
    if (!msg.guild || !msg.member) return;
    if (!isManager(msg.member)) {
      return err(msg, "Bu komutu kullanmak için yetkin yok.");
    }

    const timeStr = args[0];
    const winCount = parseInt(args[1]);
    const prize = args.slice(2).join(" ");

    if (!timeStr || isNaN(winCount) || winCount < 1 || !prize) {
      return err(msg, `Kullanım: \`${PREFIX}baslat <süre> <kazanan sayısı> <ödül>\`\nÖrnek: \`${PREFIX}baslat 1s 2 Nitro\``);
    }

    const duration = parseTime(timeStr);
    if (!duration || duration < 10000) {
      return err(msg, "Geçersiz süre. Örnekler: `30s`, `5dk`, `1s`, `2g`");
    }
    if (winCount > 20) {
      return err(msg, "En fazla 20 kazanan seçilebilir.");
    }

    const channel = msg.mentions.channels.first() ?? msg.channel;
    const endsAt = Date.now() + duration;

    const g = {
      id: makeId(),
      guildId: msg.guild.id,
      channelId: channel.id,
      messageId: null,
      hostId: msg.author.id,
      prize,
      winnerCount: winCount,
      endsAt,
      ended: false,
      paused: false,
      requiredRole: null,
      minMessages: 0,
      bonusRoles: [],
      entries: [],
      winners: [],
      createdAt: Date.now(),
    };

    createGiveaway(g);

    const gMsg = await postGiveaway(channel, g);
    updateGiveaway(g.id, { messageId: gMsg.id });

    if (channel.id !== msg.channel.id) {
      const c = new ContainerBuilder().setAccentColor(COLOR.SUCCESS);
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
        `${EMOJI.CHECK} Çekiliş başlatıldı! → [Mesaja git](${gMsg.url})\n-# ID: \`${g.id}\``
      ));
      await msg.reply({ flags: CV2, components: [c] });
    } else {
      await msg.delete().catch(() => {});
    }
  },
};

async function err(msg, text) {
  const c = new ContainerBuilder().setAccentColor(COLOR.ERROR);
  c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`${EMOJI.CROSS} ${text}`));
  await msg.reply({ flags: MessageFlags.IsComponentsV2, components: [c] });
}
