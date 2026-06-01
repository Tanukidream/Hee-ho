const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
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

function save(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function get(obj, id) {
  if (!obj[id]) obj[id] = 0;
  return obj[id];
}

// =====================
// ROLES
// =====================
const roles = ['loki', 'Captain'];

function isLeader(member) {
  return member?.roles?.cache?.some(r => roles.includes(r.name));
}

function canActivity(member) {
  return member?.roles?.cache?.some(r => roles.includes(r.name));
}

// =====================
// JACK FROST
// =====================
let lastActivity = Date.now();
let lastTalk = 0;

const heeHoMessages = [
  "Hee-Ho! ❄️ Hee-Ho System",
  "Hee-Ho! The ice is alive!",
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

    channel.send(rand(heeHoMessages));
    lastTalk = now;

  }, 10 * 60 * 1000);
});

// =====================
// MESSAGE SYSTEM
// =====================
client.on('messageCreate', (message) => {
  if (message.author.bot) return;

  lastActivity = Date.now();

  const args = message.content.trim().split(/ +/);
  const cmd = args[0].toLowerCase();
  const users = message.mentions.users;

  // ❄️ HEEHO COMMAND (FIXED)
  if (cmd === '!heeho') {
    return message.channel.send(rand(heeHoMessages));
  }

  // ❌ ERROR HELP (cuando escriben mal comandos importantes)
  const validCommands = ['!pa','!ranking','!panel','!heeho','!addpa','!removepa'];

  if (cmd.startsWith('!') && !validCommands.includes(cmd)) {
    return message.reply(
      "❄️ Comando incorrecto.\nEjemplo: `!pa`, `!ranking`, `!panel`, `!heeho`"
    );
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
      .sort((a,b)=>b[1]-a[1])
      .slice(0,10);

    let msg = "🏆 RANKING PA:\n";
    sorted.forEach((u,i)=>{
      msg += `${i+1}. <@${u[0]}> — ${u[1]} PA\n`;
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
        { name: 'PA', value: `${get(pa,user.id)}`, inline:true },
        { name: 'PD', value: `${get(pd,user.id)}`, inline:true }
      );

    return message.channel.send({ embeds:[embed] });
  }

  // =====================
  // RAID
  // =====================
  if (cmd === '!raid') {
    if (!canActivity(message.member)) {
      return message.reply("❄️ No tienes permisos.");
    }

    users.forEach(u => pa[u.id] = get(pa,u.id)+1);
    save(paFile, pa);

    return message.reply("❄️ +1 PA RAID");
  }

  // =====================
  // REMOVE PA (FIX + HELP)
  // =====================
  if (cmd === '!removepa') {
    if (!isLeader(message.member)) {
      return message.reply("❄️ Uso correcto: `!removepa @user cantidad`");
    }

    const target = users.first();
    const amount = parseInt(args[2]);

    if (!target || isNaN(amount)) {
      return message.reply("❄️ Uso correcto: `!removepa @user cantidad`");
    }

    pa[target.id] = get(pa,target.id) - amount;
    save(paFile, pa);

    return message.reply(`❄️ -${amount} PA`);
  }

});

// =====================
// LOGIN (IMPORTANT CHECK)
// =====================
if (!process.env.TOKEN) {
  console.log("❌ TOKEN no encontrado en environment variables");
}

client.login(process.env.TOKEN);
