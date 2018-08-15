const helpers = {
	getReadableTime: (time, showSeconds = false) => {
		time = new Date(time);

		if (showSeconds) {
			time = `${String(time.getUTCHours()).padStart(2, '00')}:${String(time.getUTCMinutes()).padStart(2, '00')}:${String(time.getUTCSeconds()).padStart(2, '00')}`;
		} else {
			time = `${String(time.getUTCHours()).padStart(2, '00')}:${String(time.getUTCMinutes()).padStart(2, '00')}`;
		}

		return time;
	},

	isBotMentioned: (msg, Client) => {
		return msg.mentions.users.has(Client.user.id);
	},

	convert24to12: (hour, returnString = true) => {
		const string = hour < 12 ? ' AM' : ' PM';
		return `${(hour % 12) || 12}${returnString ? string : ''}`;
	}
};

export default helpers;
