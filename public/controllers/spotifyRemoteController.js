var SpotifyRemoteController = function(host) {
	this.host                  = host || window.location.hostname;
	this.elements              = [];
	this.numberOfSearchResults = 3;
	this._canTouchThis         = 'ontouchstart' in window || 'createTouch' in document;
	this._rangeInputBlocked    = false;
	this._sendRangeInput       = false;
	this._rememberedRangeInput = 0;
}

SpotifyRemoteController.prototype.viewDidLoad =  function() {
	if (top.controller) {
		this.controller = top.controller;
		this.controller.spotifyRemoteController = this;
		this.hal = this.controller.hal;
	} else {
		this.hal = new Hal(this);
	}
},

SpotifyRemoteController.prototype.init = function(io) {
	this.io = io;
	console.log("remote client:");
	console.log(SpotifyRemoteClient);
	this.client = new SpotifyRemoteClient(this.host);
	this.client.init(io, this);
	console.log(this.client);
	this.connect();
	this.bindDOMEvents();
	this.bindVisibilityEvents();
};

SpotifyRemoteController.prototype.connect = function() {
	this.client.connect();
};

SpotifyRemoteController.prototype.disconnect = function() {
	if (this.client) {
		this.client.disconnect();
	}
};

SpotifyRemoteController.prototype.bindDOMEvents = function() {
	var self = this;

	document.addEventListener(this._canTouchThis ? 'touchstart' : 'click', function(event) {
		var handlersById = {
			'previous': self.client.previousTrack.bind(self.client),
			'next': self.client.nextTrack.bind(self.client),
			'current-play-state': self.client.togglePlay.bind(self.client)
		}
		var handler = handlersById[event.target.id];

		if (!handler) return;

		handler.call(self.client);
		event.preventDefault();
	});

	document.addEventListener('keyup', function(event) {
		if (event.target.tagName === 'INPUT') return;

		var handler = {
			32: self.client.togglePlay.bind(self.client),   // space
			78: self.client.nextTrack.bind(self.client),        // n
			80: self.client.previousTrack.bind(self.client),    // p
			107: self.client.volumeUp.bind(self.client),   // + on numpad
			109: self.client.volumeDown.bind(self.client), // - on numpad
			187: self.client.volumeUp.bind(self.client),   // +
			189: self.client.volumeDown.bind(self.client)  // -
		}[event.keyCode];

		if (handler) handler.call(self.clent);
	});

	// volume control
	this.bindRangeInputEvents('current-volume', this.client.setVolume);

	this.$('mute-unmute').addEventListener(this._canTouchThis ? 'touchstart' : 'click', function() {
		self.client.toggleMute();
	});

	// position control
	this.bindRangeInputEvents('position', this.client.setPosition);

	this.$('new-search').addEventListener('submit', function(event) {
		event.preventDefault();
		var $searchInput = self.$('search-term');
		var searchTerm   = $searchInput.value;

		$searchInput.blur();

		if (searchTerm === '') return;

		self.getAndDisplaySearchResults('tracks', searchTerm);
		self.getAndDisplaySearchResults('albums', searchTerm);
		self.getAndDisplaySearchResults('artists', searchTerm);
	});

	document.addEventListener('click', function(event) {
		var handler = {
			'tracks': self.handleTracksResultClick,
			'albums': self.handleAlbumsResultClick,
			'artists': self.handleArtistsResultClick
		}[event.target.dataset.resulttype];

		if (!handler) return;

		event.preventDefault();
		handler.call(self, event.target);
	});

	document.addEventListener(this._canTouchThis ? 'touchstart' : 'click', function(event) {
		var showPage = {
			'search': self.showSearchPage,
			'remote': self.showRemotePage,
			'artist-detail': self.showArtistDetailPage
		}[event.target.dataset.showPage];

		if (!showPage) return;

		event.preventDefault();

		if (event.target.dataset.deleteLastVisited === '') delete self.lastVisitedPage;
		showPage.call(self);
	});

	document.addEventListener('click', function(event) {
		if (event.target.className !== 'show-more') return;
		event.preventDefault();

		self.showMoreResults(event.target.rel);
	});
};

