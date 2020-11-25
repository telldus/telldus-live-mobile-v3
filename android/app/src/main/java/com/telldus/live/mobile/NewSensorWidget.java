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
import android.widget.RemoteViews;
import android.os.Bundle;
import androidx.core.content.ContextCompat;
import android.view.View;
import android.util.Log;

import com.androidnetworking.error.ANError;

import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.text.DateFormat;

import com.telldus.live.mobile.Database.MyDBHandler;
import com.telldus.live.mobile.Database.PrefManager;
import com.telldus.live.mobile.Model.SensorInfo;
import com.telldus.live.mobile.Utility.Constants;
import com.telldus.live.mobile.Utility.SensorsUtilities;
import com.telldus.live.mobile.API.API;
import com.telldus.live.mobile.API.OnAPITaskComplete;
import com.telldus.live.mobile.Utility.SensorUpdateAlarmManager;
import com.telldus.live.mobile.Utility.CommonUtilities;
import com.telldus.live.mobile.API.UserAPI;

import com.androidnetworking.AndroidNetworking;

import org.json.JSONObject;
import org.json.JSONArray;
import org.json.JSONException;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Arrays;
import java.util.List;

import static android.util.TypedValue.COMPLEX_UNIT_SP;

public class NewSensorWidget extends AppWidgetProvider {
    private static final String ACTION_SENSOR_UPDATE = "ACTION_SENSOR_UPDATE";
    public static final String ACTION_AUTO_UPDATE = "com.telldus.live.mobile.AUTO_UPDATE";
    private static final String ACTION_PURCHASE_PRO = "ACTION_PURCHASE_PRO";
    private PendingIntent pendingIntent;

    private static final String API_TAG = "SensorApi";

