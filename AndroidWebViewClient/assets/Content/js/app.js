'use strict';
console.log('app.js started');

if (!window.WebSocket)
{
    window.WebSocket = require('ws');
}
var WebSocketStream = require('websocketstream');
var rpc = require('rpc-stream');

var ws = new WebSocket('ws://localhost:9000');
var c = new WebSocketStream(ws);

var d = rpc();

c
    .pipe(d)
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

d
    .rpc('hello',
        true, //must keep this format, true is dummy

        function(msg)
        {
            console.log(msg);
        });
d
    .rpc('hello1',
        'JIM',
        function(err, mess)
        {
            if (err) throw err
            console.log(mess);
        });