package com.telldus.live.mobile.ServiceBackground;

import android.app.Service;
import android.content.Intent;
import android.os.AsyncTask;
import android.os.IBinder;
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
import java.util.LinkedHashMap;
import java.util.Map;

import com.telldus.live.mobile.Database.MyDBHandler;
import com.telldus.live.mobile.Database.PrefManager;
import com.telldus.live.mobile.Model.SensorInfo;
import com.telldus.live.mobile.Utility.SensorType;

/**
 * Created by crosssales on 1/9/2018.
 */

public class MyService extends Service {
    MyDBHandler db = new MyDBHandler(this);
    ArrayList<String> client_list=new ArrayList<>();
    private WebSocketClient mWebSocketClient;
    boolean isConnecting=false;
    private PrefManager mPrefmanager;

    String parent="ws://";
    String endpoint="websocket";
    String port;
    String address;
    String socket_address;
    Map<String,String> addressMap=new LinkedHashMap<>();
    String ctD;
    boolean isError=false;
    private String sessionID;
    private String accessToken;

    @Override
    public void onCreate() {
       // Toast.makeText(this, "Service Created", Toast.LENGTH_LONG).show();

    }

    @Override
    public void onStart(Intent intent, int startid) {
        Toast.makeText(this, "Service Started", Toast.LENGTH_LONG).show();
        mPrefmanager=new PrefManager(this);
        sessionID=mPrefmanager.getSession();
        accessToken=mPrefmanager.getAccess();

        //connectWebSocket();
        getClientList();
    }




    void getClientList() {
        client_list.clear();
        Log.d("&&&&&&&&&&&&&&&&&&&&&&&", "&&&&&&&&&&&&&&&&&&&&&&&&&&");
        final String finalAccessToken = accessToken;
        AndroidNetworking.get("https://api.telldus.com/oauth2/clients/list")
                .addHeaders("Authorization","Bearer "+finalAccessToken)
                .setPriority(Priority.LOW)
                .build()
                .getAsJSONObject(new JSONObjectRequestListener() {
                    @Override
                    public void onResponse(JSONObject response) {
                        try {
                            JSONArray jsonArray=response.getJSONArray("client");
                            Log.v("Client list",jsonArray.toString(jsonArray.length()));
                            for(int i=0;i<jsonArray.length();i++)
                            {
                                JSONObject jsonObject=jsonArray.getJSONObject(i);
                                client_list.add(jsonObject.getString("id"));
                            }
                            new MyTask().execute(client_list);

                            Log.v("ArrayList",client_list.toString());
                        } catch (JSONException e) {
                            e.printStackTrace();

                        };
                    }

                    @Override
                    public void onError(ANError anError) {
                        Log.v("AccessTokenExpired",anError.toString());


                        // String token=createAccessToken();
                        // getClientList();
                    }
                });
    }


    private class MyTask extends AsyncTask<ArrayList<String>, Void, ArrayList<String>>
    {


