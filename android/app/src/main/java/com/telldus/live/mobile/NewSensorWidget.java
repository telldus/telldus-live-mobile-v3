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
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Date;
import android.util.Log;

import com.telldus.live.mobile.Database.MyDBHandler;
import com.telldus.live.mobile.Database.PrefManager;
import com.telldus.live.mobile.Model.SensorInfo;
import com.telldus.live.mobile.Database.PrefManager;

public class NewSensorWidget extends AppWidgetProvider {
    private PendingIntent pendingIntent;
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

        String userId = sensorWidgetInfo.getUserId();
        String currentUserId = prefManager.getUserId();
        Boolean isSameAccount = userId.trim().equals(currentUserId.trim());
        if (!isSameAccount) {
            return;
        }

        RemoteViews view = new RemoteViews(context.getPackageName(), R.layout.configurable_sensor_widget);

        if (sensorWidgetInfo == null) {
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
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
        final AlarmManager manager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);

        final Intent i = new Intent(context, UpdateSensorService.class);

        if (pendingIntent == null) {
            pendingIntent = PendingIntent.getService(context, 0, i, PendingIntent.FLAG_CANCEL_CURRENT);
        }
        manager.setRepeating(AlarmManager.ELAPSED_REALTIME, SystemClock.elapsedRealtime(), 60000, pendingIntent);
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
        }
    }

    @Override
    public void onEnabled(Context context) {
        // Enter relevant functionality for when the first widget is created
    }

    @Override
    public void onDisabled(Context context) {
        // Enter relevant functionality for when the last widget is disabled
    }
}
