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

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.os.Bundle;
import android.view.View;
import android.widget.RemoteViews;
import android.widget.Toast;
import android.util.Log;

import com.androidnetworking.error.ANError;
import com.androidnetworking.interfaces.JSONObjectRequestListener;

import org.json.JSONObject;

import java.util.Map;
import java.util.concurrent.Callable;

import com.telldus.live.mobile.Database.MyDBHandler;
import com.telldus.live.mobile.Database.PrefManager;
import com.telldus.live.mobile.Model.DeviceInfo;
import com.telldus.live.mobile.Utility.DevicesUtilities;
import com.telldus.live.mobile.API.DevicesAPI;
import com.telldus.live.mobile.API.OnAPITaskComplete;

/**
 * Implementation of App Widget functionality.
 * App Widget Configuration implemented in {@link NewOnOffWidgetConfigureActivity NewOnOffWidgetConfigureActivity}
 */
public class NewOnOffWidget extends AppWidgetProvider {
    private static final String ACTION_ON = "ACTION_ON";
    private static final String ACTION_OFF = "ACTION_OFF";
    private static final String ACTION_BELL = "ACTION_BELL";

    // Important to instantiate here and not inside 'createDeviceActionApi'.
    // This is to keep a single instance of 'handler' and 'runnable' created inside 'setDeviceState'
    // for each device/widget.
    static DevicesAPI deviceAPI = new DevicesAPI();


    static void updateAppWidget(
        Context context,
        AppWidgetManager appWidgetManager,
        int appWidgetId
    ) {
        PrefManager prefManager = new PrefManager(context);
        String accessToken = prefManager.getAccess();
        // On log out, only prefManager is cleared and not DB, so we do not want device to show back again during the
        // socket update.
        if (accessToken == "") {
            return;
        }

        MyDBHandler db = new MyDBHandler(context);

        CharSequence widgetText = "Telldus";
        String transparent;
        DeviceInfo DeviceWidgetInfo = db.findUser(appWidgetId);

        if (DeviceWidgetInfo == null) {
            return;
        }

        String userId = DeviceWidgetInfo.getUserId();
        String currentUserId = prefManager.getUserId();
        Boolean isSameAccount = userId.trim().equals(currentUserId.trim());
        if (!isSameAccount) {
            return;
        }

        widgetText = DeviceWidgetInfo.getDeviceName();
        String state = DeviceWidgetInfo.getState();
        Integer methods = DeviceWidgetInfo.getDeviceMethods();
        String deviceType = DeviceWidgetInfo.getDeviceType();

        DevicesUtilities deviceUtils = new DevicesUtilities();
        Map<String, Boolean> supportedMethods = deviceUtils.getSupportedMethods(methods);
        Map<String, String> actionIconSet = deviceUtils.getDeviceActionIcon(deviceType, state, supportedMethods);

        Integer buttonsCount = supportedMethods.size();
        Boolean hasLearn = ((supportedMethods.get("LEARN") != null) && supportedMethods.get("LEARN"));
        if (hasLearn) {
            buttonsCount = buttonsCount - 1;
        }

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.new_on_off_widget);
        if (buttonsCount < 2) {
            views = new RemoteViews(context.getPackageName(), R.layout.new_on_off_widget_one);
        }

        views.setOnClickPendingIntent(R.id.iconOn, getPendingSelf(context, ACTION_ON, appWidgetId));
        views.setOnClickPendingIntent(R.id.iconOff, getPendingSelf(context, ACTION_OFF, appWidgetId));

