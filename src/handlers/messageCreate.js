import { Events } from "discord.js";
import { PREFIX } from "../constants.js";
import { incrementUserMessages } from "../db.js";

import { cmd as baslat } from "../commands/baslat.js";
import { cmd as bitir } from "../commands/bitir.js";
import { cmd as rerol } from "../commands/rerol.js";
import { cmd as iptal } from "../commands/iptal.js";
import { cmd as duraklat } from "../commands/duraklat.js";
import { cmd as sure } from "../commands/sure.js";
import { cmd as bonus } from "../commands/bonus.js";
import { cmd as gereklirol } from "../commands/gereklirol.js";
import { cmd as minmesaj } from "../commands/minmesaj.js";
import { cmd as liste } from "../commands/liste.js";
import { cmd as bilgi } from "../commands/bilgi.js";
import { cmd as katilimcilar } from "../commands/katilimcilar.js";
import { cmd as ayar } from "../commands/ayar.js";
import { cmd as yardim } from "../commands/yardim.js";

const ALL = [
  baslat, bitir, rerol, iptal, duraklat,
  sure, bonus, gereklirol, minmesaj,
  liste, bilgi, katilimcilar, ayar, yardim,
];

const commands = new Map();
for (const cmd of ALL) {
  commands.set(cmd.name, cmd);
  for (const alias of cmd.aliases ?? []) {
    commands.set(alias, cmd);
  }
}

export function registerMessageHandler(client) {
  client.on(Events.MessageCreate, async (msg) => {
    if (msg.author.bot || !msg.guild) return;

    incrementUserMessages(msg.guild.id, msg.author.id);

    if (!msg.content.startsWith(PREFIX)) return;

    const args = msg.content.slice(PREFIX.length).trim().split(/\s+/);
    const name = args.shift().toLowerCase();

    const cmd = commands.get(name);
    if (!cmd) return;

    try {
      await cmd.execute(msg, args, client);
    } catch (e) {
      console.error(`[cmd:${name}]`, e);
    }
  });
}
