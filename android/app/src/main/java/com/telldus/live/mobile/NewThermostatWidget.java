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
import android.content.res.Resources;
import android.graphics.Color;
import android.os.Bundle;
import androidx.core.content.ContextCompat;
import android.view.View;
import android.widget.RemoteViews;
import android.os.Handler;
import android.widget.TextView;

import com.androidnetworking.error.ANError;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.text.DecimalFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Date;
import java.util.List;
import java.util.Arrays;

import com.telldus.live.mobile.API.SensorsAPI;
import com.telldus.live.mobile.Database.MyDBHandler;
import com.telldus.live.mobile.Database.PrefManager;
import com.telldus.live.mobile.Model.DeviceInfo;
import com.telldus.live.mobile.Utility.Constants;
import com.telldus.live.mobile.Utility.DevicesUtilities;
import com.telldus.live.mobile.Utility.CommonUtilities;
import com.telldus.live.mobile.API.DevicesAPI;
import com.telldus.live.mobile.API.UserAPI;
import com.telldus.live.mobile.API.OnAPITaskComplete;
import com.telldus.live.mobile.Utility.SensorUpdateAlarmManager;

import static android.util.TypedValue.COMPLEX_UNIT_SP;


/**
 * Implementation of App Widget functionality.
 * App Widget Configuration implemented in {@link NewThermostatWidgetConfigureActivity NewThermostatWidgetConfigureActivity}
 */
public class NewThermostatWidget extends AppWidgetProvider {
    private static final String ACTION_THERMOSTAT = "ACTION_THERMOSTAT";
    private static final String ACTION_PURCHASE_PRO = "ACTION_PURCHASE_PRO";

    public static final String ACTION_AUTO_UPDATE = "com.telldus.live.mobile.AUTO_UPDATE";

