var globalAlarm;

var Alarm = function(currentTimeElement, hoursInput, minutesInput, secondsInput) {
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
	console.log("It's not: " + this.wakeHour + " : " + this.wakeMinute + " : " + this.wakeSecond + " it's actually " + time.getHours() + " : " + time.getMinutes() + " : " + time.getSeconds());
	return (this.wakeHour == time.getHours() && this.wakeMinute == time.getMinutes() && this.wakeSecond == time.getSeconds());
}

Alarm.prototype.checkAlarm = function(now) {
	if (this.isWakeTime(now)) {
		alert("WAKE UP!");
		console.log("WAKE UP!");
		console.log(new Date());
	}
}

Alarm.prototype.formatTwoDigitTime = function(t) {
	return (t < 10) ? "0" + t : t;
}

Alarm.prototype.getHhMmSsStringFromDateTime = function(time) {
	return this.formatTwoDigitTime(time.getHours()) + ":" + this.formatTwoDigitTime(time.getMinutes()) + ":" + this.formatTwoDigitTime(time.getSeconds());
}

Alarm.prototype.setWakeTime = function(hour, minute, second) {
	this.wakeHour = hour;
	this.wakeMinute = minute;
	this.wakeSecond = second;
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