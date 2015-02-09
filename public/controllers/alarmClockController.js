var AlarmClockController = {
	fireAlarm : function() {
		console.log('firing alarm!');
		var link = document.getElementById('musicloc').value;
		if (link) {
			AlarmClockController.openInBackground(link);
		} else {
			AlarmClockController.playAudio("http://www.palantir.net/2001/tma1/wav/zarathustra.wav");
		}
	},
	setAlarm : function(hours, minutes, seconds) {
		this.alarm.setWakeTime(hours, minutes, seconds);
	},
	viewDidLoad : function() {
		this.setBackgroundVideo( { id: 'e4Is32W-ppk' } );
		if (top.Controller) {
			this.controller = top.Controller;
			this.controller.alarmClockController = this;
			this.hal = this.controller.hal;
		} else {
			this.hal = new Hal(this);
		}
		this.hal.setWakeTimeCallback(this.setAlarm);
		this.alarm = new Alarm(this.fireAlarm, document.getElementById('currentTimeElement'), document.getElementById('wakeHoursInput'), document.getElementById('wakeMinutesInput'), document.getElementById('wakeSecondsInput'));
		this.alarm.start();
	},
	stopAlarm : function() {
		this.controller.clearAudio();
	},
	snoozeAlarm : function(minutes) {
		if (!minutes) {
			minutes = 5;
		}
		this.alarm.addMinutes(minutes);
	},
	setBackgroundVideo : function(options) {
		BackgroundVideoController.playVideo(options);
	},
	playAudio : function(location) {
		this.controller.playAudio(location);
	},
	clearAudio : function() {
		this.controller.clearAudio();
	},
	openInBackground : function(url) {
		if (this.controller) {
			this.controller.openInBackground(url);
		} else {
			window.open(url, 'background');
		}
	}
};

function random(max, min) {
	if (min == null) { min = 0; }
	var r = Math.floor((Math.random() * 1000));
	var mod = (max-min) + 1;
	return (r % mod) + min;
}
