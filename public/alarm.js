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

/*
var jsalarm={
padfield:function(f){
	return (f<10)? "0"+f : f
},
showcurrenttime:function(){
	var dateobj=new Date()
	var ct=this.padfield(dateobj.getHours())+":"+this.padfield(dateobj.getMinutes())+":"+this.padfield(dateobj.getSeconds())
	this.ctref.innerHTML=ct
	this.ctref.setAttribute("title", ct)
	if (typeof this.hourwake!="undefined"){ //if alarm is set
		if (this.ctref.title==(this.hourwake+":"+this.minutewake+":"+this.secondwake)){
			clearInterval(jsalarm.timer)
			window.location=document.getElementById("musicloc").value
		}
	}
},
init:function(){
	var dateobj=new Date()
	this.ctref=document.getElementById("jsalarm_ct")
	this.submitref=document.getElementById("submitbutton")
	this.submitref.onclick=function(){
		jsalarm.setalarm()
		this.value="Alarm Set"
		this.disabled=true
		return false
	}
	this.resetref=document.getElementById("resetbutton")
	this.resetref.onclick=function(){
	jsalarm.submitref.disabled=false
	jsalarm.hourwake=undefined
	jsalarm.hourselect.disabled=false
	jsalarm.minuteselect.disabled=false
	jsalarm.secondselect.disabled=false
	return false
	}
	var selections=document.getElementsByTagName("select")
	this.hourselect=selections[0]
	this.minuteselect=selections[1]
	this.secondselect=selections[2]
	for (var i=0; i<60; i++){
		if (i<24) //If still within range of hours field: 0-23
		this.hourselect[i]=new Option(this.padfield(i), this.padfield(i), false, dateobj.getHours()==i)
		this.minuteselect[i]=new Option(this.padfield(i), this.padfield(i), false, dateobj.getMinutes()==i)
		this.secondselect[i]=new Option(this.padfield(i), this.padfield(i), false, dateobj.getSeconds()==i)

	}
	jsalarm.showcurrenttime()
	jsalarm.timer=setInterval(function(){jsalarm.showcurrenttime()}, 1000)
},
setalarm:function(){
	this.hourwake=this.hourselect.options[this.hourselect.selectedIndex].value
	this.minutewake=this.minuteselect.options[this.minuteselect.selectedIndex].value
	this.secondwake=this.secondselect.options[this.secondselect.selectedIndex].value
	this.hourselect.disabled=true
	this.minuteselect.disabled=true
	this.secondselect.disabled=true
}
}
*/