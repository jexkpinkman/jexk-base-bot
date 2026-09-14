
         //﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌//
       //    </>  𝐂𝐫𝐞𝐝𝐢𝐭𝐬  </>      //
     //   𝐂𝐫𝐞𝐚𝐭𝐨𝐫: 𝐣𝐞𝐱𝐤𝐩𝐢𝐧𝐤𝐦𝐚𝐧      //
   //   𝐆𝐢𝐭𝐡𝐮𝐛: 𝐣𝐞𝐱𝐤𝐩𝐢𝐧𝐤𝐦𝐚𝐧      //
 //   𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩: 𝟔𝟐𝟖𝟓𝟐𝟏𝟐𝟔𝟒𝟓𝟑𝟗𝟓   //
//   𝐓𝐞𝐥𝐞𝐠𝐫𝐚𝐦: 𝐭.𝐦𝐞/𝐉𝐚𝐜𝐤_𝐩𝐢𝐧𝐤𝐦𝐚𝐧  //
//﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌//

const { jidNormalizedUser, getContentType, areJidsSameUser } = require("@whiskeysockets/baileys");
const chalk = require('chalk');
const fs = require('fs');
const axios = require('axios');
const moment = require('moment-timezone');
const { sizeFormatter } = require('human-readable');

const unixTimestampSeconds = (date = new Date()) => Math.floor(date.getTime() / 1000);
exports.unixTimestampSeconds = unixTimestampSeconds;

exports.generateMessageTag = (epoch) => {
    let tag = unixTimestampSeconds().toString();
    if (epoch) tag += '.--' + epoch;
    return tag;
};

exports.processTime = (timestamp, now) => {
    return moment.duration(now - moment(timestamp * 1000)).asSeconds();
};

exports.getRandom = (ext) => `${Math.floor(Math.random() * 10000)}${ext}`;

exports.getBuffer = async (url, options = {}) => {
    try {
        const res = await axios({
            method: "get",
            url,
            headers: { 'DNT': 1, 'Upgrade-Insecure-Request': 1 },
            ...options,
            responseType: 'arraybuffer'
        });
        return res.data;
    } catch (err) {
        return err;
    }
};

exports.fetchJson = async (url, options = {}) => {
    try {
        const res = await axios({ method: 'GET', url, ...options });
        return res.data;
    } catch (err) {
        return err;
    }
};

exports.runtime = (seconds) => {
    seconds = Number(seconds);
    let d = Math.floor(seconds / (3600 * 24));
    let h = Math.floor(seconds % (3600 * 24) / 3600);
    let m = Math.floor(seconds % 3600 / 60);
    let s = Math.floor(seconds % 60);
    return `${d ? d + "d " : ""}${h ? h + "h " : ""}${m ? m + "m " : ""}${s ? s + "s" : ""}`;
};

exports.formatp = sizeFormatter({
    std: 'JEDEC',
    decimalPlaces: 2,
    keepTrailingZeroes: false,
    render: (literal, symbol) => `${literal} ${symbol}B`,
});

exports.parseMention = (text = '') =>
    [...text.matchAll(/@([0-9]{5,16})/g)].map(v => v[1] + '@s.whatsapp.net');

exports.getGroupAdmins = (participants = []) =>
    participants.filter(p => p.admin).map(p => p.id);

exports.sleep = async (ms) => new Promise(resolve => setTimeout(resolve, ms));

exports.isUrl = (url) => /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gi.test(url);

exports.getTime = (format, date) => moment(date).format(format);

exports.tanggal = (numer) => {
    const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const d = new Date(numer);
    return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
};

// serializer pesan, dipakai di index.js sebelum masuk ke handler
exports.smsg = (sock, m, store) => {
    if (!m) return m;

    const decode = (jid) => sock.decodeJid?.(jid) || jidNormalizedUser(jid || '');

    if (m.key) {
        m.id = m.key.id;
        m.chat = m.key.remoteJid;
        m.fromMe = m.key.fromMe;
        m.isGroup = m.chat.endsWith('@g.us');
        m.sender = decode(
            m.fromMe
                ? sock.user?.id
                : m.key.participant || m.chat
        );
        if (m.isGroup) m.participant = decode(m.key.participant);
    }

    if (m.message) {
        m.mtype = getContentType(m.message);
        m.msg = m.message[m.mtype];
        m.text =
            m.msg?.text ||
            m.msg?.caption ||
            m.message.conversation ||
            '';

        let quoted = m.msg?.contextInfo?.quotedMessage;
        if (quoted) {
            let type = getContentType(quoted);
            m.quoted = quoted[type];
            m.quoted.key = {
                remoteJid: m.chat,
                fromMe: areJidsSameUser(
                    decode(m.msg.contextInfo.participant),
                    decode(sock.user?.id)
                ),
                id: m.msg.contextInfo.stanzaId,
                participant: decode(m.msg.contextInfo.participant)
            };
            m.quoted.sender = decode(m.msg.contextInfo.participant);
            m.quoted.text =
                m.quoted.text ||
                m.quoted.caption ||
                m.quoted.conversation ||
                '';
        }
    }

    m.reply = (text, chatId = m.chat, options = {}) =>
        sock.sendMessage(chatId, { text }, { quoted: m, ...options });

    return m;
};
