const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');

// =====================
// CLIENT (OPTIMIZADO)
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
// FILES (LIGHT LOAD)
// =====================
const paFile = './pa.json';
const pdFile = './pd.json';

let pa = {};
let pd = {};

if (fs.existsSync(paFile)) pa = JSON.parse(fs.readFileSync(paFile));
if (fs.existsSync(pdFile)) pd = JSON.parse(fs.readFileSync(pdFile));

// =====================
// SAVE (SAFE WRITE)
// =====================
function save(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// =====================
// GET SAFE
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
// JACK FROST SYSTEM (LIGHT)
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

  // reduced interval (RAM SAFE)
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
// MESSAGE SYSTEM
// =====================
client.on('messageCreate', (message) => {
  if (message.author.bot) return;

  lastActivity = Date.now();

  const args = message.content.split(' ');
  const cmd = args[0];
  const users = message.mentions.users;

  // =====================
  // HELP
  // =====================
  if (cmd === '!help') {
    const embed = new EmbedBuilder()
      .setColor(0x00AEFF)
      .setTitle('❄️ Hee-Ho RPG HELP')
      .addFields(
        { name: 'General', value: '!pa !ranking !panel' },
        { name: 'Activity', value: '!raid !entrenamiento !clanwar' },
        { name: 'Admin', value: '!addpa !removepa !addpd' }
      );

    return message.channel.send({ embeds: [embed] });
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
      .setTitle('❄️ PANEL')
      .addFields(
        { name: 'PA', value: `${get(pa, user.id)}`, inline: true },
        { name: 'PD', value: `${get(pd, user.id)}`, inline: true }
      );

    return message.channel.send({ embeds: [embed] });
  }

  // =====================
  // ACTIVITY (SAFE)
  // =====================
  if (cmd === '!raid') {
    if (!canActivity(message.member)) return;

    users.forEach(u => pa[u.id] = get(pa, u.id) + 1);
    save(paFile, pa);

    return message.reply('Hee-Ho RAID +1 PA');
  }

  if (cmd === '!entrenamiento') {
    if (!canActivity(message.member)) return;

    users.forEach(u => pa[u.id] = get(pa, u.id) + 1);
    save(paFile, pa);

    return message.reply('Training +1 PA');
  }

  if (cmd === '!clanwar') {
    if (!canActivity(message.member)) return;

    users.forEach(u => pa[u.id] = get(pa, u.id) + 2);
    save(paFile, pa);

    return message.reply('Clanwar +2 PA');
  }

  // =====================
  // ADD PA
  // =====================
  if (cmd === '!addpa') {
    if (!isLeader(message.member)) return;

    const target = users.first();
    const amount = parseInt(args[2]);

    pa[target.id] = get(pa, target.id) + amount;
    save(paFile, pa);

    return message.reply(`+${amount} PA`);
  }

  // =====================
  // ADD PD (SIMPLE)
  // =====================
  if (cmd === '!addpd') {
    if (!isLeader(message.member)) return;

    const target = users.first();
    const amount = parseInt(args[3]);

    pd[target.id] = get(pd, target.id) + amount;
    save(pdFile, pd);

    return message.reply(`+${amount} PD`);
  }
});

// =====================
// LOGIN
// =====================
client.login(process.env.TOKEN);
