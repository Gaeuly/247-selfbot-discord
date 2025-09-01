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

            .setName('Chess.com')

            .setDetails('gaeulychess')

            .setState('Ello 2521')

            .setStartTimestamp(Date.now())

            .setAssetsLargeImage('https://cdn.discordapp.com/attachments/1143454887204634676/1407732206436220968/download.png?ex=68a72c48&is=68a5dac8&hm=0db3fc7e24f00f16b25aafa158ed40c0c2a55dd660a68a16148e996e7336bd49&')

            .setAssetsLargeText('Coding is fun!')

            .setAssetsSmallImage('https://cdn.discordapp.com/attachments/1143454887204634676/1407732252649197629/05f71305f0055b150662ca3df401da48.jpg?ex=68a72c53&is=68a5dad3&hm=6d206bda36a25e217fa5253d6bdbe2547829e40f3f31d6a32f891f0298085a5c&')

            .setAssetsSmallText('TypeScript')

            .addButton('Chess', 'https://github.com/Gaeuly')

            .addButton('Join', 'https://gaeuly.my.id/');

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