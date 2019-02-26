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
