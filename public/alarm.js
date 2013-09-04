var globalAlarm;

var Alarm = function(alarmHandler, currentTimeElement, hoursInput, minutesInput, secondsInput) {
	this.alarmHandler = alarmHandler;
	this.currentTimeElement = currentTimeElement;
	this.hoursInput = hoursInput;
	this.minutesInput = minutesInput;
	this.secondsInput = secondsInput;
	this.setupInputs();
	globalAlarm = this;
}

Alarm.prototype.setupInputs = function(){
	this.hoursInput.onchange = this.handleHoursInputChange;
	this.minutesInput.onchange = this.handleMinutesInputChange;
	this.secondsInput.onchange = this.handleSecondsInputChange;
}

Alarm.prototype.handleHoursInputChange = function() {
	globalAlarm.wakeHour = parseInt(globalAlarm.hoursInput.value);
}

Alarm.prototype.handleMinutesInputChange = function() {
	globalAlarm.wakeMinute = parseInt(globalAlarm.minutesInput.value);
}

Alarm.prototype.handleSecondsInputChange = function() {
	globalAlarm.wakeSecond = parseInt(globalAlarm.secondsInput.value);
}

Alarm.prototype.showTime = function(now) {
	var currentTimeString = this.getHhMmSsStringFromDateTime(now);
	this.currentTimeElement.innerHTML = currentTimeString;
	this.currentTimeElement.setAttribute("title", currentTimeString);
}

Alarm.prototype.isWakeTime = function(time) {
	return (this.wakeHour == time.getHours() && this.wakeMinute == time.getMinutes() && this.wakeSecond == time.getSeconds());
}

Alarm.prototype.checkAlarm = function(now) {
	if (this.isWakeTime(now)) {	
		console.log("WAKE UP!");
		console.log(new Date());
		this.alarmHandler();
	}
}

Alarm.prototype.formatTwoDigitTime = function(t) {
	return (t < 10) ? "0" + t : t;
}

Alarm.prototype.getHhMmSsStringFromDateTime = function(time) {
	return this.formatTwoDigitTime(time.getHours()) + ":" + this.formatTwoDigitTime(time.getMinutes()) + ":" + this.formatTwoDigitTime(time.getSeconds());
}

Alarm.prototype.setWakeTime = function(hour, minute, second) {
	if (this.wakeHour != hour) {
		this.wakeHour = hour;
		this.hoursInput.value = hour;
	} if (this.wakeMinute != minute) {
		this.wakeMinute = minute;
		this.minutesInput.value = minute;
	} if (this.wakeSecond != second) {
		this.wakeSecond = second;
		this.secondsInput.value = second;
	}
}

Alarm.prototype.everySecond = function() {
	var now = new Date();
	//console.log(this);
	globalAlarm.currentTime = now;
	globalAlarm.showTime(now);
	globalAlarm.checkAlarm(now);
}

Alarm.prototype.start = function() {
	setInterval(this.everySecond, 1000);
}

//var a = new Alarm({setAttribute:function(foo){}},{setAttribute:function(foo){}},{setAttribute:function(foo){}},{setAttribute:function(foo){}});
//a.start();
//a.setWakeTime(20,34,00);