

```js
// Antilink Command (.antilink on/off)
const prefix = '.';

const antilinkSettings = {}; // Group-specific toggle

conn.ev.on('messages.upsert', async ({ messages }) => {
  const msg = messages[0];
  if (!msg.message || !msg.key.remoteJid.endsWith('@g.us')) return;

  const from = msg.key.remoteJid;
  const body = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
  const isGroupAdmin = msg.key.fromMe || (await conn.groupMetadata(from))
    .participants.find(p => p.id === msg.key.participant && p.admin);

  // Toggle command
  if (body.startsWith(`${prefix}antilink`)) {
    if (!isGroupAdmin) return conn.sendMessage(from, { text: 'Only admins can use this command.' }, { quoted: msg });

    const arg = body.split(' ')[1];
    if (arg === 'on') {
      antilinkSettings[from] = true;
      conn.sendMessage(from, { text: '🔗 Antilink is now *ON*' }, { quoted: msg });
    } else if (arg === 'off') {
      antilinkSettings[from] = false;
      conn.sendMessage(from, { text: '🔗 Antilink is now *OFF*' }, { quoted: msg });
    } else {conn.sendMessage(from, { text: 'Usage: .antilink on/off' }, { quoted: msg });
    }
    return;
  }

  // Detect link
  if (antilinkSettings[from]) {
    const urlPattern = /(https?:\/\/)?(www\.)?(chat\.whatsapp\.com)\/[a-zA-Z0-9]+/;
    if (urlPattern.test(body) && !isGroupAdmin) {
      await conn.sendMessage(from, { text: 'Link detected! You are being removed.' }, { quoted: msg });
      await conn.groupParticipantsUpdate(from, [msg.key.participant], 'remove');
    }
  }
});
```

