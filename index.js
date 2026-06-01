const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');

const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hee-Ho bot online ❄️ Hee-Ho System');
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🌐 Web server activo en puerto ${PORT}`);
});

// =====================
// BOT CLIENT
// =====================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// =====================
// CONFIG
// =====================
const TARGET_CHANNEL_ID = '1510696692909998201';

// =====================
// FILES
// =====================
const paFile = './pa.json';
const pdFile = './pd.json';

let pa = {};
let pd = {};

if (fs.existsSync(paFile)) pa = JSON.parse(fs.readFileSync(paFile));
if (fs.existsSync(pdFile)) pd = JSON.parse(fs.readFileSync(pdFile));

// =====================
// SAVE
// =====================
function save(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// =====================
// SAFE GET
// =====================
function get(obj, id) {
  if (!obj[id]) obj[id] = 0;
  return obj[id];
}

// =====================
// ROLES
// =====================
const roles = ['loki', 'Captain'];

function isLeader(member) {
  return member.roles.cache.some(r => roles.includes(r.name));
}

function canActivity(member) {
  return member.roles.cache.some(r => roles.includes(r.name));
}

// =====================
// JACK FROST SYSTEM
// =====================
let lastActivity = Date.now();
let lastTalk = 0;

const heeHoMessages = [
  "Hee-Ho! ❄️",
  "Hee-Ho! The ice is alive!",
  "Hee-Ho! El clan sigue creciendo!",
  "Hee-Ho! Train or freeze!"
];

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// =====================
// READY
// =====================
client.once('ready', () => {
  console.log(`🤖 Online como ${client.user.tag}`);

  setInterval(async () => {
    const now = Date.now();

    const active = now - lastActivity < 60 * 60 * 1000;
    const cooldown = now - lastTalk > 20 * 60 * 1000;

    if (!active || !cooldown) return;

    const channel = client.channels.cache.get(TARGET_CHANNEL_ID);
    if (!channel) return;

    await channel.send(rand(heeHoMessages));
    lastTalk = now;

  }, 10 * 60 * 1000);
});

// =====================
// MESSAGE
// =====================
client.on('messageCreate', (message) => {
  if (message.author.bot) return;

  lastActivity = Date.now();

  const args = message.content.split(' ');
  const cmd = args[0];
  const users = message.mentions.users;

  // =====================
  // HELP COMMANDS
  // =====================
  if (!cmd.startsWith('!')) return;

  // ❌ UNKNOWN COMMAND
  const validCommands = [
    '!help','!heeho','!pa','!ranking','!panel',
    '!raid','!entrenamiento','!clanwar',
    '!addpa','!removepa','!addpd','!removepd'
  ];

  if (!validCommands.includes(cmd)) {
    return message.reply(
      `❌ Comando desconocido.\n\n` +
      `✔️ Ejemplo:\n` +
      `!help | !pa | !raid @user`
    );
  }

  // =====================
  // HELP
  // =====================
  if (cmd === '!help') {
    const embed = new EmbedBuilder()
      .setColor(0x00AEFF)
      .setTitle('❄️ Hee-Ho RPG System')
      .addFields(
        { name: 'General', value: '!pa !ranking !panel !heeho' },
        { name: 'Activity', value: '!raid !entrenamiento !clanwar' },
        { name: 'Admin PA', value: '!addpa @user 10 | !removepa @user 10' },
        { name: 'Admin PD', value: '!addpd @user 10 | !removepd @user 10' }
      );

    return message.channel.send({ embeds: [embed] });
  }

  // =====================
  // HEEHO
  // =====================
  if (cmd === '!heeho') {
    return message.channel.send(rand(heeHoMessages));
  }

  // =====================
  // PA
  // =====================
  if (cmd === '!pa') {
    const user = users.first() || message.author;
    return message.reply(`🏆 ${user.username}: ${get(pa, user.id)} PA`);
  }

  // =====================
  // RANKING
  // =====================
  if (cmd === '!ranking') {
    const sorted = Object.entries(pa)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    let msg = '🏆 RANKING:\n';
    sorted.forEach((u, i) => {
      msg += `${i + 1}. <@${u[0]}> — ${u[1]} PA\n`;
    });

    return message.channel.send(msg);
  }

  // =====================
  // PANEL
  // =====================
  if (cmd === '!panel') {
    const user = message.author;

    const embed = new EmbedBuilder()
      .setColor(0x00AEFF)
      .setTitle('❄️ Hee-Ho System')
      .addFields(
        { name: 'PA', value: `${get(pa, user.id)}`, inline: true },
        { name: 'PD', value: `${get(pd, user.id)}`, inline: true }
      );

    return message.channel.send({ embeds: [embed] });
  }

  // =====================
  // ACTIVITY
  // =====================
  if (cmd === '!raid' || cmd === '!entrenamiento' || cmd === '!clanwar') {
    if (!canActivity(message.member)) {
      return message.reply('❌ No tienes permisos.');
    }

    const value = cmd === '!clanwar' ? 2 : 1;

    users.forEach(u => pa[u.id] = get(pa, u.id) + value);
    save(paFile, pa);

    return message.reply(`❄️ +${value} PA`);
  }

  // =====================
  // ADD PA
  // =====================
  if (cmd === '!addpa') {
    if (!isLeader(message.member))
      return message.reply('Uso: !addpa @user cantidad');

    const target = users.first();
    const amount = parseInt(args[2]);

    if (!target || isNaN(amount))
      return message.reply('Uso correcto: !addpa @user 10');

    pa[target.id] = get(pa, target.id) + amount;
    save(paFile, pa);

    return message.reply(`+${amount} PA`);
  }

  // =====================
  // REMOVE PA
  // =====================
  if (cmd === '!removepa') {
    if (!isLeader(message.member))
      return message.reply('Uso: !removepa @user cantidad');

    const target = users.first();
    const amount = parseInt(args[2]);

    if (!target || isNaN(amount))
      return message.reply('Uso correcto: !removepa @user 10');

    pa[target.id] = get(pa, target.id) - amount;
    save(paFile, pa);

    return message.reply(`-${amount} PA`);
  }

  // =====================
  // ADD PD
  // =====================
  if (cmd === '!addpd') {
    if (!isLeader(message.member))
      return message.reply('Uso: !addpd @user cantidad');

    const target = users.first();
    const amount = parseInt(args[2]);

    if (!target || isNaN(amount))
      return message.reply('Uso correcto: !addpd @user 10');

    pd[target.id] = get(pd, target.id) + amount;
    save(pdFile, pd);

    return message.reply(`+${amount} PD`);
  }

  // =====================
  // REMOVE PD
  // =====================
  if (cmd === '!removepd') {
    if (!isLeader(message.member))
      return message.reply('Uso: !removepd @user cantidad');

    const target = users.first();
    const amount = parseInt(args[2]);

    if (!target || isNaN(amount))
      return message.reply('Uso correcto: !removepd @user 10');

    pd[target.id] = get(pd, target.id) - amount;
    save(pdFile, pd);

    return message.reply(`-${amount} PD`);
  }
});

// =====================
// LOGIN
// =====================
client.login(process.env.TOKEN);
