var SpotifyRemoteClient = function(host) {
  console.log('host: ');console.log(host);
  this.host = host || window.location.hostname;
  console.log('host: ');console.log(this.host);
  return this;
};

SpotifyRemoteClient.prototype.init = function(io, controller) {
  this.io = io;
  this.controller = controller;
  this.connect();
};

SpotifyRemoteClient.prototype.connect = function() {
  if (this.socket && this.socket.socket.connected) return;

  if (!this.socket) {
    this.socket = this.io.connect(this.host);
  } else {
    this.socket.socket.connect(); // reuse previous socket and simply reconnect
  }

  this.socket.on('currentTrack', this.showCurrentTrack.bind(this));
  this.socket.on('currentState', this.showCurrentState.bind(this));
  this.socket.on('currentArtwork', this.showCurrentArtwork.bind(this));
};

SpotifyRemoteClient.prototype.disconnect = function() {
  this.socket.disconnect();
  this.socket.removeAllListeners();
};

SpotifyRemoteClient.prototype.showCurrentTrack = function(track) {
  // don't rerender stuff when nothing has changed
  if (this.currentTrack && this.currentTrack.id === track.id) return;

  this.controller.showCurrentTrack(track);
  this.currentTrack = track;
};

SpotifyRemoteClient.prototype.showCurrentState = function(state) {
  this.controller.showCurrentState(state);
};

SpotifyRemoteClient.prototype.showCurrentArtwork = function(artwork) {
  this.controller.showCurrentArtwork(artwork);
};

SpotifyRemoteClient.prototype.emit = function(event, data) {
  if (this.socket) this.socket.emit(event, data);
};

SpotifyRemoteClient.prototype.forEach = function(obj, iterator, context) {
  Array.prototype.forEach.call(obj, iterator, context);
};

SpotifyRemoteClient.prototype.getFromSpotify = function(url, successHandler, errorHandler) {
  var xhr = new XMLHttpRequest();
  var parsedResponse;

  xhr.open('GET', url, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        try {
          parsedResponse = JSON.parse(xhr.responseText);
          successHandler(parsedResponse);
        } catch(e) {
          errorHandler('Woah! Something went wrong!');
          if (typeof console === 'object') console.error(e);
        }
      } else {
        errorHandler('Woah! Something went wrong!');
      }
    }
  };

  xhr.send();
};

SpotifyRemoteClient.prototype.getAlbums = function(uri, successHandler, errorHandler) {
  this.getFromSpotify(
    'http://ws.spotify.com/lookup/1/.json?uri=' + uri + '&extras=track',
    successHandler,
    errorHandler
  );
}

SpotifyRemoteClient.prototype.getArtist = function(uri, successHandler, errorHandler) {
  this.getFromSpotify(
    'http://ws.spotify.com/lookup/1/.json?uri=' + uri + '&extras=album',
    successHandler,
    errorHandler
  );
}

SpotifyRemoteClient.prototype.getSearchResults = function(type, term, successHandler, errorHandler) {
  var searchUrl = {
    albums: 'http://ws.spotify.com/search/1/album.json?q=' + term,
    artists: 'http://ws.spotify.com/search/1/artist.json?q=' + term,
    tracks: 'http://ws.spotify.com/search/1/track.json?q=' + term
  }[type];

  this.getFromSpotify(
    searchUrl,
    successHandler,
    errorHandler
  );
}

SpotifyRemoteClient.prototype.previousTrack = function() {
  this.emit('previous');
}

SpotifyRemoteClient.prototype.nextTrack = function() {
  this.emit('next');
}

SpotifyRemoteClient.prototype.togglePlay = function() {
  this.emit('playPause');
}

SpotifyRemoteClient.prototype.volumeUp = function() {
  this.emit('volumeUp');
}

SpotifyRemoteClient.prototype.volumeDown = function() {
  this.emit('volumeDown');
}

SpotifyRemoteClient.prototype.toggleMute = function() {
  this.emit('muteUnmute');
}

SpotifyRemoteClient.prototype.setVolume = function(value) {
  this.emit('setVolume', value);
}

SpotifyRemoteClient.prototype.setPosition = function(value) {
  this.emit('jumpTo', value);
}

SpotifyRemoteClient.prototype.playTrack = function(uri) {
  this.socket.emit('playTrack', uri);
}
