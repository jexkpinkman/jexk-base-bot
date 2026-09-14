# Base Bot WA By jexkpinkman (JexkCode)

## 📌 Informasi
- Base Kosongan
- Base Sudah JID
- Type CommonJs
- Powered by JexkCode Baileys
- Mudah Dikembangkan
- Cocok Untuk Belajar dan Recode

## 📁 Struktur
- `index.js` — koneksi ke WhatsApp, pairing code, auto-follow channel, log chat real-time di console
- `jexk.js` — command handler (menu, addowner, delowner, addprem, delprem, public, self, sc, eval/exec owner)
- `control/settings.js` — owner number
- `lib/myfunc.js` — serializer pesan (smsg) + helper functions
- `lib/media/thumb.jpg` — thumbnail default buat menu & sc

## ⚙️ Setup
1. `npm install`
2. Edit `control/settings.js` — isi nomor owner di `global.owner`
3. `npm start`
4. Masukkan nomor WhatsApp (format 628xxx) saat diminta, lalu masukkan pairing code di HP: **Linked Devices → Link with phone number**

## 🔔 Auto-Follow Channel
ID channel ada di `index.js` (`AUTO_FOLLOW_CHANNEL`). Kosongkan `""` buat matiin.

## 💬 Console Log
Tiap ada pesan masuk (private/group), console nampilin log real-time: waktu, nama pengirim, nomor, tipe chat, dan isi pesannya.

## ⚠️ Disclaimer
Gunakan base ini secara bijak.

- ❌ Jangan diperjualbelikan
- ❌ Jangan menghapus credit creator
- ✅ Bebas digunakan untuk belajar
- ✅ Bebas dimodifikasi sesuai kebutuhan

## 🎁 Free
Base ini **100% FREE** dan dibagikan untuk komunitas.

---
© jexkpinkman
- GitHub: [jexkpinkman](https://github.com/jexkpinkman)
- WhatsApp: 6285212645395
- Telegram: [t.me/Jack_pinkman](https://t.me/Jack_pinkman)

