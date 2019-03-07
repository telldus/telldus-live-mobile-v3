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

package com.telldus.live.mobile.BroadcastReceiver;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;

import com.telldus.live.mobile.ServiceBackground.NetworkInfo;
import com.telldus.live.mobile.NewSensorWidget;

public class AEScreenOnOffReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent.getAction().equals(Intent.ACTION_SCREEN_OFF)) {
            removeAllAPIPollHandlerSensorWidgets(context);
        } else if (intent.getAction().equals(Intent.ACTION_SCREEN_ON)) {
            removeAllAPIPollHandlerSensorWidgets(context);
            refreshAllSensorWidgets(context);
        }
    }

    public void refreshAllSensorWidgets(Context context) {
        Intent intentNew = new Intent(context, NewSensorWidget.class);
        intentNew.setAction("android.appwidget.action.APPWIDGET_UPDATE");
        int ids[] = AppWidgetManager.getInstance(context.getApplicationContext()).getAppWidgetIds(new ComponentName(context.getApplicationContext(), NewSensorWidget.class));
        intentNew.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
        context.sendBroadcast(intentNew);
    }

    public void removeAllAPIPollHandlerSensorWidgets(Context context) {
        int ids[] = AppWidgetManager.getInstance(context.getApplicationContext()).getAppWidgetIds(new ComponentName(context.getApplicationContext(), NewSensorWidget.class));
        NewSensorWidget.removeAllHandlerRunnablePair(ids);
    }
}
