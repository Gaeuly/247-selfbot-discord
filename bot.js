// --- Dependensi yang Dibutuhkan ---
const Discord = require('discord.js-selfbot-v13');
const { joinVoiceChannel } = require("@discordjs/voice");

// --- Pemuatan Konfigurasi dari config.json ---
let config;
try {
    config = require(`${process.cwd()}/config.json`);
} catch (error) {
    console.error("Error: config.json tidak ditemukan atau formatnya salah! Harap buat file config.json.");
    process.exit(1);
}

// Validasi isi config
if (!config.Token || !config.Guild || !config.Channel) {
    console.error("Error: Token, Guild ID, atau Channel ID tidak ada di config.json!");
    process.exit(1);
}

const client = new Discord.Client({ checkUpdate: false });

// --- Fungsi Utama Saat Bot Online ---
client.on('ready', async () => {
    console.log(`Berhasil login sebagai ${client.user.tag}!`);

    // Hanya bergabung ke Voice Channel tanpa Rich Presence
    await joinVC();
});

// --- Logika untuk Join Ulang Voice Channel ---
client.on('voiceStateUpdate', async (oldState, newState) => {
    if (oldState.member.id !== client.user.id) return;

    const targetChannelId = config.Channel;
    if (newState.channelId !== targetChannelId) {
        console.log("Terdeteksi keluar dari voice channel. Mencoba bergabung kembali dalam 3 detik...");
        setTimeout(joinVC, 3000);
    }
});

/**
 * Fungsi untuk bergabung ke Voice Channel
 */
async function joinVC() {
    try {
        const guild = client.guilds.cache.get(config.Guild);
        if (!guild) {
            console.error('Guild tidak ditemukan. Periksa kembali Guild ID di config.');
            return;
        }
        const voiceChannel = guild.channels.cache.get(config.Channel);
        if (!voiceChannel || voiceChannel.type !== 'GUILD_VOICE') {
            console.error('Voice channel tidak ditemukan atau ID salah. Periksa kembali Channel ID.');
            return;
        }

        console.log(`Mencoba bergabung ke channel: ${voiceChannel.name}`);
        joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: true
        });
    } catch (error) {
        console.error("Gagal bergabung ke voice channel:", error);
    }
}

// --- Login ke Discord ---
client.login(config.Token);
