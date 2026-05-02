import { PermissionFlagsBits } from "discord.js";
import { getSettings } from "../db.js";

export function isManager(member) {
  if (!member?.guild) return false;
  if (member.permissions.has(PermissionFlagsBits.ManageGuild)) return true;
  if (member.permissions.has(PermissionFlagsBits.Administrator)) return true;
  const s = getSettings(member.guild.id);
  return s.managerRoles.some((r) => member.roles.cache.has(r));
}
