Sample code for ML challenge.  

`server.js` is an ffmpeg streamer that batches videos frames for training and testing;  with a little work it would make a great general library, but currently it is coded specifically for an odd ML challenge posed to me by some startup.

`ml.js' is the convolution network, which requires my little ML framework-in-progress [Various](https://github.com/NHQ/various), which is build on TensorFlow.js, using only base matrix operations.

`test.js` is a lightweight check for the ffmpeg streamer output.
