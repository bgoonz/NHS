# how to use

notice:  this has been tested with node 0.10.3.  later version have node-gygp issues.

```
npm install jsynth-jack
````

You will need jack installed, and probably the daemon jackd, which may come with jack. Try apt-get.

The following is how I run jackd, using ALSA on Ubuntu 14.x

```
sudo jackd -R -d alsa -d hw:$card,$device
```

vars $card and $device can be found with command:

```
aplay -l
```

You will want to choose the one your sound system is currently using.  For instalce, an external USB interface, internal card, etc...

Then run your program:

```
sudo node myProgram.js
```
optional flags include:
```
-r record, this will automatically write a file, you can specify the name with
-o outfile, /tracks/myFile; the file name  will have the samplerate appended to it
record writes pure, mono, 32bit float data only, which you can convert with sox:
sox -c 1 -r $sampleRate -t f32 infile outfile
```


You program should look something like this:

```js
var jsynth = require('jsynth-jack')

var dsp = function(t, s, i){ //@time, @sampleInde, @input
  // input will be your microphone or line-in
  // it is an array with those audio samples, or [0, 0]
  // the ddefault and standard is a two-channel output
  // rewrite the input

  i[0] = i[1] = Math.sin(t * Math.PI * 2 * 441)
  
  // no return value
}

jsynth(dsp)

```