SpotifyRemoteController.prototype.bindRangeInputEvents = function(id, handler) {
	var self = this;

	this.$(id).addEventListener('change', function(event) {
		clearInterval(self._rangeInputInterval);
		self._rememberedRangeInput = event.target.value;

		self._rangeInputInterval = setInterval(function() {
			if (self._sendRangeInput) {
				handler.call(self.client, self._rememberedRangeInput);
				self._rangeInputBlocked = false;
				self._sendRangeInput    = false;
				clearInterval(self._rangeInputInterval);
			}
		}, 100);
	});

	this.$(id).addEventListener(this._canTouchThis ? 'touchstart' : 'mousedown', function() {
		clearInterval(self._rangeInputInterval);
		self._rangeInputBlocked = true;
	});

	this.$(id).addEventListener(this._canTouchThis ? 'touchend' : 'mouseup', function() {
		self._sendRangeInput = true;
	});
};

SpotifyRemoteController.prototype.bindVisibilityEvents = function() {
	var self                 = this;
	var bindVisibilityChange = function(eventName, propertyName) {
		document.addEventListener(eventName, function() {
			document[propertyName] ? self.disconnect() : self.connect();
		});
	};

	if (typeof document.hidden !== 'undefined') {
		return bindVisibilityChange('visibilitychange', 'hidden');
	} else if (typeof document.webkitHidden !== 'undefined') {
		return bindVisibilityChange('webkitvisibilitychange', 'webkitHidden');
	} else if (typeof document.msHidden !== 'undefined') {
		return bindVisibilityChange('msvisibilitychange', 'msHidden');
	}

	if (typeof window.onpagehide !== 'undefined') {
		window.addEventListener('pagehide', self.disconnect.bind(self));
		window.addEventListener('pageshow', self.connect.bind(self));
	}
};

SpotifyRemoteController.prototype.showCurrentTrack = function(track) {
	// don't rerender stuff when nothing has changed
	if (this.currentTrack && this.currentTrack.id === track.id) return;

	this.$('artist').textContent   = track.artist;
	this.$('name').textContent     = track.name;
	this.$('duration').textContent = this.formatTime(track.duration);
	this.$('position').setAttribute('max', track.duration);

	this.currentTrack = track;
};

SpotifyRemoteController.prototype.showCurrentState = function(state) {
	if (!this.currentState || this.currentState.position !== state.position) {
		this.$('played-time').textContent = this.formatTime(state.position);

		if (!this._positionRangeBlocked) this.$('position').value = state.position;
	}

	if (!this.currentState || this.currentState.state !== state.state) {
		this.$('current-play-state').textContent = state.state === 'paused' ? 'Play' : 'Pause';
	}

	if (
		!this._volumeRangeBlocked && (!this.currentState ||
		(this.currentState.muted !== state.muted || this.currentState.volume !== state.volume))
	) {
		this.$('current-volume').value = state.volume;

		if (state.muted) {
			this.$('mute-unmute').src = 'mute-icon.png';
		} else {
			this.$('mute-unmute').src = state.volume === 0 ? 'novolume-icon.png' : 'volume-icon.png';
		}
	}

	this.currentState = state;
};

SpotifyRemoteController.prototype.showCurrentArtwork = function(artwork) {
	this.$('artwork').src = 'data:image/png;base64,' + artwork;
};

// jQuery.
SpotifyRemoteController.prototype.$ = function(id) {
	this.elements[id] = this.elements[id] || document.getElementById(id);

	return this.elements[id];
};

SpotifyRemoteController.prototype.forEach = function(obj, iterator, context) {
	Array.prototype.forEach.call(obj, iterator, context);
};

SpotifyRemoteController.prototype.formatTime = function(totalSeconds) {
	var minutes = Math.floor(totalSeconds / 60);
	var seconds = totalSeconds % 60;

	minutes = minutes < 10 ? '0' + minutes : minutes;
	seconds = seconds < 10 ? '0' + seconds : seconds;

	return minutes + ":" + seconds;
};

