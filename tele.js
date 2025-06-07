const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const fs = require('fs');
// === Konfigurasi Awal ===
const token = '7000250448:AAHOB_YmKKhL9VdsOYPNrW_OqOvO2Z8MPJc'; // Sebaiknya pakai .env
const bot = new TelegramBot(token, { polling: true });
const ADMIN_CHAT_ID = 6720891467;
const usersFile = 'users.json';
const groupsFile = 'groups.json';
const autopromoFile = 'autopromo.json';
const Email = require('./models/email');

let isAutoPromoOn = false;

// === Cek dan Muat config.json ===
let config = {};
try {
  config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));
} catch (err) {
  console.error('❌ Gagal membaca config.json:', err.message);
  process.exit(1);
}

const mongoURI = config.mongoKey;


// === Log Berhasil Start Bot ===
bot.getMe()
  .then((botInfo) => {
    console.log(`✅ Bot berhasil dijalankan sebagai @${botInfo.username}`);
  })
  .catch((err) => {
    console.error('❌ Gagal menginisialisasi bot:', err.message);
  });

// === Deteksi Error Saat Polling (umumnya karena token salah atau koneksi terputus) ===
bot.on('polling_error', (err) => {
  console.error('📡 Polling error:', err.message);
});

// === Log Error Umum (Opsional, debugging) ===
bot.on('webhook_error', (err) => {
  console.error('🌐 Webhook error:', err.message);
});


// === Koneksi MongoDB dan Setup ===
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Terhubung ke MongoDB');
}).catch((err) => {
  console.error('❌ Gagal konek MongoDB:', err.message);
});

// === Load File JSON User/Group/AutoPromo ===
let users = fs.existsSync(usersFile) ? JSON.parse(fs.readFileSync(usersFile)) : [];
let groups = fs.existsSync(groupsFile) ? JSON.parse(fs.readFileSync(groupsFile)) : [];

if (fs.existsSync(autopromoFile)) {
  const data = JSON.parse(fs.readFileSync(autopromoFile));
  isAutoPromoOn = data.status === true;
}

function saveUser(chatId) {
  if (!users.includes(chatId)) {
    users.push(chatId);
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  }
}

function saveGroup(chatId) {
  if (!groups.includes(chatId)) {
    groups.push(chatId);
    fs.writeFileSync(groupsFile, JSON.stringify(groups, null, 2));
  }
}

function removeGroup(chatId) {
  groups = groups.filter(id => id !== chatId);
  fs.writeFileSync(groupsFile, JSON.stringify(groups, null, 2));
}

function saveAutoPromoState(status) {
  isAutoPromoOn = status;
  fs.writeFileSync(autopromoFile, JSON.stringify({ status }, null, 2));
}


 async function cariStat() {
  const emails = await Email.find();

  const gmailFreshStok = emails.filter(e => e.soldStatus === 'not sold' && e.activeStatus === 'active' && e.ytbTrial === 'off').length;
  const gmailBekas = emails.filter(e => e.status === 'bekas' && e.soldStatus === 'not sold').length;
  const ytbOnNotSold = emails.filter(e => e.ytbTrial === 'on' && e.soldStatus === 'not sold').length;

  return { gmailFreshStok, gmailBekas, ytbOnNotSold };
}

async function rms() {
  const { gmailFreshStok, gmailBekas, ytbOnNotSold } = await cariStat();

  const teks = `
**_READY GMAIL!!!_**
*FRESH* Rp.1300  
➡️ Stok: *${gmailFreshStok}*
*BEKAS* Rp.500  
➡️ Stok: *${gmailBekas}*
*Trial YouTube* Rp.1600  
➡️ Stok: *${ytbOnNotSold}*

👌 Garansi 48 jam  
Order: [@Eki_strZ](https://t.me/Eki_strZ)
  `;

  return teks;
}


// === Auto Promo Tiap 1 Jam ===
setInterval(async () => {
  if (!isAutoPromoOn) return;

  let success = 0;
  let failed = 0;

  for (const groupId of [...groups]) {
    try {
      const pesan = await rms();
      await bot.sendMessage(chatId, pesan, {
        parse_mode: 'Markdown'
      });
      success++;
    } catch (err) {
      console.error(`Gagal kirim ke grup ${groupId}: ${err.message}`);
      failed++;
      removeGroup(groupId);
    }
  }

  console.log(`🔁 Auto-Promo: ${success} sukses, ${failed} gagal`);
}, 3600000); // 1 jam


