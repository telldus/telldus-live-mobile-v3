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
import android.graphics.PorterDuff;
import android.graphics.PorterDuffXfermode;
import android.graphics.Rect;
import android.graphics.RectF;
import android.os.Bundle;
import androidx.core.content.ContextCompat;

import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.widget.RemoteViews;
import android.content.res.Resources;

import com.androidnetworking.error.ANError;

import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;
import java.util.Date;
import java.util.Arrays;
import java.util.List;

import com.telldus.live.mobile.API.DevicesAPI;
import com.telldus.live.mobile.Database.MyDBHandler;
import com.telldus.live.mobile.Database.PrefManager;
import com.telldus.live.mobile.Model.DeviceInfo;
import com.telldus.live.mobile.Utility.Constants;
import com.telldus.live.mobile.Utility.DevicesUtilities;
import com.telldus.live.mobile.API.OnAPITaskComplete;
import com.telldus.live.mobile.Utility.CommonUtilities;
import com.telldus.live.mobile.API.UserAPI;
import com.telldus.live.mobile.Utility.RGBUtilities;

import static android.util.TypedValue.COMPLEX_UNIT_SP;

public class NewDimmerSingle extends AppWidgetProvider {

    private static final String ACTION_MORE_ACTIONS = "ACTION_MORE_ACTIONS";
    private static final String ACTION_PURCHASE_PRO = "ACTION_PURCHASE_PRO";

