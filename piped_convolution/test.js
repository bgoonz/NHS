var spawn = require('child_process').spawn
var size = 100
var scale = [25, 100]
var ff = spawn('ffmpeg', ['-i', './data/train.mp4', '-loglevel', '0', '-vf', 'scale='+scale.join(':')+',fps=20', '-vframes', size, '-c:v','rawvideo','-f','image2pipe','-pix_fmt', 'gray', '-'])
 ff.stderr.on('data', e=>console.log(e.toString()))
ff.stdout.on('data', d => console.log(d.length))
ff.stdout.resume()
