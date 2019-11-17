
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

package com.telldus.live.mobile.ServiceBackground;

import android.app.Notification;
import android.app.Service;
import android.content.Context;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Intent;
import android.os.IBinder;
import android.util.Log;
import android.os.Build;
import android.app.NotificationManager;
import androidx.core.app.NotificationCompat;
import android.app.NotificationChannel;

import com.telldus.live.mobile.Model.DeviceInfo;
import com.telldus.live.mobile.NewOnOffWidget;
import com.telldus.live.mobile.NewSensorWidget;
import com.telldus.live.mobile.Database.MyDBHandler;
import com.telldus.live.mobile.Utility.SensorUpdateAlarmManager;
import com.telldus.live.mobile.Model.SensorInfo;

public class RestartSensorUpdateAlarmManager extends Service {
    int startMode = Service.START_NOT_STICKY;

    public static final String CHANNEL_ID = "com.telldus.live.mobile.ServiceBackground";
    public static final String CHANNEL_NAME = "RESTART SENSOR UPDATE ALARM MANAGER";

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onCreate() {
        super.onCreate();

        // Create the Foreground Service
        NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        NotificationCompat.Builder notificationBuilder;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel notificationChannel = new NotificationChannel(CHANNEL_ID,
            CHANNEL_NAME, NotificationManager.IMPORTANCE_DEFAULT);
            notificationManager.createNotificationChannel(notificationChannel);
            notificationBuilder = new NotificationCompat.Builder(this, CHANNEL_ID);
        } else {
            notificationBuilder = new NotificationCompat.Builder(this);
        }

        Notification notification = notificationBuilder.setOngoing(true)
                .setCategory(NotificationCompat.CATEGORY_SERVICE)
                .build();

        startForeground(1, notification);
    }

    @Override
    public void onDestroy() {
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        restartSensorUpdateAlarmManagers();
        return startMode;
    }

    public void restartSensorUpdateAlarmManagers() {
        Context context = getApplicationContext();
        SensorUpdateAlarmManager sensorUpdateAlarmManager = new SensorUpdateAlarmManager(context);
        MyDBHandler db = new MyDBHandler(context);
        int widgetIds[] = AppWidgetManager.getInstance(context).getAppWidgetIds(new ComponentName(context, NewSensorWidget.class));
        for (int widgetId : widgetIds) {
            SensorInfo widgetInfo = db.findWidgetInfoSensor(widgetId);
            if (widgetInfo != null) {
                Integer updateInterval = widgetInfo.getUpdateInterval();
                sensorUpdateAlarmManager.startAlarm(widgetId, updateInterval, NewSensorWidget.class);
            }
            DeviceInfo widgetInfoDevice = db.findWidgetInfoDevice(widgetId);
            if (widgetInfoDevice != null) {
                Integer updateInterval = widgetInfoDevice.getUpdateInterval();
                sensorUpdateAlarmManager.startAlarm(widgetId, updateInterval, NewOnOffWidget.class);
            }
        }
        this.stopSelf();
    }
}