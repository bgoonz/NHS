example files for [nodepdx](http://nodepdx.org/) 2013

# raw

make music with bytes

[my humble beginnings](http://www.perlmonks.org/?node_id=571140) [perlmonks 2006]

# waves

use [baudio](https://github.com/substack/baudio) to make music with wave tricks

# synth

write custom synths for a usb midi keyboard

# warp

step-by-step of how I made
[warp](https://soundcloud.com/substack/warp)

# drop undrop

step-by-step of how I made
[drop undrop](https://soundcloud.com/substack/drop-undrop)

# clown dentistry

step-by-step of how I made
[clown dentistry](https://soundcloud.com/substack/clown-dentistry)

# freestyle

if we have time

# in the browser

Just use [jsynth](https://npmjs.org/package/jsynth) instead of
[baudio](https://github.com/substack/baudio):

```
$ browserify -r jsynth:baudio music.js > bundle.js
```
