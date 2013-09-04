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
		this.trySetAlarmFor(text);
	} else {
		console.log("FAILS: " + text);
	}
}

Hal.prototype.startsWithName = function(text) {
	var lower = text.toLowerCase();
	var parts = lower.split(' ');
	console.log(parts);
	var matches = {'hal':1,'how':1,'jarvis':1,'viva':1};
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

Hal.prototype.trySetAlarmFor = function(text) {
	console.log('sort of trying ' + text);
	if (!(/set alarm for/.test(text))) return false;
	if (!(/.* hours/.test(text))) return false;
	if (!(/.* minutes/.test(text))) return false;
	console.log("trying");

	var hoursPhrase = /.* hours/.exec(text)[0]; // should come back 'hal set alarm for 12 hours'		
	var hoursParts = hoursPhrase.split(' '); // ['hal','set','alarm','for','12','hours']
	console.log(hoursParts);
	var hoursStr = this.fixNumberParsing(hoursParts[hoursParts.length - 2]); // '12'
	var hours = parseInt(hoursStr);

	var minutesParts = /.* minutes/.exec(text)[0].split(' ');
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