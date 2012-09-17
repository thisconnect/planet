$$('input[type=reset]').addEvent('click', function(e){
	e.stop();
	socket.emit('delete');
	location.reload(true);
});
