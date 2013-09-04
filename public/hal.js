var Hal = function() {
	function start() {
		var recognition = new webkitSpeechRecognition();
		recognition.continuous = true;
		recognition.interim = true;
		recognition.onresult = handleEvent;
		recognition.onend = function(end) {
			recognition.start();
		}
		recognition.onerror = function(err) {
			console.log('Error: ' + err.toString());
			recognition.start();
		}
		recognition.start();
		/*
		setTimeout(
			function(){
				recognition.stop();
				alert('stopped');
			}, 5000
		);
	*/
		return recognition;
	}

	function handleEvent(event) {
		for (var i = event.resultIndex; i < event.results.length; ++i) {
			for (var j = 0; j < event.results[i].length; j++) {
				parseForCommand(event.results[i][j].transcript);
			};
	    }
	}

	function parseForCommand(text) {
		text = trimBeginningSpaces(text);
		if (startsWithName(text)) {
			alert("Hal in: " + text);

		} else {
			alert("No 'hal' IN: " + text);
		}
	}

	function startsWithName(text) {
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

	function trimBeginningSpaces(str) {
		var first = str[0];
		var last = str[str.length - 1];
		if (first == ' ') {
			str = str.slice(1,str.length);
			return trimBeginningSpaces(str);
		} else {
			return str;
		}
	}

	this.start = start;
};