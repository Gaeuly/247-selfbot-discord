// --- Dependensi yang Dibutuhkan ---

const Discord = require('discord.js-selfbot-v13');

const { joinVoiceChannel } = require('@discordjs/voice');

// --- Pemuatan Konfigurasi dari config.js ---

let config;

try {

    config = require(`${process.cwd()}/config.js`);

} catch (error) {

    console.error('Error: config.js tidak ditemukan atau formatnya salah!');

    process.exit(1);

}

// Validasi isi config

if (!config.Token || !config.Guild || !config.Channel) {

    console.error("Error: Token, Guild ID, atau Channel ID tidak ada di config.js!");

    process.exit(1);

}

const client = new Discord.Client({ checkUpdate: false });

// --- Fungsi Utama Saat Bot Online ---

client.on('ready', async () => {

    // console.log(`Berhasil login sebagai ${client.user.tag}!`);

    // Jika Rich Presence diaktifkan

    if (config.enableRichPresence) {

        setStaticRichPresence();

    }

    // Jika Voice Join diaktifkan

    if (config.enableVoiceJoin) {

        await joinVC();

    }

});

// Join ulang ketika ter‐disconnect dari VC, hanya jika fitur voice diaktifkan

client.on('voiceStateUpdate', async (oldState, newState) => {

    if (!config.enableVoiceJoin) return;

    if (oldState.member.id !== client.user.id) return;

    const targetChannelId = config.Channel;

    if (newState.channelId !== targetChannelId) {

        console.log("Terdeteksi keluar dari voice channel. Mencoba bergabung kembali dalam 3 detik...");

        setTimeout(joinVC, 3000);

    }

});

/**

 * Mengatur status Rich Presence (PLAYING)

 */

function setStaticRichPresence() {

    try {

        const rpc = new Discord.RichPresence(client)

            .setType('PLAYING')

            .setName('Sleeping')

            .setDetails('In the bed')

            .setState('')

            .setStartTimestamp(Date.now())

            .setAssetsLargeImage('https://i.imgur.com/LrROxNP.gif')

            .setAssetsLargeText('Coding is fun!')

            .setAssetsSmallImage('https://i.imgur.com/AswzxJ8.jpeg')

            .setAssetsSmallText('TypeScript')

            .addButton('Github', 'https://github.com/Gaeuly')

            .addButton('Mybed', 'https://gaeuly.my.id/');

        client.user.setActivity(rpc);

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

            console.error('Guild tidak ditemukan. Periksa kembali Guild ID di config.js.');

            return;

        }

        const voiceChannel = guild.channels.cache.get(config.Channel);

        if (!voiceChannel || voiceChannel.type !== 'GUILD_VOICE') {

            console.error('Voice channel tidak ditemukan atau salah ID.');

            return;

        }

        console.log(`Mencoba bergabung ke channel: ${voiceChannel.name}`);

        joinVoiceChannel({

            channelId: voiceChannel.id,

            guildId: guild.id,

            adapterCreator: guild.voiceAdapterCreator,

            selfDeaf: false,

            selfMute: true,

        });

    } catch (error) {

        console.error("Gagal bergabung ke voice channel:", error);

    }

}

// --- Login ke Discord ---

client.login(config.Token);