    static void updateAppWidget(
        Context context,
        AppWidgetManager appWidgetManager,
        int appWidgetId
    ) {
        PrefManager prefManager = new PrefManager(context);
        String accessToken = prefManager.getAccessToken();
        // On log out, only prefManager is cleared and not DB, so we do not want device to show back again during the
        // socket update.
        if (accessToken == "") {
            return;
        }

        SensorUpdateAlarmManager sensorUpdateAlarmManager = new SensorUpdateAlarmManager(context);

        MyDBHandler db = new MyDBHandler(context);

        DeviceInfo DeviceWidgetInfo = db.findWidgetInfoDevice(appWidgetId);

        if (DeviceWidgetInfo == null) {
            return;
        }

        String userId = DeviceWidgetInfo.getUserId();
        String currentUserId = prefManager.getUserId();
        if (currentUserId == null || userId == null) {
            return;
        }

        int iconWidth = CommonUtilities.getBaseIconWidth(context, appWidgetManager, appWidgetId);
        int fontSize = CommonUtilities.getBaseFontSize(context, appWidgetManager, appWidgetId);
        int fontSizeOne = (int) (fontSize * 0.88);
        int fontSizeTwo = (int) (fontSize * 0.68);
        int fontSizeFour = (int) (fontSize * 0.9);
        int fontSizeFive = (int) (fontSize * 0.6);
        fontSizeFour = fontSizeFour > Constants.widgetTitleMaxSize ? Constants.widgetTitleMaxSize : fontSizeFour;

        Boolean isSameAccount = userId.trim().equals(currentUserId.trim());
        if (!isSameAccount) {

            sensorUpdateAlarmManager.stopAlarm(appWidgetId, NewThermostatWidget.class);

            RemoteViews view = new RemoteViews(context.getPackageName(), R.layout.logged_out);
            String preScript = context.getResources().getString(R.string.reserved_widget_android_message_user_logged_out_one);
            String phraseTwo = context.getResources().getString(R.string.reserved_widget_android_message_user_logged_out_two);
            view.setTextViewText(R.id.loggedOutInfoOne, preScript + ": ");
            view.setTextViewText(R.id.loggedOutInfoEmail, userId);
            view.setTextViewText(R.id.loggedOutInfoTwo, phraseTwo);

            view.setTextViewTextSize(R.id.loggedOutInfoOne, COMPLEX_UNIT_SP, fontSizeFive);
            view.setTextViewTextSize(R.id.loggedOutInfoEmail, COMPLEX_UNIT_SP, fontSizeFive);
            view.setTextViewTextSize(R.id.loggedOutInfoTwo, COMPLEX_UNIT_SP, fontSizeFive);

            appWidgetManager.updateAppWidget(appWidgetId, view);

            return;
        }

        Integer deviceId = DeviceWidgetInfo.getDeviceId();
        if (deviceId.intValue() == -1) {
            iconWidth = (int) iconWidth / 2;
            RemoteViews view = new RemoteViews(context.getPackageName(), R.layout.widget_item_removed);
            view.setTextViewText(R.id.widgetItemRemovedInfo, context.getResources().getString(R.string.reserved_widget_android_message_device_not_found));
            view.setImageViewBitmap(R.id.infoIcon, CommonUtilities.buildTelldusIcon(
                "info",
                ContextCompat.getColor(context, R.color.brightRed),
                    iconWidth,
                    (int) (iconWidth * 0.8),
                    (int) (iconWidth * 0.8),
                context));

            view.setTextViewTextSize(R.id.widgetItemRemovedInfo, COMPLEX_UNIT_SP, fontSizeFive);

            appWidgetManager.updateAppWidget(appWidgetId, view);
            sensorUpdateAlarmManager.stopAlarm(appWidgetId, NewThermostatWidget.class);
            return;
        }

        String transparent = DeviceWidgetInfo.getTransparent();
        CharSequence widgetText = DeviceWidgetInfo.getDeviceName();
        String state = DeviceWidgetInfo.getState();
        Integer methods = DeviceWidgetInfo.getDeviceMethods();
        String deviceType = DeviceWidgetInfo.getDeviceType();
        Integer isShowingStatus = DeviceWidgetInfo.getIsShowingStatus();
        String deviceStateValue = DeviceWidgetInfo.getDeviceStateValue();
        deviceStateValue = deviceStateValue == "null" ? "" : deviceStateValue;
        String secondaryStateValue = DeviceWidgetInfo.getSecondaryStateValue();
        secondaryStateValue = secondaryStateValue == "null" ? "" : secondaryStateValue;

        DevicesUtilities deviceUtils = new DevicesUtilities();
        Map<String, Boolean> supportedMethods = deviceUtils.getSupportedMethods(methods);
        Map<String, String> actionIconSet = deviceUtils.getDeviceActionIcon(deviceType, state, supportedMethods);

        Boolean hasThermo = ((supportedMethods.get("THERMOSTAT") != null) && supportedMethods.get("THERMOSTAT"));

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.new_thermostat_widget);

        int pro = prefManager.getPro();
        long now = new Date().getTime() / 1000;
        Boolean isBasicUser = pro == -1 || pro < now;

        transparent = transparent == null ? "" : transparent;
        if (transparent.equals("dark") || transparent.equals("light") || transparent.equals("true")) {
            views.setInt(R.id.iconWidget, "setBackgroundColor", Color.TRANSPARENT);
        }

