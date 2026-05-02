import { Events } from "discord.js";
import { getAllActiveGiveaways, updateGiveaway } from "../db.js";
import { pickWinners, updateGiveawayMessage, CV2 } from "../utils/giveaway.js";
import { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize } from "discord.js";
import { COLOR, EMOJI, FOOTER } from "../constants.js";

export function registerReadyHandler(client) {
  client.once(Events.ClientReady, async () => {
    console.log(`╔══════════════════════════════════════╗`);
    console.log(`║   ${FOOTER}`);
    console.log(`║   Bot: ${client.user.tag}`);
    console.log(`║   ID:  ${client.user.id}`);
    console.log(`╚══════════════════════════════════════╝`);
    startTimer(client);
  });
}

function startTimer(client) {
  setInterval(() => checkGiveaways(client), 10_000);
}

async function checkGiveaways(client) {
  const active = getAllActiveGiveaways();
  for (const g of active) {
    if (g.paused) continue;
    if (Date.now() < g.endsAt) continue;
    await endGiveaway(client, g);
  }
}

async function endGiveaway(client, g) {
  try {
    const guild = await client.guilds.fetch(g.guildId).catch(() => null);
    if (!guild) {
      updateGiveaway(g.id, { ended: 1 });
      return;
    }

    const members = await guild.members.fetch().catch(() => new Map());
    const winners = pickWinners(g.entries, g.bonusRoles, g.winnerCount, members);

    updateGiveaway(g.id, { ended: 1, winners });
    const ended = { ...g, ended: true, winners };

    await updateGiveawayMessage(client, ended);

    const ch = await client.channels.fetch(g.channelId).catch(() => null);
    if (ch) {
      const c = new ContainerBuilder().setAccentColor(COLOR.PRIMARY);
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
        `# ${EMOJI.CONFETTI} Çekiliş Sona Erdi!`
      ));
      c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
        `${EMOJI.GIFT} **Ödül:** ${g.prize}\n` +
        `${EMOJI.CROWN} **Kazanan${winners.length > 1 ? "lar" : ""}:** ${winners.length ? winners.map((w) => `<@${w}>`).join(", ") : "Katılımcı yoktu."}\n` +
        (winners.length ? `\nTebrikler! 🎊` : "")
      ));
      c.addSeparatorComponents(new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small));
      c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
        `-# ${FOOTER} • ID: \`${g.id}\``
      ));
      await ch.send({ flags: CV2, components: [c] });
    }

    console.log(`[giveaway] Ended: ${g.id} | Prize: ${g.prize} | Winners: ${winners.join(", ") || "none"}`);
  } catch (e) {
    console.error(`[endGiveaway:${g.id}]`, e.message);
  }
}
