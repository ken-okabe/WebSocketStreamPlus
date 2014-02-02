/* jslint node: true */
/* global describe, it, before, beforeEach, after, afterEach */

'use strict';

// WebSocket API
// http://www.w3.org/TR/2012/CR-websockets-20120920/

// Node.js v0.10.1
// http://nodejs.org/docs/v0.10.1/api/stream.html

// object.watch===================
if (!Object.prototype.watch)
{
      Object.defineProperty(Object.prototype, "watch",
      {
            enumerable: false,
            configurable: true,
            writable: false,
            value: function(prop, handler)
            {
                  var
                  oldval = this[prop],
                        newval = oldval,
                        getter = function()
                        {
                              return newval;
                        }, setter = function(val)
                        {
                              oldval = newval;
                              newval = handler.call(this, prop, oldval, val);
                              return newval;
                        };

                  if (delete this[prop])
                  { // can't watch constants
                        Object.defineProperty(this, prop,
                        {
                              get: getter,
                              set: setter,
                              enumerable: true,
                              configurable: true
                        });
                  }
            }
      });
}

// object.unwatch
if (!Object.prototype.unwatch)
{
      Object.defineProperty(Object.prototype, "unwatch",
      {
            enumerable: false,
            configurable: true,
            writable: false,
            value: function(prop)
            {
                  var val = this[prop];
                  delete this[prop]; // remove accessors
                  this[prop] = val;
            }
      });
}
//=====================================
var stream = require('stream');

var isOpen;
var getReadyState;
var hasBufferedData;

var WebSocketStream = function(socket, options)
{
      console.log('============WebSocketStream instance==========');
      var socketStream = this;

      // From _stream_readable.  This should be Infinity but see
      // https://github.com/joyent/node/pull/4955
      var MAX_HWM = 0x800000;

      var duplexOptions = options ||
      {};

      duplexOptions.decodeStrings = false;
      duplexOptions.highWaterMark = MAX_HWM;
      stream.Duplex.call(this, duplexOptions);
      this.socket = socket;

      try
      {
            //this is just for rpc-stream on WebSocket Unsupporting AndroidWebView(4.1-4.3), 
            //works with websocket.js+  TooTallNate/Java-WebSocket with subClass + WebSocketFactory Hack

            socket.isOpen();

            console.log('WebSocketStream node_module MODE:webSocket UNSUPPORTED webView, JAVA websocket bridge used');

            isOpen = function(socket1)
            {
                  return socket1.isOpen();
            };

            hasBufferedData = function(socket1)
            {
                  return socket1.hasBufferedData();
            };

            socket.onmessage = function(data)
            {
                  console.log('wssNPMonMsg <--B.webSocket.msg  on websocket.js <-- JAVA' + data);

                  var data1 = data.replace(/(\r\n|\n|\r)/gm, '') + '\n';
                  console.log('<---------------------------' + data1);
                  try
                  {
                        socketStream.push(data1);
                  }
                  catch (e)
                  {

                        console.log(e);
                  }
            };

      }
      catch (e)
      {
            console.log('WebSocketStream node_module MODE:node.ws or webSocket SUPPORTED webView');

            isOpen = function(socket1)
            {
                  return (socket1.readyState == socket.OPEN);
            };

            hasBufferedData = function(socket1)
            {
                  return socket1.hasBufferedData;
            };

            socket.onmessage = function(event)
            {
                  console.log('wssNPMonMsg ' + event.data);
                  // Convert ArrayBuffers into Buffers.
                  socketStream.push(event.type == 'Binary' ? new Buffer(event.data) : event.data === '' ? null : event.data);
            };

      }

      socket.onopen = function()
      {
            console.log('wssNPMonopen');
            socketStream.emit('open');
      };
      socket.onerror = function()
      {
            console.log('wssNPMonerror');
            socketStream.emit('error');
      };
      socket.onclose = function()
      {
            console.log('wssNPMonclose');
            socketStream.emit('close');
      };

      //inherits close, error, and override finish
      this.on('finish', function()
      {
            // Use empty string to represent null.
            this.write('');
            socket.close();
      });
      this.on('close', function()
      {
            socket.close();
      });
      this.on('error', function()
      {
            socket.close();
      });
};

require('util')
      .inherits(WebSocketStream, stream.Duplex);


WebSocketStream.prototype._read = function(size)
{
      // Nothing to do here.
};

WebSocketStream.prototype._write = function(chunk, encoding, callback)
{
      var webSocketStream = this;
      var socket = this.socket;

      var send = function()
      {
            console.log('wssNPM======send====' + chunk);
            // Convert Buffers into ArrayBuffers
            socket.send(chunk instanceof Buffer ? new Uint8Array(chunk) : chunk);

            callback();
      };

      if (isOpen(socket))
      {
            send();
      }
      else
      {
            webSocketStream.on('open', function()
            {
                  console.log('>openState open');
                  send();
            });
      }
};

WebSocketStream.prototype.write = function(chunk, encoding, callback)
{
      var webSocketStream = this;
      var socket = this.socket;
      var flushed;
      // Write the chunk and ignore Duplex's return value because we've maxed
      // out the high water mark.
      stream.Duplex.prototype.write.call(this, chunk, encoding, callback);

      // We have to poll socket.bufferedAmount because there's no event to
      // tell us when it's zero.  :-(

      var checkBufferedAmount = function()
      {
            if (!hasBufferedData(socket))
            {
                  webSocketStream.emit('drain');
            }
            else
            {
                  setTimeout(checkBufferedAmount, 50);
            }
      };


      if (isOpen(socket))
      {
            flushed = !hasBufferedData(socket);

            if (!flushed)
            {
                  checkBufferedAmount();
            }
      }
      else
      {
            flushed = false;

            webSocketStream.on('open', function()
            {
                  console.log('>openState open');
                  checkBufferedAmount();
            });

      }

      return flushed;
};

module.exports = WebSocketStream;