        // Thermostat
        if (hasThermo) {
            views.setViewVisibility(R.id.widget_content_cover, View.VISIBLE);
            views.setViewVisibility(R.id.thermoCover, View.VISIBLE);
            views.setViewVisibility(R.id.thermoTextCover, View.VISIBLE);

            views.setOnClickPendingIntent(R.id.thermoCover, getPendingSelf(context, ACTION_THERMOSTAT, appWidgetId));

            int colorIdle = ContextCompat.getColor(context, R.color.brandSecondary);
            if (transparent.equals("dark")) {
                views.setInt(R.id.thermoCover, "setBackgroundResource", R.drawable.shape_border_round_black);
                colorIdle = ContextCompat.getColor(context, R.color.themeDark);
            } else if (transparent.equals("light") || transparent.equals("true")) {
                views.setInt(R.id.thermoCover, "setBackgroundResource", R.drawable.shape_border_round_white);
                colorIdle = ContextCompat.getColor(context, R.color.white);
            } else {
                views.setInt(R.id.thermoCover, "setBackgroundResource", R.drawable.button_background);
            }

            if (isShowingStatus == 1) {
                if (transparent.equals("dark")) {
                    showFlashIndicator(
                            views,
                            R.id.flash_view_thermo,
                            R.id.flashing_indicator_thermo,
                            R.drawable.shape_circle_black_fill
                    );
                } else if (transparent.equals("light") || transparent.equals("true")) {
                    showFlashIndicator(
                            views,
                            R.id.flash_view_thermo,
                            R.id.flashing_indicator_thermo,
                            R.drawable.shape_circle_white_fill
                    );
                } else {
                    showFlashIndicator(
                            views,
                            R.id.flash_view_thermo,
                            R.id.flashing_indicator_thermo,
                            R.drawable.shape_circle_black_fill
                    );
                }
            } else {
                hideFlashIndicator(views, R.id.flashing_indicator_thermo);
            }

            String thermoState = "", icon = "";
            ArrayList<Map> modes = deviceUtils.getKnownModesThermostat(context);

            for (int j = 0; j < modes.size(); j++) {
                Map m = modes.get(j);
                if (Integer.parseInt(m.get("id").toString(), 10) == Integer.parseInt(state, 10)) {
                    thermoState = m.get("label").toString();
                    icon = m.get("icon").toString();
                }
            }

            views.setImageViewBitmap(R.id.heaticon, CommonUtilities.buildTelldusIcon(
                    icon,
                colorIdle,
                iconWidth,
                    (int) (iconWidth * 0.8),
                    (int) (iconWidth * 0.8),
                context));

            Boolean hasSecStateVal = secondaryStateValue != null && !secondaryStateValue.trim().isEmpty();
            Boolean hasStateVal = deviceStateValue != null && !deviceStateValue.trim().isEmpty();

            if (hasSecStateVal) {
                Double valueAsDouble = Double.valueOf(secondaryStateValue);
                DecimalFormat df = new DecimalFormat("#.#");
                String formattedSecondaryStateValue = df.format(valueAsDouble);

                views.setTextViewText(R.id.txtValue, formattedSecondaryStateValue);
                views.setTextViewText(R.id.txtUnit, "°C");

                views.setTextColor(R.id.txtValue, colorIdle);
                views.setTextColor(R.id.txtUnit, colorIdle);

                views.setTextViewTextSize(R.id.txtValue, COMPLEX_UNIT_SP, fontSize);
                views.setTextViewTextSize(R.id.txtUnit, COMPLEX_UNIT_SP, fontSizeOne);
            } else {
                views.setViewVisibility(R.id.thermoValueCover, View.GONE);
            }

            if (hasStateVal) {
                Double valueAsDouble = Double.valueOf(deviceStateValue);
                DecimalFormat df = new DecimalFormat("#.#");
                String formattedDeviceStateValue = df.format(valueAsDouble);

                views.setViewVisibility(R.id.thermoCurrValueCover, View.VISIBLE);
                String currentValue = context.getResources().getString(R.string.reserved_widget_android_current_adjective)+": "+formattedDeviceStateValue;
                views.setTextViewText(R.id.txtCurrValue, currentValue);
                views.setTextViewText(R.id.txtCurrUnit, "°C");

                views.setTextColor(R.id.txtCurrValue, colorIdle);
                views.setTextColor(R.id.txtCurrUnit, colorIdle);

                views.setTextViewTextSize(R.id.txtCurrValue, COMPLEX_UNIT_SP, fontSizeTwo);
                views.setTextViewTextSize(R.id.txtCurrUnit, COMPLEX_UNIT_SP, fontSizeTwo);
            } else {
                views.setViewVisibility(R.id.thermoCurrValueCover, View.GONE);
            }

            views.setTextViewText(R.id.txtLabel, thermoState);
            views.setTextColor(R.id.txtLabel, colorIdle);
            views.setTextViewTextSize(R.id.txtLabel, COMPLEX_UNIT_SP, fontSizeTwo);

            if (!hasStateVal && !hasSecStateVal && thermoState == "") {
                views.setViewVisibility(R.id.heaticon, View.GONE);

                views.setViewVisibility(R.id.info_block_cover, View.VISIBLE);
                views.setTextViewText(R.id.infoText, context.getResources().getString(R.string.reserved_widget_android_noThermostatSettings));
                views.setTextColor(R.id.infoText, colorIdle);

                views.setTextViewTextSize(R.id.infoText, COMPLEX_UNIT_SP, fontSizeFive);

                int iconInfoWidth = (int) (iconWidth / 2);
                views.setImageViewBitmap(R.id.infoIcon, CommonUtilities.buildTelldusIcon(
                    "info",
                colorIdle,
                        iconInfoWidth,
                    (int) (iconInfoWidth * 0.8),
                    (int) (iconInfoWidth * 0.8),
                context));
            } else {
                views.setViewVisibility(R.id.heaticon, View.VISIBLE);

                views.setViewVisibility(R.id.info_block_cover, View.GONE);
            }
        }

