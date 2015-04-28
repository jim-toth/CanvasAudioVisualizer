$(document).ready(function () {
	var context;
	if (typeof AudioContext !== "undefined") {
		context = new AudioContext();
	} else if (typeof webkitAudioContext !== "undefined") {
		context = new webkitAudioContext();
	} else {
		throw new Error('AudioContext not supported.');
	}

	window.reload = function () {
		$('#status').text('LOADING');
		$('#reload').text('reload').prop('disabled', true);
		$('#error').text('');

		SC.get('/resolve', {url: $('#trackUri').val(), client_id: '8320c8fe21f98b89ad50068014b92068'}, function(track, err) {
			if(err) {
				$('#error').text(err);
			}

			if(!track.streamable) {
				$('#error').text('Error: This track is not streamable due permissions set.');
			}

			// Update track artist and title information
			$('#track_title').text(track.title);
			$('#track_artist').text(track.user.username + ' - ');

			// Update logo link to track page
			$('#sc_logo_anchor').attr('href', track.permalink_url);

			var request = new XMLHttpRequest();
			request.open('GET', track.stream_url+'?client_id=8320c8fe21f98b89ad50068014b92068', true);
			request.responseType = "arraybuffer";

			// Our asynchronous callback
			request.onload = function() {
				context.decodeAudioData(request.response, function(buffer) {
					// create sound source and set buffer
					var soundSource = context.createBufferSource();
					soundSource.buffer = buffer;

					// create gain node
					var volume = context.createGain();
					volume.gain.value = 1;

					// create analysis node
					var analyser = context.createAnalyser();
					analyser.fftSize = 512;
					var frequencyData = new Uint8Array(analyser.frequencyBinCount);
					
					// wire connections
					soundSource.connect(analyser);
					analyser.connect(volume);
					volume.connect(context.destination);
					
					// control callbacks
					window.playSound = function () {
						draw();

						soundSource.start();
					};

					window.stopSound = function () {
						soundSource.stop();
					};

					function getClippedRegion(image, x, y, width, height) {
						var canvas = document.createElement('canvas'),
						ctx = canvas.getContext('2d');

						canvas.width = width;
						canvas.height = height;

						//                   source region         dest. region
						ctx.drawImage(image, x, y, width, height,  0, 0, width, height);

						return canvas;
					}

					// Set up the visualization elements
					var image = new Image();
					//image.src = 'images/clipclop.png';
					image.src = track.artwork_url.replace('-large.','-t500x500.');
					var canvas = $('#canvas')[0];
					var canvasCtx = canvas.getContext('2d');
					var barWidth = 0;
					var bars = [];
					var barNum = (analyser.fftSize / 2);

					function drawLogo(atOrigin) {
						console.log('drawLogo', atOrigin);
						// draw artwork background
						//canvasCtx.drawImage(image,0,0);

						// draw SC logo
						var sc_logo = new Image();
						sc_logo.src = 'images/sc_logo.png';
						sc_logo.onload = function () {
							var logoOffsetY = canvas.height-sc_logo.height
							if(atOrigin) canvasCtx.translate(0, logoOffsetY);
							canvasCtx.fillStyle="white";
							canvasCtx.fillRect(0, 0, sc_logo.width, sc_logo.height);
							canvasCtx.drawImage(sc_logo, 0, 0);
							if(atOrigin) canvasCtx.translate(0, -logoOffsetY);
						};
					};

					image.onload = function () {
						// paint image to canvas
						canvas.width = image.width;
						canvas.height = image.height;
						barWidth = Math.ceil(canvas.width / barNum);
						//canvasCtx.drawImage(image, 0, 0);

						// separate image into bars
						for(var i=0; i < barNum; i++) {
							bars.push(getClippedRegion(image, i*barWidth, 0, barWidth, canvas.height));
							//canvasCtx.drawImage(bars[i], i * barWidth, 0);
						}
						canvasCtx.drawImage(image,0,0);
						//drawLogo(true);
					};

					// animation code
					function draw() {
						requestAnimationFrame(draw);

						analyser.getByteFrequencyData(frequencyData);
						//console.log(frequencyData);

						// Update the visualisation
						canvasCtx.drawImage(image,0,0);
						
						var grd = canvasCtx.createLinearGradient(0,0,0,canvas.height);
						grd.addColorStop(0,'rgba(0,0,0,0.75');
						grd.addColorStop(0.5,'rgba(255,85,0,0.75)');
						grd.addColorStop(1,'rgba(255,85,0,1)');
						canvasCtx.fillStyle = grd;
						//canvasCtx.fillStyle="red";
						var originX = canvas.width/2;
						var originY = canvas.height/2;
						var barMax = canvas.height;
						var barMin = 0;
						var centerOffset = 0;
						var minAngle = 90;
						var maxAngle = 180;

						//canvasCtx.drawImage(image,0,0);
						$.each(bars, function (idx, bar) {
							var clipHeight = (frequencyData[idx]*barMax)/256;
							if(clipHeight < barMin) {
								clipHeight = barMin;
							}
							//var dir = (Math.floor(Math.random() * 2) == 0);
							//var neg = (dir) ? 1 : -1;
							//canvasCtx.rotate(neg*(256-clipHeight)*Math.PI/180);
							canvasCtx.translate(0, canvas.height);
							var angle = ((idx*-180/bars.length)*Math.PI/180)-45;//(idx*90/bars.length)*Math.PI/180;
							
							canvasCtx.rotate(angle);
							barWidth = 3;
							canvasCtx.fillRect(centerOffset, centerOffset, barWidth, clipHeight);//clipHeight);//barWidth, clipHeight);
							//canvasCtx.drawImage(image, 0, 0, barWidth, clipHeight, idx * barWidth, 0, barWidth, canvas.height);
							canvasCtx.rotate(-angle);
							//canvasCtx.rotate(-neg*(256-clipHeight)*Math.PI/180);
							canvasCtx.translate(0, -canvas.height);

							//if(!--bars.length) drawLogo(false);
						});

						//drawLogo();
					};

					$('#play').prop('disabled', false);
					$('#stop').prop('disabled', false);
					$('#status').text('READY');
					$('#reload').prop('disabled', false);
				});
			};
			request.send();
		});
	};
});