        @Override
        protected ArrayList<String> doInBackground(ArrayList<String>[] arrayLists) {

            ArrayList<String> result = new ArrayList<String>();
            ArrayList<String> clientID = arrayLists[0]; //get passed arraylist
            // Log.v("ClientID",clientID.toString());
            addressMap.clear();
            for(int i=0;i<clientID.size();i++)
            {
                final String id = client_list.get(i);
                String url = "https://api.telldus.com/oauth2/client/serverAddress?id=" + id;
              //  String accessToken="82c579429a838b8796a63a4304c28c983bac25a5";

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
                                    ctD=id;
                                    addressMap.put(socket_address,ctD);
                                }
                                catch (Exception e) {
                                    //  Log.v("JSON Array empty","[]");
                                }
                            }
                            @Override
                            public void onError(ANError anError) {
                                Log.v("ANError", anError.toString());
                            }
                        });
                try {

                    Thread.sleep(3000);
                }catch (Exception e)
                {

                }
            }


            return result;
        }

        @Override
        protected void onPostExecute(ArrayList<String> strings) {
            super.onPostExecute(strings);
            // Log.v("ArrayList",strings.toString());
            Log.v("****************","---------------");
            ConnectWebsocketAddress();
        }
    }

    public void ConnectWebsocketAddress() {

        //   Toast.makeText(getApplicationContext(),"Fire",Toast.LENGTH_LONG).show();
        for (Map.Entry m : addressMap.entrySet()) {
            Log.v("WebsocketAddress", m.getKey() + "---" + m.getValue());

            String socketAddress = m.getKey().toString();
            final String ClientID = m.getValue().toString();

            URI uri = null;
            try {

                uri = new URI(socketAddress);
            } catch (URISyntaxException e) {
                Log.v("URISyntaxException", e.getMessage());

            }
            mWebSocketClient = new WebSocketClient(uri, new Draft_17()) {
                @Override
                public void onOpen(ServerHandshake handshakedata) {
                    //1855ca0f-5e0c-41fd-8306-69b15ec0765c
                    authoriseWebsocket(ClientID, sessionID, mWebSocketClient);
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
                    //Log.v("message", message);
                    if (message.equals("validconnection")) {
                        isConnecting = true;
                        Log.v("Websocket open","websocket_opened @"+ClientID);
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
                            jsonDataObject = jsonObject.getJSONObject("data");
                            int sensorid = Integer.parseInt(jsonDataObject.getString("sensorId"));
                            String module = jsonObject.getString("module");
                            String time = jsonDataObject.getString("time");

                            JSONArray jsonArray = jsonDataObject.optJSONArray("data");
                         //   Log.v("JSON ARRAY",jsonArray.toString(10));

                            String valueSensor = null;

                              ArrayList<SensorInfo> mSensorInfoList = db.findSensorDevice(sensorid);

                              for(int i=0;i<mSensorInfoList.size();i++)
                              {
                                  SensorInfo objInfo=mSensorInfoList.get(i);

                                  String widgetName=objInfo.getWidgetName();
                                  int widgetID=objInfo.getWidgetID();
                                  String widgetType=objInfo.getWidgetType();
                            //      int SensorID=objInfo.getDeviceID();


                                  for(int j=0;j<jsonArray.length();j++)
                                  {
                                      JSONObject jsonObject1 =jsonArray.getJSONObject(j);
                                      String type=jsonObject1.getString("type");
                                      String scale=jsonObject1.getString("scale");
                                  String typeValue=String.valueOf(SensorType.getValueLang(widgetType));

                                      if(type.equals(typeValue))
                                      {
                                          //Log.v("JSONObject",jsonObject1.toString(10));

                                          Log.v("Widget name",widgetName);
                                          Log.v("Widget ID",String.valueOf(widgetID));
                                          Log.v("Widget Type",widgetType);
                                          Log.v(" Sensor ID",String.valueOf(objInfo.getDeviceID()));
                                          valueSensor = jsonObject1.optString("value");
                                          long timeStamp = Long.parseLong(time);
                                          int result = db.updateSensorInfo(valueSensor, timeStamp, widgetID);


                                      }

                                  }
                              }


/*
                            if (mSensorInfo != null) {
                                String widgetname = mSensorInfo.getWidgetName();
                                String widgettype = mSensorInfo.getWidgetType();
                                int widgetIDD=mSensorInfo.getWidgetID();

                                String typeValue=String.valueOf(SensorType.getValueLang(widgettype));

                                 for(int i=0;i<jsonArray.length();i++)
                                 {
                                     JSONObject jsonObject1 =jsonArray.getJSONObject(i);
                                     String type=jsonObject1.getString("type");
                                    if(type.equals(typeValue))
                                    {
                                        valueSensor = jsonObject1.optString("value");

                                    }

                                }

                                int widgeID = mSensorInfo.getWidgetID();
                                Log.v("Widgetname", widgetname);
                                Log.v("widgetype", widgettype);
                                Log.v("widgetID", String.valueOf(widgeID));
                                Log.v("*********", "------->" + "Fire");


                            }*/
                          /*  Log.v("SensorID", "--------->" + sensorid);
                            Log.v("Module", "---------->" + module);
                            Log.v("Time", "----------->" + time);*/

                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                   }
                }

                @Override
                public void onClose(int code, String reason, boolean remote) {
                    Log.v("Websocket", "Closed " + reason);
                    Log.v("Websocket close","websocket_closed @"+ClientID);

                }

                @Override
                public void onError(Exception ex) {
                    Log.v("Websocket", "Error " + ex.getMessage());

                }
            };
            mWebSocketClient.connect();
            try {
                Thread.sleep(3000);
            } catch (Exception e) {
                e.printStackTrace();
            }
            if (isConnecting) {
                Log.v("Valid Socket address", "True");
                break;
            }
            /*if(isError)
            {
                getClientList();
                break;
            }*/
        }
        if(!isConnecting)
        {
            getClientList();
        }
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


}
