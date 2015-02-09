var AlarmClockController = function(){};

AlarmClockController.prototype.fireAlarm = function() {
	console.log('firing alarm!');
	var link = document.getElementById('musicloc').value;
	if (link) {
		this.openInBackground(link);
	} else {
		this.playAudio("http://www.palantir.net/2001/tma1/wav/zarathustra.wav");
	}
}

AlarmClockController.prototype.setAlarm = function(hours, minutes, seconds) {
	this.alarm.setWakeTime(hours, minutes, seconds);
}

AlarmClockController.prototype.viewDidLoad = function() {
	this.setBackgroundVideo( { id: 'e4Is32W-ppk' } );
	if (top.controller) {
		this.controller = top.controller;
		this.controller.alarmClockController = this;
		this.hal = this.controller.hal;
	} else {
		this.hal = new Hal(this);
	}
	this.hal.setWakeTimeCallback(this.setAlarm);
	this.alarm = new Alarm(this.fireAlarm.bind(this), document.getElementById('currentTimeElement'), document.getElementById('wakeHoursInput'), document.getElementById('wakeMinutesInput'), document.getElementById('wakeSecondsInput'));
	this.alarm.start();
}

AlarmClockController.prototype.stopAlarm = function() {
	this.controller.clearAudio();
}

AlarmClockController.prototype.snoozeAlarm = function(minutes) {
	if (!minutes) {
		minutes = 5;
	}
	this.alarm.addMinutes(minutes);
}

AlarmClockController.prototype.setBackgroundVideo = function(options) {
	BackgroundVideoController.playVideo(options);
}

AlarmClockController.prototype.playAudio = function(location) {
	this.controller.playAudio(location);
}

AlarmClockController.prototype.clearAudio = function() {
	this.controller.clearAudio();
}

AlarmClockController.prototype.openInBackground = function(url) {
	if (this.controller) {
		this.controller.openInBackground(url);
	} else {
		window.open(url, 'background');
	}
}

var controller = new AlarmClockController();
