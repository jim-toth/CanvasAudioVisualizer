document.addEventListener("DOMContentLoaded", function(event) {
	var bgImage = new Image();
	bgImage.src = 'js/clipclop.jpg';
	var barMin = 0;
	var centerOffset = 0;
	var minAngle = 90;
	var maxAngle = 180;
	var barWidth = 3;

	SC.get('/resolve', { url: 'https://soundcloud.com/y2k2y/nitewine', client_id: '8320c8fe21f98b89ad50068014b92068' }, function(track, err) {
		var cav = new CanvasAudioVisualizer('audioElement', 'canvasElement', {
			fftSize: 512,
			animateFn: function (canvas, canvasContext, streamData) {
				// reset canvas
				canvasContext.fillStyle = 'white';
				canvasContext.fillRect(0,0,canvas.width,canvas.height);

				// if image is ready, update canvas to image size
				if(bgImage.complete) {
					canvas.width = bgImage.width;
					canvas.height = bgImage.height;

					canvasContext.drawImage(bgImage,0,0);
				}

				// set up to draw bars
				var numBars = this.fftSize / 2;
				var grd = canvasContext.createLinearGradient(0,0,0,canvas.height);
				grd.addColorStop(0,'rgba(0,0,0,0.75');
				grd.addColorStop(0.5,'rgba(255,85,0,0.75)');
				grd.addColorStop(1,'rgba(255,85,0,1)');
				canvasContext.fillStyle = grd;
				var originX = canvas.width/2;
				var originY = canvas.height/2;
				var barMax = canvas.height;

				// visualize bars
				for(var i=0; i < numBars; i++) {
					var clipHeight = (streamData[i]*barMax)/256;
					if(clipHeight < barMin) {
						clipHeight = barMin;
					}
					canvasContext.translate(0, canvas.height);
					var angle = ((i*-180/numBars)*Math.PI/180)-45;
					canvasContext.rotate(angle);
					canvasContext.fillRect(centerOffset, centerOffset, barWidth, clipHeight);
					canvasContext.rotate(-angle);
					canvasContext.translate(0, -canvas.height);
				}
			}
		});

		// UI play function
		window.play = function () {
			//cav.play('js/nitewine.mp3');
			cav.play(track.stream_url+'?client_id=8320c8fe21f98b89ad50068014b92068');
		};
		// UI stop function
		window.stop = function () {
			cav.pause();
		};
	});
});