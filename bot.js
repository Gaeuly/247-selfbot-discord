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

    // 1. Mengatur Rich Presence yang baru
    setStaticRichPresence();

    // 2. Bergabung ke Voice Channel
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


// --- Fungsi Pembantu ---

/**
 * Mengatur status Rich Presence (PLAYING) yang statis menggunakan metode builder.
 */
function setStaticRichPresence() {
    console.log("Mencoba mengatur Rich Presence...");
    try {
        // Menggunakan builder RichPresence dari skrip keduamu
        const rpc = new Discord.RichPresence(client)
            .setType('PLAYING')
            .setName('Visual Studio Code')
            .setDetails('Working on a new feature')
            .setState('Coding in an awesome project')
            .setStartTimestamp(Date.now()) // Timer "elapsed"
            
            // PENTING: Ganti link di bawah dengan link dari CDN Discord milikmu
            .setAssetsLargeImage('https://cdn.discordapp.com/attachments/1143454887204634676/1405114958659715185/UksaRTx_-_Imgur.png?ex=689da6c7&is=689c5547&hm=0f329153df9f6f0754771dca5d9d8527ed3121be0969fced74cf85d9909cefe3&')
            .setAssetsLargeText('Coding is fun!')
            .setAssetsSmallImage('https://cdn.discordapp.com/attachments/1143454887204634676/1405114994592321557/Vmake1755073967146.png?ex=689da6d0&is=689c5550&hm=46dcce793e3c69847b5994704557f68184233055f65fd3ce1f0e5c51ff37502d&')
            .setAssetsSmallText('TypeScript')

            // Menambahkan tombol seperti di contoh skrip keduamu
            .addButton('GitHub', 'https://github.com/Gaeuly')
            .addButton('Portfolio', 'https://gaeuly.my.id/');

        client.user.setActivity(rpc);
        console.log('Berhasil mengatur Rich Presence activity.');
    } catch (error) {
        console.error("Gagal mengatur Rich Presence:", error);
    }
}

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
        console.log("Berhasil bergabung ke voice channel!");
    } catch (error) {
        console.error("Gagal bergabung ke voice channel:", error);
    }
}

// --- Login ke Discord ---
client.login(config.Token);
