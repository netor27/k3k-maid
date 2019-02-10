// load .env variables
require('dotenv').config();
const config = require('./config.json');
const prefix = process.env.COMMAND_PREFIX;

const Discord = require('discord.js');
const bot = new Discord.Client();

const VoiceChannels = require('./helpers/voiceChannels');

bot.on('voiceStateUpdate', (oldMember, newMember) => {
	const newUserChannel = newMember.voiceChannel;
	const oldUserChannel = oldMember.voiceChannel;
	const handler = new VoiceChannels();
	// if the old user channel is not undefined, it means the user
	// leaved a channel
	if (oldUserChannel !== undefined) {
		handler.onUserLeavesChannel(oldUserChannel);
	}

	// if the new user channel is not undefined, it means the user
	// joined a channel
	if (newUserChannel !== undefined) {
		handler.onUserJoinsChannel(newUserChannel);
	}
});

bot.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) {
		return;
	}
	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();
	if (commandName == 'version') {
		message.channel.send(`Bot version: ${config.version}`);
	}
});


// start the bot
bot.login(process.env.DISCORD_BOT_TOKEN);