        if (isBasicUser) {
            views.setViewVisibility(R.id.premiumRequiredInfo, View.VISIBLE);
            views.setOnClickPendingIntent(R.id.premiumRequiredInfo, getPendingSelf(context, ACTION_PURCHASE_PRO, appWidgetId));

            iconWidth = (int) (iconWidth * 0.3);
            int padding = (int) (iconWidth * 0.3) + 8;

            views.setImageViewBitmap(R.id.icon_premium, CommonUtilities.drawableToBitmap(context.getDrawable(R.drawable.icon_premium), iconWidth, iconWidth));
            views.setImageViewBitmap(R.id.icon_premium_bg_mask, CommonUtilities.drawableToBitmap(context.getDrawable(R.drawable.shape_circle), iconWidth + padding, iconWidth + padding));
            views.setTextViewTextSize(R.id.textPremiumRequired, COMPLEX_UNIT_SP, fontSizeFive);

            sensorUpdateAlarmManager.stopAlarm(appWidgetId, NewThermostatWidget.class);
        } else {
            views.setViewVisibility(R.id.premiumRequiredInfo, View.GONE);

            if (hasThermo) {
                int updateInterval = DeviceWidgetInfo.getUpdateInterval();
                boolean alreadyRunning = sensorUpdateAlarmManager.checkIfAlarmAlreadyRunning(appWidgetId, NewThermostatWidget.class);
                if (!alreadyRunning) {
                    sensorUpdateAlarmManager.startAlarm(appWidgetId, updateInterval, NewThermostatWidget.class);
                }
            } else {
                boolean alreadyRunning = sensorUpdateAlarmManager.checkIfAlarmAlreadyRunning(appWidgetId, NewThermostatWidget.class);
                if (!alreadyRunning) {
                    sensorUpdateAlarmManager.stopAlarm(appWidgetId, NewThermostatWidget.class);
                }
            }
        }

        views.setTextViewText(R.id.txtWidgetTitle, widgetText);
        views.setTextViewTextSize(R.id.txtWidgetTitle, COMPLEX_UNIT_SP, fontSizeFour);
        if (transparent.equals("dark")) {
            views.setTextColor(R.id.txtWidgetTitle, ContextCompat.getColor(context, R.color.themeDark));
        } else if (transparent.equals("light") || transparent.equals("true")) {
            views.setTextColor(R.id.txtWidgetTitle, ContextCompat.getColor(context, R.color.white));
        } else {
            views.setTextColor(R.id.txtWidgetTitle, ContextCompat.getColor(context, R.color.white));
        }
        // Instruct the widget manager to update the widget
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    public static void showFlashIndicator(RemoteViews views, int visibleFlashId, int flashId, int drawable) {
        hideAllFlashIndicators(views);

        views.setInt(visibleFlashId, "setBackgroundResource", drawable);
        views.setViewVisibility(flashId, View.VISIBLE);
    }

    public static void hideFlashIndicator(RemoteViews views, int flashId) {
        views.setViewVisibility(flashId, View.GONE);
    }

    public static void hideAllFlashIndicators(RemoteViews views) {
        Integer[] primaryShadedButtons = new Integer[]{R.id.flashing_indicator_on, R.id.flashing_indicator_off};

        List<Integer> list = Arrays.asList(primaryShadedButtons);

        for (int i = 0; i < list.size(); i++) {
            int id = list.get(i);
            views.setViewVisibility(id, View.GONE);
        }
    }

