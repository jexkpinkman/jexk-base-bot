
         //﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌//
       //    </>  𝐂𝐫𝐞𝐝𝐢𝐭𝐬  </>      //
     //   𝐂𝐫𝐞𝐚𝐭𝐨𝐫: 𝐣𝐞𝐱𝐤𝐩𝐢𝐧𝐤𝐦𝐚𝐧      //
   //   𝐆𝐢𝐭𝐡𝐮𝐛: 𝐣𝐞𝐱𝐤𝐩𝐢𝐧𝐤𝐦𝐚𝐧      //
 //   𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩: 𝟔𝟐𝟖𝟓𝟐𝟏𝟐𝟔𝟒𝟓𝟑𝟗𝟓   //
//   𝐓𝐞𝐥𝐞𝐠𝐫𝐚𝐦: 𝐭.𝐦𝐞/𝐉𝐚𝐜𝐤_𝐩𝐢𝐧𝐤𝐦𝐚𝐧  //
//﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌﹌//

require('./control/settings');
const {
    default: makeWASocket,
    prepareWAMessageMedia,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeInMemoryStore,
    jidDecode,
    downloadContentFromMessage,
    makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");
const pino = require('pino');
const readline = require("readline");
const fs = require('fs');
const chalk = require("chalk");
const { smsg } = require('./lib/myfunc');

const usePairingCode = true;

// ganti ID channel di sini kalau mau follow channel lain (kosongkan "" buat matiin)
const AUTO_FOLLOW_CHANNEL = "120363405612723183@newsletter";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise(resolve => rl.question(text, resolve));

const store = makeInMemoryStore({ logger: pino({ level: 'silent' }) });

function printBanner() {
    const banner = `
${chalk.cyan('     ██╗███████╗██╗  ██╗██╗  ██╗ ██████╗ ██████╗ ██████╗ ███████╗')}
${chalk.cyan('     ██║██╔════╝╚██╗██╔╝██║ ██╔╝██╔════╝██╔═══██╗██╔══██╗██╔════╝')}
${chalk.cyan('     ██║█████╗   ╚███╔╝ █████╔╝ ██║     ██║   ██║██║  ██║█████╗  ')}
${chalk.cyan('██   ██║██╔══╝   ██╔██╗ ██╔═██╗ ██║     ██║   ██║██║  ██║██╔══╝  ')}
${chalk.cyan('╚█████╔╝███████╗██╔╝ ██╗██║  ██╗╚██████╗╚██████╔╝██████╔╝███████╗')}
${chalk.cyan(' ╚════╝ ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝')}

${chalk.gray('  Creator   :')} ${chalk.magenta('jexkpinkman')}
${chalk.gray('  Github    :')} ${chalk.magenta('github.com/jexkpinkman')}
${chalk.gray('  WhatsApp  :')} ${chalk.magenta('6285212645395')}
${chalk.gray('  Telegram  :')} ${chalk.magenta('t.me/Jack_pinkman')}
`;
    console.log(banner);
}

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState("./session");
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        printQRInTerminal: !usePairingCode,
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        logger: pino({ level: 'silent' }),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
        }
    });

    sock.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            const decode = jidDecode(jid) || {};
            return decode.user && decode.server ? decode.user + '@' + decode.server : jid;
        }
        return jid;
    };

    store.bind(sock.ev);

    if (!sock.authState.creds.registered) {
        const phoneNumber = await question(`\nSilahkan masukkan nomor (628xxx):\n`);
        const code = await sock.requestPairingCode(phoneNumber.trim(), "JEXKCODE");
        console.log(chalk.blue("PAIRING CODE:", code));
    }

    sock.public = true;

    // auto-follow channel jexkpinkman sekali setelah connect
    let alreadyFollowed = false;
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'open' && !alreadyFollowed && AUTO_FOLLOW_CHANNEL) {
            alreadyFollowed = true;
            setTimeout(() => {
                sock.newsletterFollow(AUTO_FOLLOW_CHANNEL).catch(() => {});
            }, 3000);
        }

        if (connection === 'close') {
            if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                connectToWhatsApp();
            }
        }
    });

    const logIncoming = (m) => {
        const time = new Date().toLocaleTimeString('id-ID', { hour12: false });
        const senderNum = (m.sender || '').split('@')[0] || 'unknown';
        const name = m.pushName || senderNum;
        const chatType = m.isGroup ? 'Group' : 'Private';
        const text = m.text && m.text.length ? m.text : `[${m.mtype}]`;

        console.log(
            chalk.gray(`[${time}]`) +
            ' ' + chalk.cyan(name) + chalk.gray(` (${senderNum})`) +
            ' ' + chalk.gray(`[${chatType}]`) +
            ' ' + chalk.white('➜') +
            ' ' + chalk.yellow(text)
        );
    };

    sock.ev.on('messages.upsert', async ({ messages }) => {
        try {
            const mek = messages[0];
            if (!mek.message) return;
            if (mek.key.remoteJid === 'status@broadcast') return;

            const m = smsg(sock, mek, store);
            if (!m) return;

            logIncoming(m);

            const isCreator = [sock?.user?.id, ...(global.owner || [])]
                .map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
                .includes(m.sender);

            if (!sock.public && !mek.key.fromMe && !isCreator) return;
            if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return;
            if (mek.key.id.startsWith('jexkcode.base')) return;

            require("./jexk")(sock, m, store);

        } catch (e) {
            console.log(e);
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

printBanner();
connectToWhatsApp();
