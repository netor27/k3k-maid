const voiceChannelType = 'voice';
const nameSeparator = '-';

class VoiceChannels {

	onUserLeavesChannel(channel) {
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
		// or the number suffix of the channel is 1
		// dont'do nothing
		if (channel.members.size > 0 || channelData.number == 1) {
			return;
		}

		if (this.anotherEmptyChannelExists(channel, channelData.prefix, channelData.number)) {
			channel.delete('Unused channel');
		}
	}

	onUserJoinsChannel(channel) {
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
			channel.clone(channelData.prefix + ' ' + nameSeparator + ' ' + n, true, true, 'Created because no empty channels existed.')
				.then(newChannel => {
					newChannel.setParent(channel.parent.id);
				});
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
				if (channelData.prefix == channelPrefix && channelData.number != channelNumber && item.members.size == 0) {
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
				if (channelData.prefix == channelPrefix && channelData.number >= maxNumber) {
					maxNumber = channelData.number;
				}
			}
		});
		return maxNumber;
	}
}

module.exports = VoiceChannels;
