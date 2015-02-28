# Hal — Your home automator, alarm clock, and eventual cause of death

## What?

Ok, it's got a speech recognition engine running in the background at all 
times, and a few other widgets you can load in. Widgets currently include

1. Alarm Clock
2. Spotify Remote - controller for spotify on your machine
3. Space - stream from the ISS

Hit the website, click a button to enable microphone use, and you're good to go.
(Only tested with Chrome on OSX)

Almost.

## Installation

1. Install [Node.js](http://nodejs.org/)
2. Install npm
3. Install the heroku toolbelt
4. Clone the repo
5. `npm install`
6. `$ foreman start`

## Gotchas

* If you're hosting locally, you'll have to keep re-enabling the microphone
* If you're not connecting over https, you'll have to keep re-enabling the microphone
* For the Spotify widget, make sure `spotify-remote` is running
* Spotify remote only works on OSX
* Spotify remote traffic can't use https, so click the shield in your address bar to enable mixed content

## Starting and using spotify-remote

1. Make sure Spotify is running.
2. Install spotify-remote

    ```
    $ npm install -g spotify-remote
    ```
3. Start the spotify-remote server in a shell:

    ```
    $ spotify-remote
    ```

The client is expecting port 3333

```
$ PORT=3333 spotify-remote
```

## Credits

* [David Crowell](http://github.com/david-crowell)
* [tubular](http://www.seanmccambridge.com/tubular/)
* [spotify-remote](https://www.npmjs.com/package/spotify-remote)

## Todo

Everything?

## License

MIT

[Spotify](http://www.spotify.com) is a registered trademark of Spotify Ltd.
Hal and spotify-remote are in no way affiliated with Spotify