SpotifyRemoteController.prototype.showMoreResults = function(resultsId) {
	var $results          = document.getElementById(resultsId);
	var $showMoreButton   = $results.querySelector('.show-more');
	var visibleResults    = 0;
	var moreResultsToShow = false;

	this.forEach($results.children, function($result, index) {
		// skip when item is not a search result or we are already done and can return early
		if (!$result.dataset.resulttype || moreResultsToShow) return;

		if ($result.style.display === 'block') {
			visibleResults++;
		} else if (index < (visibleResults + this.numberOfSearchResults)) {
			$result.style.display = 'block';
		} else {
			moreResultsToShow = true;
		}
	}, this);

	if (!moreResultsToShow) {
		$showMoreButton.style.display = 'none';
	}
};

SpotifyRemoteController.prototype.showSearchPage = function() {
	this.showPage(this.lastVisitedPage || 'search', {savePage: true});
};

SpotifyRemoteController.prototype.showRemotePage = function() {
	this.showPage('remote', {savePage: false});
};

SpotifyRemoteController.prototype.showArtistDetailPage = function() {
	this.showPage('artist-detail', {savePage: true});
};

SpotifyRemoteController.prototype.showPage = function(pageId, options) {
	var pages = document.getElementsByClassName('page');

	if (options && options.savePage) this.lastVisitedPage = pageId;

	this.forEach(pages, function(page) {
		page.style.display = page.id === pageId ? 'block' : 'none';
	});
};

SpotifyRemoteController.prototype.handleTracksResultClick = function(target) {
	this.client.playTrack(target.dataset.spotifyurl);
	this.showRemotePage();
};

SpotifyRemoteController.prototype.getFromSpotify = function(url, successHandler, errorHandler) {
	this.client.getFromSpotify(url, successHandler, errorHandler);
};

SpotifyRemoteController.prototype.handleAlbumsResultClick = function(target) {
	this.client.getAlbums(
		target.dataset.spotifyurl,
		this.displayAlbumDetails.bind(this),
		this.displayAlbumDetailError.bind(this)
	);
};

SpotifyRemoteController.prototype.handleArtistsResultClick = function(target) {
	this.client.getArtist(
		target.dataset.spotifyurl,
		this.displayArtistDetails.bind(this),
		this.displayArtistDetailError.bind(this)
	);
};

SpotifyRemoteController.prototype.getAndDisplaySearchResults = function(type, term) {
	this.client.getSearchResults(
		type,
		term,
		this.displaySearchResults.bind(this, type),
		this.displaySearchError.bind(this, type)
	);
};

SpotifyRemoteController.prototype.displayAlbumDetails = function(albumDetails) {
	var $oldTracks   = document.getElementById('album-detail-tracks');
	var $newTracks   = document.createElement('div');
	$newTracks.id    = 'album-detail-tracks';
	var $albumDetail = document.getElementById('album-detail-album');

	this.createSearchResultElements('tracks', albumDetails.album.tracks, function(elements) {
		elements.map(function(el) {
			el.style.display = 'block';
			$newTracks.appendChild(el);
		});

		$oldTracks.parentNode.replaceChild($newTracks, $oldTracks);
		$albumDetail.textContent = albumDetails.album.artist + ' - ' + albumDetails.album.name;

		if (this.lastVisitedPage === 'artist-detail') {
			var $backButton                       = document.querySelector('#album-detail .go-back');
			$backButton.dataset.showPage          = 'artist-detail';
			$backButton.dataset.deleteLastVisited = undefined;
		}

		this.showPage('album-detail', {savePage: true});
	}.bind(this));
};

SpotifyRemoteController.prototype.displayAlbumDetailError = function(error) {
	document.getElementById('album-detail-album').textContent  = error;
	document.getElementById('album-detail-tracks').textContent = '';

	this.showPage('album-detail', {savePage: true});
};

