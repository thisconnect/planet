(function(){

var state = null;

var mySlider = new Slider('slider', 'knob', {
	offset: -2,
	onChange: function(step){
		if (state != 'acquired') state = step;
		else socket.emit('update', {
			key: 'slider',
			value: step
		});
	},
	onComplete: function(step){
		if (state == 'acquired'){
			console.log('release key');
			socket.emit('release key', 'slider');
			state = null;
		}
	}
});

mySlider.element.addEvent('mousedown', function(){
	state = mySlider.step;
	if (state != 'locked') socket.emit('acquire lock', 'slider');
});

socket.on('update', function(data){
	if (data.key == 'slider' && state != 'acquired'){
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

socket.on('lock acquired', function(data){
	if (data == 'slider'){
		state = 'acquired';
		socket.emit('update', {
			key: 'slider',
			value: state
		});
	}
});

socket.on('lock released', function(data){
	if (data == 'slider') state = null;
});

socket.on('lock key', function(data){
	if (data == 'slider'){
		mySlider.detach();
		state = 'locked';
	}
});

socket.on('release key', function(data){
	if (data == 'slider'){
		mySlider.attach();
		state = null;
	}
});

})();
