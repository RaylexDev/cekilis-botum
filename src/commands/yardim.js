import { CV2 } from "../utils/giveaway.js";
import { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize } from "discord.js";
import { COLOR, EMOJI, PREFIX, FOOTER } from "../constants.js";

export const cmd = {
  name: "yardim",
  aliases: ["help", "komutlar", "h"],
  desc: "Tüm komutları listeler.",
  usage: `${PREFIX}yardim`,

  async execute(msg, args, client) {
    const c = new ContainerBuilder().setAccentColor(COLOR.PRIMARY);
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `# ${EMOJI.GIFT} Çekiliş Botu — Komutlar`
    ));
    c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));

    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `## ${EMOJI.CONFETTI} Temel Çekiliş\n` +
      `\`${PREFIX}baslat <süre> <kazanan> <ödül>\` — Yeni çekiliş başlat\n` +
      `\`${PREFIX}bitir <id>\` — Çekilişi erken bitir\n` +
      `\`${PREFIX}iptal <id>\` — Çekilişi iptal et & sil\n` +
      `\`${PREFIX}rerol <id> [sayı]\` — Kazananı yeniden seç`
    ));
    c.addSeparatorComponents(new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small));

    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `## ⚙️ Yönetim\n` +
      `\`${PREFIX}duraklat <id>\` — Duraklat / Devam ettir\n` +
      `\`${PREFIX}sure <id> <±süre>\` — Süreyi uzat veya kısalt\n` +
      `\`${PREFIX}bonus <id> @rol <çarpan>\` — Bonus rol çarpanı ekle\n` +
      `\`${PREFIX}gereklirol <id> @rol\` — Gerekli rol belirle\n` +
      `\`${PREFIX}minmesaj <id> <sayı>\` — Min mesaj şartı koy`
    ));
    c.addSeparatorComponents(new SeparatorBuilder().setDivider(false).setSpacing(SeparatorSpacingSize.Small));

    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `## ${EMOJI.LIST} Bilgi\n` +
      `\`${PREFIX}liste\` — Aktif çekilişleri göster\n` +
      `\`${PREFIX}bilgi <id>\` — Çekiliş detayları\n` +
      `\`${PREFIX}katilimcilar <id>\` — Katılımcı listesi\n` +
      `\`${PREFIX}ayar\` — Bot ayarları`
    ));
    c.addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small));
    c.addTextDisplayComponents(new TextDisplayBuilder().setContent(
      `-# ${FOOTER} • Prefix: \`${PREFIX}\` • Süre örnekleri: \`30s\` \`5dk\` \`2s\` \`1g\``
    ));

    await msg.reply({ flags: CV2, components: [c] });
  },
};
