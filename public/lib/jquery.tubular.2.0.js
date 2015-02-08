/* jQuery tubular plugin
|* by Sean McCambridge, modified by David Crowell
|* http://www.seanmccambridge.com/tubular
|* version: 2.0
|* updated: February 8, 2015
|* since 2010
|* licensed under the MIT License
|* Enjoy.
|* 
|* Thanks,
|* Sean */

;(function ($, window) {
    // defaults
    var defaults = {
        ratio: 16/9, // usually either 4/3 or 16/9 -- tweak as needed
        mute: true,
        repeat: true,
        width: $(window).width(),
        wrapperZIndex: 99,
        playButtonClass: 'tubular-play',
        pauseButtonClass: 'tubular-pause',
        muteButtonClass: 'tubular-mute',
        volumeUpClass: 'tubular-volume-up',
        volumeDownClass: 'tubular-volume-down',
        increaseVolumeBy: 10,
        start: 0
    };

    // methods

    var tubular = function($node, options) { // should be called on the wrapper div
        var options = $.extend({}, defaults, options),
            $body = $('body'); // cache body node
            // $node = $(node); // cache wrapper node

        setOptions(options);
        // build container
        var tubularContainer = '<div id="tubular-container" style="overflow: hidden; position: fixed; z-index: 1; width: 100%; height: 100%"><div id="tubular-player" style="position: absolute"></div></div><div id="tubular-shield" style="width: 100%; height: 100%; z-index: 2; position: absolute; left: 0; top: 0;"></div>';

        // set up css prereq's, inject tubular container and set up wrapper defaults
        $('html,body').css({'width': '100%', 'height': '100%'});
        $body.prepend(tubularContainer);
        $node.css({position: 'relative', 'z-index': options.wrapperZIndex});

        // set up iframe player, use global scope so YT api can talk
        window.player;
        window.onYouTubeIframeAPIReady = function() {
            player = new YT.Player('tubular-player', {
                width: options.width,
                height: Math.ceil(options.width / options.ratio),
                videoId: options.videoId,
                playerVars: {
                    controls: 0,
                    showinfo: 0,
                    modestbranding: 1,
                    wmode: 'transparent'
                },
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange
                }
            });
            setPlayer(player);
        }

        window.onPlayerReady = function(e) {
            resize();
            if (getOptions().mute) e.target.mute();
            if (getOptions().id) {
                e.target.seekTo(getOptions().start);
                e.target.loadVideoById(getOptions().id);
            }
            setInitialized();
        }

        window.onPlayerStateChange = function(state) {
            if (state.data === 0 && getOptions().repeat) { // video ended and repeat option is set true
                player.seekTo(getOptions().start); // restart
                player.playVideo();
            }
        }

        // resize handler updates width, height and offset of player after resize/init
        var resize = function() {
            var width = $(window).width(),
                pWidth, // player width, to be defined
                height = $(window).height(),
                pHeight, // player height, tbd
                $tubularPlayer = $('#tubular-player');

            // when screen aspect ratio differs from video, video must center and underlay one dimension

            if (width / options.ratio < height) { // if new video height < window height (gap underneath)
                pWidth = Math.ceil(height * options.ratio); // get new player width
                $tubularPlayer.width(pWidth).height(height).css({left: (width - pWidth) / 2, top: 0}); // player width is greater, offset left; reset top
            } else { // new video width < window width (gap to right)
                pHeight = Math.ceil(width / options.ratio); // get new player height
                $tubularPlayer.width(width).height(pHeight).css({left: 0, top: (height - pHeight) / 2}); // player height is greater, offset top; reset left
            }

        }

        function getPlayer() {
            return $.data($node, 'player');
        }
        function getOptions() {
            return $.data($node, 'options');
        }
        function setPlayer(player) {
            $.data($node, 'player', player);
        }
        function setOptions(options) {
            $.data($node, 'options', options);
        }
        function setInitialized() {
            $.data($node, 'initialized', true);
        }

        // events
        $(window).on('resize.tubular', function() {
            resize();
        })

        $('body').on('click','.' + options.playButtonClass, function(e) { // play button
            e.preventDefault();
            player.playVideo();
        }).on('click', '.' + options.pauseButtonClass, function(e) { // pause button
            e.preventDefault();
            player.pauseVideo();
        }).on('click', '.' + options.muteButtonClass, function(e) { // mute button
            e.preventDefault();
            (player.isMuted()) ? player.unMute() : player.mute();
        }).on('click', '.' + options.volumeDownClass, function(e) { // volume down button
            e.preventDefault();
            var currentVolume = player.getVolume();
            if (currentVolume < options.increaseVolumeBy) currentVolume = options.increaseVolumeBy;
            player.setVolume(currentVolume - options.increaseVolumeBy);
        }).on('click', '.' + options.volumeUpClass, function(e) { // volume up button
            e.preventDefault();
            if (player.isMuted()) player.unMute(); // if mute is on, unmute
            var currentVolume = player.getVolume();
            if (currentVolume > 100 - options.increaseVolumeBy) currentVolume = 100 - options.increaseVolumeBy;
            player.setVolume(currentVolume + options.increaseVolumeBy);
        })
    }

    function getPlayer($node) {
        return $.data($node, 'player');
    }
    function getOptions($node) {
        return $.data($node, 'options');
    }
    function hasInitialized($node) {
        return $.data($node, 'initialized');
    }
    function setPlayer($node, player) {
        $.data($node, 'player', player);
    }
    function setOptions($node, options) {
        $.data($node, 'options', options);
    }

    function getMethods(obj) {
      var result = [];
      for (var id in obj) {
        try {
          if (typeof(obj[id]) == "function") {
            result.push(id + ": " + obj[id].toString());
          }
        } catch (err) {
          result.push(id + ": inaccessible");
        }
      }
      return result;
    }

    var playVideo = function($node, options){
        var player = getPlayer($node);
        setOptions($node, options);
        if (hasInitialized($node)) {
            if (options.mute) player.mute();
            player.loadVideoById(options.id);
            player.seekTo(options.start);
        }
    }

    // load yt iframe js api

    var tag = document.createElement('script');
    tag.src = "//www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // create plugin

    $.fn.setupBackgroundVideo = function (options, $node) {
        return this.each(function () {
            if (!$.data($node, 'tubular_instantiated')) { // let's only run one
                $.data($node, 'tubular_instantiated', 
                tubular($node, options));
            }
        });
    }

    $.fn.playBackgroundVideo = function(options, $node) {
        options = $.extend({}, getOptions($node), options);
        setOptions($node, options);
        playVideo($node, options); 
    }

})(jQuery, window);
