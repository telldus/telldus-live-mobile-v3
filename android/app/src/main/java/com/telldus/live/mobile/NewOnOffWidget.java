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
import android.support.v4.content.ContextCompat;
import android.view.View;
import android.widget.RemoteViews;
import android.widget.Toast;
import android.util.Log;
import android.os.Handler;
import android.os.Looper;

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

import static android.util.TypedValue.COMPLEX_UNIT_SP;

/**
 * Implementation of App Widget functionality.
 * App Widget Configuration implemented in {@link NewOnOffWidgetConfigureActivity NewOnOffWidgetConfigureActivity}
 */
public class NewOnOffWidget extends AppWidgetProvider {
    private static final String ACTION_ON = "ACTION_ON";
    private static final String ACTION_OFF = "ACTION_OFF";
    private static final String ACTION_BELL = "ACTION_BELL";

    private static final String METHOD_ON = "1";
    private static final String METHOD_OFF = "2";
    private static final String METHOD_BELL = "4";

    DevicesAPI deviceAPI = new DevicesAPI();

    private Handler handlerResetDeviceStateToNull;
    private Runnable runnableResetDeviceStateToNull;
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
        DeviceInfo DeviceWidgetInfo = db.findWidgetInfoDevice(appWidgetId);

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
        String methodRequested = DeviceWidgetInfo.getMethodRequested();
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

        Integer deviceId = DeviceWidgetInfo.getDeviceId();
        if (deviceId.intValue() == -1) {
            views.removeAllViews(R.id.widget_content_cover);
            views.setTextViewText(R.id.txtWidgetTitle, "Device not found");
            appWidgetManager.updateAppWidget(appWidgetId, views);
            return;
        }

        views.setOnClickPendingIntent(R.id.onLayout, getPendingSelf(context, ACTION_ON, appWidgetId));
        views.setOnClickPendingIntent(R.id.offLinear, getPendingSelf(context, ACTION_OFF, appWidgetId));

        String onActionIcon = actionIconSet.get("TURNON");
        String offActionIcon = actionIconSet.get("TURNOFF");
        // Bell
        if (supportedMethods.get("BELL") != null && supportedMethods.get("BELL")) {
            views.setOnClickPendingIntent(R.id.onLayout, getPendingSelf(context, ACTION_BELL, appWidgetId));
            views.setViewVisibility(R.id.offLinear, View.GONE);

            views.setViewVisibility(R.id.parentLayout, View.VISIBLE);
            views.setInt(R.id.onLayout, "setBackgroundResource", R.drawable.button_background);
            views.setTextViewText(R.id.iconOn, "bell");
            views.setTextViewTextSize(R.id.iconOn, COMPLEX_UNIT_SP, Float.parseFloat("26"));
            views.setTextColor(R.id.iconOn, ContextCompat.getColor(context, R.color.brandSecondary));
            views.setInt(R.id.iconOn, "setBackgroundColor", Color.TRANSPARENT);

            if (methodRequested != null && methodRequested.equals("4")) {
                views.setInt(R.id.onLayout, "setBackgroundResource", R.drawable.button_background_secondary_fill);
                views.setTextColor(R.id.iconOn, ContextCompat.getColor(context, R.color.white));
            }

            if (methodRequested == null && state != null && state.equals("4")) {
                views.setTextViewText(R.id.iconOn, "checkmark");
                views.setTextViewTextSize(R.id.iconOn, COMPLEX_UNIT_SP, Float.parseFloat("18"));
                views.setTextColor(R.id.iconOn, ContextCompat.getColor(context, R.color.white));
                views.setInt(R.id.iconOn, "setBackgroundResource", R.drawable.shape_circular_background_green);
            }
        }

        Boolean hasOn = ((supportedMethods.get("TURNON") != null) && supportedMethods.get("TURNON"));
        // ON
        if (hasOn) {
            views.setViewVisibility(R.id.parentLayout, View.VISIBLE);
            views.setTextViewText(R.id.iconOn, onActionIcon);
            views.setTextViewTextSize(R.id.iconOn, COMPLEX_UNIT_SP, Float.parseFloat("26"));

            views.setInt(R.id.onLayout, "setBackgroundResource", R.drawable.shape_right_rounded_corner);
            views.setTextColor(R.id.iconOn, ContextCompat.getColor(context, R.color.brandSecondary));
            views.setInt(R.id.iconOn, "setBackgroundColor", Color.TRANSPARENT);

            if (methodRequested != null && methodRequested.equals("1")) {
                views.setInt(R.id.onLayout, "setBackgroundResource", R.drawable.shape_right_rounded_corner_secondary_fill);
                views.setTextColor(R.id.iconOn, ContextCompat.getColor(context, R.color.white));
            }

            if (methodRequested == null && state != null && state.equals("1")) {
                views.setTextViewText(R.id.iconOn, "checkmark");
                views.setTextViewTextSize(R.id.iconOn, COMPLEX_UNIT_SP, Float.parseFloat("18"));
                views.setTextColor(R.id.iconOn, ContextCompat.getColor(context, R.color.white));
                views.setInt(R.id.iconOn, "setBackgroundResource", R.drawable.shape_circular_background_green);
            }
        }

