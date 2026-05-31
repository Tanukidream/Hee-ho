
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hee-Ho bot alive ❄️');
});

// IMPORTANTE: Render usa PORT
app.listen(process.env.PORT || 3000, () => {
  console.log('🌐 Web server listo en Render');
});
const app = express();

app.get('/', (req, res) => {
  res.send('Bot activo ❄️ Hee-Ho!');
});

app.listen(process.env.PORT || 3000);
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 📍 CANAL FIJO (TU CANAL)
const TARGET_CHANNEL_ID = '1510696692909998201';

// 📂 FILES
const paFile = './pa.json';
const pdFile = './pd.json';

let pa = {};
let pd = {};

if (fs.existsSync(paFile)) pa = JSON.parse(fs.readFileSync(paFile));
if (fs.existsSync(pdFile)) pd = JSON.parse(fs.readFileSync(pdFile));

// 💾 SAVE
function savePA() {
  fs.writeFileSync(paFile, JSON.stringify(pa, null, 2));
}

function savePD() {
  fs.writeFileSync(pdFile, JSON.stringify(pd, null, 2));
}

// 🧠 GET SAFE
function get(obj, id) {
  if (!obj[id]) obj[id] = 0;
  return obj[id];
}

// 🔐 ROLES
const roles = ['loki', 'Captain'];

function isLeader(member) {
  return member.roles.cache.some(r => roles.includes(r.name));
}

function canActivity(member) {
  return member.roles.cache.some(r => roles.includes(r.name));
}

// ❄️ JACK FROST SYSTEM
let lastActivity = Date.now();
let lastHeeHo = 0;

const heeHoMessages = [
  'Hee-Ho! ❄️ / Hee-Ho! ❄️',

  'Hee-Ho! El clan está vivo, ho! / Hee-Ho! The clan is alive, ho!',
  'Hee-Ho! Jack Frost vigila, ho! / Hee-Ho! Jack Frost is watching, ho!',
  'Hee-Ho! Más PA para el destino, ho! / Hee-Ho! More PA for destiny, ho!',
  'Hee-Ho! Entrena o te congelas, ho! / Hee-Ho! Train or you freeze, ho!',
  'Hee-Ho! El ranking se mueve, ho! / Hee-Ho! The ranking is shifting, ho!',
  'Hee-Ho! Frost power, ho! / Hee-Ho! Frost power, ho!',
  'Hee-Ho! El hielo nunca descansa / Hee-Ho! The ice never rests',

  'Hee-Ho! ¡A por la victoria del clan! / Hee-Ho! Go for clan victory!',
  'Hee-Ho! El poder del hielo crece / Hee-Ho! The power of ice grows',
  'Hee-Ho! No olvidéis vuestros PA / Hee-Ho! Don’t forget your PA',

  'Hee-Ho! Soy Jack Frost, ho! / Hee-Ho! I am Jack Frost, ho!',
  'Hee-Ho! Te observo desde el hielo / Hee-Ho! I watch you from the ice'
];
// 🚀 READY
client.once('ready', () => {
  console.log(`🤖 Bot conectado como ${client.user.tag}`);

  // ❄️ MENSAJES AUTOMÁTICOS
  setInterval(async () => {
    const now = Date.now();

    const active = now - lastActivity < 60 * 60 * 1000;
    const cooldown = now - lastHeeHo > 30 * 60 * 1000;

    if (!active || !cooldown) return;

    try {
      for (const guild of client.guilds.cache.values()) {
        const channel = guild.channels.cache.get(TARGET_CHANNEL_ID);
        if (!channel || !channel.isTextBased()) continue;

        const msg =
          heeHoMessages[Math.floor(Math.random() * heeHoMessages.length)];

        await channel.send(msg);
      }

      lastHeeHo = now;
    } catch (err) {
      console.error(err);
    }
  }, 5 * 60 * 1000);
});

