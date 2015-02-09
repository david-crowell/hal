# Hal — Your home automator, alarm clock, and eventual cause of dearth

## What?

Ok, it's got a speech recognition engine running in the background at all 
times, and a few other widgets you can load in. Widgets currently include

1. Alarm clock
2. Spotify controller

Hit the website, click a button to enable microphone use, and you're good to go.
(Only tested with Chrome on OSX)

Almost.

## Installation

1. Install [Node.js](http://nodejs.org/)
2. Install the heroku toolbelt
3. Clone the repo
4. `npm install`
5. `$ foreman start`

## Gotchas

* If you're hosting locally, you'll have to keep re-enabling the microphone
* If you're not connecting over https, you'll have to keep re-enabling the microphone
* For the Spotify widget, make sure `spotify-remote` is running
* Spotify remote only works on OSX
* Spotify remote traffic can't use https, so click the shield in your address bar to enable mixed content

## Starting and using spotify-remote

1. Make sure Spotify is running.
2. Start the spotify-remote server in a shell:

    ```
    $ spotify-remote
    ```

The client is expecting port 3333

```
$ PORT=1337 spotify-remote
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
spotify-remote is in no way affiliated with Spotify, we're just a little
tool sitting on top of the Spotify.app and their webservices.
