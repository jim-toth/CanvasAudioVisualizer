var cav = new CanvasAudioVisualizer('audio');
var canvas = document.getElementById('canvas');
var canvasContext = canvasElement.getContext('2d');

var draw = function () {
	requestAnimationFrame(draw);
};

cav.playStream();