SpotifyRemoteController.prototype.displayArtistDetails = function(artistDetails) {
	var $oldAlbums = document.getElementById('artist-detail-albums');
	var $newAlbums = document.createElement('div');
	$newAlbums.id  = 'artist-detail-albums';

	this.createArtistDetailAlbumResults(artistDetails.artist.albums, function(elements) {
		elements.map(function(el) {
			el.style.display = 'block';
			$newAlbums.appendChild(el);
		});

		$oldAlbums.parentNode.replaceChild($newAlbums, $oldAlbums);
		document.getElementById('artist-detail-artist').textContent = artistDetails.artist.name;

		this.showPage('artist-detail', {savePage: true});
	}.bind(this));
};

SpotifyRemoteController.prototype.displayArtistDetailError = function(error) {
	document.getElementById('artist-detail-albums').textContent = error;
	this.showPage('artist-detail', {savePage: true});
};

SpotifyRemoteController.prototype.displaySearchResults = function(type, result) {
	var self              = this;
	var searchResultsId   = type + '-search-results';
	var $oldSearchResults = document.getElementById(searchResultsId);
	var $newSearchResults = document.createElement('div');
	$newSearchResults.id  = searchResultsId;

	this.createSearchResultElements(type, result[type], function(elements) {
		if (elements.length) {
			elements.map(function(el, index) {
				el.style.display = index < self.numberOfSearchResults ? 'block' : 'none';
				$newSearchResults.appendChild(el);
			});

			if (elements.length > self.numberOfSearchResults) {
				$newSearchResults.appendChild(self.createShowMoreElement(searchResultsId));
			}
		} else {
			$newSearchResults.appendChild(self.createNoSearchResultElement());
		}

		$oldSearchResults.parentNode.replaceChild($newSearchResults, $oldSearchResults);
	});
};

SpotifyRemoteController.prototype.displaySearchError = function(type, errorMsg) {
	document.getElementById(type + '-search-results').textContent = errorMsg;
};

SpotifyRemoteController.prototype.createNoSearchResultElement = function() {
	var el         = document.createElement('div');
	el.className   = 'no-search-result';
	el.textContent = 'Woah! No search results!';
	return el;
};

SpotifyRemoteController.prototype.createShowMoreElement = function(searchResultsId) {
	var el         = document.createElement('a');
	el.className   = 'show-more';
	el.textContent = 'Show more';
	el.rel         = searchResultsId;
	return el;
};

SpotifyRemoteController.prototype.createSearchResultElements = function(type, results, cb) {
	var elementCreator = {
		'tracks': this.createTrackSearchResultElement,
		'albums': this.createAlbumSearchResultElement,
		'artists': this.createArtistSearchResultElement
	}[type];

	cb(results.map(elementCreator, this));
};

SpotifyRemoteController.prototype.createAlbumSearchResultElement = function(result) {
	var label = result.artists[0].name + ' - ' + result.name;
	return this._createSpotifyLink(label, result.href, 'albums');
};

SpotifyRemoteController.prototype.createArtistDetailAlbumResults = function(results, cb) {
	var elements = results.map(function(result) {
		var label = result.album.artist + ' - ' + result.album.name;
		return this._createSpotifyLink(label, result.album.href, 'albums');
	}, this);

	return cb(elements);
};

SpotifyRemoteController.prototype.createTrackSearchResultElement = function(result) {
	var label = result.artists[0].name + ' - ' + result.name;
	return this._createSpotifyLink(label, result.href, 'tracks');
};

SpotifyRemoteController.prototype.createArtistSearchResultElement = function(result) {
	return this._createSpotifyLink(result.name, result.href, 'artists');
};

SpotifyRemoteController.prototype._createSpotifyLink = function(label, url, type) {
	var el                = document.createElement('a');
	el.textContent        = label;
	el.dataset.spotifyurl = url;
	el.dataset.resulttype = type;

	return el;
};

var spotifyRemoteController = new SpotifyRemoteController('http://localhost:3333');
spotifyRemoteController.init(io);
// $('document').ready(function() {
// 	new SpotifyRemoteController().init(io);
// });
