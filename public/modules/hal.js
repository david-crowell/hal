var globalHal;

var Hal = function(controller) {
	this.controller = controller;
	globalHal = this;
};

Hal.prototype.start = function() {
	var recognition = new webkitSpeechRecognition();
	recognition.continuous = true;
	recognition.interim = true;
	recognition.onresult = this.handleEvent;
	recognition.onend = function(end) {
		recognition.start();
	}
	recognition.onerror = function(err) {
		console.log('Error: ' + err.toString());
		recognition.start();
	}
	recognition.start();
	return recognition;
}

Hal.prototype.setWakeTimeCallback = function(callback) {
	this.wakeTimeCallback = callback;
	console.log("set it");
	globalHal = this;
}

Hal.prototype.handleEvent = function(event) {
	for (var i = event.resultIndex; i < event.results.length; ++i) {
		for (var j = 0; j < event.results[i].length; j++) {
			globalHal.parseForCommand(event.results[i][j].transcript);
		};
    }
}

Hal.prototype.parseForCommand = function(text) {
	text = this.trimBeginningSpaces(text.toLowerCase());
	if (this.startsWithName(text)) {
		this.controller.log("Keyword found: " + text);
		if (this.tryConfirm(text)) return;
		if (this.tryOpenWidget(text)) return;
		if (this.trySetAlarmFor(text)) return;
		if (this.trySnoozeAlarm(text)) return;
		if (this.tryStopAlarm(text)) return;
		if (this.tryPlay(text)) return;
		if (this.tryPause(text)) return;
	} else {
		var savingThrow = this.tryGoodEvening(text);
		savingThrow = savingThrow || this.tryStopAlarm(text);
		if (!savingThrow) {
			console.log("No command matched: " + text);
		}
	}
}

Hal.prototype.startsWithName = function(text) {
	var lower = text.toLowerCase();
	var parts = lower.split(' ');
	var matches = {'hal':1,'how':1,'jarvis':1,'foul':1,'hal':1};
	if (parts[0] in matches) {
		return true;	
	} else {
		return false;
	}
}

Hal.prototype.trimBeginningSpaces = function(str) {
	var first = str[0];
	var last = str[str.length - 1];
	if (first == ' ') {
		str = str.slice(1,str.length);
		return this.trimBeginningSpaces(str);
	} else {
		return str;
	}
}

Hal.prototype.fixNumberParsing = function(input) {
	input = input.replace('for','4');
	input = input.replace('to','2');
	input = input.replace('too','2');
	input = input.replace('won', '1');
	input = input.replace('tin', '10');
	return input;
}

Hal.prototype.tryConfirm = function(text) {
	if (!(/confirm/.test(text))) return false;

	if (text.split(' ').length > 5) {
		//probably not right
		return false;
	}
	else {
		if (this.confirmationCallback) {
			this.confirmationCallback(true);
			this.confirmationCallback = null;
		} else {
			this.controller.log("null confirmation");
		}
	}
	return true;
}

Hal.prototype.tryOpenWidget = function(text) {
	if (!(/open/.test(text))) return false;

	var openPhrase = /.* open .*/.exec(text)[0]; // should be 'hal open <app> <maybe other stuff>'
	var openParts = openPhrase.split(' '); // ['hal','open','<app>','<maybe>','<other>','<stuff>']
	var appNameParts = openParts.slice(2); // '12'
	if (appNameParts[0] == 'open') {
		appNameParts = appNameParts.slice(1);
	}
	this.controller.log('Trying to open widget: ' + appNameParts);

	if (tryMenu(appNameParts)) {
		this.controller.openMenu();
		return true;
	} else if (trySpotifyRemote(appNameParts)) {
		this.controller.openSpotifyRemote()
		return true;
	} else if (tryAlarmClock(appNameParts)) {
		this.controller.openAlarmClock();
		return true;
	} else if (trySpace(appNameParts)) {
		this.controller.openSpace();
		return true;
	}
	return false;

	function trySpotifyRemote(appNameParts) {
		if (appNameParts.length > 5) return false;
		return appNameParts[0] in {
			'spotify':true
		}
	}

	function tryMenu(appNameParts) {
		if (appNameParts.length > 5) return false;
		return appNameParts[0] in {
			'menu':true,
			'many':true
		}
	}

	function tryAlarmClock(appNameParts) {
		if (appNameParts.length > 5) return false;
		var matches = { 'alarm': true };
		for (var i = 0; i < appNameParts.length; i++) {
			if (appNameParts[i] in matches) return true;
		};
		return false;
	}

	function trySpace(appNameParts) {
		if (appNameParts.length > 5) return false;
		return appNameParts[0] in {
			'space':true
		}
	}
}

Hal.prototype.tryGoodEvening = function(text) {
	var patterns = [/how are you doing hal/,/how are you doing how/,/how are you doing jarvis/,/good evening hal/,/good evening how/,/good evening jarvis/];
	var match = false;
	for (var i = patterns.length - 1; i >= 0; i--) {
		if (patterns[i].test(text)) {
			match = true;
		}
	}

	if (match) {
		if (this.controller) {
			this.controller.playAudio("http://www.palantir.net/2001/tma1/wav/hihal.wav");
		}
		return true;
	}
}