        Boolean hasOff = ((supportedMethods.get("TURNOFF") != null) && supportedMethods.get("TURNOFF"));
        // OFF
        if (hasOff) {
            views.setViewVisibility(R.id.parentLayout, View.VISIBLE);
            views.setTextViewText(R.id.iconOff, offActionIcon);
            views.setTextViewTextSize(R.id.iconOff, COMPLEX_UNIT_SP, Float.parseFloat("26"));

            views.setInt(R.id.offLinear, "setBackgroundResource", R.drawable.shape_left_rounded_corner);
            views.setTextColor(R.id.iconOff, ContextCompat.getColor(context, R.color.brandPrimary));
            views.setInt(R.id.iconOff, "setBackgroundColor", Color.TRANSPARENT);

            if (methodRequested != null && methodRequested.equals("2")) {
                views.setInt(R.id.offLinear, "setBackgroundResource", R.drawable.shape_left_rounded_corner_primary_fill);
                views.setTextColor(R.id.iconOff, ContextCompat.getColor(context, R.color.white));
            }

            if (methodRequested == null && state != null && state.equals("2")) {
                views.setTextViewText(R.id.iconOff, "checkmark");
                views.setTextViewTextSize(R.id.iconOff, COMPLEX_UNIT_SP, Float.parseFloat("18"));
                views.setTextColor(R.id.iconOff, ContextCompat.getColor(context, R.color.white));
                views.setInt(R.id.iconOff, "setBackgroundResource", R.drawable.shape_circular_background_green);
            }
        }
        transparent = DeviceWidgetInfo.getTransparent();
        if (transparent.equals("true")) {
            views.setInt(R.id.iconWidget, "setBackgroundColor", Color.TRANSPARENT);
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
            boolean b = db.deleteWidgetInfoDevice(appWidgetId);
            if (b) {
                Toast.makeText(context,"Successfully deleted",Toast.LENGTH_LONG).show();
            } else {
                Toast.makeText(context,"Widget not created",Toast.LENGTH_LONG).show();
            }
            int count = db.countWidgetDeviceTableValues();

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
        DeviceInfo widgetInfo = db.findWidgetInfoDevice(widgetId);
        if (widgetInfo == null) {
            return;
        }

        Integer methods = widgetInfo.getDeviceMethods();
        int deviceId = widgetInfo.getDeviceId();

        if (ACTION_BELL.equals(intent.getAction()) && methods != 0) {

            db.updateDeviceMethodRequested(METHOD_BELL, deviceId);
            AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
            updateAppWidget(context, widgetManager, widgetId);

            createDeviceActionApi(context, deviceId, 4, widgetId, db, "Bell");
        }
        if (ACTION_ON.equals(intent.getAction()) && methods != 0) {

            db.updateDeviceMethodRequested(METHOD_ON, deviceId);
            AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
            updateAppWidget(context, widgetManager, widgetId);

            createDeviceActionApi(context, deviceId, 1, widgetId, db, "On");
        }
        if (ACTION_OFF.equals(intent.getAction()) && methods != 0) {

            db.updateDeviceMethodRequested(METHOD_OFF, deviceId);
            AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
            updateAppWidget(context, widgetManager, widgetId);

            createDeviceActionApi(context, deviceId, 2, widgetId, db, "Off");
        }
    }

    void createDeviceActionApi(final Context context, final int deviceId, int method, final int widgetId, final MyDBHandler db, final String action) {
        PrefManager prefManager = new PrefManager(context);
        String  accessToken = prefManager.getAccess();

        String params = "device/command?id="+deviceId+"&method="+method+"&value=null";
        deviceAPI.setDeviceState(deviceId, method, 0, widgetId, context, new OnAPITaskComplete() {
            @Override
            public void onSuccess(JSONObject response) {
                String error = response.optString("error");
                if (!error.isEmpty() && error != null) {
                    String noDeviceMessage = "Device \""+deviceId+"\" not found!";
                    if (String.valueOf(error).trim().equalsIgnoreCase(noDeviceMessage.trim())) {
                        db.updateDeviceIdDeviceWidget(-1, widgetId);
                    }
                }
                resetDeviceStateToNull(deviceId, widgetId, context);

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

    public void resetDeviceStateToNull(final int deviceId, final int widgetId, final Context context) {
        handlerResetDeviceStateToNull = new Handler(Looper.getMainLooper());
        runnableResetDeviceStateToNull = new Runnable() {
            @Override
            public void run() {
                MyDBHandler db = new MyDBHandler(context);
                db.updateDeviceState(null, deviceId, "");
                AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                updateAppWidget(context, widgetManager, widgetId);
            }
        };

        handlerResetDeviceStateToNull.postDelayed(runnableResetDeviceStateToNull, 5000);
    }
}
