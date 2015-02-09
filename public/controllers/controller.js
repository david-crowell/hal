var Controller = function(){};

Controller.prototype.viewDidLoad = function() {
	this.hal = new Hal(this);
	this.addWidget('alarmClockWidget.html');
	this.showBanner('Alarm Clock loaded');
}

Controller.prototype.clearWidgets = function() {
	var canvas = document.getElementById('widgetCanvas');
	var widgets = canvas.childNodes;
	console.log(widgets);
	for (var i = widgets.length - 1; i >= 0; i--) {
		canvas.removeChild(widgets[i]);
	};
	console.log('finished clearing');
}

Controller.prototype.addWidget = function(path) {
	this.clearWidgets();
	var canvas = document.getElementById('widgetCanvas');
	var frame = document.createElement('iframe');
	frame.src = path;
	canvas.appendChild(frame);
}

Controller.prototype.log = function(text) {
	console.log(text);
	console.log("Banner: " + text);
	this.showBanner(text);
}

Controller.prototype.showBanner = function(text) {
	if (this.bannerFadeInterval) {
		clearInterval(this.bannerFadeInterval);
	}
	console.log(this.getBanner().innerHTML);
	var banner = this.getBanner();
	banner.innerHTML = '<h1>' + text + '</h1>';
	console.log(banner.innerHTML);
	banner.height = 30;
	this.bannerFadeInterval = setInterval(this.hideBanner.bind(this), 5000);
}

Controller.prototype.hideBanner = function() {
	this.getBanner().innerHTML = '';
}

Controller.prototype.getBanner = function() {
	if (this.banner) { return banner; }
	this.banner = document.getElementById('banner');
	return this.banner;
}

Controller.prototype.playAudio = function(location) {
	this.clearAudio();
	console.log("playing new audio: " + location);
	this.audio = new Audio(location);
	this.audio.addEventListener('ended',function(){});
	this.audio.play();
}

Controller.prototype.clearAudio = function() {
	if (this.audio) {
		this.audio.pause();
	}
}

Controller.prototype.openInBackground = function(url){
	var a = document.createElement("a");
	a.href = url;
	var evt = document.createEvent("MouseEvents");
	//the thirtenth parameter of initMouseEvent sets meta key
	evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, true, 0, null);
	a.dispatchEvent(evt);
}

var controller = new Controller();   
