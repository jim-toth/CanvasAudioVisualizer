var CanvasAudioVisualizer = function (audio) {
	var self = this;
	var player = document.getElementById(audio);
	var audioContext = new (window.AudioContext || window.webkitAudioContext);
	var source = audioContext.createMediaElementSource(player);
	var analyser = audioContext.createAnalyser();

	analyser.fftSize = 512;

	source.connect(analyser);
	analyser.connect(audioContext.destination);

	var sampleAudio = function () {
		analyser.getByteFrequencyData(self.streamData);
	};

	self.streamData = new Uint8Array(analyser.fftSize/2);
	self.play = function (streamUri) {
		player.setAttribute('src', streamUri);
		player.play();
	};

	setInterval(sampleAudio, 50);
};