// 📩 MESSAGE
client.on('messageCreate', (message) => {
  if (message.author.bot) return;

  lastActivity = Date.now();

  const args = message.content.split(' ');
  const cmd = args[0];
  const users = message.mentions.users;

  // =========================
  // 🆘 HELP
  // =========================
  if (cmd === '!help') {
    const embed = new EmbedBuilder()
      .setColor(0x00AEFF)
      .setTitle('🆘 RPG CLAN HELP ❄️')
      .addFields(
        { name: '🎮 GENERAL', value: '!pa !ranking !panel !heeho' },
        { name: '⚔️ ACTIVIDAD', value: '!raid !entrenamiento !clanwar' },
        { name: '📦 PD', value: '!addpd !removepd !viewpd' },
        { name: '🟢 ADMIN PA', value: '!addpa !removepa' }
      )
      .setFooter({ text: 'Hee-Ho System ❄️' });

    return message.channel.send({ embeds: [embed] });
  }

  // =========================
  // ❄️ HEEHO
  // =========================
  if (cmd === '!heeho') {
    return message.channel.send(
      heeHoMessages[Math.floor(Math.random() * heeHoMessages.length)]
    );
  }

  // =========================
  // 📊 PA
  // =========================
  if (cmd === '!pa') {
    const user = users.first() || message.author;
    return message.reply(`🏆 ${user.username}: ${get(pa, user.id)} PA`);
  }

  // =========================
  // 🏆 RANKING
  // =========================
  if (cmd === '!ranking') {
    const sorted = Object.entries(pa)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    let msg = '🏆 RANKING PA:\n';
    sorted.forEach((u, i) => {
      msg += `${i + 1}. <@${u[0]}> — ${u[1]} PA\n`;
    });

    return message.channel.send(msg);
  }

  // =========================
  // 🎮 PANEL
  // =========================
  if (cmd === '!panel') {
    const user = message.author;

    const embed = new EmbedBuilder()
      .setColor(0x00AEFF)
      .setTitle('🎮 RPG PANEL ❄️')
      .addFields(
        { name: '🏆 PA', value: `${get(pa, user.id)}`, inline: true },
        { name: '📦 PD', value: `${get(pd, user.id)}`, inline: true }
      );

    return message.channel.send({ embeds: [embed] });
  }

  // =========================
  // ⚔️ RAID
  // =========================
  if (cmd === '!raid') {
    if (!canActivity(message.member))
      return message.reply('❌ Sin permisos.');

    users.forEach(u => pa[u.id] = get(pa, u.id) + 1);
    savePA();

    return message.reply('⚔️ +1 PA ❄️ Hee-Ho RAID!');
  }

  // =========================
  // 🏋️ TRAIN
  // =========================
  if (cmd === '!entrenamiento') {
    if (!canActivity(message.member))
      return message.reply('❌ Sin permisos.');

    users.forEach(u => pa[u.id] = get(pa, u.id) + 1);
    savePA();

    return message.reply('🏋️ +1 PA ❄️');
  }

  // =========================
  // ⚔️ CLANWAR
  // =========================
  if (cmd === '!clanwar') {
    if (!canActivity(message.member))
      return message.reply('❌ Sin permisos.');

    users.forEach(u => pa[u.id] = get(pa, u.id) + 2);
    savePA();

    return message.reply('⚔️ +2 PA ❄️');
  }

  // =========================
  // 🟢 ADD PA
  // =========================
  if (cmd === '!addpa') {
    if (!isLeader(message.member))
      return message.reply('❌ Solo líderes.');

    const target = users.first();
    const amount = parseInt(args[2]);

    pa[target.id] = get(pa, target.id) + amount;
    savePA();

    return message.reply(`✅ +${amount} PA ❄️`);
  }

  // =========================
  // 🔴 REMOVE PA
  // =========================
  if (cmd === '!removepa') {
    if (!isLeader(message.member))
      return message.reply('❌ Solo líderes.');

    const target = users.first();
    const amount = parseInt(args[2]);

    pa[target.id] = get(pa, target.id) - amount;
    savePA();

    return message.reply(`⚠️ -${amount} PA ❄️`);
  }

  // =========================
  // 🔵 ADD PD
  // =========================
  if (cmd === '!addpd') {
    if (!isLeader(message.member))
      return message.reply('❌ Solo líderes.');

    const target = users.first();
    const type = args[2];
    const amount = parseInt(args[3]);

    let value = 0;

    switch (type) {
      case 'basic': value = (amount / 1000); break;
      case 'medium': value = amount * 3; break;
      case 'high': value = amount * 5; break;
      case 'event': value = amount * 8; break;
      case 'equip': value = amount * 6; break;
      case 'division': value = amount * 6; break;
    }

    pd[target.id] = get(pd, target.id) + value;
    savePD();

    return message.reply(`📦 +${value} PD ❄️`);
  }

  // =========================
  // 🔴 REMOVE PD
  // =========================
  if (cmd === '!removepd') {
    if (!isLeader(message.member))
      return message.reply('❌ Solo líderes.');

    const target = users.first();
    const amount = parseInt(args[2]);

    pd[target.id] = get(pd, target.id) - amount;
    savePD();

    return message.reply(`⚠️ -${amount} PD ❄️`);
  }

  // =========================
  // 👀 VIEW PD
  // =========================
  if (cmd === '!viewpd') {
    const user = users.first() || message.author;
    return message.reply(`📦 ${user.username}: ${get(pd, user.id)} PD`);
  }
});

client.login(process.env.TOKEN);
