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
	text = this.trimBeginningSpaces(text);
	if (this.startsWithName(text)) {
		console.log("Starts right: " + text);
		this.tryConfirm(text);
		this.trySetAlarmFor(text);
		this.trySnoozeAlarm(text);
	} else {
		console.log("FAILS: " + text);
	}
}

Hal.prototype.startsWithName = function(text) {
	var lower = text.toLowerCase();
	var parts = lower.split(' ');
	console.log(parts);
	var matches = {'hal':1,'how':1,'jarvis':1};
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

	console.log("trying confirm: " + text);
	if (text.split(' ').length > 5) {
		//probably not right
		return false;
	}
	else {
		if (this.confirmationCallback) {
			this.confirmationCallback(true);
			this.confirmationCallback = null;
		} else {
			console.log("null confirmation");
		}
	}
}

Hal.prototype.trySetAlarmFor = function(text) {
	console.log('sort of trying ' + text);
	if (!(/set alarm for/.test(text))) return false;
	if (!(/.* hour/.test(text))) return false;
	if (!(/.* minute/.test(text))) return false;
	console.log("trying");

	var hoursPhrase = /.* hour/.exec(text)[0]; // should come back 'hal set alarm for 12 hours'		
	var hoursParts = hoursPhrase.split(' '); // ['hal','set','alarm','for','12','hours']
	console.log(hoursParts);
	var hoursStr = this.fixNumberParsing(hoursParts[hoursParts.length - 2]); // '12'
	var hours = parseInt(hoursStr);

	var minutesParts = /.* minute/.exec(text)[0].split(' ');
	console.log(minutesParts);
	var minutes = parseInt(this.fixNumberParsing(minutesParts[minutesParts.length - 2]));

	var seconds = 0;

	console.log(hours + " : " + minutes);
	//alert(hours + " : " + minutes);
	if (this.controller) {
		this.controller.setAlarm(hours, minutes, seconds);
		//wakeTimeCallback(hours, minutes, seconds);
	} else {
		console.log('aint got it');
		console.log(this);
	}
	return true;
}

Hal.prototype.trySnoozeAlarm = function(text) {
	console.log('snooze');
	if (!(/snooze alarm/.test(text)) && !(/news alarm/.test(text))) return false;

	var minutes = 5;
	if (/.* minute/.test(text)) {
		var minutesParts = /.* minute/.exec(text)[0].split(' ');
		console.log(minutesParts);
		minutes = parseInt(this.fixNumberParsing(minutesParts[minutesParts.length - 2]));	
		//alert(minutes);
		this.confirmSnoozeMinutes(minutes, function(confirmed) {
			if (confirmed) {
				globalHal.snoozeForMinutes(minutes);
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

Hal.prototype.snoozeForMinutes = function(minutes){
	console.log("snoozing for " + minutes + " minutes");
	if (this.controller) {
		this.controller.snoozeAlarm(minutes);
	} else {
		console.log('aint got it at snooze ');
		console.log(this);
	}	
}

Hal.prototype.confirmSnoozeMinutes = function(minutes, callback) {
	var url = "http://translate.google.com/translate_tts?tl=en_gb&total=1&q=" + encodeURIComponent("setting alarm for " + minutes + " minutes. Confirm?");
	console.log(url);
	if (this.controller) {
		this.controller.playAudio(url);
	} else {
		console.log('aint got it in confirm snooze minutes');
		console.log(this);
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

Hal.prototype.tryStopAlarm = function(text) {
	console.log('stop');
	if (!(/stop alarm/.test(text))) return false;

	if (this.controller) {
		this.controller.stopAlarm();
	} else {
		console.log('aint got it');
		console.log(this);
	}
	return true;
}







