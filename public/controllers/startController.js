var StartController = function(controller){
	this.controller = controller;
	return this;
};

StartController.prototype.viewDidLoad = function() {
	if (this.controller == null && top.controller) {
		this.controller = top.controller;
	} if (this.controller) {
		this.controller.startController = this;
		this.hal = this.controller.hal;
	} else {
		this.hal = new Hal(this);
	}
}

StartController.prototype.start = function() {
	console.log(this);
	this.hal.start();
}

var startController = new StartController();
