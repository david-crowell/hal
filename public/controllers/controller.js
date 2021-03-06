var Controller = function(){
	this.hal = new Hal(this);
	this.widgets = {};
};

Controller.prototype.viewDidLoad = function() {
	this.showBanner('Welcome');
	this.showWidget('start');
}

Controller.prototype.hideWidgets = function(exceptName) {
	var canvas = document.getElementById('widgetCanvas');
	var widgets = canvas.childNodes;
	for (var i = widgets.length - 1; i >= 0; i--) {
		var widget = widgets[i];
		if (!widget.tagName || widget.tagName.toLowerCase() != 'iframe') continue;
		if (!exceptName || widget != this.widgets[exceptName]) {
			console.log("hiding: " + widget.src);
			widget.style.height = '0px';
			widget.style.visibility = 'hidden';
		}
	};
	if (this.spotifyRemoteController && exceptName != 'spotifyRemote') {
		this.spotifyRemoteController.disconnect();
	}
}

Controller.prototype.openAlarmClock = function() {
	this.log("Opening Alarm Clock");
	this.showWidget('alarmClock');
}

Controller.prototype.openSpotifyRemote = function() {
	this.log("Opening Spotify Remote");
	if (this.spotifyRemoteController && !this.spotifyRemoteController.connected) {
		this.spotifyRemoteController.connect();
	}
	this.showWidget('spotifyRemote');
}

Controller.prototype.openMenu = function() {
	this.log("Opening Menu");
	this.showWidget('menu');
}

Controller.prototype.openSpace = function() {
	this.log("Opening Space");
	this.showWidget('space');
}

Controller.prototype.showWidget = function(name) {
	this.hideWidgets(name);
	var widget = this.widgets[name];
	if (widget) {
		widget.style.height = '100%';
		widget.style.visibility = 'visible';
	} else {
		this.addWidget(name);
	}
}

Controller.prototype.addWidget = function(name) {
	console.log("Add widget");
	var path = 'widgets/' + name + 'Widget.html';
	var canvas = document.getElementById('widgetCanvas');
	var frame = document.createElement('iframe');
	frame.src = path;
	canvas.appendChild(frame);
	this.widgets[name] = frame;
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

Controller.prototype.toggleSpotifyPlay = function() {
	if (this.spotifyRemoteController && this.spotifyRemoteController.client) {
		if (!(this.spotifyRemoteController.client.connected)) {
			this.spotifyRemoteController.client.connect();
		}
		this.controller.spotifyRemoteController.client.togglePlay();
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
