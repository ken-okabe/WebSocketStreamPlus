package com.example.app;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebView;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URI;
import java.nio.ByteBuffer;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;


import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;


public class MainActivity extends Activity
{
    private Activity ac = this;

    public static String replaceAllRegex(String value, String regex, String replacement)
    {
        if (value == null || value.length() == 0 || regex == null || regex.length() == 0 || replacement == null)
        {
            return "";
        }
        return Pattern.compile(regex).matcher(value).replaceAll(replacement);
    }


    @Override
    protected void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        System.out.println("-------App Launched Java-----------------");


        //----innerHTTP between webView&this get ready-----------------------------------------
        class httpHandler implements HttpHandler
        {
            public void handle(HttpExchange t) throws IOException
            {

                System.out.println("------request-------");
                Map<String, String> params = queryToMap(t.getRequestURI().getQuery());

                String scheme = params.get("scheme");
                String cmd = params.get("cmd");
                String data = params.get("data");
                System.out.println(scheme);
                System.out.println(cmd);
                System.out.println(data);

                //-------


                if (scheme.equals("scheme"))
                {
                    if (cmd.equals("cmd"))
                    {
                        System.out.println("------localSocketServer.start-------");
                        //   IOthreadLocalSocketServer io2 = new IOthreadLocalSocketServer();
                        //   io2.start();
                    }
                    if (cmd.equals("data"))
                    {
                        System.out.println("------localSocketServer.accept-------");
                        // IOthreadLocalSocketServerAccept io3 = new IOthreadLocalSocketServerAccept();
                        //  io3.start();
                    }
                }


                //-------

                String response = "This is the response";
                t.sendResponseHeaders(200, response.length());
                OutputStream os = t.getResponseBody();
                os.write(response.getBytes());
                os.close();
            }

            private Map<String, String> queryToMap(String query)
            {
                Map<String, String> result = new HashMap<>();
                for (String param : query.split("&"))
                {
                    String pair[] = param.split("=");
                    if (pair.length > 1)
                    {
                        result.put(pair[0], pair[1]);
                    }
                    else
                    {
                        result.put(pair[0], "");
                    }
                }
                return result;
            }
        }

        try
        {
            HttpServer server = HttpServer.create(new InetSocketAddress(8888), 0);
            server.createContext("/", new httpHandler());
            server.setExecutor(null); // creates a default executor
            server.start();
        }
        catch (IOException ex)
        {
        }


        //------------------------
        final WebView wv = (WebView) findViewById(R.id.LocalWebView);
        wv.setWebChromeClient(new WebChromeClient()
        {
        });
        // allow zooming/panning
        wv.getSettings().setBuiltInZoomControls(false);
        wv.getSettings().setSupportZoom(false);

        // we DON'T want the page zoomed-out, since it is phone-sized content
        wv.getSettings().setLoadWithOverviewMode(false);
        wv.getSettings().setUseWideViewPort(false);
        wv.getSettings().setJavaScriptEnabled(true);


        //-----------
        class WebSocketNew extends WebSocketClient
        {
            private String url;
            private int Count = 0;

            public ByteBuffer[] BufferA;

            public WebSocketNew(URI uri)
            {
                super(uri);

                url = uri.toString();
            }


            @Override
            public void onOpen(ServerHandshake handshake)
            {
                System.out.println("====JAVA=========onOpen ");

                final String msg = "javascript:B.webSocket.open('" + url + "')";
                System.out.println(msg);


                ac.runOnUiThread(new Runnable()
                {
                    @Override
                    public void run()
                    {
                        wv.loadUrl(msg);
                    }
                });


                // this.send("hello3");
            }

            @Override
            public void onError(Exception ex)
            {
                System.out.println("====JAVA========= onError ");
                ex.printStackTrace();
                final String msg = "javascript:B.webSocket.error('" + url + "')";
                System.out.println(msg);
                ac.runOnUiThread(new Runnable()
                {
                    @Override
                    public void run()
                    {
                        wv.loadUrl(msg);
                    }
                });
            }

            @Override
            public void onClose(int code, String reason, boolean remote)
            {
                System.out.println("====JAVA========= onClose: " + code + " " + reason);

                final String msg = "javascript:B.webSocket.close('" + url + "')";
                System.out.println(msg);
                ac.runOnUiThread(new Runnable()
                {
                    @Override
                    public void run()
                    {
                        wv.loadUrl(msg);
                    }
                });
            }


            @Override
            public void onMessage(String message)
            {
                System.out.println("====JAVA========onMessage(String message)========== " + message);

                String message1 = replaceAllRegex(message, "\n", "");
                final String msg = "javascript:B.webSocket.msg('" + url + "','" + message1 + "')";
                System.out.println(msg);

                ac.runOnUiThread(new Runnable()
                {
                    @Override
                    public void run()
                    {
                        wv.loadUrl(msg);
                    }
                });

            }

            @Override
            public void onMessage(ByteBuffer blob)
            {
                System.out.println("====JAVA=======onMessage(ByteBuffer blob) ");
                BufferA[Count++] = blob;

                final String msg = "javascript:B.webSocket.ByteBufferMessage('" + url + "'," + Count + ")";
                System.out.println(msg);

                ac.runOnUiThread(new Runnable()
                {
                    @Override
                    public void run()
                    {
                        wv.loadUrl(msg);
                    }
                });

            }


            @JavascriptInterface
            public String test1()
            {
                System.out.println("====JAVA=========test1==========");
                return "test1";
            }

            @JavascriptInterface
            public void send1(String message)
            {
                System.out.println("====JAVA========send1(String message)======== " + message);
                super.send(message);
            }

            @JavascriptInterface
            public boolean isOpen1()
            {
                boolean val = super.isOpen();
                System.out.println("====JAVA========isOpen1()======= " + val);
                return val;
            }

            @JavascriptInterface
            public boolean hasBufferedData1()
            {
                System.out.println("====JAVA=======hasBufferedData1()=========");
                return super.hasBufferedData();
            }

            @JavascriptInterface
            public ByteBuffer getBufferA(int count)
            {
                System.out.println("====JAVA========= getBufferA(int count)======== " + count);
                return BufferA[count];
            }

            @JavascriptInterface
            public void close1()
            {
                System.out.println("====JAVA========close1()======== ");
                super.close();
            }

            @JavascriptInterface
            public void nullBlob(int count)
            {
                System.out.println("====JAVA========= nullBlob(int count)======== " + count);
                BufferA[count] = null;
            }

        }


        final HashMap<String, WebSocketNew> ws = new HashMap<>();

        //runs on non-UI-thread
        class WebSocketFactory
        {
            public WebSocketFactory()
            {
            }

            @JavascriptInterface
            public WebSocketNew getInstance(String url)
            {
                System.out.println("====JAVA======WebSocketFactory========== getInstance  " + url);

                try
                {
                    ws.put(url, new WebSocketNew(new URI(url)));
                    ws.get(url).connect();

                    System.out.println("====JAVA==========WebSocketNew===== " + url);

                    return ws.get(url);
                }
                catch (Exception e)
                {
                    System.out.println("====JAVA================ERROR");
                    return null;
                }
            }
        }

        wv.addJavascriptInterface(new
                WebSocketFactory(),
                "factoryJ");

        wv.loadUrl("file:///android_asset/Content/app.html");

    }

}