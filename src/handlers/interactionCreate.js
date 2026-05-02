import { Events, MessageFlags } from "discord.js";
import { ContainerBuilder, TextDisplayBuilder } from "discord.js";
import { getGiveaway, updateGiveaway, getUserMessages } from "../db.js";
import { COLOR, EMOJI } from "../constants.js";
import { CV2 } from "../utils/giveaway.js";

export function registerInteractionHandler(client) {
  client.on(Events.InteractionCreate, async (i) => {
    if (!i.isButton()) return;
    try {
      const id = i.customId;
      if (id.startsWith("giveaway:join:")) await handleJoin(i, id.split(":")[2]);
      else if (id.startsWith("giveaway:leave:")) await handleLeave(i, id.split(":")[2]);
    } catch (e) {
      console.error("[interaction]", e);
      await i.reply({ content: "Bir hata oluştu.", ephemeral: true }).catch(() => {});
    }
  });
}

async function handleJoin(i, giveawayId) {
  if (!i.guild) return;
  const g = getGiveaway(giveawayId);
  if (!g || g.ended || g.paused) {
    return i.reply({ content: "Bu çekiliş aktif değil.", ephemeral: true });
  }

  if (g.requiredRole) {
    const member = await i.guild.members.fetch(i.user.id).catch(() => null);
    if (!member?.roles.cache.has(g.requiredRole)) {
      return i.reply({
        flags: CV2 | MessageFlags.Ephemeral,
        components: [errComp(`Bu çekilişe katılmak için <@&${g.requiredRole}> rolüne sahip olmalısın.`)],
      });
    }
  }

  if (g.minMessages > 0) {
    const count = getUserMessages(i.guild.id, i.user.id);
    if (count < g.minMessages) {
      return i.reply({
        flags: CV2 | MessageFlags.Ephemeral,
        components: [errComp(`Bu çekilişe katılmak için en az **${g.minMessages}** mesaj göndermiş olmalısın. (Şu an: ${count})`)],
      });
    }
  }

  if (g.entries.includes(i.user.id)) {
    return i.reply({
      flags: CV2 | MessageFlags.Ephemeral,
      components: [errComp("Zaten bu çekilişe katıldın.")],
    });
  }

  const newEntries = [...g.entries, i.user.id];
  updateGiveaway(g.id, { entries: newEntries });

  await i.reply({
    flags: CV2 | MessageFlags.Ephemeral,
    components: [succComp(`${EMOJI.CONFETTI} **${g.prize}** çekilişine katıldın! Toplam: ${newEntries.length} katılımcı.`)],
  });
}

async function handleLeave(i, giveawayId) {
  const g = getGiveaway(giveawayId);
  if (!g || g.ended) {
    return i.reply({ content: "Bu çekiliş aktif değil.", ephemeral: true });
  }

  if (!g.entries.includes(i.user.id)) {
    return i.reply({
      flags: CV2 | MessageFlags.Ephemeral,
      components: [errComp("Bu çekilişe zaten katılmamışsın.")],
    });
  }

  const newEntries = g.entries.filter((u) => u !== i.user.id);
  updateGiveaway(g.id, { entries: newEntries });

  await i.reply({
    flags: CV2 | MessageFlags.Ephemeral,
    components: [succComp(`🚪 **${g.prize}** çekilişinden ayrıldın.`)],
  });
}

function errComp(text) {
  const c = new ContainerBuilder().setAccentColor(COLOR.ERROR);
  c.addTextDisplayComponents(new TextDisplayBuilder().setContent(`${EMOJI.CROSS} ${text}`));
  return c;
}

function succComp(text) {
  const c = new ContainerBuilder().setAccentColor(COLOR.SUCCESS);
  c.addTextDisplayComponents(new TextDisplayBuilder().setContent(text));
  return c;
}
