const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore } = require("@whiskeysockets/baileys")
const pino = require("pino")
const settings = require("./settings")

async function Eden() {
  const { state, saveCreds } = await useMultiFileAuthState('./session')
  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })) },
    browser: ["Eden Kenya", "Chrome", "1.0"]
  })

  if (!sock.authState.creds.registered) {
    await new Promise(r => setTimeout(r, 3000))
    let code = await sock.requestPairingCode(settings.pairNumber)
    console.log(`\n=== EDEN KENYA BOT PAIR CODE ===\nCODE: ${code}\n1. Open WhatsApp\n2. Linked Devices > Link with phone number\n3. Enter code\n==============================\n`)
  }

  sock.ev.on('creds.update', saveCreds)
  sock.ev.on('connection.update', async (s) => {
    const { connection, lastDisconnect } = s
    if (connection === 'open') {
      console.log("Eden Kenya Bot Connected!")
      await sock.sendMessage(sock.user.id, { 
        text: `*Eden Kenya Bot Online* ✅\nMode: ${settings.mode}\nType .menu`,
      })
    }
    if (connection === 'close' && lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) Eden()
  })

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m.message) return
    require("./lib/functions")(sock, m, settings)
  })
}
Eden()