    static void updateAppWidget(
            Context context,
            AppWidgetManager appWidgetManager,
            int appWidgetId,
            Map extraArgs
            ) {
        PrefManager prefManager = new PrefManager(context);
        String accessToken = prefManager.getAccessToken();
        // On log out, only prefManager is cleared and not DB, so we do not want sensor to show back again during the timed interval
        // or socket update.
        if (accessToken == "") {
            return;
        }

        String sensorIcon = "";
        CharSequence widgetText = "";
        String sensorLastUpdated = "";
        CharSequence sensorValue = "", sensorUnit = "";
        String widgetType;
        SensorUpdateAlarmManager sensorUpdateAlarmManager = new SensorUpdateAlarmManager(context);
        MyDBHandler db = new MyDBHandler(context);
        SensorInfo sensorWidgetInfo = db.findWidgetInfoSensor(appWidgetId);
        String transparent;

        if (sensorWidgetInfo == null) {
            return;
        }

        String userId = sensorWidgetInfo.getUserId();
        String currentUserId = prefManager.getUserId();
        if (currentUserId == null || userId == null) {
            return;
        }

        Boolean isNearly1By1 = CommonUtilities.isNearly1By1(context, appWidgetManager, appWidgetId);

        int iconWidth = CommonUtilities.getBaseIconWidth(context, appWidgetManager, appWidgetId);
        int fontSize = CommonUtilities.getBaseFontSize(context, appWidgetManager, appWidgetId);
        fontSize = isNearly1By1 ? (int) (fontSize * 1.8) : fontSize;
        int fontSizeOne = (int) (fontSize * 1.2);
        int fontSizeTwo = (int) (fontSize * 0.88);
        int fontSizeFour = (int) (fontSize * 0.9);
        int fontSizeFive = (int) (fontSize * 0.6);
        fontSizeFour = fontSizeFour > Constants.widgetTitleMaxSize ? Constants.widgetTitleMaxSize : fontSizeFour;

        Boolean isSameAccount = userId.trim().equals(currentUserId.trim());
        if (!isSameAccount) {
            sensorUpdateAlarmManager.stopAlarm(appWidgetId, NewSensorWidget.class);

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

        Integer sensorId = sensorWidgetInfo.getSensorId();
        if (sensorId.intValue() == -1) {
            iconWidth = (int) iconWidth / 2;
            RemoteViews view = new RemoteViews(context.getPackageName(), R.layout.widget_item_removed);
            view.setTextViewText(R.id.widgetItemRemovedInfo, context.getResources().getString(R.string.reserved_widget_android_message_sensor_not_found));
            view.setImageViewBitmap(R.id.infoIcon, CommonUtilities.buildTelldusIcon(
                    "info",
                    ContextCompat.getColor(context, R.color.brightRed),
                    iconWidth,
                    (int) (iconWidth * 0.8),
                    (int) (iconWidth * 0.8),
                    context));
            view.setTextViewTextSize(R.id.widgetItemRemovedInfo, COMPLEX_UNIT_SP, fontSizeFive);

            appWidgetManager.updateAppWidget(appWidgetId, view);

            sensorUpdateAlarmManager.stopAlarm(appWidgetId, NewSensorWidget.class);
            return;
        }

        int pro = prefManager.getPro();
        long now = new Date().getTime() / 1000;
        Boolean isBasicUser = pro == -1 || pro < now;

        Object normalizeUIO = extraArgs.get("normalizeUI");
        Boolean normalizeUI = normalizeUIO == null ? false : (Boolean) normalizeUIO;

        RemoteViews view = new RemoteViews(context.getPackageName(), R.layout.configurable_sensor_widget);

        widgetText = sensorWidgetInfo.getSensorName();
        sensorValue = sensorWidgetInfo.getSensorValue();
        sensorUnit = sensorWidgetInfo.getSensorUnit();
        sensorIcon = sensorWidgetInfo.getSensorIcon();
        sensorLastUpdated = sensorWidgetInfo.getSensorUpdate();
        widgetType = sensorWidgetInfo.getSensorDisplayType();
        transparent = sensorWidgetInfo.getTransparent();

        String isUpdating = sensorWidgetInfo.getIsUpdating();

        String formattedValue = formatValue(sensorValue);

        long time = Long.parseLong(sensorLastUpdated);

        // if timestamp given in seconds, convert to millis
        if (time < 1000000000000L) {
            time *= 1000;
        }

        Date date = new Date(time);

        Locale locale = Locale.getDefault();
        DateFormat dMWY = formatDate(locale);
        String formattedDate = dMWY.format(date);
        String formattedTime = DateFormat.getTimeInstance(DateFormat.SHORT, locale).format(date);

        String formattedDT = isNearly1By1 ? formattedTime : formattedDate + " " + formattedTime;

        transparent = transparent == null ? "" : transparent;
        int color = ContextCompat.getColor(context, R.color.white);
        int colorTitle = ContextCompat.getColor(context, R.color.white);
        view.setViewPadding(R.id.linear_background, 2, 2, 2, 2);

        if (isUpdating != null && isUpdating.equals("true")) {
            if (transparent.equals("dark")) {
                showFlashIndicator(
                    view,
                    R.id.flash_view_sensor,
                    R.id.flashing_indicator_sensor,
                    R.drawable.shape_circle_black_fill
                );

                view.setInt(R.id.iconWidgetSensor,"setBackgroundColor", Color.TRANSPARENT);
                view.setInt(R.id.linear_background, "setBackgroundResource", R.drawable.shape_border_round_black);
                color = ContextCompat.getColor(context, R.color.themeDark);
                colorTitle = ContextCompat.getColor(context, R.color.themeDark);
            } else if (transparent.equals("light") || transparent.equals("true")) {
                showFlashIndicator(
                    view,
                    R.id.flash_view_sensor,
                    R.id.flashing_indicator_sensor,
                    R.drawable.shape_circle_white_fill
                );

                view.setInt(R.id.iconWidgetSensor,"setBackgroundColor", Color.TRANSPARENT);
                view.setInt(R.id.linear_background, "setBackgroundResource", R.drawable.shape_border_round_white);
                color = ContextCompat.getColor(context, R.color.white);
                colorTitle = ContextCompat.getColor(context, R.color.white);
            } else {
                showFlashIndicator(
                    view,
                    R.id.flash_view_sensor,
                    R.id.flashing_indicator_sensor,
                    R.drawable.shape_circle_white_fill
                );

                view.setInt(R.id.linear_background, "setBackgroundResource", R.drawable.shape_black);
            }
        }
        if (isUpdating == null || isUpdating.equals("false")) {
            hideFlashIndicator(view, R.id.flashing_indicator_sensor);
            if (transparent.equals("dark")) {
                view.setInt(R.id.iconWidgetSensor,"setBackgroundColor", Color.TRANSPARENT);
                view.setInt(R.id.linear_background, "setBackgroundResource", R.drawable.shape_border_round_black);
                color = ContextCompat.getColor(context, R.color.themeDark);
                colorTitle = ContextCompat.getColor(context, R.color.themeDark);
            } else if (transparent.equals("light") || transparent.equals("true")) {
                view.setInt(R.id.iconWidgetSensor,"setBackgroundColor", Color.TRANSPARENT);
                view.setInt(R.id.linear_background, "setBackgroundResource", R.drawable.shape_border_round_white);
                color = ContextCompat.getColor(context, R.color.white);
                colorTitle = ContextCompat.getColor(context, R.color.white);
            } else {
                view.setInt(R.id.linear_background, "setBackgroundResource", R.drawable.shape_black);
            }
        }

        view.setOnClickPendingIntent(R.id.linear_background, getPendingSelf(context, ACTION_SENSOR_UPDATE, appWidgetId));

        if (isNearly1By1) {
            view.setViewVisibility(R.id.iconSensor, View.GONE);
        } else {
            view.setViewVisibility(R.id.iconSensor, View.VISIBLE);
            view.setImageViewBitmap(R.id.iconSensor, CommonUtilities.buildTelldusIcon(
                    sensorIcon,
                    color,
                    (int) (iconWidth * 0.8),
                    (int) (iconWidth * 0.8),
                    (int) (iconWidth * 0.8),
                    context));
        }

        view.setTextColor(R.id.txtSensorType, colorTitle);
        view.setTextColor(R.id.txtHistoryInfo, color);
        view.setTextColor(R.id.txtSensorValue, color);
        view.setTextColor(R.id.txtSensorUnit, color);

        view.setTextViewText(R.id.txtSensorType, widgetText);
        view.setTextViewText(R.id.txtHistoryInfo, formattedDT);
        view.setTextViewText(R.id.txtSensorValue, formattedValue);
        view.setTextViewText(R.id.txtSensorUnit, sensorUnit);

        view.setTextViewTextSize(R.id.txtSensorValue, COMPLEX_UNIT_SP, fontSizeOne);
        view.setTextViewTextSize(R.id.txtSensorUnit, COMPLEX_UNIT_SP, fontSizeTwo);
        view.setTextViewTextSize(R.id.txtHistoryInfo, COMPLEX_UNIT_SP, fontSizeFive);
        view.setTextViewTextSize(R.id.txtSensorType, COMPLEX_UNIT_SP, 14);

        long currentTime = new Date().getTime();
        long timeAgo = currentTime - time;
        int limit = (24 * 3600 * 1000);
        if (timeAgo < limit && !transparent.equals("light") && !transparent.equals("dark") && !transparent.equals("true")) {
            view.setTextColor(R.id.txtHistoryInfo, ContextCompat.getColor(context, R.color.white));
        } else if (timeAgo >= limit) {
            view.setTextColor(R.id.txtHistoryInfo, ContextCompat.getColor(context, R.color.brightRed));
        }

        if (normalizeUI) {
            hideFlashIndicator(view, R.id.flashing_indicator_sensor);
        }

        if (isBasicUser) {
            view.setViewVisibility(R.id.premiumRequiredInfo, View.VISIBLE);
            view.setOnClickPendingIntent(R.id.premiumRequiredInfo, getPendingSelf(context, ACTION_PURCHASE_PRO, appWidgetId));

            iconWidth = (int) (iconWidth * 0.3);
            int padding = (int) (iconWidth * 0.3) + 8;

            view.setImageViewBitmap(R.id.icon_premium, CommonUtilities.drawableToBitmap(context.getDrawable(R.drawable.icon_premium), iconWidth, iconWidth));
            view.setImageViewBitmap(R.id.icon_premium_bg_mask, CommonUtilities.drawableToBitmap(context.getDrawable(R.drawable.shape_circle), iconWidth + padding, iconWidth + padding));
            view.setTextViewTextSize(R.id.textPremiumRequired, COMPLEX_UNIT_SP, fontSizeFive);

            sensorUpdateAlarmManager.stopAlarm(appWidgetId, NewSensorWidget.class);
        } else {
            view.setViewVisibility(R.id.premiumRequiredInfo, View.GONE);

            int updateInterval = sensorWidgetInfo.getUpdateInterval();
            boolean alreadyRunning = sensorUpdateAlarmManager.checkIfAlarmAlreadyRunning(appWidgetId, NewSensorWidget.class);
            if (!alreadyRunning) {
                sensorUpdateAlarmManager.startAlarm(appWidgetId, updateInterval, NewSensorWidget.class);
            }
        }

        // Instruct the widget manager to update the widget
        appWidgetManager.updateAppWidget(appWidgetId, view);
    }

    public static void showFlashIndicator(RemoteViews views, int visibleFlashId, int flashId, int drawable) {
        views.setInt(visibleFlashId, "setBackgroundResource", drawable);
        views.setViewVisibility(flashId, View.VISIBLE);
    }

    public static void hideFlashIndicator(RemoteViews views, int flashId) {
        views.setViewVisibility(flashId, View.GONE);
    }

    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager appWidgetManager, int appWidgetId, Bundle newOptions) {
        updateAppWidget(context, appWidgetManager, appWidgetId, new HashMap());
        super.onAppWidgetOptionsChanged(context, appWidgetManager, appWidgetId, newOptions);
    }

