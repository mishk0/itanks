#!/usr/bin/env node

var _ = require('lodash');
var http = require('http');
var WebSocketServer = require('websocket').server;
var GameLogic = require('./gamelogic');

var server = http.createServer(function(request, response) {
    response.end(404, '');
});

var webSocketServer = new WebSocketServer({
    httpServer: server
});

server.listen(process.env.PORT || 1337, function() {
    console.log('SERVER IS STARTED on port:', port);

    var game = new GameLogic();

    webSocketServer.on('request', function(request) {

        if (request.resource === '/game') {
            var connection = request.accept(null, request.origin);

            game.onConnect(connection)
        } else {
            request.reject();
        }

    });
});
