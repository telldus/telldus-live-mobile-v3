/**
 * Copyright 2016-present Telldus Technologies AB.
 *
 * This file is part of the Telldus Live! app.
 *
 * Telldus Live! app is free : you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Telldus Live! app is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Telldus Live! app.  If not, see <http://www.gnu.org/licenses/>.
 */

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

public class MyService extends Service {
    MyDBHandler db = new MyDBHandler(this);
    ArrayList<String> client_list = new ArrayList<>();
    private WebSocketClient mWebSocketClient;
    boolean isConnecting = false;
    private PrefManager prefManager;

    String parent = "ws://";
    String endpoint = "websocket";
    String port;
    String address;
    String socket_address;

    Runnable r;

    String ctD;
    boolean isError = false;

    private String accessToken;

    private String uniqueId;

    String SOC_ADDR;
    String SOC_CLI;
    int count = 0;;
    private Handler handler;
    Runnable mRunnable;
    boolean isRunnable = false;


    @Override
    public void onCreate() {
    }

    @Override
    public void onStart(Intent intent, int startid) {
        prefManager = new PrefManager(this);

        uniqueId = prefManager.getSession();
        accessToken = prefManager.getAccess();

        handler = new Handler((Looper.getMainLooper()));
        getClientList();
    }

    void getClientList() {
        client_list.clear();

        uniqueId = prefManager.getSession();
        accessToken = prefManager.getAccess();

        AndroidNetworking.get("https://api.telldus.com/oauth2/clients/list")
            .addHeaders("Authorization","Bearer "+accessToken)
            .setPriority(Priority.LOW)
            .build()
            .getAsJSONObject(new JSONObjectRequestListener() {
                @Override
                public void onResponse(JSONObject response) {
                    try {
                        JSONArray jsonArray = response.getJSONArray("client");
                        client_list.clear();
                        for (int i = 0;i < jsonArray.length();i++) {
                            JSONObject jsonObject = jsonArray.getJSONObject(i);
                            boolean check = client_list.contains(jsonObject.getString("id"));
                            if (!check) {
                                client_list.add(jsonObject.getString("id"));
                            }
                        }
                        FetchWebAddress();
                    } catch (JSONException e) {
                        e.printStackTrace();
                    };
                }
                @Override
                public void onError(ANError anError) {
                }
            });
    }

    public void FetchWebAddress() {
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
                    try {
                        JSONObject jsonObject = new JSONObject(response.toString());
                        address = jsonObject.getString("address");
                        port = jsonObject.getString("port");
                        socket_address = parent + address + ":" + port + "/" + endpoint;
                        ctD = id;
                        SOC_ADDR = socket_address;
                        SOC_CLI = id;

                        ConnectWebsocketAddress();

                    } catch (Exception e) {
                        if (count + 1 < client_list.size()) {
                            count = count + 1;
                            FetchWebAddress();

                        } else {
                            count = 0;
                            getClientList();
                        }
                    }
                }

                @Override
                public void onError(ANError anError) {
                }
            });
    }

    public void ConnectWebsocketAddress() {
        uniqueId = prefManager.getSession();

        URI uri = null;
        try {
            uri = new URI(SOC_ADDR);
        } catch (URISyntaxException e) {
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
                    if (message.equals("validconnection")) {
                        isConnecting = true;
                        if (isRunnable) {
                            isRunnable = false;
                            handler.removeCallbacks(mRunnable);
                        }
                    }
                    if (message.equals("error")) {
                        isError = true;
                    }
                    if (!message.equals("validconnection") && !message.equals("error") && !message.equals("nothere")) {
                        try {
                            JSONObject jsonObject = new JSONObject(message);

                            JSONObject jsonDataObject = new JSONObject();
                            String chooseWidget = jsonObject.getString("module");

                            if (chooseWidget.equals("device")) {
                                jsonDataObject = jsonObject.getJSONObject("data");
                                int deviceID = jsonDataObject.getInt("deviceId");
                                String method = jsonDataObject.getString("method");
                                String value = jsonDataObject.getString("value");
                                boolean b = db.updateDeviceState(method, deviceID, value);

                                if (b) {
                                    int widgetIDsOnOff[] = AppWidgetManager.getInstance(getApplication()).getAppWidgetIds(new ComponentName(getApplication(), NewOnOffWidget.class));
                                    AppWidgetManager onOffWidgetManager = AppWidgetManager.getInstance(getApplicationContext());

                                    for (int id : widgetIDsOnOff) {
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

                                String valueSensor = null;

                                ArrayList<SensorInfo> mSensorInfoList = db.findSensorDevice(sensorid);

                                for (int i = 0; i < mSensorInfoList.size(); i++) {
                                    SensorInfo objInfo = mSensorInfoList.get(i);

                                    String widgetName = objInfo.getWidgetName();
                                    int widgetID = objInfo.getWidgetID();
                                    String widgetType = objInfo.getWidgetType();

                                    for (int j = 0; j < jsonArray.length(); j++) {
                                        JSONObject jsonObject1 = jsonArray.getJSONObject(j);
                                        String type = jsonObject1.getString("type");
                                        String scale = jsonObject1.getString("scale");
                                        String typeValue = String.valueOf(SensorType.getValueLang(widgetType));

                                        if (type.equals(typeValue)) {
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
                    boolean screenCheck = helper.screenOn;
                    if (screenCheck) {
                        boolean bol = isNetworkConnected();
                        if (bol) {
                            boolean sensorDB = prefManager.getSensorDB();
                            boolean deviceDB = prefManager.getDeviceDB();

                            if (sensorDB || deviceDB) {
                                if (!isError) {
                                    isConnecting = false;
                                    if (count + 1 < client_list.size()) {
                                        count = count + 1;
                                        FetchWebAddress();
                                    } else {
                                        count = 0;
                                        getClientList();
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
                            }
                        } else {
                            if (isRunnable) {
                                isRunnable = false;
                                handler.removeCallbacks(mRunnable);
                            }
                        }
                    } else {
                        if (isRunnable) {
                            isRunnable = false;
                            handler.removeCallbacks(mRunnable);
                        }
                    }
                }

                @Override
                public void onError(Exception ex) {
                }
            };
            mWebSocketClient.connect();
    }

    public void reconnectWebsocket() {
        isRunnable = true;

        mRunnable = new Runnable() {
            public void run() {
                if (!isConnecting) {
                    getClientList();
                }
                handler.postDelayed(this, 30000);
            }
        };
        handler.postDelayed(mRunnable, 30000);
    }

    @Override
    public void onDestroy() {
        if (isConnecting) {
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

            mWebSocketClient.send(jsonObject.toString());
        } catch (Exception e) {
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

    private void SessionID() {
        UUID uuid = UUID.randomUUID();
        final String uniq = uuid.toString();

        accessToken = prefManager.getAccess();

        String url = "https://api3.telldus.com/oauth2/user/authenticateSession?session="+uniq;
        AndroidNetworking.get(url)
            .addHeaders("Authorization", "Bearer " + accessToken)
            .setPriority(Priority.LOW)
            .build()
            .getAsJSONObject(new JSONObjectRequestListener() {
                @Override
                public void onResponse(JSONObject response) {
                    try {
                        String status = response.optString("status");
                        if (status.equals("success")) {
                            prefManager.saveSessionID(uniq);

                            ConnectWebsocketAddress();
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    };
                }

                @Override
                public void onError(ANError anError) {
                }
            });
    }

}