    @Override
    public void onEnabled(Context context) {
        // Enter relevant functionality for when the first widget is created
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        // There may be multiple widgets active, so update all of them
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId, new HashMap());
        }
    }

    @Override
    public void onDeleted(Context context, int[] appWidgetIds) {
        // When the user deletes the widget, delete the data associated with it and stop auto-update alarm.
        MyDBHandler db = new MyDBHandler(context);
        SensorUpdateAlarmManager sensorUpdateAlarmManager = new SensorUpdateAlarmManager(context);
        for (int appWidgetId : appWidgetIds) {
            sensorUpdateAlarmManager.stopAlarm(appWidgetId, NewSensorWidget.class);
            boolean b = db.deleteWidgetInfoSensor(appWidgetId);
        }
    }

    @Override
    public void onDisabled(Context context) {
        super.onDisabled(context);
        // Enter relevant functionality for when the last widget is disabled
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        Bundle extras = intent.getExtras();
        if (extras == null) {
            return;
        }

        int widgetId = extras.getInt(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID);
        if (widgetId == AppWidgetManager.INVALID_APPWIDGET_ID) {
            return;
        }

        MyDBHandler db = new MyDBHandler(context);
        SensorInfo widgetInfo = db.findWidgetInfoSensor(widgetId);
        if (widgetInfo == null) {
            return;
        }

        Integer sensorId = widgetInfo.getSensorId();
        if (sensorId.intValue() == -1) {
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

        if (ACTION_SENSOR_UPDATE.equals(intent.getAction())) {
            AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);

            String isUpdating = widgetInfo.getIsUpdating();
            if (isUpdating != null && isUpdating.equals("true")) {
                AndroidNetworking.cancel(API_TAG);
                db.updateSensorIsUpdating(widgetId, "false");
                updateAppWidget(context, widgetManager, widgetId, new HashMap());
            }

            db.updateSensorIsUpdating(widgetId, "true");
            updateAppWidget(context, widgetManager, widgetId, new HashMap());

            createSensorApi(sensorId, widgetId, db, context);
        }

        if (intent.getAction().equals(ACTION_AUTO_UPDATE)) {
            int updateInterval = widgetInfo.getUpdateInterval();
            SensorUpdateAlarmManager sensorUpdateAlarmManager = new SensorUpdateAlarmManager(context);
            sensorUpdateAlarmManager.startAlarm(widgetId, updateInterval, NewSensorWidget.class);

            createSensorApi(sensorId, widgetId, db, context);
        }
    }

    private static PendingIntent getPendingSelf(Context context, String action, int id) {
        Intent intent = new Intent(context, NewSensorWidget.class);
        intent.setAction(action);
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, id);
        return PendingIntent.getBroadcast(context, id, intent, 0);
    }

    void createSensorApi(final Integer sensorId, final Integer widgetId, final MyDBHandler database, final Context context) {
        String params = "/sensor/info?id="+sensorId;
        API endPoints = new API();
        endPoints.callEndPoint(context, params, API_TAG, new OnAPITaskComplete() {
            @Override
            public void onSuccess(final JSONObject response) {
                try {
                    SensorInfo sensorWidgetInfo = database.findWidgetInfoSensor(widgetId);

                    if (sensorWidgetInfo != null) {

                        String error = response.optString("error");
                        if (!error.isEmpty() && error != null) {
                            String noSensorMessage = "The sensor with id \""+sensorId+"\" does not exist";
                            if (String.valueOf(error).trim().equalsIgnoreCase(noSensorMessage.trim())) {
                                database.updateSensorIdSensorWidget(-1, widgetId);

                                AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                                updateAppWidget(context, widgetManager, widgetId, new HashMap());
                            }
                            return;
                        }

                        JSONObject responseObject = new JSONObject(response.toString());
                        JSONArray sensorData = responseObject.getJSONArray("data");

                        SensorsUtilities sc = new SensorsUtilities();

                        String sensorName = responseObject.optString("name");
                        if (sensorName == null) {
                            sensorName = context.getResources().getString(R.string.reserved_widget_android_unknown);
                        }

                        for (int j = 0; j < sensorData.length(); j++) {
                            JSONObject currData = sensorData.getJSONObject(j);

                            String lastUp = currData.optString("lastUpdated");
                            String name = currData.optString("name");
                            String scale = currData.optString("scale");
                            String value = currData.optString("value");

                            Map<String, Object> info = sc.getSensorInfo(name, scale, value, context);
                            Object label = info.get("label").toString();
                            Object unit = info.get("unit").toString();
                            String labelUnit = label+"("+unit+")";

                            String widgetLabelUnit = sensorWidgetInfo.getSensorDisplayType();
                            if (widgetLabelUnit.equalsIgnoreCase(labelUnit)) {
                                String senValue = info.get("value").toString();
                                database.updateSensorInfo(sensorName, senValue, Long.parseLong(lastUp), widgetId);
                            }
                        }
                    }
                    database.updateSensorIsUpdating(widgetId, "false");

                    AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                    updateAppWidget(context, widgetManager, widgetId, new HashMap());
                } catch (JSONException e) {
                    e.printStackTrace();
                    database.updateSensorIsUpdating(widgetId, "false");
                    AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                    updateAppWidget(context, widgetManager, widgetId, new HashMap());
                }
            }
            @Override
            public void onError(ANError error) {
                database.updateSensorIsUpdating(widgetId, "false");
                AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                updateAppWidget(context, widgetManager, widgetId, new HashMap());
            }
        });
    }

    public static String formatValue(CharSequence sensorValue) {
        if (sensorValue == null || sensorValue == "") {
            return "";
        }

        String value = String.valueOf(sensorValue);

        if (value == null || value.trim().isEmpty()) {
            return "";
        }

        List<String> list = Arrays.asList(SensorsUtilities.WIND_DIR);
        if (list.contains(value)) { // Check for wind direction values
            return value;
        }

        Double valueAsDouble = Double.valueOf(value);
        DecimalFormat df = new DecimalFormat("#.#");
        Boolean hasDecimal = (valueAsDouble - valueAsDouble.intValue()) != 0;
        df.setMaximumIntegerDigits(hasDecimal ? 4 : 5);
        String formattedDecimal = df.format(valueAsDouble);
        return formattedDecimal;
    }

    public static DateFormat formatDate(Locale locale) {
        SimpleDateFormat formattedDate = (SimpleDateFormat) DateFormat.getDateInstance(DateFormat.MEDIUM, locale);
        formattedDate.applyPattern(formattedDate.toPattern().replaceAll(
            "([^\\p{Alpha}']|('[\\p{Alpha}]+'))*y+([^\\p{Alpha}']|('[\\p{Alpha}]+'))*",
            ""));
        return formattedDate;
    }

    public void updateUserProfile(final int widgetId, final Context context) {
        UserAPI userAPI = new UserAPI();
        userAPI.getUserProfile(context, new OnAPITaskComplete() {
            @Override
            public void onSuccess(JSONObject response) {
                WidgetsUpdater wUpdater = new WidgetsUpdater();
                wUpdater.updateAllWidgets(context, new HashMap());
            }
            @Override
            public void onError(ANError error) {
            }
        });
    }
}
