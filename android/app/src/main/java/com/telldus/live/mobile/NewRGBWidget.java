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
import android.graphics.Color;
import android.os.Bundle;
import androidx.core.content.ContextCompat;
import android.view.View;
import android.widget.RemoteViews;
import android.content.res.Resources;

import com.androidnetworking.error.ANError;

import org.json.JSONObject;

import java.util.Map;
import java.util.Date;
import java.util.Arrays;
import java.util.List;

import com.telldus.live.mobile.Database.MyDBHandler;
import com.telldus.live.mobile.Database.PrefManager;
import com.telldus.live.mobile.Model.DeviceInfo;
import com.telldus.live.mobile.Utility.DevicesUtilities;
import com.telldus.live.mobile.API.OnAPITaskComplete;
import com.telldus.live.mobile.Utility.CommonUtilities;
import com.telldus.live.mobile.API.UserAPI;

public class NewRGBWidget extends AppWidgetProvider {

    private static final String ACTION_MORE_ACTIONS = "ACTION_MORE_ACTIONS";
    private static final String ACTION_PURCHASE_PRO = "ACTION_PURCHASE_PRO";


    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager,
                                int appWidgetId) {

        PrefManager prefManager = new PrefManager(context);
        String accessToken = prefManager.getAccessToken();
        // On log out, only prefManager is cleared and not DB, so we do not want device to show back again during the
        // socket update.
        if (accessToken == "") {
            return;
        }

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
        Boolean isSameAccount = userId.trim().equals(currentUserId.trim());
        if (!isSameAccount) {

            RemoteViews view = new RemoteViews(context.getPackageName(), R.layout.logged_out);
            String preScript = context.getResources().getString(R.string.reserved_widget_android_message_user_logged_out_one);
            String phraseTwo = context.getResources().getString(R.string.reserved_widget_android_message_user_logged_out_two);
            view.setTextViewText(R.id.loggedOutInfoOne, preScript + ": ");
            view.setTextViewText(R.id.loggedOutInfoEmail, userId);
            view.setTextViewText(R.id.loggedOutInfoTwo, phraseTwo);

            appWidgetManager.updateAppWidget(appWidgetId, view);

            return;
        }

        Integer deviceId = DeviceWidgetInfo.getDeviceId();
        if (deviceId.intValue() == -1) {
            RemoteViews view = new RemoteViews(context.getPackageName(), R.layout.widget_item_removed);
            view.setTextViewText(R.id.widgetItemRemovedInfo, context.getResources().getString(R.string.reserved_widget_android_message_device_not_found));
            view.setImageViewBitmap(R.id.infoIcon, CommonUtilities.buildTelldusIcon(
                    "info",
                    ContextCompat.getColor(context, R.color.brightRed),
                    80,
                    95,
                    65,
                    context));

            appWidgetManager.updateAppWidget(appWidgetId, view);
            return;
        }

        CharSequence widgetText = DeviceWidgetInfo.getDeviceName();
        Integer methods = DeviceWidgetInfo.getDeviceMethods();
        String transparent = DeviceWidgetInfo.getTransparent();

        DevicesUtilities deviceUtils = new DevicesUtilities();
        Map<String, Boolean> supportedMethods = deviceUtils.getSupportedMethods(methods);

        Boolean hasRGB = ((supportedMethods.get("RGB") != null) && supportedMethods.get("RGB"));

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.new_rgb_widget);

        int pro = prefManager.getPro();
        long now = new Date().getTime() / 1000;
        Boolean isBasicUser = pro == -1 || pro < now;

        int renderedButtonsCount = 0;

        transparent = transparent == null ? "" : transparent;
        if (transparent.equals("dark") || transparent.equals("light") || transparent.equals("true")) {
            views.setInt(R.id.iconWidget, "setBackgroundColor", Color.TRANSPARENT);
        }

        views.setViewVisibility(R.id.widget_content_cover, View.VISIBLE);

        if (hasRGB) {
            views.setViewVisibility(R.id.rgbActionCover, View.VISIBLE);

            Boolean isLastButton = true;
            int colorIdle = handleBackgroundWhenIdleOne(
                                "ON",
                                transparent,
                                renderedButtonsCount,
                                isLastButton,
                                R.id.rgbActionCover,
                                views,
                                context
                            );

            int width = Resources.getSystem().getDisplayMetrics().widthPixels;
            int iconWidth = (int) (width * 0.14);

            views.setImageViewBitmap(R.id.palette, CommonUtilities.buildTelldusIcon(
                "palette",
                colorIdle,
                iconWidth,
                    (int) (iconWidth * 0.7),
                    (int) (iconWidth * 0.7),
                context));

            views.setOnClickPendingIntent(R.id.rgbActionCover, getPendingSelf(context, ACTION_MORE_ACTIONS, appWidgetId));
            
            renderedButtonsCount++;
        }

        if (isBasicUser) {
            views.setViewVisibility(R.id.premiumRequiredInfo, View.VISIBLE);
            views.setOnClickPendingIntent(R.id.premiumRequiredInfo, getPendingSelf(context, ACTION_PURCHASE_PRO, appWidgetId));
        } else {
            views.setViewVisibility(R.id.premiumRequiredInfo, View.GONE);
        }

        views.setTextViewText(R.id.txtWidgetTitle, widgetText);
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

    public static Boolean isPrimaryShade(String button) {
        String[] primaryShadedButtons = new String[]{"OFF", "STOP"};

        List<String> list = Arrays.asList(primaryShadedButtons);

        return list.contains(button);
    }

    public static int handleBackgroundWhenIdleOne(
        String button, String transparent,
        int renderedButtonsCount, Boolean isLastButton,
        int viewId, RemoteViews views, Context context) {

            if (transparent.equals("dark")) {
                setCoverBackground(
                    renderedButtonsCount,
                    isLastButton,
                    R.drawable.shape_left_black_round,
                    R.drawable.shape_border_right_round_black,
                    R.drawable.shape_left_black,
                    R.drawable.shape_border_round_black,
                    viewId,
                    views,
                    context
                );
                return ContextCompat.getColor(context, R.color.themeDark);
            } else if (transparent.equals("light") || transparent.equals("true")) {
                setCoverBackground(
                    renderedButtonsCount,
                    isLastButton,
                    R.drawable.shape_left_white_round,
                    R.drawable.shape_border_right_round_white,
                    R.drawable.shape_left_white,
                    R.drawable.shape_border_round_white,
                    viewId,
                    views,
                    context
                );
                return ContextCompat.getColor(context, R.color.white);
            } else {
                setCoverBackground(
                    renderedButtonsCount,
                    isLastButton,
                    R.drawable.shape_left_rounded_corner,
                    R.drawable.shape_right_rounded_corner,
                    R.drawable.button_background_no_bordradi,
                    R.drawable.button_background,
                    viewId,
                    views,
                    context
                );
                if (isPrimaryShade(button)) {
                    return ContextCompat.getColor(context, R.color.brandPrimary);
                }
                return ContextCompat.getColor(context, R.color.brandSecondary);
            }
    }

    public static void setCoverBackground(
        int renderedButtonsCount, Boolean isLastButton,
        int drawableWhenFirst, int drawableWhenLast, int drawableWhenInMiddle, int drawableWhenTheOnly,
        int viewId, RemoteViews views, Context context
        ) {

        if (renderedButtonsCount == 0 && isLastButton) {
            views.setInt(viewId, "setBackgroundResource", drawableWhenTheOnly);
        } else if (renderedButtonsCount == 0) {
            views.setInt(viewId, "setBackgroundResource", drawableWhenFirst);
        } else if (isLastButton) {
            views.setInt(viewId, "setBackgroundResource", drawableWhenLast);
        } else {
            views.setInt(viewId, "setBackgroundResource", drawableWhenInMiddle);
        }
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        // There may be multiple widgets active, so update all of them
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    private static PendingIntent getPendingSelf(Context context, String action, int id) {
        Intent intent = new Intent(context, NewRGBWidget.class);
        intent.setAction(action);
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, id);
        return PendingIntent.getBroadcast(context, id, intent, 0);
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

        if (ACTION_MORE_ACTIONS.equals(intent.getAction())) {
            Intent dialogueIntent = new Intent(context, DevicesGroupDialogueActivity.class);
            dialogueIntent.putExtra("widgetId", widgetId);
            dialogueIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(dialogueIntent);
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
    public void onDeleted(Context context, int[] appWidgetIds) {
        super.onDeleted(context, appWidgetIds);
        MyDBHandler db = new MyDBHandler(context);
        PrefManager prefManager = new PrefManager(context);
        for (int appWidgetId : appWidgetIds) {
            boolean b = db.deleteWidgetInfoDevice(appWidgetId);
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
}
