package com.telldus.live.mobile;

import android.app.Service;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.net.ConnectivityManager;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.support.annotation.Nullable;
import android.util.Log;
import android.widget.Toast;

import com.androidnetworking.AndroidNetworking;
import com.androidnetworking.common.Priority;
import com.androidnetworking.error.ANError;
import com.androidnetworking.interfaces.JSONObjectRequestListener;
import com.androidnetworking.interfaces.StringRequestListener;

import org.java_websocket.client.WebSocketClient;
import org.java_websocket.drafts.Draft_17;
import org.java_websocket.handshake.ServerHandshake;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.UUID;

import com.telldus.live.mobile.Database.MyDBHandler;
import com.telldus.live.mobile.Database.PrefManager;
import com.telldus.live.mobile.Model.SensorInfo;
import com.telldus.live.mobile.Utility.SensorType;
import com.telldus.live.mobile.Utility.helper;

/**
 * Created by crosssales on 1/9/2018.
 */

public class MyService extends Service {
    MyDBHandler db = new MyDBHandler(this);
    ArrayList<String> client_list=new ArrayList<>();
    private WebSocketClient mWebSocketClient;
    boolean isConnecting=false;
    private PrefManager prefManager;

    String parent="ws://";
    String endpoint="websocket";
    String port;
    String address;
    String socket_address;

    Runnable r;

    String ctD;
    boolean isError=false;

    private String accessToken;

    private String uniqueId;

    String SOC_ADDR;
    String SOC_CLI;
    int  count = 0;;
    private Handler handler;
    Runnable mRunnable;
    boolean isRunnable=false;


    @Override
    public void onCreate() {
       // Toast.makeText(this, "Service Created", Toast.LENGTH_LONG).show();

    }

    @Override
    public void onStart(Intent intent, int startid) {
        Toast.makeText(this, "Service Started", Toast.LENGTH_LONG).show();
        prefManager=new PrefManager(this);

        uniqueId=prefManager.getSession();
        accessToken=prefManager.getAccess();

        handler = new Handler(  (Looper.getMainLooper()));
        getClientList();

    }

    void getClientList() {
        client_list.clear();
     //   addressMap.clear();

        uniqueId=prefManager.getSession();
        accessToken=prefManager.getAccess();

        Log.d("&&&&&&&&&&&&&&&&&&&&&&&", "&&&&&&&&&&&&&&&&&&&&&&&&&&");

        AndroidNetworking.get("https://api.telldus.com/oauth2/clients/list")
                .addHeaders("Authorization","Bearer "+accessToken)
                .setPriority(Priority.LOW)
                .build()
                .getAsJSONObject(new JSONObjectRequestListener() {
                    @Override
                    public void onResponse(JSONObject response) {
                        try {
                            JSONArray jsonArray=response.getJSONArray("client");
                            client_list.clear();
                            Log.v("Client list",jsonArray.toString(jsonArray.length()));
                            for(int i=0;i<jsonArray.length();i++)
                            {
                                JSONObject jsonObject=jsonArray.getJSONObject(i);
                                boolean check=client_list.contains(jsonObject.getString("id"));
                                if(!check) {
                                    client_list.add(jsonObject.getString("id"));
                                }
                            }
                            Log.v("ArrayList",client_list.toString());
                            FetchWebAddress();
                        } catch (JSONException e) {
                            e.printStackTrace();

                        };
                    }

                    @Override
                    public void onError(ANError anError) {
                        Log.v("Error an GetClientList",anError.toString());

                    }
                });
    }

public void FetchWebAddress()
{
           accessToken = prefManager.getAccess();

            final String id = client_list.get(count);
            String url = "https://api.telldus.com/oauth2/client/serverAddress?id=" + id;

            AndroidNetworking.get(url)
                    .addHeaders("Authorization", "Bearer " + accessToken)
                    .setPriority(Priority.LOW)
                    .build()
                    .getAsString(new StringRequestListener() {
                        @Override
                        public void onResponse(String response) {
                            //Log.v("response", response.toLowerCase());
                            try {
                                JSONObject jsonObject = new JSONObject(response.toString());
                                Log.v("JSON Address Response", "---->" + jsonObject.toString(5));
                                address = jsonObject.getString("address");
                                port = jsonObject.getString("port");
                                socket_address = parent + address + ":" + port + "/" + endpoint;
                                ctD = id;
                                SOC_ADDR = socket_address;
                                SOC_CLI = id;

                                ConnectWebsocketAddress();

                                Log.v("socket addr",SOC_ADDR);
                                Log.v("Soc_Client_ID",SOC_CLI);

                            } catch (Exception e) {
                                  Log.v("JSON Array empty","[]");



                                if(count+1<client_list.size())
                                {
                                    count=count+1;
                                    FetchWebAddress();

                                }else
                                {
                                    count=0;
                                    Log.v("Called  FetchWebAddress","-----" +"*****************************************************");
                                    getClientList();

                                    //new MyTask().execute(client_list);
                                }
                            }
                        }

                        @Override
                        public void onError(ANError anError) {
                            Log.v("Error on FetchWebsocket",anError.toString());

                        }
                    });



    }

