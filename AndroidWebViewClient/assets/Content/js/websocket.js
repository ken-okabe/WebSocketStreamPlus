 'use strict';

 (function()
 {
       if (!window.WebSocket)
       {
             console.log('#####################WebSocket not available, using non-native');

             window.B = {
                   webSocket:
                   {
                         open: null,
                         close: null,
                         error: null,
                         msg: null,
                         ByteBufferMessage: null
                   }
             };

             window.WebSocket = function(url)
             {
                   console.log('####################creating new WebScoketInstance JS ' + url);

                   var p = {
                         url: null
                   };
                   p.url = url;

                   var ws = factoryJ.getInstance(p.url);

                   var obj = {

                         send: function(data)
                         {
                               console.log('---  send: function(data)-----  ws.send1(data);------');
                               ws.send1(data);
                         },
                         hasBufferedData: function()
                         {
                               console.log('--- hasBufferedData: function()----');
                               return ws.hasBufferedData1();
                         },
                         isOpen: function()
                         {
                               console.log('---isOpen()---');
                               return ws.isOpen1();
                         },
                         close: function()
                         {
                               console.log('---close: function() --ws.close1();-----');
                               ws.close1();
                         },
                         ///////////// Must be overloaded somewhere useful
                         onopen: function()
                         {
                               throw new Error('onopen not implemented.');
                         },
                         onclose: function()
                         {
                               throw new Error('onclose not implemented.');
                         },
                         onerror: function(msg)
                         {
                               throw new Error('onerror not implemented.');
                         },
                         onmessage: function(msg)
                         {
                               throw new Error('onmessage not implemented.');
                         }
                   };

                   //-----event trigger from Bridge from JAVA
                   B.webSocket.open = function(url)
                   {
                         console.log('----B.webSocket.open----: ' + url);

                         console.log('======ws.isOpen1()=======' + ws.isOpen1());

                         if (url === p.url)
                         {
                               obj.onopen();
                         }
                   };
                   B.webSocket.close = function(url)
                   {
                         console.log('----B.webSocket.close----: ' + url);

                         if (url === p.url)
                         {
                               obj.onclose();
                         }
                   };
                   B.webSocket.error = function(url)
                   {
                         console.log('----B.webSocket.error----: ' + url);

                         if (url === p.url)
                         {
                               obj.onerror();
                         }
                   };
                   B.webSocket.msg = function(url, msg)
                   {
                         console.log('---- B.webSocket.msg ----: ' + url + '  ' + msg);

                         if (url === p.url)
                         {

                               obj.onmessage(msg);
                         }
                   };
                   B.webSocket.ByteBufferMessage = function(url, Count)
                   {
                         console.log('---- B.webSocket.ByteBufferMessage ----: ' + url + '    ' + count);

                         if (url === p.url)
                         {
                               ws.nullBlob(count - 1);

                               obj.onmessage(ws.getBufferA(count));
                         }
                   };

                   return obj;
             };
       }
       else
       {
             console.log('#######################WebSocket available, using native');
       }

 })();