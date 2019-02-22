var CanvasAudioVisualizer = function (audio, canvas, options) {
	var self = this;
  var audioContext, source, analyser, initialized = false;

	// Grab the audio player element
	var player = document.getElementById(audio);
  
  // Grab the canvas and the canvas context
	var canvas = document.getElementById(canvas);
	var canvasContext = canvas.getContext('2d');
  
	var initAudio = function () {
    // Grab the audio context safely
    var audioContext = new (window.AudioContext || window.webkitAudioContext);

    // Grab the audio source and create an analyser
    var source = audioContext.createMediaElementSource(player);
    var analyser = audioContext.createAnalyser();

    // Grab and set fftSize override from options if it exists
    if(typeof options != "undefined" && typeof options.fftSize != "undefined") {
      analyser.fftSize = options.fftSize;
    } else {
      analyser.fftSize = 512; //default to 512
    }

    // Wire the audio source => analyser => destination (speakers)
    source.connect(analyser);
    analyser.connect(audioContext.destination);
		
	// Initialize stream data
	self.streamData = new Uint8Array(analyser.fftSize/2);
  };

	// Simple function to grab the current FFT data from the audio
	var sampleAudio = function () {
		analyser.getByteFrequencyData(self.streamData);
	};

	// Draw function
	var draw = function () {
		// Set up loop
		requestAnimationFrame(draw);

		// Update streamData
		sampleAudio();

		// Fire animate callback function, if it exists, to update the canvas
		if(typeof options != "undefined" && typeof options.animateFn == "function") {
			options.animateFn(canvas, canvasContext, self.streamData);
		}
	};

	// Define play function to begin playback, animation loop, and analysis
	var started = false;
	self.play = function (streamUri) {
    if (!initialized) {
      initAudio();
    }
		player.setAttribute('src', streamUri);
		player.addEventListener('loadedmetadata', function () {
			player.play();
		}, false);
		//player.play();
		if(!started) {
			draw();
			started = true;
		}
	};

	// Define pause function to pause audio playback
	self.pause = function () {
		player.pause();
	};
};
