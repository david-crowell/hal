var BackgroundVideoController = {
	$wrapper : null,

	changeVideo : function() {
		this.changeVideoWithOptions({'id':'BPDYFt1pYxk'});
	},

	changeVideoWithOptions : function(options) {
		this.$wrapper.changeTubularVideo(options, this.$wrapper);
	}
};

var wrapper;
var options = { videoId: 'e4Is32W-ppk' }
$('document').ready(function() {
	var options = { videoId: 'e4Is32W-ppk' };
	BackgroundVideoController.$wrapper = $('#wrapper');
	wrapper = BackgroundVideoController.$wrapper;
	console.log(wrapper);
	BackgroundVideoController.$wrapper.tubular(options, BackgroundVideoController.$wrapper);
});