        String onActionIcon = actionIconSet.get("TURNON");
        String offActionIcon = actionIconSet.get("TURNOFF");
        // Bell
        if (state.equals("4") || (supportedMethods.get("BELL") != null && supportedMethods.get("BELL"))) {
            views.setOnClickPendingIntent(R.id.iconOn, getPendingSelf(context, ACTION_BELL, appWidgetId));
            views.setViewVisibility(R.id.offLinear, View.GONE);

            views.setViewVisibility(R.id.parentLayout, View.VISIBLE);
            views.setInt(R.id.onLayout, "setBackgroundColor", Color.parseColor("#FFFFFF"));
            views.setTextViewText(R.id.iconOn, "bell");
            views.setTextColor(R.id.iconOn, Color.parseColor("#E26901"));
        }
        // ON
        if (state.equals("1")) {
            views.setViewVisibility(R.id.parentLayout, View.VISIBLE);
            views.setInt(R.id.onLayout, "setBackgroundColor", Color.parseColor("#E26901"));
            views.setTextViewText(R.id.iconOn, onActionIcon);
            views.setTextColor(R.id.iconOn, Color.parseColor("#FFFFFF"));

            if (methods == 0) {
                views.setViewVisibility(R.id.offLinear, View.GONE);
            }

            if (methods != 0) {
                views.setTextViewText(R.id.iconOff, offActionIcon);
                views.setTextColor(R.id.iconOff, Color.parseColor("#1b365d"));
                views.setInt(R.id.offLinear, "setBackgroundColor", Color.parseColor("#FFFFFF"));
            }
        }
        // OFF
        if (state.equals("2")) {
            views.setViewVisibility(R.id.parentLayout, View.VISIBLE);
            views.setInt(R.id.offLinear, "setBackgroundColor", Color.parseColor("#1b365d"));
            views.setTextViewText(R.id.iconOff, offActionIcon);
            views.setTextColor(R.id.iconOff, Color.parseColor("#FFFFFF"));

            if (methods == 0) {
                views.setViewVisibility(R.id.onLayout, View.GONE);
            }

            if (methods != 0) {
                views.setTextViewText(R.id.iconOn, onActionIcon);
                views.setTextColor(R.id.iconOn, Color.parseColor("#E26901"));
                views.setInt(R.id.onLayout, "setBackgroundColor", Color.parseColor("#FFFFFF"));
            }
        }
        transparent = DeviceWidgetInfo.getTransparent();
        if (transparent.equals("true")) {
            views.setInt(R.id.iconWidget, "setBackgroundColor", Color.TRANSPARENT);
            views.setInt(R.id.onLayout, "setBackgroundColor", Color.TRANSPARENT);
            views.setInt(R.id.offLinear,"setBackgroundColor", Color.TRANSPARENT);
        }

        views.setTextViewText(R.id.txtWidgetTitle, widgetText);
        // Instruct the widget manager to update the widget
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    private static PendingIntent getPendingSelf(Context context, String action, int id) {
        Intent intent = new Intent(context, NewOnOffWidget.class);
        intent.setAction(action);
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID,id);
        return PendingIntent.getBroadcast(context, id, intent, 0);
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
        MyDBHandler db = new MyDBHandler(context);
        PrefManager prefManager = new PrefManager(context);
        for (int appWidgetId : appWidgetIds) {
            boolean b = db.delete(appWidgetId);
            if (b) {
                Toast.makeText(context,"Successfully deleted",Toast.LENGTH_LONG).show();
            } else {
                Toast.makeText(context,"Widget not created",Toast.LENGTH_LONG).show();
            }
            int count = db.CountDeviceWidgetValues();

            if (count > 0) {
                Toast.makeText(context,"have data",Toast.LENGTH_LONG).show();

            } else {
                Toast.makeText(context,"No Device",Toast.LENGTH_SHORT).show();
                prefManager.DeviceDB(false);
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

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);

        Bundle extras = intent.getExtras();
        if (extras == null) {
            return;
        }

        int widgetId = extras.getInt(AppWidgetManager.EXTRA_APPWIDGET_ID,AppWidgetManager.INVALID_APPWIDGET_ID);
        if (widgetId == AppWidgetManager.INVALID_APPWIDGET_ID) {
            return;
        }

        MyDBHandler db = new MyDBHandler(context);
        DeviceInfo widgetInfo = db.findUser(widgetId);
        if (widgetInfo == null) {
            return;
        }

        Integer methods = widgetInfo.getDeviceMethods();

        if (ACTION_BELL.equals(intent.getAction()) && methods != 0) {

            DeviceInfo info = db.getSinlgeDeviceID(widgetId);

            createDeviceActionApi(context, info.getDeviceID(), 4, widgetId, db, "Bell");
        }
        if (ACTION_ON.equals(intent.getAction()) && methods != 0) {

            DeviceInfo info = db.getSinlgeDeviceID(widgetId);

            createDeviceActionApi(context, info.getDeviceID(), 1, widgetId, db, "On");
        }
        if (ACTION_OFF.equals(intent.getAction()) && methods != 0) {

            DeviceInfo info = db.getSinlgeDeviceID(widgetId);

            createDeviceActionApi(context, info.getDeviceID(), 2, widgetId, db, "Off");
        }
    }

    void createDeviceActionApi(final Context context, final int deviceId, int method, final int widgetId, final MyDBHandler db, final String action) {
        PrefManager prefManager = new PrefManager(context);
        String  accessToken = prefManager.getAccess();

        String params = "device/command?id="+deviceId+"&method="+method+"&value=null";
        deviceAPI.setDeviceState(deviceId, method, 0, widgetId, context, new OnAPITaskComplete() {
            @Override
            public void onSuccess(JSONObject response) {
                AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                updateAppWidget(context, widgetManager, widgetId);
            }
            @Override
            public void onError(ANError error) {
                AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                updateAppWidget(context, widgetManager, widgetId);
            }
        });
    }
}
