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
		this.hal.start();
	} else {
		this.hal = new Hal(this);
		this.hal.start();
	}
}

StartController.prototype.start = function() {
	this.controller.openMenu();
}

var startController = new StartController();
