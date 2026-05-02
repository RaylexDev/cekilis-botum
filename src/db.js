import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";

const DIR = "./data";
const PATH = `${DIR}/cekilis.json`;

mkdirSync(DIR, { recursive: true });

const SCHEMA = {
  giveaways: {},
  userMessages: {},
  settings: {},
};

function load() {
  if (!existsSync(PATH)) return structuredClone(SCHEMA);
  try {
    return JSON.parse(readFileSync(PATH, "utf8"));
  } catch {
    return structuredClone(SCHEMA);
  }
}

function save(data) {
  writeFileSync(PATH, JSON.stringify(data, null, 2), "utf8");
}

function read() {
  return load();
}

function write(fn) {
  const data = load();
  fn(data);
  save(data);
}

// ---------- Giveaways ----------

export function getGiveaway(id) {
  return read().giveaways[id] ?? null;
}

export function getGiveawayByMessage(messageId) {
  const data = read();
  return Object.values(data.giveaways).find((g) => g.messageId === messageId) ?? null;
}

export function getActiveGiveaways(guildId) {
  const data = read();
  return Object.values(data.giveaways).filter(
    (g) => g.guildId === guildId && !g.ended
  );
}

export function getAllActiveGiveaways() {
  const data = read();
  return Object.values(data.giveaways).filter((g) => !g.ended);
}

export function getGiveawaysByGuild(guildId, limit = 10) {
  const data = read();
  return Object.values(data.giveaways)
    .filter((g) => g.guildId === guildId)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);
}

export function createGiveaway(g) {
  write((data) => {
    data.giveaways[g.id] = g;
  });
}

export function updateGiveaway(id, patch) {
  write((data) => {
    if (!data.giveaways[id]) return;
    Object.assign(data.giveaways[id], patch);
  });
}

export function deleteGiveaway(id) {
  write((data) => {
    delete data.giveaways[id];
  });
}

// ---------- User Messages ----------

export function getUserMessages(guildId, userId) {
  return read().userMessages[`${guildId}:${userId}`] ?? 0;
}

export function incrementUserMessages(guildId, userId) {
  write((data) => {
    const key = `${guildId}:${userId}`;
    data.userMessages[key] = (data.userMessages[key] ?? 0) + 1;
  });
}

// ---------- Settings ----------

export function getSettings(guildId) {
  return read().settings[guildId] ?? { guildId, managerRoles: [], logChannel: null };
}

export function saveSettings(guildId, patch) {
  write((data) => {
    const cur = data.settings[guildId] ?? { guildId, managerRoles: [], logChannel: null };
    data.settings[guildId] = { ...cur, ...patch };
  });
}