    private static final int METHOD_DIM = 16;

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager,
                                int appWidgetId, Map extraArgs) {

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

        int iconWidth = (int) (CommonUtilities.getBaseIconWidth(context, appWidgetManager, appWidgetId)* 2);
        int fontSize = (int) (CommonUtilities.getBaseFontSize(context, appWidgetManager, appWidgetId) * 2.3);
        int fontSizeFour = (int) (fontSize * 0.9);
        int fontSizeFive = (int) (fontSize * 0.6);
        int fontSizeSix = (int) (fontSize * 0.45);
        fontSizeFour = fontSizeFour > Constants.widgetTitleMaxSize ? Constants.widgetTitleMaxSize : fontSizeFour;

        Boolean isSameAccount = userId.trim().equals(currentUserId.trim());
        if (!isSameAccount) {

            RemoteViews view = new RemoteViews(context.getPackageName(), R.layout.logged_out);
            String preScript = context.getResources().getString(R.string.reserved_widget_android_message_user_logged_out_one);
            String phraseTwo = context.getResources().getString(R.string.reserved_widget_android_message_user_logged_out_two);
            view.setTextViewText(R.id.loggedOutInfoOne, preScript + ": ");
            view.setTextViewText(R.id.loggedOutInfoEmail, userId);
            view.setTextViewText(R.id.loggedOutInfoTwo, phraseTwo);

            view.setTextViewTextSize(R.id.loggedOutInfoOne, COMPLEX_UNIT_SP, fontSizeSix);
            view.setTextViewTextSize(R.id.loggedOutInfoEmail, COMPLEX_UNIT_SP, fontSizeSix);
            view.setTextViewTextSize(R.id.loggedOutInfoTwo, COMPLEX_UNIT_SP, fontSizeSix);

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
            return;
        }

        CharSequence widgetText = DeviceWidgetInfo.getDeviceName();
        Integer methods = DeviceWidgetInfo.getDeviceMethods();
        String transparent = DeviceWidgetInfo.getTransparent();
        String methodRequested = DeviceWidgetInfo.getMethodRequested();
        String state = DeviceWidgetInfo.getState();
        Integer isShowingStatus = DeviceWidgetInfo.getIsShowingStatus();
        String deviceStateValue = DeviceWidgetInfo.getDeviceStateValue();
        deviceStateValue = deviceStateValue == "null" ? "" : deviceStateValue;

        DevicesUtilities deviceUtils = new DevicesUtilities();
        Map<String, Boolean> supportedMethods = deviceUtils.getSupportedMethods(methods);

        Boolean hasDIM = ((supportedMethods.get("DIM") != null) && supportedMethods.get("DIM"));

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.new_dimmer_one_widget);

        int pro = prefManager.getPro();
        long now = new Date().getTime() / 1000;
        Boolean isBasicUser = pro == -1 || pro < now;

        int renderedButtonsCount = 0;

        transparent = transparent == null ? "" : transparent;
        if (transparent.equals("dark") || transparent.equals("light") || transparent.equals("true")) {
            views.setInt(R.id.iconWidget, "setBackgroundColor", Color.TRANSPARENT);
        }

        views.setViewVisibility(R.id.widget_content_cover, View.VISIBLE);

        Object normalizeUIO = extraArgs.get("normalizeUI");
        Boolean normalizeUI = normalizeUIO == null ? false : (Boolean) normalizeUIO;

        if (hasDIM) {
            views.setViewVisibility(R.id.iconCheck, View.GONE);
            views.setViewVisibility(R.id.dimmerCoverLinear, View.VISIBLE);
            views.setViewVisibility(R.id.dimmerCover, View.VISIBLE);

            Boolean isLastButton = true;
            int colorIdle = handleBackgroundWhenIdleOne(
                            "DIM",
                            transparent,
                            renderedButtonsCount,
                            isLastButton,
                            R.id.dimmerCover,
                            views,
                            context
                        );
            views.setImageViewBitmap(R.id.dimmer, CommonUtilities.buildTelldusIcon(
                "dim25",
                colorIdle,
                80,
                35,
                65,
                context));
            views.setTextColor(R.id.txtDimmer, colorIdle);
            views.setTextViewTextSize(R.id.txtDimmer, COMPLEX_UNIT_SP, fontSizeSix);

            views.setOnClickPendingIntent(R.id.dimmerCover, getPendingSelf(context, ACTION_MORE_ACTIONS, appWidgetId));

            if (methodRequested != null && state == null && isShowingStatus != 1 && methodRequested.equals(String.valueOf((METHOD_DIM)))) {
                int colorOnAction = handleBackgroundOnActionOne(
                                        "DIM",
                                        transparent,
                                        renderedButtonsCount,
                                        isLastButton,
                                        R.id.flash_view_dim,
                                        R.id.flashing_indicator_dim,
                                        R.id.dimmerCover,
                                        views,
                                        context
                                    );
                views.setImageViewBitmap(R.id.dimmer, CommonUtilities.buildTelldusIcon(
                    "dim25",
                    colorOnAction,
                    80,
                    35,
                    65,
                    context));
                views.setTextColor(R.id.txtDimmer, colorOnAction);
            }

            if (methodRequested != null && isShowingStatus == 1) {
                if (methodRequested != null && methodRequested.equals(String.valueOf(METHOD_DIM))) {
                        views.setViewVisibility(R.id.iconCheck, View.VISIBLE);
                        views.setViewVisibility(R.id.dimmerCoverLinear, View.GONE);
                        views.setImageViewBitmap(R.id.iconCheck, CommonUtilities.buildTelldusIcon(
                            "statuscheck",
                            ContextCompat.getColor(context, R.color.widgetGreen),
                            80,
                            95,
                            65,
                            context));
                    hideFlashIndicator(views, R.id.flashing_indicator_dim);
                    handleBackgroundPostActionOne(
                        "DIM",
                        transparent,
                        renderedButtonsCount,
                        isLastButton,
                        R.id.dimmerCover,
                        views,
                        context
                    );
                }
            }

            views.setTextViewText(R.id.txtDimmer, context.getResources().getString(R.string.reserved_widget_android_dim));

            renderedButtonsCount++;

            if (normalizeUI) {
                hideFlashIndicator(views, R.id.flashing_indicator_dim);
            }
        }

        if (isBasicUser) {
            views.setViewVisibility(R.id.premiumRequiredInfo, View.VISIBLE);
            views.setOnClickPendingIntent(R.id.premiumRequiredInfo, getPendingSelf(context, ACTION_PURCHASE_PRO, appWidgetId));

            iconWidth = (int) (iconWidth * 0.3);
            int padding = (int) (iconWidth * 0.3) + 8;

            views.setImageViewBitmap(R.id.icon_premium, CommonUtilities.drawableToBitmap(context.getDrawable(R.drawable.icon_premium), iconWidth, iconWidth));
            views.setImageViewBitmap(R.id.icon_premium_bg_mask, CommonUtilities.drawableToBitmap(context.getDrawable(R.drawable.shape_circle), iconWidth + padding, iconWidth + padding));
            views.setTextViewTextSize(R.id.textPremiumRequired, COMPLEX_UNIT_SP, (int) (fontSizeFive * 0.8));
        } else {
            views.setViewVisibility(R.id.premiumRequiredInfo, View.GONE);
        }

        views.setTextViewText(R.id.txtWidgetTitle, widgetText);
        views.setTextViewTextSize(R.id.txtWidgetTitle, COMPLEX_UNIT_SP, 14);
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
                    R.drawable.shape_border_round_black_fill,
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
                    R.drawable.shape_border_round_white_fill,
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

    public static void handleBackgroundPostActionOne(
            String button, String transparent,
            int renderedButtonsCount, Boolean isLastButton,
            int viewId, RemoteViews views, Context context) {
        if (transparent.equals("dark")) {
            setCoverBackground(
                    renderedButtonsCount,
                    isLastButton,
                    R.drawable.shape_border_left_round_black_fill,
                    R.drawable.shape_border_right_round_black_fill,
                    R.drawable.shape_left_black_fill,
                    R.drawable.shape_border_round_black_fill,
                    viewId,
                    views,
                    context
            );
        } else if (transparent.equals("light") || transparent.equals("true")) {
            setCoverBackground(
                    renderedButtonsCount,
                    isLastButton,
                    R.drawable.shape_border_left_round_white_fill,
                    R.drawable.shape_border_right_round_white_fill,
                    R.drawable.shape_left_white_fill,
                    R.drawable.shape_border_round_white_fill,
                    viewId,
                    views,
                    context
            );
        }
    }

    public static int handleBackgroundOnActionOne(
            String button, String transparent,
            int renderedButtonsCount, Boolean isLastButton,
            int flashViewId, int flashCoverId,
            int viewId, RemoteViews views, Context context) {

        if (transparent.equals("dark")) {
            setCoverBackground(
                    renderedButtonsCount,
                    isLastButton,
                    R.drawable.shape_left_black_round_fill,
                    R.drawable.shape_border_right_round_black_fill,
                    R.drawable.shape_left_black_fill,
                    R.drawable.shape_border_round_black_fill,
                    viewId,
                    views,
                    context
            );
            showFlashIndicator(
                    views,
                    flashViewId,
                    flashCoverId,
                    R.drawable.shape_circle_white_fill
            );
            return ContextCompat.getColor(context, R.color.white);
        } else if (transparent.equals("light") || transparent.equals("true")) {
            setCoverBackground(
                    renderedButtonsCount,
                    isLastButton,
                    R.drawable.shape_left_white_round_fill,
                    R.drawable.shape_border_right_round_white_fill,
                    R.drawable.shape_left_white_fill,
                    R.drawable.shape_border_round_white_fill,
                    viewId,
                    views,
                    context
            );
            showFlashIndicator(
                    views,
                    flashViewId,
                    flashCoverId,
                    R.drawable.shape_circle_black_fill
            );
            return ContextCompat.getColor(context, R.color.themeDark);
        } else {
            if (isPrimaryShade(button)) {
                setCoverBackground(
                        renderedButtonsCount,
                        isLastButton,
                        R.drawable.shape_left_rounded_corner_primary_fill,
                        R.drawable.shape_right_rounded_corner_primary_fill,
                        R.drawable.button_background_no_bordradi_primary_fill,
                        R.drawable.button_background_primary_fill,
                        viewId,
                        views,
                        context
                );
            } else {
                setCoverBackground(
                        renderedButtonsCount,
                        isLastButton,
                        R.drawable.shape_left_rounded_corner_secondary_fill,
                        R.drawable.shape_right_rounded_corner_secondary_fill,
                        R.drawable.button_background_no_bordradi_secondary_fill,
                        R.drawable.button_background_secondary_fill,
                        viewId,
                        views,
                        context
                );
            }
            showFlashIndicator(
                    views,
                    flashViewId,
                    flashCoverId,
                    R.drawable.shape_circle_white_fill
            );
            return ContextCompat.getColor(context, R.color.white);
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

    public static void showFlashIndicator(RemoteViews views, int visibleFlashId, int flashId, int drawable) {

        views.setInt(visibleFlashId, "setBackgroundResource", drawable);
        views.setViewVisibility(flashId, View.VISIBLE);
    }

    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager appWidgetManager, int appWidgetId, Bundle newOptions) {
        updateAppWidget(context, appWidgetManager, appWidgetId, new HashMap());
        super.onAppWidgetOptionsChanged(context, appWidgetManager, appWidgetId, newOptions);
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        // There may be multiple widgets active, so update all of them
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId, new HashMap());
        }
    }

    private static PendingIntent getPendingSelf(Context context, String action, int id) {
        Intent intent = new Intent(context, NewDimmerSingle.class);
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
            String[] methodsToShow = new String[1];
            methodsToShow[0] = "DIM";
            dialogueIntent.putExtra("methodsToShow", methodsToShow);
            dialogueIntent.putExtra("widgetKey", "NewDimmerSingle");
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

    public static void hideFlashIndicator(RemoteViews views, int flashId) {
        views.setViewVisibility(flashId, View.GONE);
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