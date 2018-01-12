package com.telldus.live.mobile.ServiceBackground;

import android.app.ActivityManager;
import android.app.Service;
import android.appwidget.AppWidgetManager;
import android.content.Context;
import android.content.Intent;
import android.os.Handler;
import android.os.IBinder;
import android.support.annotation.Nullable;
import android.text.format.DateUtils;
import android.util.Log;
import android.widget.RemoteViews;
import android.widget.Toast;


import com.koushikdutta.async.ByteBufferList;
import com.koushikdutta.async.DataEmitter;
import com.koushikdutta.async.callback.DataCallback;
import com.koushikdutta.async.http.AsyncHttpClient;
import com.koushikdutta.async.http.WebSocket;

import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;
import org.json.JSONArray;
import org.json.JSONObject;

import java.net.URI;
import java.net.URISyntaxException;

import com.telldus.live.mobile.Database.MyDBHandler;
import com.telldus.live.mobile.GetTimeAgo;
import com.telldus.live.mobile.Model.SensorInfo;
import com.telldus.live.mobile.R;

/**
 * Created by crosssales on 1/9/2018.
 */

public class MyService extends Service {
    MyDBHandler db = new MyDBHandler(this);

    private WebSocketClient mWebSocketClient;
    @Override
    public void onCreate() {
       // Toast.makeText(this, "Service Created", Toast.LENGTH_LONG).show();

    }

    @Override
    public void onStart(Intent intent, int startid) {
        Toast.makeText(this, "Service Started", Toast.LENGTH_LONG).show();

        connectWebSocket();
    }

    private void connectWebSocket() {
        URI uri;
        try {
            uri = new URI("ws://tyra.telldus.com:80/websocket");
        } catch (URISyntaxException e) {
            e.printStackTrace();
            return;
        }

        mWebSocketClient = new WebSocketClient(uri) {
            @Override
            public void onOpen(ServerHandshake serverHandshake) {
                Log.v("Websocket", "Opened");
                authoriseWebsocket("63faf3df-07c0-49be-b4b5-1864c0b5654vgfc", mWebSocketClient);

                addWebsocketFilter("device", "added",mWebSocketClient);
                addWebsocketFilter("device", "removed",mWebSocketClient);
                addWebsocketFilter("device", "failSetState",mWebSocketClient);
                addWebsocketFilter("device", "setState",mWebSocketClient);

                addWebsocketFilter("sensor", "added",mWebSocketClient);
                addWebsocketFilter("sensor", "removed",mWebSocketClient);
                addWebsocketFilter("sensor", "setName",mWebSocketClient);
                addWebsocketFilter("sensor", "setPower",mWebSocketClient);
                addWebsocketFilter("sensor", "value",mWebSocketClient);

                addWebsocketFilter("zwave", "removeNodeFromNetwork",mWebSocketClient);
                addWebsocketFilter("zwave", "removeNodeFromNetworkStartTimeout",mWebSocketClient);
                addWebsocketFilter("zwave", "addNodeToNetwork",mWebSocketClient);
                addWebsocketFilter("zwave", "addNodeToNetworkStartTimeout",mWebSocketClient);
                addWebsocketFilter("zwave", "interviewDone",mWebSocketClient);
                addWebsocketFilter("zwave", "nodeInfo",mWebSocketClient);

            }

            @Override
            public void onMessage(String s) {
                Log.v("JsonResponse",s);

                try {
                    JSONObject jsonObject = new JSONObject(s);
                    Log.v("Json_Response", jsonObject.toString());

                    JSONObject jsonDataObject = new JSONObject();
                    jsonDataObject = jsonObject.getJSONObject("data");
                    int sensorid = Integer.parseInt(jsonDataObject.getString("sensorId"));
                    String module = jsonObject.getString("module");
                    String time = jsonDataObject.getString("time");

                    JSONArray jsonArray = new JSONArray();
                    jsonArray = jsonDataObject.optJSONArray("data");
                    Log.v("JSON-Array", jsonArray.toString());
                    String valueSensor = null;

                    //   for(int i=0;i<jsonArray.length();i++)
                    // {
                    JSONObject jsonObject1 = jsonArray.getJSONObject(jsonArray.length() - 1);
                    valueSensor = jsonObject1.optString("value");
                    // }
                    Log.v("************", "------------->" + jsonObject1.toString());


                    SensorInfo mSensorInfo = db.findSensorDevice(sensorid);

                    if (mSensorInfo != null) {
                        String widgetname = mSensorInfo.getWidgetName();
                        String widgettype = mSensorInfo.getWidgetType();
                     //   int sensorID = mSensorInfo.getDeviceID();
                        int widgeID = mSensorInfo.getWidgetID();
                        Log.v("Widgetname", widgetname);
                        Log.v("widgetype", widgettype);
                       // Log.v("sensorID", String.valueOf(sensorID));
                        Log.v("widgetID", String.valueOf(widgeID));
                        Log.v("*********", "------->" + "Fire");
                            long timeStamp = Long.parseLong(time);


                      int result=  db.updateSensorInfo(valueSensor,timeStamp,sensorid);

                    }
                    Log.v("SensorID", "--------->" + sensorid);
                    Log.v("Module", "---------->" + module);
                    Log.v("Time", "----------->" + time);

                } catch (Exception e) {
                    e.printStackTrace();
                }
            }

            @Override
            public void onClose(int i, String s, boolean b) {
              //  Log.v("Websocket", "Closed " + s);
                connectWebSocket();


            }

            @Override
            public void onError(Exception e) {
                Log.v("Websocket", "Error " + e.getMessage());
                //connectWebSocket();
            }
        };
        mWebSocketClient.connect();
    }
    @Override
    public void onDestroy() {
        Toast.makeText(this, "Service Destroyed", Toast.LENGTH_LONG).show();
     //   mWebSocketClient.close();

    }




    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }


    public void addWebsocketFilter(String module, String action,WebSocketClient mWebSocketClient) {
        JSONObject jsonObjectParent = new JSONObject();
        try {
            jsonObjectParent.put("module", "filter");
            jsonObjectParent.put("action", "accept");
            JSONObject jsonObject2 = new JSONObject();
            jsonObject2.put("module", module);
            jsonObject2.put("action", action);
            jsonObjectParent.put("data", jsonObject2);
            mWebSocketClient.send(jsonObjectParent.toString());
        } catch (Exception e) {
            e.printStackTrace();

        }

    }

    public void authoriseWebsocket(String sessionId, WebSocketClient mWebSocketClient) {
        JSONObject jsonObject = new JSONObject();
        try {
            jsonObject.put("module", "auth");
            jsonObject.put("action", "auth");
            JSONObject jsonObject1 = new JSONObject();
            jsonObject1.put("sessionid", sessionId);
            jsonObject1.put("clientId", "255765");
            jsonObject.put("data", jsonObject1);
            mWebSocketClient.send(jsonObject.toString());
        } catch (Exception e) {
            e.printStackTrace();

        }
    }



}
