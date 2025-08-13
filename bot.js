const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel } = require("@discordjs/voice");

// --- Pemuatan Konfigurasi yang Aman ---
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

const client = new Client({ checkUpdate: false });

// --- Fungsi Utama ---

client.on('ready', async () => {
    console.log(`Berhasil login sebagai ${client.user.tag}!`);

    // Atur status "Playing"
    setPlayingActivity();

    // Langsung join VC saat startup
    await joinVC();
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    // Hanya peduli jika itu adalah akun kita sendiri
    if (oldState.member.id !== client.user.id) return;

    // Jika kita terputus dari VC atau pindah ke channel yang salah, gabung kembali
    const targetChannelId = config.Channel;
    if (newState.channelId !== targetChannelId) {
        console.log("Terdeteksi keluar dari voice channel. Mencoba bergabung kembali...");
        setTimeout(joinVC, 3000); // Tunggu 3 detik sebelum join lagi
    }
});

// --- Fungsi Pembantu ---

/**
 * Mengatur status Rich Presence statis untuk pengguna.
 */
function setPlayingActivity() {
    // ## INI BAGIAN YANG DIPERBAIKI ##
    // Menghapus .then() karena tidak didukung.
    // Menggunakan try...catch untuk menangani error jika terjadi.
    try {
        client.user.setActivity({
            name: 'Visual Studio Code',
            type: 'PLAYING',
            details: 'Working on a project',
            state: 'Coding in Angular',
            timestamps: {
                start: Date.now()
            },
            assets: {
                large_image: 'https://i.imgur.com/UksaRTx.png',
                large_text: 'Visual Studio Code',
                small_image: 'https://i.imgur.com/bpL0ItM.png',
                small_text: 'Angular'
            }
        });
        console.log('Berhasil mengatur status "Playing Visual Studio Code".');
    } catch (error) {
        console.error("Gagal mengatur status activity:", error);
    }
}

async function joinVC() {
    try {
        const guild = client.guilds.cache.get(config.Guild);
        if (!guild) {
            console.error('Guild tidak ditemukan. Periksa kembali Guild ID di config.');
            return;
        }

        const voiceChannel = guild.channels.cache.get(config.Channel);
        if (!voiceChannel || voiceChannel.type !== 'GUILD_VOICE') {
            console.error('Voice channel tidak ditemukan atau ID salah. Periksa kembali Channel ID di config.');
            return;
        }

        console.log(`Mencoba bergabung ke channel: ${voiceChannel.name} di server: ${guild.name}`);
        joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: true
        });
        console.log("Berhasil bergabung ke voice channel!");

    } catch (error) {
        console.error("Gagal bergabung ke voice channel:", error);
    }
}

// --- Login ke Discord ---
client.login(config.Token);
