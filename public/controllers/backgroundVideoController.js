var BackgroundVideoController = {
	$wrapper : null,

	playVideo : function(options) {
		this.$wrapper.playBackgroundVideo(options, this.$wrapper);
	},

	playDefaultVideo : function() {
		this.playVideo({'id':'M1Deb8CQHcM'});
	}
};

var wrapper;
$('document').ready(function() {
	var wrapper = $('#wrapper');
	BackgroundVideoController.$wrapper = wrapper;
	wrapper.setupBackgroundVideo({}, wrapper);
});
