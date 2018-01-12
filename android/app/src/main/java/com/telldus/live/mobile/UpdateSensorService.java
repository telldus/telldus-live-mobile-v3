package com.telldus.live.mobile;

/**
 * Created by crosssales on 1/11/2018.
 */
import android.app.Service;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Intent;
import android.os.IBinder;
import android.support.annotation.Nullable;
import android.widget.RemoteViews;
import android.widget.Toast;

import java.util.Calendar;

import com.telldus.live.mobile.Database.MyDBHandler;
import com.telldus.live.mobile.Model.SensorInfo;

public class UpdateSensorService extends Service {
    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        int widgetIDs[] = AppWidgetManager.getInstance(getApplication()).getAppWidgetIds(new ComponentName(getApplication(), SensorAppWidget.class));
        AppWidgetManager widgetManager = AppWidgetManager.getInstance(this);

        for(int id : widgetIDs) {
                 AppWidgetManager.getInstance(getApplication()).notifyAppWidgetViewDataChanged(id, R.id.never);

                SensorAppWidget.updateAppWidget(getApplicationContext(),widgetManager,id);
            }

        /*for (int id : widgetIDs) {
            AppWidgetManager.getInstance(getApplication()).notifyAppWidgetViewDataChanged(id, R.id.never);
            Toast.makeText(getApplicationContext(),String.valueOf(id),Toast.LENGTH_LONG).show();
        }*/

        return super.onStartCommand(intent, flags, startId);
    }

    private String getCurrentDateTime() {
        Calendar c = Calendar.getInstance();
        int minute = c.get(Calendar.MINUTE);
        int hour = c.get(Calendar.HOUR_OF_DAY);

        return hour + ":" + minute;
    }
}