    public void ConnectWebsocketAddress() {
        uniqueId=prefManager.getSession();


            URI uri = null;
            try {

                uri = new URI(SOC_ADDR);
            } catch (URISyntaxException e) {
                Log.v("URISyntaxException", e.getMessage());

            }
            mWebSocketClient = new WebSocketClient(uri, new Draft_17()) {
                @Override
                public void onOpen(ServerHandshake handshakedata) {

                    authoriseWebsocket(SOC_CLI, uniqueId, mWebSocketClient);
                    addWebsocketFilter("device", "added", mWebSocketClient);
                    addWebsocketFilter("device", "removed", mWebSocketClient);
                    addWebsocketFilter("device", "failSetState", mWebSocketClient);
                    addWebsocketFilter("device", "setState", mWebSocketClient);

                    addWebsocketFilter("sensor", "added", mWebSocketClient);
                    addWebsocketFilter("sensor", "removed", mWebSocketClient);
                    addWebsocketFilter("sensor", "setName", mWebSocketClient);
                    addWebsocketFilter("sensor", "setPower", mWebSocketClient);
                    addWebsocketFilter("sensor", "value", mWebSocketClient);

                    addWebsocketFilter("zwave", "removeNodeFromNetwork", mWebSocketClient);
                    addWebsocketFilter("zwave", "removeNodeFromNetworkStartTimeout", mWebSocketClient);
                    addWebsocketFilter("zwave", "addNodeToNetwork", mWebSocketClient);
                    addWebsocketFilter("zwave", "addNodeToNetworkStartTimeout", mWebSocketClient);
                    addWebsocketFilter("zwave", "interviewDone", mWebSocketClient);
                    addWebsocketFilter("zwave", "nodeInfo", mWebSocketClient);
                }

                @Override
                public void onMessage(String message) {
                    Log.v("message", message);
                    if (message.equals("validconnection")) {
                        isConnecting = true;
                        Log.v("Websocket open", "websocket_opened @" + SOC_CLI);
                        if(isRunnable)
                        {
                            isRunnable=false;
                            handler.removeCallbacks(mRunnable);
                        }
                    }
                    if(message.equals("error"))
                    {
                        isError=true;
                    }
                    if (!message.equals("validconnection") && !message.equals("error")&& !message.equals("nothere")) {

                        try {
                            JSONObject jsonObject = new JSONObject(message);
                            Log.v("Json_Response", jsonObject.toString(10));

                            JSONObject jsonDataObject = new JSONObject();
                            String chooseWidget=jsonObject.getString("module");

                            if(chooseWidget.equals("device"))
                            {
                                jsonDataObject = jsonObject.getJSONObject("data");
                                int deviceID=jsonDataObject.getInt("deviceId");
                                String method=jsonDataObject.getString("method");

                                boolean b=db.updateActionDevice(method,deviceID);

                                if(b)
                                {
                                  int widgetIDsOnOff[] = AppWidgetManager.getInstance(getApplication()).getAppWidgetIds(new ComponentName(getApplication(), NewOnOffWidget.class));
                                  AppWidgetManager onOffWidgetManager = AppWidgetManager.getInstance(getApplicationContext());

                                  for(int id : widgetIDsOnOff) {
                                      AppWidgetManager.getInstance(getApplication()).notifyAppWidgetViewDataChanged(id, R.id.never);

                                      NewOnOffWidget.updateAppWidget(getApplicationContext(),onOffWidgetManager,id);

                                  }
                                }

                            }
                            else {
                                jsonDataObject = jsonObject.getJSONObject("data");
                                int sensorid = Integer.parseInt(jsonDataObject.getString("sensorId"));

                                String time = jsonDataObject.getString("time");

                                JSONArray jsonArray = jsonDataObject.optJSONArray("data");
                                //   Log.v("JSON ARRAY",jsonArray.toString(10));

                                String valueSensor = null;

                                ArrayList<SensorInfo> mSensorInfoList = db.findSensorDevice(sensorid);

                                for (int i = 0; i < mSensorInfoList.size(); i++) {
                                    SensorInfo objInfo = mSensorInfoList.get(i);

                                    String widgetName = objInfo.getWidgetName();
                                    int widgetID = objInfo.getWidgetID();
                                    String widgetType = objInfo.getWidgetType();
                                    //      int SensorID=objInfo.getDeviceID();


                                    for (int j = 0; j < jsonArray.length(); j++) {
                                        JSONObject jsonObject1 = jsonArray.getJSONObject(j);
                                        String type = jsonObject1.getString("type");
                                        String scale = jsonObject1.getString("scale");
                                        String typeValue = String.valueOf(SensorType.getValueLang(widgetType));

                                        if (type.equals(typeValue)) {
                                            //Log.v("JSONObject",jsonObject1.toString(10));

                                            Log.v("Widget name", widgetName);
                                            Log.v("Widget ID", String.valueOf(widgetID));
                                            Log.v("Widget Type", widgetType);
                                            Log.v(" Sensor ID", String.valueOf(objInfo.getDeviceID()));
                                            valueSensor = jsonObject1.optString("value");
                                            long timeStamp = Long.parseLong(time);
                                            int result = db.updateSensorInfo(valueSensor, timeStamp, widgetID);

                                        }
                                    }
                                }
                            }

                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                   }
                }

                @Override
                public void onClose(int code, String reason, boolean remote) {
                    Log.v("Websocket", "Closed " + reason);
                    Log.v("Websocket close", "websocket_closed @" + SOC_CLI);
                    boolean screenCheck = helper.screenOn;
                    if (screenCheck) {
                        boolean bol = isNetworkConnected();
                        if (bol) {
                            Log.v("Network enabled", "Network enabled");
                            boolean sensorDB = prefManager.getSensorDB();
                            boolean deviceDB = prefManager.getDeviceDB();

                            if (sensorDB || deviceDB) {

                                Log.v("sensorDB || deviceDB", "sensorDB || deviceDB");
                                if (!isError) {
                                    isConnecting = false;
                                    if (count + 1 < client_list.size()) {
                                        count = count + 1;
                                        FetchWebAddress();
                                    } else {
                                        count = 0;
                                        getClientList();
                                        Log.v("Called  OnClose", "-----" + "*****************************************************");

                                    }
                                    if (!isRunnable && !isConnecting) {
                                        reconnectWebsocket();
                                    }
                                } else {
                                    isError = false;
                                    SessionID();
                                }
                            } else {

                                if (isRunnable) {
                                    isRunnable = false;
                                    handler.removeCallbacks(mRunnable);
                                }
                                Log.v("WebSocket Stopped", "????????????????????????????????????????????????" + " No database");
                            }
                        } else {
                            if (isRunnable) {
                                isRunnable = false;
                                handler.removeCallbacks(mRunnable);
                            }
                            Log.v("WebSocket Stoped", "No internet Connection");
                        }

                    } else {
                        Log.v("Websocket stopted","Device screen off");
                        if (isRunnable) {
                            isRunnable = false;
                            handler.removeCallbacks(mRunnable);
                        }
                    }
                }

                @Override
                public void onError(Exception ex) {
                    Log.v("Websocket", "Error " + ex.getMessage());
                }
            };
            mWebSocketClient.connect();

    }

    public void reconnectWebsocket()
    {
        Log.v("Triggering reconnect","triggered" +"Runnable");
        isRunnable=true;

        mRunnable = new Runnable() {
            public void run() {

                Log.v("Fireeeeeeeeee","@@@@@@@@@@@"+"@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");

                if(!isConnecting)
                {
                   // mWebSocketClient.close();
                    Log.v("Called  Reconnection","-----" +"*****************************************************");
                    getClientList();

                }

                handler.postDelayed(this, 30000);
            }
        };
        handler.postDelayed(mRunnable, 30000);
    }

    @Override
    public void onDestroy() {
        Toast.makeText(this, "Service Destroyed", Toast.LENGTH_LONG).show();

      if(isConnecting) {
          mWebSocketClient.close();
      }
        prefManager.websocketService(false);

    }
    private boolean isNetworkConnected() {
        ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);

        return cm.getActiveNetworkInfo() != null;
    }




    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }


    public void authoriseWebsocket(String clientID,String sessionId, WebSocketClient mWebSocketClient) {
        JSONObject jsonObject = new JSONObject();
        try {
            jsonObject.put("module", "auth");
            jsonObject.put("action", "auth");
            JSONObject jsonObject1 = new JSONObject();
            jsonObject1.put("sessionid", sessionId);
            jsonObject1.put("clientId", clientID);
            jsonObject.put("data", jsonObject1);

            Log.v("AuthoriseWebsocket",jsonObject.toString(4));
            mWebSocketClient.send(jsonObject.toString());
        } catch (Exception e) {
            Log.v("authoriseWebsocket",e.getMessage());

        }
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


    private void SessionID()
    {

        UUID uuid = UUID.randomUUID();
        final String uniq = uuid.toString();

        Log.v("***Session id****",uniq);

      accessToken=prefManager.getAccess();

        String url="https://api3.telldus.com/oauth2/user/authenticateSession?session="+uniq;
        Log.v("URL",url);
        AndroidNetworking.get(url)
                .addHeaders("Authorization", "Bearer " + accessToken)
                .setPriority(Priority.LOW)
                .build()
                .getAsJSONObject(new JSONObjectRequestListener() {
                    @Override
                    public void onResponse(JSONObject response) {
                        try {
                            String status=response.optString("status");
                            if(status.equals("success"))
                            {
                                // start();
                                Log.v("JSON Response",response.toString(5));
                                //CallJSONResponse(uniqueId);
                               prefManager.saveSessionID(uniq,"123323");

                              ConnectWebsocketAddress();

                            }
                        } catch (Exception e) {
                            e.printStackTrace();
                        };
                    }

                    @Override
                    public void onError(ANError anError) {
                        Log.v("onError---->",anError.toString());
                    }
                });
    }

}