// === Handler Pesan Masuk ===
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const chatType = msg.chat.type;
  const text = msg.text?.trim() || '';

  console.log(`[DEBUG] Pesan dari ${chatType} (${chatId}): "${text}"`);

  // Simpan pengguna / grup
  if (chatType === 'private') {
    saveUser(chatId);
  } else if (chatType === 'group' || chatType === 'supergroup') {
    saveGroup(chatId);
  }

  // === Handler /start ===
  if (text === '/start') {
    const firstNameRaw = msg.from?.first_name || 'User';

    // Escape karakter Markdown agar tidak error
    const safeName = firstNameRaw.replace(/([*_`[\]()])/g, '');

    const welcomeMessage = `
Halo *${safeName}* 👋

Selamat datang di bot *GUDANG GMAIL* 📨

Gunakan tombol di bawah:
📝CEK STOK → untuk melihat stok Gmail yang tersedia

Butuh bantuan? Hubungi admin: [@Eki_strZ](https://t.me/Eki_strZ)
    `;

    return bot.sendMessage(chatId, welcomeMessage, {
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: [['📝CEK STOK']],
        resize_keyboard: true,
        one_time_keyboard: false
      }
    });
  }

  // === Handler CEK STOK ===
  if (text === '📝CEK STOK') {
    try {
      const pesan = await rms();
      return bot.sendMessage(chatId, pesan, {
        parse_mode: 'Markdown'
      });
    } catch (err) {
      console.error('❌ Gagal ambil data stok:', err.message);
      return bot.sendMessage(chatId, '⚠️ Gagal mengambil data stok. Silakan coba lagi nanti.');
    }
  }
});

// === Perintah: Kirim Promo ke Semua User ===
bot.onText(/\/sendpromot/, async (msg) => {
  const senderId = msg.chat.id;
  if (senderId !== ADMIN_CHAT_ID) return bot.sendMessage(senderId, '❌ Kamu tidak punya akses.');
  for (const userId of users) {
    try {
      const pesan = await rms();
      return bot.sendMessage(chatId, pesan, {
        parse_mode: 'Markdown'
      });
    } catch (err) {
      console.error(`Gagal kirim ke ${userId}:`, err.message);
    }
  }

  bot.sendMessage(senderId, `✅ Promo terkirim ke ${users.length} pengguna.`);
});

// === Perintah Broadcast Custom ===
bot.onText(/\/broadcast (.+)/, (msg, match) => {
  const senderId = msg.chat.id;
  if (senderId !== ADMIN_CHAT_ID) return bot.sendMessage(senderId, '❌ Kamu tidak punya akses.');

  const broadcastMessage = match[1];

  users.forEach((userId) => {
    bot.sendMessage(userId, broadcastMessage).catch((err) => {
      console.error(`Gagal kirim ke ${userId}:`, err.message);
    });
  });

  bot.sendMessage(senderId, `✅ Broadcast terkirim ke ${users.length} pengguna.`);
});

// === Perintah Kirim Promo ke Semua Grup ===
bot.onText(/\/sepgrup/, async (msg) => {
  const senderId = msg.chat.id;
  if (senderId !== ADMIN_CHAT_ID) return bot.sendMessage(senderId, '❌ Kamu tidak punya akses.');
  for (const groupId of [...groups]) {
    try {
      const pesan = await rms();
      await bot.sendMessage(chatId, pesan, {
        parse_mode: 'Markdown'
      });
      success++;
    } catch (err) {
      console.error(`❌ Gagal kirim ke grup ${groupId}: ${err.message}`);
      failed++;
      removeGroup(groupId);
    }
  }

  bot.sendMessage(senderId, `✅ Terkirim ke ${success} grup, ❌ Gagal: ${failed}`);
});

// === Auto Promo ON/OFF ===
bot.onText(/\/autopromoon/, (msg) => {
  const senderId = msg.chat.id;
  if (senderId !== ADMIN_CHAT_ID) return;

  if (isAutoPromoOn) {
    bot.sendMessage(senderId, 'ℹ️ Auto promo sudah aktif.');
  } else {
    saveAutoPromoState(true);
    bot.sendMessage(senderId, '✅ Auto promo ke grup diaktifkan setiap 1 jam.');
  }
});

bot.onText(/\/autopromooff/, (msg) => {
  const senderId = msg.chat.id;
  if (senderId !== ADMIN_CHAT_ID) return;

  if (!isAutoPromoOn) {
    bot.sendMessage(senderId, 'ℹ️ Auto promo memang sudah nonaktif.');
  } else {
    saveAutoPromoState(false);
    bot.sendMessage(senderId, '🛑 Auto promo ke grup telah dimatikan.');
  }
});

