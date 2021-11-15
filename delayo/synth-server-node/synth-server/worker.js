this.onmessage = function(evt){

    var self = this;
    var evt = evt;
    var sampleRate = evt.data.sampleRate;
    var resamplers = [];
    var id = evt.data.id;
    var chans = 1;

    var player = AV.Asset.fromURL('http://10.0.0.3:11002/audio.acc?' + evt.data.uri);

    player.on('format', function(d){


	d.sourceLength = player.source.length;
	chans = d.channelsPerFrame;

	var bufferSize = Math.ceil(4096 / (sampleRate / d.sampleRate));

	for(var x = 0; x < chans; x++){
	    resamplers[x] = new Resampler(d.sampleRate, sampleRate, 1, bufferSize);
	}
	
	self.postMessage({type: 'meta', data: d});

    })

    player.on('meta', function(d){
	self.postMessage({id: id, type: 'meta', data: d})
    })

    player.on('data', function(bufArray){
        for(x in resamplers){
	    bufArray[x] = resamplers[x].resampler(bufArray[x])
	}
	self.postMessage({id: id, buffer: bufArray})
    });

    player.on('end', function(){
	self.postMessage({id: id, type: 'end'})
    });

    player.start();
}

