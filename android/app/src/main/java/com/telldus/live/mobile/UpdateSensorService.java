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

import java.util.Calendar;

public class UpdateSensorService extends Service {
    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        int widgetIDs[] = AppWidgetManager.getInstance(getApplication()).getAppWidgetIds(new ComponentName(getApplication(), NewSensorWidget.class));
        AppWidgetManager widgetManager = AppWidgetManager.getInstance(this);

        for(int id : widgetIDs) {
                 AppWidgetManager.getInstance(getApplication()).notifyAppWidgetViewDataChanged(id, R.id.never);

                NewSensorWidget.updateAppWidget(getApplicationContext(),widgetManager,id);
            }

        /*for (int id : widgetIDs) {
            AppWidgetManager.getInstance(getApplication()).notifyAppWidgetViewDataChanged(id, R.id.never);
            Toast.makeText(getApplicationContext(),String.valueOf(id),Toast.LENGTH_LONG).show();
        }*/

        return super.onStartCommand(intent, flags, startId);
    }


}
