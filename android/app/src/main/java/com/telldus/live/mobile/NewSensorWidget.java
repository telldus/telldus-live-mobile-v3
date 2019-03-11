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
import android.content.BroadcastReceiver;
import android.content.IntentFilter;

import com.androidnetworking.error.ANError;
import com.androidnetworking.interfaces.JSONObjectRequestListener;

import java.sql.Timestamp;
import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.text.NumberFormat;
import java.text.DateFormat;

import com.telldus.live.mobile.Database.MyDBHandler;
import com.telldus.live.mobile.Database.PrefManager;
import com.telldus.live.mobile.Model.SensorInfo;
import com.telldus.live.mobile.Database.PrefManager;
import com.telldus.live.mobile.Utility.HandlerRunnablePair;
import com.telldus.live.mobile.Utility.SensorsUtilities;
import com.telldus.live.mobile.API.API;
import com.telldus.live.mobile.API.OnAPITaskComplete;
import com.telldus.live.mobile.BroadcastReceiver.AEScreenOnOffReceiver;

import org.json.JSONObject;
import org.json.JSONArray;
import org.json.JSONException;

import java.util.HashMap;
import java.util.Locale;
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
        SensorInfo sensorWidgetInfo = db.findWidgetInfoSensor(appWidgetId);
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

        Integer deviceId = sensorWidgetInfo.getSensorId();
        if (deviceId.intValue() == -1) {
            view.removeAllViews(R.id.linear_background);
            view.setTextViewText(R.id.txtSensorType, "Sensor not found");
            appWidgetManager.updateAppWidget(appWidgetId, view);

            removeHandlerRunnablePair(appWidgetId);
            return;
        }

        widgetText = sensorWidgetInfo.getSensorName();
        sensorValue = sensorWidgetInfo.getSensorValue();
        sensorUnit = sensorWidgetInfo.getSensorUnit();
        sensorIcon = sensorWidgetInfo.getSensorIcon();
        sensorHistory = sensorWidgetInfo.getSensorUpdate();
        widgetType = sensorWidgetInfo.getSensorDisplayType();
        transparent = sensorWidgetInfo.getTransparent();

        String formattedValue = formatValue(sensorValue);

        long time = Long.parseLong(sensorHistory);

        // if timestamp given in seconds, convert to millis
        if (time < 1000000000000L) {
            time *= 1000;
        }

        Date date = new Date(time);

        Locale locale = Locale.getDefault();
        DateFormat dMWY = formatDate(locale);
        String formattedDate = dMWY.format(date);
        String formattedTime = DateFormat.getTimeInstance(DateFormat.SHORT, locale).format(date);

        String formattedDT = formattedDate + " " + formattedTime;

        if (transparent.equals("true")) {
            view.setInt(R.id.iconWidgetSensor,"setBackgroundColor", Color.TRANSPARENT);
            view.setInt(R.id.linear_background,"setBackgroundColor", Color.TRANSPARENT);
        }

        view.setOnClickPendingIntent(R.id.linear_background, getPendingSelf(context, ACTION_SENSOR_UPDATE, appWidgetId));

        view.setTextViewText(R.id.iconSensor, sensorIcon);
        view.setTextViewText(R.id.txtSensorType, widgetText);
        view.setTextViewText(R.id.txtHistoryInfo, formattedDT);
        view.setTextViewText(R.id.txtSensorValue, formattedValue);
        view.setTextViewText(R.id.txtSensorUnit, sensorUnit);

        // Instruct the widget manager to update the widget
        appWidgetManager.updateAppWidget(appWidgetId, view);
    }

    @Override
    public void onEnabled(Context context) {
        // Enter relevant functionality for when the first widget is created
        IntentFilter filter = new IntentFilter(Intent.ACTION_SCREEN_ON);
        filter.addAction(Intent.ACTION_SCREEN_OFF);
        BroadcastReceiver mReceiver = new AEScreenOnOffReceiver();
        context.getApplicationContext().registerReceiver(mReceiver, filter);
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        // There may be multiple widgets active, so update all of them
        for (int appWidgetId : appWidgetIds) {
            Map<String, HandlerRunnablePair> prevHandlerRunnablePair = handlerAPIPollingList.get(appWidgetId);
            if (prevHandlerRunnablePair == null) {
                Map<String, HandlerRunnablePair> newHandlerRunnablePair = createAPIPollingHandler(appWidgetId, context);
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
            boolean b = db.deleteWidgetInfoSensor(appWidgetId);
            if (b) {
                Toast.makeText(context,"Successfully deleted",Toast.LENGTH_LONG).show();
            } else {
                Toast.makeText(context,"Widget not created",Toast.LENGTH_LONG).show();
            }
            int count = db.countWidgetSensorTableValues();
            if (count > 0) {
                Toast.makeText(context,"have data",Toast.LENGTH_LONG).show();

            } else {
                Toast.makeText(context,"No sensor",Toast.LENGTH_SHORT).show();
                prefManager.sensorDB(false);
                prefManager.websocketService(false);
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

        int widgetId = extras.getInt(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID);
        if (widgetId == AppWidgetManager.INVALID_APPWIDGET_ID) {
            return;
        }

        MyDBHandler db = new MyDBHandler(context);
        SensorInfo widgetInfo = db.findWidgetInfoSensor(widgetId);
        if (widgetInfo == null) {
            return;
        }

        Integer sensorId = widgetInfo.getSensorId();
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
    public Map<String, HandlerRunnablePair> createAPIPollingHandler(final int appWidgetId, final Context context) {
        final Handler handler = new Handler(Looper.getMainLooper());// Need to be non-static
        runnable = new Runnable(){// Need to be non-static
            @Override
            public void run() {
                if (runnable != null) {
                    MyDBHandler db = new MyDBHandler(context);
                    SensorInfo widgetInfo = db.findWidgetInfoSensor(appWidgetId);
                    if (widgetInfo != null) {
                        Integer sensorId = widgetInfo.getSensorId();
                        Integer updateInterval = widgetInfo.getUpdateInterval();
                        createSensorApi(sensorId, appWidgetId, db, context);
                        handler.postDelayed(runnable, updateInterval);
                    } else {
                        // createAPIPollingHandler will be called before widget addition is confirmed.
                        // So till confirm button is pressed 'widgetInfo' will be null, we do not want the loop to stop
                        // so keep checking after 30secs, to get the actual interval and runnable
                        handler.postDelayed(runnable, 30000);
                    }
                }
            }
        };
        MyDBHandler db = new MyDBHandler(context);
        SensorInfo widgetInfo = db.findWidgetInfoSensor(appWidgetId);
        if (widgetInfo != null) {
            Integer sensorId = widgetInfo.getSensorId();
            createSensorApi(sensorId, appWidgetId, db, context);

            Integer updateInterval = widgetInfo.getUpdateInterval();
            handler.postDelayed(runnable, updateInterval);
        } else {
            // createAPIPollingHandler will be called before widget addition is confirmed.
            // So till confirm button is pressed 'widgetInfo' will be null, we do not want the loop to stop
            // so keep checking after 30secs, to get the actual interval and runnable
            handler.postDelayed(runnable, 30000);
        }
        Map<String, HandlerRunnablePair> handlerRunnableHashMap = new HashMap<String, HandlerRunnablePair>();
        HandlerRunnablePair handlerRunnablePair = new HandlerRunnablePair(handler, runnable);
        handlerRunnablePair.setRunnable(runnable);
        handlerRunnablePair.setHandler(handler);
        handlerRunnableHashMap.put("HandlerRunnablePair", handlerRunnablePair);
        return handlerRunnableHashMap;
    }

    public static void removeAllHandlerRunnablePair(int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            removeHandlerRunnablePair(appWidgetId);
        }
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

        String params = "/sensor/info?id="+sensorId;
        API endPoints = new API();
        endPoints.callEndPoint(context, params, new OnAPITaskComplete() {
            @Override
            public void onSuccess(final JSONObject response) {
                try {
                    SensorInfo sensorWidgetInfo = database.findWidgetInfoSensor(widgetId);

                    if (sensorWidgetInfo != null) {

                        String error = response.optString("error");
                        if (!error.isEmpty() && error != null) {
                            String noSensorMessage = "The sensor with id \""+sensorId+"\" does not exist";
                            if (String.valueOf(error).trim().equalsIgnoreCase(noSensorMessage.trim())) {
                                database.updateSensorIdSensorWidget(-1, widgetId);

                                AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                                updateAppWidget(context, widgetManager, widgetId);
                            }
                            return;
                        }

                        JSONObject responseObject = new JSONObject(response.toString());
                        JSONArray sensorData = responseObject.getJSONArray("data");

                        SensorsUtilities sc = new SensorsUtilities();

                        String sensorName = responseObject.optString("name");
                        if (sensorName == null || sensorName.equals("null")) {
                            sensorName = "Unknown";
                        }

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

                            String widgetLabelUnit = sensorWidgetInfo.getSensorDisplayType();
                            if (widgetLabelUnit.equalsIgnoreCase(labelUnit)) {
                                database.updateSensorInfo(sensorName, value, Long.parseLong(lastUp), widgetId);

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

    public static String formatValue(CharSequence sensorValue) {
        String value = String.valueOf(sensorValue);
        Double valueAsDouble = Double.valueOf(value);
        DecimalFormat df = new DecimalFormat("#.#");
        String formattedDecimal = df.format(valueAsDouble);
        return formattedDecimal;
    }

    public static DateFormat formatDate(Locale locale) {
        SimpleDateFormat formattedDate = (SimpleDateFormat) DateFormat.getDateInstance(DateFormat.MEDIUM, locale);
        formattedDate.applyPattern(formattedDate.toPattern().replaceAll(
            "([^\\p{Alpha}']|('[\\p{Alpha}]+'))*y+([^\\p{Alpha}']|('[\\p{Alpha}]+'))*",
            ""));
        return formattedDate;
    }
}
