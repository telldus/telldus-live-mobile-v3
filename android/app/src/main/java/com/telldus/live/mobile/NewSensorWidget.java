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
import android.support.v4.content.ContextCompat;

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
import com.telldus.live.mobile.Utility.SensorUpdateAlarmManager;

import org.json.JSONObject;
import org.json.JSONArray;
import org.json.JSONException;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

public class NewSensorWidget extends AppWidgetProvider {
    private static final String ACTION_SENSOR_UPDATE = "ACTION_SENSOR_UPDATE";
    public static final String ACTION_AUTO_UPDATE = "com.telldus.live.mobile.AUTO_UPDATE";
    private PendingIntent pendingIntent;

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager,
                                int appWidgetId) {
        PrefManager prefManager = new PrefManager(context);
        String accessToken = prefManager.getAccessToken();
        // On log out, only prefManager is cleared and not DB, so we do not want sensor to show back again during the timed interval
        // or socket update.
        if (accessToken == "") {
            return;
        }

        String sensorIcon = "";
        CharSequence widgetText = "";
        String sensorLastUpdated = "";
        CharSequence sensorValue = "", sensorUnit = "";
        String widgetType;
        SensorUpdateAlarmManager sensorUpdateAlarmManager = new SensorUpdateAlarmManager(context);
        MyDBHandler db = new MyDBHandler(context);
        SensorInfo sensorWidgetInfo = db.findWidgetInfoSensor(appWidgetId);
        String transparent;

        if (sensorWidgetInfo == null) {
            return;
        }

        String userId = sensorWidgetInfo.getUserId();
        String currentUserId = prefManager.getUserId();
        if (currentUserId == null || userId == null) {
            return;
        }
        Boolean isSameAccount = userId.trim().equals(currentUserId.trim());
        if (!isSameAccount) {
            sensorUpdateAlarmManager.stopAlarm(appWidgetId);

            RemoteViews view = new RemoteViews(context.getPackageName(), R.layout.logged_out);
            String preScript = context.getResources().getString(R.string.message_user_logged_out_one);
            String phraseTwo = context.getResources().getString(R.string.message_user_logged_out_two);
            view.setTextViewText(R.id.loggedOutInfoOne, preScript + ": ");
            view.setTextViewText(R.id.loggedOutInfoEmail, userId);
            view.setTextViewText(R.id.loggedOutInfoTwo, phraseTwo);

            appWidgetManager.updateAppWidget(appWidgetId, view);

            return;
        }

        Integer sensorId = sensorWidgetInfo.getSensorId();
        if (sensorId.intValue() == -1) {
            RemoteViews view = new RemoteViews(context.getPackageName(), R.layout.widget_item_removed);
            view.setTextViewText(R.id.widgetItemRemovedInfo, context.getResources().getString(R.string.message_sensor_not_found));

            appWidgetManager.updateAppWidget(appWidgetId, view);

            sensorUpdateAlarmManager.stopAlarm(appWidgetId);
            return;
        }

        RemoteViews view = new RemoteViews(context.getPackageName(), R.layout.configurable_sensor_widget);

        widgetText = sensorWidgetInfo.getSensorName();
        sensorValue = sensorWidgetInfo.getSensorValue();
        sensorUnit = sensorWidgetInfo.getSensorUnit();
        sensorIcon = sensorWidgetInfo.getSensorIcon();
        sensorLastUpdated = sensorWidgetInfo.getSensorUpdate();
        widgetType = sensorWidgetInfo.getSensorDisplayType();
        transparent = sensorWidgetInfo.getTransparent();

        String formattedValue = formatValue(sensorValue);

        long time = Long.parseLong(sensorLastUpdated);

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

        long currentTime = new Date().getTime();
        long timeAgo = currentTime - time;
        int limit = (24 * 3600 * 1000);
        if (timeAgo < limit) {
            view.setTextColor(R.id.txtHistoryInfo, ContextCompat.getColor(context, R.color.white));
        } else {
            view.setTextColor(R.id.txtHistoryInfo, ContextCompat.getColor(context, R.color.brightRed));
        }

        // Instruct the widget manager to update the widget
        appWidgetManager.updateAppWidget(appWidgetId, view);
    }

    @Override
    public void onEnabled(Context context) {
        // Enter relevant functionality for when the first widget is created
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        // There may be multiple widgets active, so update all of them
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onDeleted(Context context, int[] appWidgetIds) {
        // When the user deletes the widget, delete the preference associated with it.
        PrefManager prefManager = new PrefManager(context);
        MyDBHandler db = new MyDBHandler(context);
        SensorUpdateAlarmManager sensorUpdateAlarmManager = new SensorUpdateAlarmManager(context);
        for (int appWidgetId : appWidgetIds) {
            sensorUpdateAlarmManager.stopAlarm(appWidgetId);
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

        if (intent.getAction().equals(ACTION_AUTO_UPDATE)) {
            createSensorApi(sensorId, widgetId, db, context);
        }
    }

    private static PendingIntent getPendingSelf(Context context, String action, int id) {
        Intent intent = new Intent(context, NewSensorWidget.class);
        intent.setAction(action);
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, id);
        return PendingIntent.getBroadcast(context, id, intent, 0);
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
                            sensorName = context.getResources().getString(R.string.text_unknown);
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
        Boolean hasDecimal = (valueAsDouble - valueAsDouble.intValue()) != 0;
        df.setMaximumIntegerDigits(hasDecimal ? 4 : 5);
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
