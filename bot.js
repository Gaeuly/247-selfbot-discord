const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel } = require("@discordjs/voice");
// REMOVED: axios and fs are no longer needed.

// --- Secure Configuration Loading ---
let config;
try {
    config = require(`${process.cwd()}/config.json`);
} catch (error) {
    console.error("Error: config.json not found or has incorrect format! Please create it.");
    process.exit(1);
}

// Validate config content
if (!config.Token || !config.Guild || !config.Channel) {
    console.error("Error: Token, Guild ID, or Channel ID is missing in config.json!");
    process.exit(1);
}

const client = new Client({ checkUpdate: false });

// --- Main Functions ---

client.on('ready', async () => {
    console.log(`Successfully logged in as ${client.user.tag}!`);

    // NEW: Set the "Playing" activity status
    setPlayingActivity();

    // Join the specified voice channel on startup
    await joinVC();
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    // Only care if it's our own account
    if (oldState.member.id !== client.user.id) return;

    // If we get disconnected or moved to a different channel, rejoin
    const targetChannelId = config.Channel;
    if (newState.channelId !== targetChannelId) {
        console.log("Detected disconnection from the voice channel. Rejoining...");
        // Wait 3 seconds before rejoining to avoid spamming
        setTimeout(joinVC, 3000);
    }
});

// --- Helper Functions ---

/**
 * NEW: Sets a static Rich Presence activity for the user.
 */
function setPlayingActivity() {
    // The setActivity function from the library handles the complex presence update
    client.user.setActivity({
        name: 'Visual Studio Code', // Main name of the activity (e.g., the game)
        type: 'PLAYING',           // Activity type: PLAYING, WATCHING, LISTENING, STREAMING

        // These are the lines of text that show up in the profile
        details: 'Working on a project', // The top, larger text line
        state: 'Coding in Angular',    // The bottom, smaller text line

        // This makes the "00:00 elapsed" timer appear and count up
        timestamps: {
            start: Date.now()
        },

        // NOTE: Assets (images) are tricky for self-bots. Discord might show the
        // official VS Code icon automatically. These keys are placeholders and may
        // or may not work. The text will always work.
        assets: {
            large_image: 'vscode_icon', // A placeholder key for the large image
            large_text: 'Visual Studio Code', // Tooltip for the large image
            small_image: 'angular_icon',  // Placeholder for the small image
            small_text: 'Angular'         // Tooltip for the small image
        }
    }).then(() => {
        console.log('Successfully set "Playing Visual Studio Code" activity.');
    }).catch(console.error);
}


async function joinVC() {
    try {
        const guild = client.guilds.cache.get(config.Guild);
        if (!guild) {
            console.error('Guild not found. Please check the Guild ID in config.');
            return;
        }

        const voiceChannel = guild.channels.cache.get(config.Channel);
        if (!voiceChannel || voiceChannel.type !== 'GUILD_VOICE') {
            console.error('Voice channel not found or ID is wrong. Please check the Channel ID.');
            return;
        }

        console.log(`Attempting to join channel: ${voiceChannel.name} in server: ${guild.name}`);
        joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: true
        });
        console.log("Successfully joined the voice channel!");

    } catch (error) {
        console.error("Failed to join the voice channel:", error);
    }
}

// --- Login to Discord ---
client.login(config.Token);
