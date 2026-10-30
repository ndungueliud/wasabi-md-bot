const fs = require("fs")
const settings = require("../settings")

const sendButtonMenu = async (sock, from, text, buttons) => {
  const btn = buttons.map(b => ({ buttonId: b.id, buttonText: { displayText: b.text }, type: 1 }))
  return sock.sendMessage(from, {
    text: text,
    footer: settings.footer,
    buttons: btn,
    headerType: 1
  })
}

const sendListMenu = async (sock, from, title, sections) => {
  return sock.sendMessage(from, {
    text: title,
    footer: settings.footer,
    title: settings.botName,
    buttonText: "View Menu",
    sections
  })
}

module.exports = async (sock, m, settings) => {
  const from = m.key.remoteJid
  const isGroup = from.endsWith("@g.us")
  const sender = isGroup ? (m.key.participant || m.participant) : from
  const body = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || m.message.videoMessage?.caption || ""
  const isOwner = settings.ownerNumber.includes(sender)
  const args = body.trim().split(/ +/).slice(1)
  const command = body.slice(settings.prefix.length).trim().split(/ +/).shift()?.toLowerCase()
  if (!body.startsWith(settings.prefix)) return

  // MODE
  if (settings.mode === 'private' && !isOwner) return
  if (settings.mode === 'self' && !isOwner && !m.key.fromMe) return
  if (settings.mode === 'grouponly' && !isGroup) return

  // === MAIN MENU WITH NATIVE BUTTONS ===
  if (command === 'menu' || command === 'eden' || command === 'help') {
    return sendButtonMenu(sock, from, 
`*╭───「 ${settings.botName} 」───
│ Owner: Eden Kenya
│ Number: 254184380203
│ Mode: ${settings.mode}
│ Prefix: ${settings.prefix}
╰────────────────*

Select a category below:`, [
      { id: '.botmenu', text: '🤖 Bot Menu' },
      { id: '.groupmenu', text: '👥 Group Menu' },
      { id: '.ownermenu', text: '👑 Owner Menu' },
      { id: '.downloadmenu', text: '📥 Download Menu' }
    ])
  }

  // BOT MENU
  if (command === 'botmenu') {
    return sendListMenu(sock, from, "*BOT MENU*", [
      {
        title: "Core Bot",
        rows: [
          { title: "Ping Speed", rowId: ".ping", description: "Check bot speed" },
          { title: "Uptime", rowId: ".uptime", description: "Bot runtime" },
          { title: "Info", rowId: ".info", description: "Bot info" },
          { title: "Owner", rowId: ".owner", description: "Show owner" },
          { title: "AFK", rowId: ".afk", description: "Set AFK mode" },
          { title: "Mode", rowId: ".mode public", description: "public/private/self/grouponly" },
          { title: "Add Owner", rowId: ".addowner 2547...", description: "Add new owner" },
          { title: "Del Owner", rowId: ".delowner 2547...", description: "Remove owner" },
        ]
      },
      {
        title: "Media Menus",
        rows: [
          { title: "Image Menu", rowId: ".imgmenu", description: "Image templates" },
          { title: "Video Menu", rowId: ".vidmenu", description: "Video templates" },
          { title: "Document Menu", rowId: ".docmenu", description: "Doc templates" },
          { title: "Button Menu", rowId: ".btnmenu", description: "Buttons samples" },
          { title: "Template Menu", rowId: ".templatemenu", description: "Template styles" },
        ]
      }
    ])
  }

  // GROUP MENU
  if (command === 'groupmenu') {
    let txt = `*GROUP MENU*\n\n.antilink on/off\n.antibadword on/off\n.warn @user\n.unwarn @user\n.ban @user\n.unban @user\n.link\n.add 254...\n.kick @user\n.ppdl @user - download profile pic\n.promote @user\n.demote @user\n.promotemsg set Welcome @user promoted\n.demotemsg set\n.welcome on/off\n.goodbye on/off\n.hidetag hello\n.tagadmin\n.tagall\n.activelist\n.history`
    return sendButtonMenu(sock, from, txt, [
      { id: '.tagall', text: 'Tag All' },
      { id: '.hidetag', text: 'Hide Tag' },
      { id: '.link', text: 'Group Link' }
    ])
  }

  // OWNER MENU
  if (command === 'ownermenu') {
    if (!isOwner) return sock.sendMessage(from, { text: "Owner only!" })
    return sendButtonMenu(sock, from, 
`*OWNER MENU*\n\n.autobio on/off\n.setpp reply image\n.autotype on/off\n.autorecording on/off\n.autoreact on/off\n.autoread on/off\n.autoviewstatus on/off\n.antiviewonce on/off\n.antidelete on/off`, [
      { id: '.autobio on', text: 'Auto Bio ON' },
      { id: '.autoviewstatus on', text: 'Auto View Status' },
      { id: '.setpp', text: 'Set Bot PP' }
    ])
  }

  // IMAGE / VIDEO / DOCUMENT / BUTTONS / TEMPLATE - NATIVE
  if (command === 'imgmenu') {
    return sock.sendMessage(from, {
      image: { url: "https://telegra.ph/file/6d3c0b5f6a5f9d8b9a5f.jpg" },
      caption: "Image Menu",
      footer: settings.footer,
      buttons: [
        { buttonId: '.imgmenu1', buttonText: { displayText: 'Image + Buttons' }, type: 1 },
        { buttonId: '.imgmenu2', buttonText: { displayText: 'Image + List' }, type: 1 }
      ],
      headerType: 4
    })
  }

  if (command === 'btnmenu') {
    return sendButtonMenu(sock, from, "This is Native Buttons Menu Sample", [
      { id: '.menu', text: 'Main Menu' },
      { id: '.ping', text: 'Ping' },
      { id: '.owner', text: 'Contact Owner' }
    ])
  }

  if (command === 'templatemenu') {
    return sock.sendMessage(from, {
      text: "Template Menu Styles - Eden Kenya Bot",
      footer: settings.footer,
      templateButtons: [
        { index: 1, urlButton: { displayText: "🌐 Github Repo", url: "https://github.com/" } },
        { index: 2, callButton: { displayText: "📞 Call Owner", phoneNumber: "+254184380203" } },
        { index: 3, quickReplyButton: { displayText: "Back to Menu", id: ".menu" } }
      ]
    })
  }

  // DOWNLOAD MENU
  if (command === 'downloadmenu' || command === 'dlmenu') {
    return sendListMenu(sock, from, "*DOWNLOAD MENU*", [{
      title: "Downloaders",
      rows: [
        { title: "YT MP3", rowId: ".mp3 https://youtu.be/...", description: "YouTube to MP3" },
        { title: "YT MP4", rowId: ".mp4 https://youtu.be/...", description: "YouTube to MP4" },
        { title: "TikTok", rowId: ".tiktok https://tiktok.com/...", description: "No watermark" },
        { title: "Facebook", rowId: ".fb https://fb.watch/...", description: "FB video" },
        { title: "Instagram - Instaprime", rowId: ".ig https://instagram.com/...", description: "Via Instaprime App API" },
      ]
    }])
  }

  // QUICK COMMANDS
  if (command === 'ping') {
    const start = Date.now()
    await sock.sendMessage(from, { text: "Pong..." })
    return sock.sendMessage(from, { text: `*Speed:* ${Date.now() - start}ms` })
  }
  if (command === 'buybot') {
    return sendButtonMenu(sock, from, "*BUY EDEN KENYA BOT*\n\nPrice: KES 1500 Lifetime\nIncludes: Pair code, all menus, updates\nPay via M-PESA: 07184380203\nThen send screenshot to owner", [
      { id: '.owner', text: 'Contact Owner to Buy' }
    ])
  }
  if (command === 'hirebot') {
    return sendButtonMenu(sock, from, "*HIRE BOT FOR GROUP*\n\nKES 300 / Month\nWe add Eden Kenya Bot to your group + manage\nContact Owner", [
      { id: '.owner', text: 'Hire Now' }
    ])
  }

  // Add rest: antilink, welcome, games, tools in same file or import from /menu/
}