    private static PendingIntent getPendingSelf(Context context, String action, int id) {
        Intent intent = new Intent(context, NewThermostatWidget.class);
        intent.setAction(action);
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID,id);
        return PendingIntent.getBroadcast(context, id, intent, 0);
    }

    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager appWidgetManager, int appWidgetId, Bundle newOptions) {
        updateAppWidget(context, appWidgetManager, appWidgetId);
        super.onAppWidgetOptionsChanged(context, appWidgetManager, appWidgetId, newOptions);
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

        SensorUpdateAlarmManager sensorUpdateAlarmManager = new SensorUpdateAlarmManager(context);

        for (int appWidgetId : appWidgetIds) {
            sensorUpdateAlarmManager.stopAlarm(appWidgetId, NewThermostatWidget.class);
            boolean b = db.deleteWidgetInfoDevice(appWidgetId);
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

        PrefManager prefManager = new PrefManager(context);
        int pro = prefManager.getPro();
        long now = new Date().getTime() / 1000;
        Boolean isBasicUser = pro == -1 || pro < now;
        if (isBasicUser) {
            if (ACTION_PURCHASE_PRO.equals(intent.getAction())) {
                Intent mainActivity = new Intent(context, MainActivity.class);
                mainActivity.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                mainActivity.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TASK);
                context.startActivity(mainActivity);
                WidgetModule.setOpenPurchase(true);
                return;
            }

            updateUserProfile(widgetId, context);
            return;
        }

        Integer methods = widgetInfo.getDeviceMethods();
        int deviceId = widgetInfo.getDeviceId();

        if (ACTION_THERMOSTAT.equals(intent.getAction()) && methods != 0) {
            int updateInterval = widgetInfo.getUpdateInterval();
            SensorUpdateAlarmManager sensorUpdateAlarmManager = new SensorUpdateAlarmManager(context);
            boolean alreadyRunning = sensorUpdateAlarmManager.checkIfAlarmAlreadyRunning(widgetId, NewThermostatWidget.class);
            if (!alreadyRunning) {
                sensorUpdateAlarmManager.startAlarm(widgetId, updateInterval, NewThermostatWidget.class);
            }

           WidgetModule.setOpenThermostatControl(deviceId);
           Intent launchActivity = new Intent(context, MainActivity.class);
           launchActivity.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
           launchActivity.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TASK);
           context.startActivity(launchActivity);
        }
        if (intent.getAction().equals(ACTION_AUTO_UPDATE)) {
            int updateInterval = widgetInfo.getUpdateInterval();
            SensorUpdateAlarmManager sensorUpdateAlarmManager = new SensorUpdateAlarmManager(context);
            sensorUpdateAlarmManager.startAlarm(widgetId, updateInterval, NewThermostatWidget.class);

            String methReq = widgetInfo.getMethodRequested();
            String state = widgetInfo.getState();
            String stateValue = widgetInfo.getDeviceStateValue();
            String secStateValue = widgetInfo.getSecondaryStateValue();

            db.updateDeviceInfo(methReq, state, stateValue, 1, secStateValue, widgetId);
            AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
            updateAppWidget(context, widgetManager, widgetId);

            updateThermostat(context, deviceId, widgetId, db);
        }
    }

    public void updateUserProfile(final int widgetId, final Context context) {
        UserAPI userAPI = new UserAPI();
        userAPI.getUserProfile(context, new OnAPITaskComplete() {
            @Override
            public void onSuccess(JSONObject response) {
                WidgetsUpdater wUpdater = new WidgetsUpdater();
                wUpdater.updateAllWidgets(context);
            }
            @Override
            public void onError(ANError error) {
            }
        });
    }

    void updateThermostat(final Context context, final int deviceId, final int widgetId, final MyDBHandler db) {

        DeviceInfo widgetInfo = db.findWidgetInfoDevice(widgetId);
        int clientDeviceId = widgetInfo.getClientDeviceid();
        int clientId = widgetInfo.getClientId();
        String methReq = widgetInfo.getMethodRequested();
        final String state = widgetInfo.getState();
        String stateValue = widgetInfo.getDeviceStateValue();
        String secStateValue = widgetInfo.getSecondaryStateValue();

        SensorsAPI sensorsAPI = new SensorsAPI();
        String params = "/sensors/list?includeValues=1&includeScale=1";

        sensorsAPI.getSensorsList(params, context, "SensorsApi", new OnAPITaskComplete() {
            @Override
            public void onSuccess(final JSONObject response) {
                    DevicesAPI devicessAPI = new DevicesAPI();
                    devicessAPI.getDeviceInfoGeneral(deviceId, context, new OnAPITaskComplete() {

                        @Override
                        public void onSuccess(JSONObject result) {
                            try {

                                String state2 = state, stateValue2 = stateValue, secStateValue2 = secStateValue;

                                JSONObject sensorData = new JSONObject(response.toString());
                                JSONArray JsonsensorList = sensorData.getJSONArray("sensor");

                                DevicesUtilities deviceUtils = new DevicesUtilities();
                                ArrayList<Map> modes = deviceUtils.getKnownModesThermostat(context);

                                if (JsonsensorList != null) {

                                    try {
                                        JSONArray stateValues = result.getJSONArray("statevalues");
                                        if (stateValues != null) {
                                            for (int ii = 0; ii < stateValues.length(); ii++) {
                                                try {
                                                    JSONObject stateValuesObj = stateValues.getJSONObject(ii);
                                                    String stateC = stateValuesObj.getString("state");

                                                    if (stateC.equalsIgnoreCase("2048")) {
                                                        JSONObject valuesObj = stateValuesObj.getJSONObject("value");
                                                        JSONObject setpointObj = valuesObj.getJSONObject("setpoint");
                                                        String mode = valuesObj.getString("mode");

                                                        for (int j = 0; j < modes.size(); j++) {
                                                            Map m = modes.get(j);
                                                            if (setpointObj != null && setpointObj.length() == 1 && mode == null) {
                                                                Iterator<String> setpointKeys = setpointObj.keys();
                                                                String setpointKey = setpointKeys.next();
                                                                if (setpointKey.equalsIgnoreCase(m.get("mode").toString())) {
                                                                    state2 = m.get("id").toString();
                                                                    secStateValue2 = setpointObj.optString(setpointKey);
                                                                }
                                                            } else {
                                                                if (mode.equalsIgnoreCase(m.get("mode").toString())) {
                                                                    state2 = m.get("id").toString();
                                                                    secStateValue2 = setpointObj.optString(stateValuesObj.getJSONObject("value").getString("mode"));
                                                                }
                                                            }
                                                        }
                                                    }
                                                } catch (Exception e) {

                                                }
                                            }
                                        }
                                    } catch(Exception e) {

                                    }

                                    for (int ii = 0; ii < JsonsensorList.length(); ii++) {
                                        try {
                                            JSONObject currObject = JsonsensorList.getJSONObject(ii);
                                            Integer sensorId = currObject.getInt("sensorId");
                                            if (clientDeviceId == sensorId && clientId == currObject.getInt("client")) {
                                                JSONArray SensorData = currObject.getJSONArray("data");
                                                for (int j = 0; j < SensorData.length(); j++) {
                                                    JSONObject currData = SensorData.getJSONObject(j);

                                                    String nameScale = currData.optString("name");
                                                    Integer scale = currData.optInt("scale");
                                                    String value = currData.optString("value");

                                                    if (nameScale.equalsIgnoreCase("temp") && scale == 0) {
                                                        stateValue2 = value;
                                                    }
                                                }
                                            }
                                        }
                                        catch (Exception e) {
                                            db.updateDeviceInfo(methReq, state, stateValue, 0, secStateValue2, widgetId);
                                            AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                                            updateAppWidget(context, widgetManager, widgetId);
                                        }
                                    }

                                    db.updateDeviceInfo(methReq, state2, stateValue2, 0, secStateValue2, widgetId);
                                    AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                                    updateAppWidget(context, widgetManager, widgetId);
                                } else {
                                    db.updateDeviceInfo(methReq, state, stateValue, 0, secStateValue2, widgetId);
                                    AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                                    updateAppWidget(context, widgetManager, widgetId);
                                }
                            } catch (JSONException e) {
                                db.updateDeviceInfo(methReq, state, stateValue, 0, secStateValue, widgetId);
                                AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                                updateAppWidget(context, widgetManager, widgetId);

                                e.printStackTrace();
                            }
                        }

                        @Override
                        public void onError(ANError result) {
                            db.updateDeviceInfo(methReq, state, stateValue, 0, secStateValue, widgetId);
                            AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                            updateAppWidget(context, widgetManager, widgetId);
                        }
                    });
            }
            @Override
            public void onError(ANError error) {
                db.updateDeviceInfo(methReq, state, stateValue, 0, secStateValue, widgetId);
                AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                updateAppWidget(context, widgetManager, widgetId);
            }
        });
    }
}
