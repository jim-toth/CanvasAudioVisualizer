var CanvasAudioVisualizer = function (audio, canvas, options) {
	var self = this;
	var player = document.getElementById(audio);
	var audioContext = new (window.AudioContext || window.webkitAudioContext);
	var source = audioContext.createMediaElementSource(player);
	var analyser = audioContext.createAnalyser();

	if(typeof options != "undefined" && typeof options.fftSize != "undefined") {
		analyser.fftSize = options.fftSize;
	} else {
		analyser.fftSize = 512;
	}

	source.connect(analyser);
	analyser.connect(audioContext.destination);

	var canvas = document.getElementById(canvas);
	var canvasContext = canvas.getContext('2d');

	var sampleAudio = function () {
		analyser.getByteFrequencyData(self.streamData);
	};

	var draw = function () {
		requestAnimationFrame(draw);

		sampleAudio();

		if(typeof options != "undefined" && typeof options.animateFn == "function") {
			options.animateFn(canvas, canvasContext, self.streamData);
		}
	};

	self.streamData = new Uint8Array(analyser.fftSize/2);
	self.play = function (streamUri) {
		player.setAttribute('src', streamUri);
		player.play();
		draw();
	};
};