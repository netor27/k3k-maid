const voiceChannelType = 'voice';
const nameSeparator = '-';

class VoiceChannels {

	onUserLeavesChannel(channel) {
		try {
			if (channel == null) {
				return;
			}
			// get the number of the channel
			const channelData = this.getChannelNameData(channel.name);
			if (channelData == undefined) {
				return;
			}

			// if this is a channel without category, don't do nothing
			if (channel.parent == null || channel.parent == undefined) {
				return;
			}

			// if the channel still has members
			// dont'do nothing
			if (channel.members.size > 0) {
				return;
			}

			// if its the #1 channel, check the others and erase the empty ones
			if (channelData.number == 1) {
				this.cleanupEmptyChannels(channel, channelData.prefix);
				return;
			}
			else if (this.anotherEmptyChannelExists(channel, channelData.prefix, channelData.number)) {
				channel.delete('Unused channel');
			}
		}
		catch (error) {
			console.error(error);
		}

	}

	onUserJoinsChannel(channel) {
		try {
			if (channel == null) {
				return;
			}
			// get the number of the channel
			const channelData = this.getChannelNameData(channel.name);
			if (channelData == undefined) {
				return;
			}

			// if this is a channel without category, don't do nothing
			if (channel.parent == null || channel.parent == undefined) {
				return;
			}

			// if we don't have another empty channel, clone this one with the same prefix, but an increased number
			if (!this.anotherEmptyChannelExists(channel, channelData.prefix, channelData.number)) {
				const n = this.getMaxChannelNumber(channel, channelData.prefix) + 1;
				channel.clone({ name: channelData.prefix + ' ' + nameSeparator + ' ' + n, reason: 'Created because no empty channels existed.' })
					.then(newChannel => {
						newChannel.setParent(channel.parent.id);
					});
			}
		}
		catch (error) {
			console.error(error);
		}

	}

	getChannelNameData(channelName) {
		const splitted = channelName.split(nameSeparator);
		if (splitted.length != 2) {
			return undefined;
		}
		try {
			const prefix = splitted[0].trim();
			const number = parseInt(splitted[1].trim(), 10);
			return { prefix: prefix, number: number };
		}
		catch (error) {
			console.error(error);
			return undefined;
		}
	}

	anotherEmptyChannelExists(channel, channelPrefix, channelNumber) {
		let foundAnotherEmptyChannel = false;

		// iterate over all the channels parent category
		channel.parent.children.forEach(item => {
			// check only voice channel types
			if (item.type == voiceChannelType) {
				const channelData = this.getChannelNameData(item.name);

				// if the other channel has the same prefix, a different number and it's empty, return true
				if (channelData != undefined && channelData.prefix == channelPrefix && channelData.number != channelNumber && item.members.size == 0) {
					foundAnotherEmptyChannel = true;
				}
			}
		});
		return foundAnotherEmptyChannel;
	}

	getMaxChannelNumber(channel, channelPrefix) {
		let maxNumber = 0;
		if (channel.parent == null || channel.parent == undefined) {
			return maxNumber;
		}

		// iterate over all the channels parent category
		channel.parent.children.forEach(item => {
			// check only voice channel types
			if (item.type == voiceChannelType) {
				const channelData = this.getChannelNameData(item.name);
				// if the other channel has the same prefix, a different number and it's empty, return true
				if (channelData != undefined && channelData.prefix == channelPrefix && channelData.number >= maxNumber) {
					maxNumber = channelData.number;
				}
			}
		});
		return maxNumber;
	}

	cleanupEmptyChannels(channel, channelPrefix) {
		// iterate over all the channels parent category
		channel.parent.children.forEach(item => {
			// check only voice channel types
			if (item.type == voiceChannelType) {
				const channelData = this.getChannelNameData(item.name);

				// if the other channel has the same prefix, it's not the #1 and it's empty, delete the channel
				if (channelData != undefined && channelData.prefix == channelPrefix && channelData.number != 1 && item.members.size == 0) {
					item.delete('Unused channel');
				}
			}
		});
	}
}

module.exports = VoiceChannels;
