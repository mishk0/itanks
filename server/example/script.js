
var socket = new WebSocket("ws://172.16.220.124:1337/game");

socket.onopen = function() {
    console.log('SOCKET OPENED');
};

socket.onmessage = function(data) {
    console.log('MESSAGE:', data);
};

socket.onclose = function() {

};