// AlarmClockWidget
Hal.prototype.trySetAlarmFor = function(text) {
	if (!(/set alarm for/.test(text))) return false;
	if (!(/.* hour/.test(text))) return false;
	if (!(/.* minute/.test(text))) return false;

	var hoursPhrase = /.* hour/.exec(text)[0]; // should come back 'hal set alarm for 12 hours'		
	var hoursParts = hoursPhrase.split(' '); // ['hal','set','alarm','for','12','hours']
	var hoursStr = this.fixNumberParsing(hoursParts[hoursParts.length - 2]); // '12'
	var hours = parseInt(hoursStr);

	var minutesParts = /.* minute/.exec(text)[0].split(' ');
	var minutes = parseInt(this.fixNumberParsing(minutesParts[minutesParts.length - 2]));

	var seconds = 0;

	this.controller.log("Setting alarm for " + hours + ":" + formatTwoDigitTime(minutes));
	if (this.controller && this.controller.alarmClockController) {
		this.controller.alarmClockController.setAlarm(hours, minutes, seconds);
		//wakeTimeCallback(hours, minutes, seconds);
	} else {
		this.controller.log('Can\'t find controllers');
	}
	return true;
}

// AlarmClockWidget
Hal.prototype.trySnoozeAlarm = function(text) {
	if (!(/snooze alarm/.test(text)) && !(/news alarm/.test(text))) return false;

	var minutes = 5;
	if (/.* minute/.test(text)) {
		var minutesParts = /.* minute/.exec(text)[0].split(' ');
		minutes = parseInt(this.fixNumberParsing(minutesParts[minutesParts.length - 2]));	
		this.snoozeMinutesAwaitingConfirmation = minutes;
		//alert(minutes);
		this.confirmSnoozeMinutes(minutes, function(confirmed) {
			if (confirmed) {
				globalHal.snoozeForMinutes(globalHal.snoozeMinutesAwaitingConfirmation);
				globalHal.controller.playAudio("http://www.palantir.net/2001/tma1/wav/decision.wav");
			} else {
				globalHal.controller.playAudio("http://www.palantir.net/2001/tma1/wav/cantdo.wav");
			}
		});
	} else {
		this.snoozeForMinutes(minutes);
	}	
	return true;
}

// AlarmClockWidget
Hal.prototype.snoozeForMinutes = function(minutes){
	console.log("snoozing for " + minutes + " minutes");
	if (this.controller && this.controller.alarmClockController) {
		this.controller.alarmClockController.snoozeAlarm(minutes);
	} else {
		this.controller.log('Can\'t find snooze controllers')
	}	
}

// AlarmClockWidget
Hal.prototype.confirmSnoozeMinutes = function(minutes, callback) {
	this.controller.log('Snooze for ' + minutes + ' minutes. Confirm?');
	var url = "http://translate.google.com/translate_tts?tl=en_gb&total=1&q=" + encodeURIComponent("setting alarm for " + minutes + " minutes. Confirm?");
	console.log(url);
	if (this.controller && this.controller.alarmClockController) {
		this.controller.alarmClockController.playAudio(url);
	} else {
		this.controller.log('Can\'t find confirm snooze controllers');
	}
	var thisCallback = function(args) {
		callback(args);
		this.confirmationCallback = null;
	}
	this.confirmationCallback = thisCallback;
	setTimeout(function(){
		if (globalHal.confirmationCallback === thisCallback) {
			globalHal.confirmationCallback(false);
			globalHal.confirmationCallback = null;
		}
	}, 15000);
}

// AlarmClockWidget
Hal.prototype.tryStopAlarm = function(text) {
	if (!(/stop alarm/.test(text))) return false;
	this.controller.log('Stopping alarm');

	if (this.controller && this.controller.alarmClockController) {
		this.controller.alarmClockController.stopAlarm();
	} else {
		this.controller.log('Can\'t find stop alarm controllers')
	}
	return true;
}

// SpotifyRemoteWidget
Hal.prototype.tryPlay = function(text) {
	if (!(/play/.test(text))) return false;
	this.controller.log('Playing');

	if (this.controller && this.controller.spotifyRemoteController && this.controller.spotifyRemoteController.client) {
		this.controller.spotifyRemoteController.client.togglePlay();
	} else {
		this.controller.log('Can\'t find spotify controller')
	}
	return true;
}

// SpotifyRemoteWidget
Hal.prototype.tryPause = function(text) {
	if (!(/pause/.test(text)) && !(/paws/.test(text)) && !(/passé/.test(text))) return false;
	this.controller.log('Pausing');

	if (this.controller && this.controller.spotifyRemoteController && this.controller.spotifyRemoteController.client) {
		this.controller.spotifyRemoteController.client.togglePlay();
	} else {
		this.controller.log('Can\'t find spotify controller')
	}
	return true;
}

function formatTwoDigitTime(t) {
	return (t < 10) ? "0" + t : t;
}






