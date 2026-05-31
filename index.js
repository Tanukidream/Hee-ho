const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

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

// ❄️ JACK FROST IA SYSTEM
const TARGET_CHANNEL_ID = '1510696692909998201';

let lastActivity = Date.now();
let lastTalk = 0;
let mood = "normal";
const insultKeywords = [
  'tonto', 'idiota', 'estúpido', 'basura', 'imbecil', 'mierda', 'noob', 'maldito',
  'stupid', 'idiot', 'trash', 'noob', 'dumb', 'shit', 'loser'
];

const insultReplies = [
  // Español
  "Hee-Ho... tus palabras se congelan antes de llegar, ho!",
  "Hee-Ho! Eso no me afecta, soy hielo eterno, ho!",
  "Hee-Ho! El insulto se rompió como hielo débil, ho!",
  "Hee-Ho! No puedes derretir mi espíritu, ho!",

  // English
  "Hee-Ho... your words freeze before they reach me, ho!",
  "Hee-Ho! That doesn't affect me, I'm eternal ice, ho!",
  "Hee-Ho! Your insult shattered like weak ice, ho!",
  "Hee-Ho! You can't melt my spirit, ho!"
];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const msg = message.content.toLowerCase();

if (insultKeywords.some(word => msg.includes(word))) {
  return message.channel.send(getRandom(insultReplies));
}
const jackFrost = {
  normal: [
    "Hee-Ho! El hielo observa en silencio, ho!",
    "Hee-Ho! El clan sigue creciendo, ho!",
    "Hee-Ho! ¿Quién será el más fuerte, ho?"
  ],
  hype: [
    "HEE-HO! ¡El poder del clan es enorme, ho!",
    "Hee-Ho! ¡Esto se está poniendo interesante, ho!",
    "Hee-Ho! ¡El ranking está en movimiento, ho!"
  ],
  chill: [
    "Hee-Ho... todo está en calma, ho...",
    "Hee-Ho... observo en silencio, ho..."
  ],
  angry: [
    "Hee-Ho!! ¡Entrenad más, ho!",
    "Hee-Ho! ¡El hielo exige más poder!"
  ]
};

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 🚀 READY
client.once('ready', () => {
  console.log(`🤖 Bot conectado como ${client.user.tag}`);
});

// 📩 MESSAGE SYSTEM
client.on('messageCreate', (message) => {
  if (message.author.bot) return;

  lastActivity = Date.now();

  const args = message.content.split(' ');
  const cmd = args[0];
  const users = message.mentions.users;

  // ❄️ JACK FROST REACT (MENTION)
  if (message.mentions.has(client.user)) {
    return message.channel.send(getRandom(jackFrost[mood]));
  }

  // 🎭 MOOD CONTROL
  const content = message.content.toLowerCase();

  if (content.startsWith('!raid')) mood = "hype";
  if (content.startsWith('!clanwar')) mood = "angry";
  if (content.startsWith('!entrenamiento')) mood = "normal";

  // =========================
  // 🆘 HELP
  // =========================
  if (cmd === '!help') {
    const embed = new EmbedBuilder()
      .setColor(0x00AEFF)
      .setTitle('🆘 RPG CLAN HELP')
      .addFields(
        { name: '🎮 GENERAL', value: '!pa !ranking !panel' },
        { name: '⚔️ ACTIVITY', value: '!raid !entrenamiento !clanwar' },
        { name: '🔵 PD', value: '!addpd !removepd !viewpd' },
        { name: '🟢 PA ADMIN', value: '!addpa !removepa' }
      )
      .setFooter({ text: 'Hee-Ho RPG System ❄️' });

    return message.channel.send({ embeds: [embed] });
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

    return message.reply('⚔️ +1 PA RAID Hee-Ho!');
  }

  // =========================
  // 🏋️ TRAIN
  // =========================
  if (cmd === '!entrenamiento') {
    if (!canActivity(message.member))
      return message.reply('❌ Sin permisos.');

    users.forEach(u => pa[u.id] = get(pa, u.id) + 1);
    savePA();

    return message.reply('🏋️ +1 PA Hee-Ho!');
  }

  // =========================
  // ⚔️ CLANWAR
  // =========================
  if (cmd === '!clanwar') {
    if (!canActivity(message.member))
      return message.reply('❌ Sin permisos.');

    users.forEach(u => pa[u.id] = get(pa, u.id) + 2);
    savePA();

    return message.reply('⚔️ +2 PA CLAN WAR!');
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

    return message.reply(`✅ +${amount} PA a ${target.username}`);
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

    return message.reply(`⚠️ -${amount} PA a ${target.username}`);
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
      default: return message.reply('Tipo inválido');
    }

    pd[target.id] = get(pd, target.id) + value;
    savePD();

    return message.reply(`📦 +${value} PD a ${target.username}`);
  }

  // =========================
  // 👀 VIEW PD
  // =========================
  if (cmd === '!viewpd') {
    const user = users.first() || message.author;
    return message.reply(`📦 ${user.username}: ${get(pd, user.id)} PD`);
  }
});

// ❄️ JACK FROST HABLA SOLO
setInterval(async () => {
  const now = Date.now();

  const channel = client.channels.cache.get(TARGET_CHANNEL_ID);
  if (!channel) return;

  const active = now - lastActivity < 60 * 60 * 1000;
  const cooldown = now - lastTalk > 12 * 60 * 1000;

  if (!active || !cooldown) return;

  const line = getRandom(jackFrost[mood]);

  try {
    await channel.send(line);
    lastTalk = now;
  } catch (err) {
    console.error(err);
  }
}, 3 * 60 * 1000);

// 🛡️ ANTI CRASH
process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);

// 🔑 LOGIN
client.login(process.env.TOKEN);
