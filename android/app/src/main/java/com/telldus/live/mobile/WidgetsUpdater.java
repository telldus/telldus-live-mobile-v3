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

import android.content.Context;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;

import com.telldus.live.mobile.Database.MyDBHandler;
import com.telldus.live.mobile.Model.DeviceInfo;

import java.util.HashMap;
import java.util.Map;

public class WidgetsUpdater  {

    public int[] getAllWidgetsSensor(Context context) {
        return AppWidgetManager.getInstance(context).getAppWidgetIds(new ComponentName(context, NewSensorWidget.class));
    }

    public int[] getAllWidgetsDevice2By1(Context context) {
        return AppWidgetManager.getInstance(context).getAppWidgetIds(new ComponentName(context, NewOnOffWidget.class));
    }

    public int[] getAllWidgetsDevice3By1(Context context) {
        return AppWidgetManager.getInstance(context).getAppWidgetIds(new ComponentName(context, NewAppWidget.class));
    }

    public int[] getAllThermostatWidgets(Context context) {
        return AppWidgetManager.getInstance(context).getAppWidgetIds(new ComponentName(context, NewThermostatWidget.class));
    }

    public int[] getAllRGBWidgets(Context context) {
        return AppWidgetManager.getInstance(context).getAppWidgetIds(new ComponentName(context, NewRGBWidget.class));
    }

    public void updateUIWidgetSensor(int widgetId, Context context, Map extraArgs) {
        AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
        NewSensorWidget.updateAppWidget(context, widgetManager, widgetId, extraArgs);
    }

    public void updateUIWidgetDevice2By1(int widgetId, Context context, Map extraArgs) {
        AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
        NewOnOffWidget.updateAppWidget(context, widgetManager, widgetId, extraArgs);
    }

    public void updateUIWidgetDevice3By1(int widgetId, Context context, Map extraArgs) {
        AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
        NewAppWidget.updateAppWidget(context, widgetManager, widgetId, extraArgs);
    }

    public void updateUIWidgetDeviceThermo(int widgetId, Context context, Map extraArgs) {
        AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
        NewThermostatWidget.updateAppWidget(context, widgetManager, widgetId, extraArgs);
    }

    public void updateUIWidgetDeviceRGB(int widgetId, Context context, Map extraArgs) {
        AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
        NewRGBWidget.updateAppWidget(context, widgetManager, widgetId, extraArgs);
    }

    public void updateAllWidgets(Context context, Map extraArgs) {
        MyDBHandler db = new MyDBHandler(context);
        Object normalizeUIO = extraArgs.get("normalizeUI");
        Boolean normalizeUI = normalizeUIO == null ? false : (Boolean) normalizeUIO;
        
        int widgetIdsSensor[] = getAllWidgetsSensor(context);
        for (int widgetId : widgetIdsSensor) {
            updateUIWidgetSensor(widgetId, context, extraArgs);
        }
        int widgetIdsDevice2By1[] = getAllWidgetsDevice2By1(context);
        for (int widgetId : widgetIdsDevice2By1) {
            if (normalizeUI) {
                DeviceInfo widgetInfo = db.findWidgetInfoDevice(widgetId);
                String secondaryStateValue = widgetInfo.getSecondaryStateValue();
                String stateValue = widgetInfo.getDeviceStateValue();
                db.updateDeviceInfo(null, null, stateValue, 0, secondaryStateValue, widgetId, null, null);
            }
            updateUIWidgetDevice2By1(widgetId, context, extraArgs);
        }
        int widgetIdsDevice3By1[] = getAllWidgetsDevice3By1(context);
        for (int widgetId : widgetIdsDevice3By1) {
            if (normalizeUI) {
                DeviceInfo widgetInfo = db.findWidgetInfoDevice(widgetId);
                String secondaryStateValue = widgetInfo.getSecondaryStateValue();
                String stateValue = widgetInfo.getDeviceStateValue();
                db.updateDeviceInfo(null, null, stateValue, 0, secondaryStateValue, widgetId, null, null);
            }
            updateUIWidgetDevice3By1(widgetId, context, extraArgs);
        }
        int widgetIdsDeviceThermo[] = getAllThermostatWidgets(context);
        for (int widgetId : widgetIdsDeviceThermo) {
            updateUIWidgetDeviceThermo(widgetId, context, extraArgs);
        }
        int widgetIdsDeviceRGB[] = getAllRGBWidgets(context);
        for (int widgetId : widgetIdsDeviceRGB) {
            if (normalizeUI) {
                DeviceInfo widgetInfo = db.findWidgetInfoDevice(widgetId);
                String secondaryStateValue = widgetInfo.getSecondaryStateValue();
                String stateValue = widgetInfo.getDeviceStateValue();
                db.updateDeviceInfo(null, null, stateValue, 0, secondaryStateValue, widgetId, null, null);
            }
            updateUIWidgetDeviceRGB(widgetId, context, extraArgs);
        }
    }
}
