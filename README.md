# 🎉 Çekiliş Botu

Discord için gelişmiş çekiliş botu. ComponentsV2, canvas banner, SQLite veritabanı ve tam özellikli çekiliş yönetimi.

**Yapımcı:** RaylexDev

---

## 📦 Kurulum

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. .env dosyasını oluştur
cp .env.example .env

# 3. .env içine token yaz
TOKEN=YOUR_BOT_TOKEN_HERE
PREFIX=!

# 4. Botu başlat
npm start
```

### Termux Kurulumu

```bash
pkg update && pkg upgrade
pkg install nodejs python git
npm install
npm start
```

> ⚠️ `@napi-rs/canvas` kurulumu için `pkg install python` gerekebilir.

---

## 🤖 Discord Bot Ayarları

Bot panelinde şu **Privileged Gateway Intents** aktif olmalı:

- ✅ **Server Members Intent**
- ✅ **Message Content Intent**

---

## 📋 Komutlar

### 🎉 Temel Çekiliş

| Komut | Açıklama |
|---|---|
| `!baslat <süre> <kazanan> <ödül>` | Yeni çekiliş başlat |
| `!bitir <id>` | Çekilişi erken bitir |
| `!rerol <id> [sayı]` | Kazananı yeniden seç |
| `!iptal <id>` | Çekilişi iptal et & sil |

**Süre örnekleri:** `30s` · `5dk` · `2s` · `1g`

### ⚙️ Yönetim

| Komut | Açıklama |
|---|---|
| `!duraklat <id>` | Çekilişi duraklat / devam ettir |
| `!sure <id> <±süre>` | Süreyi uzat veya kısalt |
| `!bonus <id> @rol <çarpan>` | Bonus rol çarpanı ekle (max 10x) |
| `!gereklirol <id> @rol` | Katılım için gerekli rol belirle |
| `!minmesaj <id> <sayı>` | Min. mesaj sayısı şartı |

### 📋 Bilgi

| Komut | Açıklama |
|---|---|
| `!liste` | Aktif çekilişleri göster |
| `!bilgi <id>` | Çekiliş detayları |
| `!katilimcilar <id>` | Katılımcı listesi |
| `!yardim` | Tüm komutlar |

### 🛠️ Ayarlar

| Komut | Açıklama |
|---|---|
| `!ayar` | Mevcut ayarları göster |
| `!ayar yoneticirol @rol` | Yönetici rolü ekle/kaldır |
| `!ayar logkanal #kanal` | Log kanalı belirle |

---

## ✨ Özellikler

- **Canvas Banner** — Her çekilişe özel görsel otomatik oluşur
- **ComponentsV2** — Modern Discord arayüzü
- **Bonus Roller** — Belirli rollere çarpan (1x–10x) verilebilir
- **Gerekli Rol** — Sadece belirli role sahip kişiler katılabilir
- **Min. Mesaj Şartı** — Sunucuda aktif olmayanları filtreler
- **Ağırlıklı Çekiliş** — Bonus roller havuza eklenerek ağırlıklandırılır
- **Katıl / Ayrıl Butonları** — Tek tıkla katılım
- **Otomatik Bitiş** — Bot çalıştığı sürece çekilişler zamanında biter
- **SQLite Veritabanı** — Kalıcı veri, restart'a dayanıklı

---

## 🗂️ Yapı

```
src/
├── index.js
├── db.js
├── constants.js
├── canvas/
│   └── banner.js
├── commands/
│   ├── baslat.js
│   ├── bitir.js
│   ├── rerol.js
│   ├── iptal.js
│   ├── duraklat.js
│   ├── sure.js
│   ├── bonus.js
│   ├── gereklirol.js
│   ├── minmesaj.js
│   ├── liste.js
│   ├── bilgi.js
│   ├── katilimcilar.js
│   ├── ayar.js
│   └── yardim.js
├── handlers/
│   ├── messageCreate.js
│   ├── interactionCreate.js
│   └── ready.js
└── utils/
    ├── giveaway.js
    ├── perms.js
    └── time.js
```

---

**RaylexDev**
