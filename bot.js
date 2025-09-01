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

            .setState('zZZ')

            .setStartTimestamp(Date.now())

            .setAssetsLargeImage('https://cdn.discordapp.com/attachments/1143454887204634676/1411873795987472425/70c13819595845e79d953cf41cb7dea9.gif?ex=68b63d70&is=68b4ebf0&hm=ac9ae0277718a284fe15de3703846799db70d8776b7ba918761194b6f23ff5a6&')

            .setAssetsLargeText('Coding is fun!')

            .setAssetsSmallImage('https://cdn.discordapp.com/attachments/1143454887204634676/1411873823703171102/eb7e0fab3f96dd0b7d5faf6237235330.jpg?ex=68b63d76&is=68b4ebf6&hm=7ac649c0effa4a002696f95339dc5ac6096b1324b1fb952802b8f5d7d13ec008&')

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

            selfMute: false,

        });

    } catch (error) {

        console.error("Gagal bergabung ke voice channel:", error);

    }

}

// --- Login ke Discord ---

client.login(config.Token);
