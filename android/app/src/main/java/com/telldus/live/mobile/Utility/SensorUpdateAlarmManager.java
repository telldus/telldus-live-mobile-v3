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

package com.telldus.live.mobile.Utility;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

import java.util.Calendar;
import com.telldus.live.mobile.NewSensorWidget;

public class SensorUpdateAlarmManager {

    private Context mContext;


    public SensorUpdateAlarmManager(Context context) {
        mContext = context;
    }

    public void startAlarm(int widgetId, int updateInterval) {
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.MILLISECOND, updateInterval);

        Intent alarmIntent = new Intent(mContext, NewSensorWidget.class);
        alarmIntent.setAction(NewSensorWidget.ACTION_AUTO_UPDATE);
        alarmIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, widgetId);
        PendingIntent pendingIntent = PendingIntent.getBroadcast(mContext, widgetId, alarmIntent, PendingIntent.FLAG_CANCEL_CURRENT);

        AlarmManager alarmManager = (AlarmManager) mContext.getSystemService(Context.ALARM_SERVICE);
        alarmManager.setRepeating(AlarmManager.RTC, calendar.getTimeInMillis(), updateInterval, pendingIntent);
    }


    public void stopAlarm(int widgetId) {
        Intent alarmIntent = new Intent(mContext, NewSensorWidget.class);
        alarmIntent.setAction(NewSensorWidget.ACTION_AUTO_UPDATE);
        PendingIntent pendingIntent = PendingIntent.getBroadcast(mContext, widgetId, alarmIntent, PendingIntent.FLAG_CANCEL_CURRENT);

        AlarmManager alarmManager = (AlarmManager) mContext.getSystemService(Context.ALARM_SERVICE);
        alarmManager.cancel(pendingIntent);
    }
}