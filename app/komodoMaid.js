// load .env variables
require('dotenv').config();
const config = require('./config.json');
const prefix = process.env.COMMAND_PREFIX;

const Discord = require('discord.js');
const bot = new Discord.Client();
const VoiceChannels = require('./helpers/voiceChannels');

bot.on('voiceStateUpdate', (oldMember, newMember) => {
	try {
		const newUserChannel = newMember.channel;
		const oldUserChannel = oldMember.channel;
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
	}
	catch (error) {
		console.error(error);
	}
});

bot.on('message', message => {
	try {
		if (!message.content.startsWith(prefix) || message.author.bot) {
			return;
		}
		const args = message.content.slice(prefix.length).split(/ +/);
		const commandName = args.shift().toLowerCase();
		if (commandName == 'version') {
			message.channel.send(`Bot version: ${config.version}`);
		}
	}
	catch (error) {
		console.error(error);
	}

});


// start the bot
bot.login(process.env.DISCORD_BOT_TOKEN);
