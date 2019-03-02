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

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Typeface;
import android.os.SystemClock;
import android.text.format.DateUtils;
import android.widget.RemoteViews;
import android.widget.Toast;
import android.util.Log;
import android.os.Handler;
import android.os.Looper;
import android.os.Bundle;

import com.androidnetworking.error.ANError;
import com.androidnetworking.interfaces.JSONObjectRequestListener;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Date;

import com.telldus.live.mobile.Database.MyDBHandler;
import com.telldus.live.mobile.Database.PrefManager;
import com.telldus.live.mobile.Model.SensorInfo;
import com.telldus.live.mobile.Database.PrefManager;
import com.telldus.live.mobile.Utility.HandlerRunnablePair;
import com.telldus.live.mobile.Utility.SensorsUtilities;
import com.telldus.live.mobile.API.API;
import com.telldus.live.mobile.API.OnAPITaskComplete;

import org.json.JSONObject;
import org.json.JSONArray;
import org.json.JSONException;

import java.util.HashMap;
import java.util.Map;

public class NewSensorWidget extends AppWidgetProvider {
    private static final String ACTION_SENSOR_UPDATE = "ACTION_SENSOR_UPDATE";
    private PendingIntent pendingIntent;

    // 'handlerAPIPollingList' is kept static, handler and runnable are created from a non-static context.
    // This is important for each sensor widget to have it's own handler and runnable, also be able to remove
    // callbacks by using each widget id during different cases.
    private static Map<Integer, Map> handlerAPIPollingList = new HashMap<Integer, Map>();
    Runnable runnable;// Need to be non-static

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager,
                                int appWidgetId) {
        PrefManager prefManager = new PrefManager(context);
        String accessToken = prefManager.getAccess();
        // On log out, only prefManager is cleared and not DB, so we do not want sensor to show back again during the timed interval
        // or socket update.
        if (accessToken == "") {
            return;
        }

        String sensorIcon = "";
        CharSequence widgetText = "";
        String sensorHistory = "";
        CharSequence sensorValue = "", sensorUnit = "";
        int src = R.drawable.sensor;
        String widgetType;
        MyDBHandler db = new MyDBHandler(context);
        SensorInfo sensorWidgetInfo = db.findSensor(appWidgetId);
        String transparent;

        if (sensorWidgetInfo == null) {
            return;
        }

        String userId = sensorWidgetInfo.getUserId();
        String currentUserId = prefManager.getUserId();
        Boolean isSameAccount = userId.trim().equals(currentUserId.trim());
        if (!isSameAccount) {
            removeHandlerRunnablePair(appWidgetId);
            return;
        }

        RemoteViews view = new RemoteViews(context.getPackageName(), R.layout.configurable_sensor_widget);

        Integer deviceId = sensorWidgetInfo.getDeviceID();
        if (deviceId.intValue() == -1) {
            view.removeAllViews(R.id.linear_background);
            view.setTextViewText(R.id.txtSensorType, "Sensor not found");
            appWidgetManager.updateAppWidget(appWidgetId, view);

            removeHandlerRunnablePair(appWidgetId);
            return;
        }

        widgetText = sensorWidgetInfo.getWidgetName();
        sensorValue = sensorWidgetInfo.getSensorValue();
        sensorUnit = sensorWidgetInfo.getSensorUnit();
        sensorIcon = sensorWidgetInfo.getSensorIcon();
        sensorHistory = sensorWidgetInfo.getSensorUpdate();
        widgetType = sensorWidgetInfo.getWidgetType();
        transparent = sensorWidgetInfo.getTransparent();

        long time = Long.parseLong(sensorHistory);
        // String timeStamp = GetTimeAgo.getTimeAgo(time, context);
        long now = System.currentTimeMillis();

        // if timestamp given in seconds, convert to millis
        if (time < 1000000000000L) {
            time *= 1000;
        }

        Date date = new Date(time);
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd hh:mm");

        sensorHistory = formatter.format(date);

        if (transparent.equals("true")) {
            view.setInt(R.id.iconWidgetSensor,"setBackgroundColor", Color.TRANSPARENT);
            view.setInt(R.id.linear_background,"setBackgroundColor", Color.TRANSPARENT);
        }

        view.setOnClickPendingIntent(R.id.linear_background, getPendingSelf(context, ACTION_SENSOR_UPDATE, appWidgetId));

        view.setTextViewText(R.id.iconSensor, sensorIcon);
        view.setTextColor(R.id.iconSensor, Color.parseColor("#FFFFFF"));
        view.setTextViewText(R.id.txtSensorType, widgetText);
        view.setTextViewText(R.id.txtHistoryInfo, sensorHistory);
        view.setTextViewText(R.id.txtSensorValue, sensorValue);
        view.setTextViewText(R.id.txtSensorUnit, sensorUnit);

        // Instruct the widget manager to update the widget
        appWidgetManager.updateAppWidget(appWidgetId, view);
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        // There may be multiple widgets active, so update all of them
        for (int appWidgetId : appWidgetIds) {
            Map<String, HandlerRunnablePair> prevHandlerRunnablePair = handlerAPIPollingList.get(appWidgetId);
            if (prevHandlerRunnablePair == null) {
                Map<String, HandlerRunnablePair> newHandlerRunnablePair = createAPIPollingHandler(appWidgetId);
                handlerAPIPollingList.put(appWidgetId, newHandlerRunnablePair);
            }
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onDeleted(Context context, int[] appWidgetIds) {
        // When the user deletes the widget, delete the preference associated with it.
        PrefManager prefManager = new PrefManager(context);
        MyDBHandler db = new MyDBHandler(context);
        for (int appWidgetId : appWidgetIds) {
            boolean b = db.deleteSensor(appWidgetId);
            if (b) {
                Toast.makeText(context,"Successfully deleted",Toast.LENGTH_LONG).show();
            } else {
                Toast.makeText(context,"Widget not created",Toast.LENGTH_LONG).show();
            }
            int count = db.CountSensorTableValues();
            if (count > 0) {
                Toast.makeText(context,"have data",Toast.LENGTH_LONG).show();

            } else {
                Toast.makeText(context,"No sensor",Toast.LENGTH_SHORT).show();
                prefManager.sensorDB(false);
                prefManager.websocketService(false);
                context.stopService(new Intent(context, MyService.class));
            }
            removeHandlerRunnablePair(appWidgetId);
        }
    }

    @Override
    public void onDisabled(Context context) {
        super.onDisabled(context);
        // Enter relevant functionality for when the last widget is disabled
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);

        Bundle extras = intent.getExtras();
        if (extras == null) {
            return;
        }

        int widgetId = extras.getInt(AppWidgetManager.EXTRA_APPWIDGET_ID,AppWidgetManager.INVALID_APPWIDGET_ID);
        if (widgetId == AppWidgetManager.INVALID_APPWIDGET_ID) {
            return;
        }

        MyDBHandler db = new MyDBHandler(context);
        SensorInfo widgetInfo = db.findSensor(widgetId);
        if (widgetInfo == null) {
            return;
        }

        Integer sensorId = widgetInfo.getDeviceID();
        if (sensorId.intValue() == -1) {
            return;
        }

        if (ACTION_SENSOR_UPDATE.equals(intent.getAction())) {
            createSensorApi(sensorId, widgetId, db, context);
        }
    }

    private static PendingIntent getPendingSelf(Context context, String action, int id) {
        Intent intent = new Intent(context, NewSensorWidget.class);
        intent.setAction(action);
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, id);
        return PendingIntent.getBroadcast(context, id, intent, 0);
    }

    // Need to be non-static
    public Map<String, HandlerRunnablePair> createAPIPollingHandler(final int appWidgetId) {
        final Handler handler = new Handler(Looper.getMainLooper());// Need to be non-static
        runnable = new Runnable(){// Need to be non-static
            @Override
            public void run() {
                if (runnable != null) {
                    handler.postDelayed(runnable, 10000);
                }
            }
        };
        handler.postDelayed(runnable, 10000);
        Map<String, HandlerRunnablePair> handlerRunnableHashMap = new HashMap<String, HandlerRunnablePair>();
        HandlerRunnablePair handlerRunnablePair = new HandlerRunnablePair(handler, runnable);
        handlerRunnablePair.setRunnable(runnable);
        handlerRunnablePair.setHandler(handler);
        handlerRunnableHashMap.put("HandlerRunnablePair", handlerRunnablePair);
        return handlerRunnableHashMap;
    }

    static void removeHandlerRunnablePair(Integer appWidgetId) {
        Map<String, HandlerRunnablePair> prevHandlerRunnablePair = handlerAPIPollingList.get(appWidgetId);
        if (prevHandlerRunnablePair != null) {
            HandlerRunnablePair handlerRunnablePair = prevHandlerRunnablePair.get("HandlerRunnablePair");
            Runnable prevRunnable = handlerRunnablePair.getRunnable();
            Handler prevHandler = handlerRunnablePair.getHandler();
            prevHandler.removeCallbacks(prevRunnable);
            prevHandlerRunnablePair.remove("HandlerRunnablePair");
            handlerAPIPollingList.remove(appWidgetId);
        }
    }

    void createSensorApi(final Integer sensorId, final Integer widgetId, final MyDBHandler database, final Context context) {

        String params = "sensor/info?id="+sensorId;
        API endPoints = new API();
        endPoints.callEndPoint(context, params, new OnAPITaskComplete() {
            @Override
            public void onSuccess(final JSONObject response) {
                try {
                    SensorInfo sensorWidgetInfo = database.findSensor(widgetId);

                    if (sensorWidgetInfo != null) {
                        JSONObject responseObject = new JSONObject(response.toString());
                        JSONArray sensorData = responseObject.getJSONArray("data");

                        SensorsUtilities sc = new SensorsUtilities();

                        for (int j = 0; j < sensorData.length(); j++) {
                            JSONObject currData = sensorData.getJSONObject(j);

                            String lastUp = currData.optString("lastUpdated");
                            String name = currData.optString("name");
                            String scale = currData.optString("scale");
                            String value = currData.optString("value");

                            Map<String, Object> info = sc.getSensorInfo(name, scale, value, context);
                            Object label = info.get("label").toString();
                            Object unit = info.get("unit").toString();
                            String labelUnit = label+"("+unit+")";

                            String widgetLabelUnit = sensorWidgetInfo.getWidgetType();
                            if (widgetLabelUnit.equalsIgnoreCase(labelUnit)) {
                                database.updateSensorInfo(name, value, Long.parseLong(lastUp), widgetId);

                                AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                                updateAppWidget(context, widgetManager, widgetId);
                            }
                        }
                    }
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
            @Override
            public void onError(ANError error) {
            }
        });
    }
}
