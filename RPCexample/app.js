'use strict';

var port = 9000;
console.log('Server port: ' + port);

var WebSocket = require('ws');
var WebSocketStream = require('WebSocketStreamPlus');
var rpc = require('rpc-stream');

var webSocketServer =
    new WebSocket.Server(
    {
        port: port
    })
    .on('connection',
        function(ws)
        {
            var c = new WebSocketStream(ws);
            c
                .pipe(
                    rpc(
                    {
                        hello: function(val, f) // must keep this format
                        {
                            console.log('rpc:hello is called!');
                            f('hello');
                            f('hello');
                        },
                        hello1: function(val, f)
                        {
                            console.log('rpc:hello1 is called!');
                            f(null, 'hello!! ' + val)
                        }
                    }))
                .pipe(c)
                .on('close', function()
                {
                    console.log('c close');
                    ws.close();
                })
                .on('error', function()
                {
                    console.log('c error');
                    ws.close();
                })
                .on('finish', function()
                {
                    console.log('c finish');
                    ws.close();
                });
        });