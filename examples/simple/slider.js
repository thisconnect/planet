(function(){

	var mySlider = new Slider('slider', 'knob', {
		offset: -2
	});

	mySlider.addEvent('change', function(step){
		socket.emit('update', {
			key: 'slider',
			value: step
		});
	});

	mySlider.element.addEvent('mousedown', function(){
		socket.emit('update', {
			key: 'slider',
			value: mySlider.step
		});
	});

	socket.on('update', function(data){
		if (data.key == 'slider'){
			mySlider.setKnobPosition(mySlider.toPosition(data.value));
			mySlider.step = data.value;
		}
	});

	socket.on('initial state', function(data){
		if ('slider' in data){
			mySlider.setKnobPosition(mySlider.toPosition(data.slider));
			mySlider.step = data.slider;
		}
	});

})();
