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
import android.support.v4.content.ContextCompat;
import android.view.View;
import android.widget.RemoteViews;
import android.os.Handler;
import android.os.Looper;

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
import com.telldus.live.mobile.API.DevicesAPI;
import com.telldus.live.mobile.API.OnAPITaskComplete;
import com.telldus.live.mobile.Utility.CommonUtilities;
import com.telldus.live.mobile.API.UserAPI;

import static android.util.TypedValue.COMPLEX_UNIT_SP;
/**
 * Implementation of App Widget functionality.
 * App Widget Configuration implemented in {@link NewAppWidgetConfigureActivity NewAppWidgetConfigureActivity}
 */
public class NewAppWidget extends AppWidgetProvider {

    private static final String ACTION_ON = "ACTION_ON";
    private static final String ACTION_OFF = "ACTION_OFF";
    private static final String ACTION_BELL = "ACTION_BELL";
    private static final String ACTION_UP = "ACTION_UP";
    private static final String ACTION_DOWN = "ACTION_DOWN";
    private static final String ACTION_STOP = "ACTION_STOP";
    private static final String DIMMER_25 = "ACTION_DIMMER_ONE";
    private static final String DIMMER_50 = "ACTION_DIMMER_TWO";
    private static final String DIMMER_75 = "ACTION_DIMMER_THREE";

    private static final String ACTION_MORE_ACTIONS = "ACTION_MORE_ACTIONS";
    private static final String ACTION_PURCHASE_PRO = "ACTION_PURCHASE_PRO";

    private static final String METHOD_ON = "1";
    private static final String METHOD_OFF = "2";
    private static final String METHOD_BELL = "4";
    private static final String METHOD_UP = "128";
    private static final String METHOD_DOWN = "256";
    private static final String METHOD_STOP = "512";
    private static final String METHOD_DIMMER_25 = "16_25";
    private static final String METHOD_DIMMER_50 = "16_50";
    private static final String METHOD_DIMMER_75 = "16_75";

    private PendingIntent pendingIntent;

    DevicesAPI deviceAPI = new DevicesAPI();

    private Handler handlerResetDeviceStateToNull;
    private Runnable runnableResetDeviceStateToNull;

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
        String state = DeviceWidgetInfo.getState();
        String deviceType = DeviceWidgetInfo.getDeviceType();
        String deviceStateValue = DeviceWidgetInfo.getDeviceStateValue();
        Integer methods = DeviceWidgetInfo.getDeviceMethods();
        String methodRequested = DeviceWidgetInfo.getMethodRequested();
        Integer isShowingStatus = DeviceWidgetInfo.getIsShowingStatus();
        String transparent = DeviceWidgetInfo.getTransparent();

        DevicesUtilities deviceUtils = new DevicesUtilities();
        Map<String, Boolean> supportedMethods = deviceUtils.getSupportedMethods(methods);
        Map<String, String> actionIconSet = deviceUtils.getDeviceActionIcon(deviceType, state, supportedMethods);

        Integer buttonsCount = supportedMethods.size();

        String onActionIcon = actionIconSet.get("TURNON");
        String offActionIcon = actionIconSet.get("TURNOFF");
        Boolean hasBell = ((supportedMethods.get("BELL") != null) && supportedMethods.get("BELL"));
        Boolean hasUp = ((supportedMethods.get("UP") != null) && supportedMethods.get("UP"));
        Boolean hasDown = ((supportedMethods.get("DOWN") != null) && supportedMethods.get("DOWN"));
        Boolean hasStop = ((supportedMethods.get("STOP") != null) && supportedMethods.get("STOP"));
        Boolean hasOff = ((supportedMethods.get("TURNOFF") != null) && supportedMethods.get("TURNOFF"));
        Boolean hasDim = ((supportedMethods.get("DIM") != null) && supportedMethods.get("DIM"));
        Boolean hasOn = ((supportedMethods.get("TURNON") != null) && supportedMethods.get("TURNON"));

        Boolean hasLearn = ((supportedMethods.get("LEARN") != null) && supportedMethods.get("LEARN"));
        if (hasLearn) {
            buttonsCount = buttonsCount - 1;
        }
        if (hasDim) {
            buttonsCount = buttonsCount + 2;
        }

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.new_app_widget);

        int pro = prefManager.getPro();
        long now = new Date().getTime() / 1000;
        Boolean isBasicUser = pro == -1 || pro < now;

        int renderedButtonsCount = 0;
        int maxButtonsOnWidget = 5;
        Boolean showMoreActions = (renderedButtonsCount == 4 ) && (buttonsCount > 5);

        transparent = transparent == null ? "" : transparent;
        if (transparent.equals("dark") || transparent.equals("light")) {
            views.setInt(R.id.iconWidget, "setBackgroundColor", Color.TRANSPARENT);
        }

        views.setViewVisibility(R.id.widget_content_cover, View.VISIBLE);
        if (hasBell && !showMoreActions) {
            views.setViewVisibility(R.id.bellCover,View.VISIBLE);

            Boolean isLastButton = (renderedButtonsCount == (buttonsCount - 1)) || (renderedButtonsCount == (maxButtonsOnWidget - 1));
            int colorIdle = handleBackgroundWhenIdleOne(
                                "BELL",
                                transparent,
                                renderedButtonsCount,
                                isLastButton,
                                R.id.bellCover,
                                views,
                                context
                            );
            views.setImageViewBitmap(R.id.bell, CommonUtilities.buildTelldusIcon(
                "bell",
                colorIdle,
                80,
                95,
                65,
                context));

            views.setOnClickPendingIntent(R.id.bellCover, getPendingSelf(context, ACTION_BELL, appWidgetId));

            if (methodRequested != null && state == null && isShowingStatus != 1 && methodRequested.equals(METHOD_BELL)) {
                int colorOnAction = handleBackgroundOnActionOne(
                                        "BELL",
                                        transparent,
                                        renderedButtonsCount,
                                        isLastButton,
                                        R.id.flash_view_bell,
                                        R.id.flashing_indicator_bell,
                                        R.id.bellCover,
                                        views,
                                        context
                                    );
                views.setImageViewBitmap(R.id.bell, CommonUtilities.buildTelldusIcon(
                    "bell",
                    colorOnAction,
                    80,
                    95,
                    65,
                    context));
            }
            if (methodRequested != null && isShowingStatus == 1 && methodRequested.equals("4")) {
                if (state == null || !state.equals("4")) {
                    views.setImageViewBitmap(R.id.bell, CommonUtilities.buildTelldusIcon(
                        "statusx",
                        ContextCompat.getColor(context, R.color.widgetRed),
                        80,
                        95,
                        65,
                        context));
                } else {
                    views.setImageViewBitmap(R.id.bell, CommonUtilities.buildTelldusIcon(
                        "statuscheck",
                        ContextCompat.getColor(context, R.color.widgetGreen),
                        80,
                        95,
                        65,
                        context));
                }
                hideFlashIndicator(views, R.id.flashing_indicator_bell);
                handleBackgroundPostActionOne(
                    "BELL",
                    transparent,
                    renderedButtonsCount,
                    isLastButton,
                    R.id.bellCover,
                    views,
                    context
                );
            }

            renderedButtonsCount++;
        }

        showMoreActions = (renderedButtonsCount == 4 ) && (buttonsCount > 5);
        if (hasUp && !showMoreActions) {
            views.setViewVisibility(R.id.upCover, View.VISIBLE);

            Boolean isLastButton = (renderedButtonsCount == (buttonsCount - 1)) || (renderedButtonsCount == (maxButtonsOnWidget - 1));
            int colorIdle = handleBackgroundWhenIdleOne(
                                "UP",
                                transparent,
                                renderedButtonsCount,
                                isLastButton,
                                R.id.upCover,
                                views,
                                context
                            );
            views.setImageViewBitmap(R.id.uparrow, CommonUtilities.buildTelldusIcon(
                "up",
                colorIdle,
                80,
                95,
                65,
                context));

            views.setOnClickPendingIntent(R.id.upCover, getPendingSelf(context, ACTION_UP, appWidgetId));

            if (methodRequested != null && state == null && isShowingStatus != 1 && methodRequested.equals(METHOD_UP)) {
                int colorOnAction = handleBackgroundOnActionOne(
                                        "UP",
                                        transparent,
                                        renderedButtonsCount,
                                        isLastButton,
                                        R.id.flash_view_up,
                                        R.id.flashing_indicator_up,
                                        R.id.upCover,
                                        views,
                                        context
                                    );
                views.setImageViewBitmap(R.id.uparrow, CommonUtilities.buildTelldusIcon(
                    "up",
                    colorOnAction,
                    80,
                    95,
                    65,
                    context));
            }
            if (methodRequested != null && isShowingStatus == 1 && methodRequested.equals("128")) {
                if (state != null && state.equals("128")) {
                    views.setImageViewBitmap(R.id.uparrow, CommonUtilities.buildTelldusIcon(
                        "statuscheck",
                        ContextCompat.getColor(context, R.color.widgetGreen),
                        80,
                        95,
                        65,
                        context));
                } else {
                    views.setImageViewBitmap(R.id.uparrow, CommonUtilities.buildTelldusIcon(
                        "statusx",
                        ContextCompat.getColor(context, R.color.widgetRed),
                        80,
                        95,
                        65,
                        context));
                }
                hideFlashIndicator(views, R.id.flashing_indicator_up);
                handleBackgroundPostActionOne(
                    "UP",
                    transparent,
                    renderedButtonsCount,
                    isLastButton,
                    R.id.upCover,
                    views,
                    context
                );
            }
            renderedButtonsCount++;
        }

        showMoreActions = (renderedButtonsCount == 4 ) && (buttonsCount > 5);
        if (hasDown && !showMoreActions) {
            views.setViewVisibility(R.id.downCover, View.VISIBLE);

            Boolean isLastButton = (renderedButtonsCount == (buttonsCount - 1)) || (renderedButtonsCount == (maxButtonsOnWidget - 1));
            int colorIdle = handleBackgroundWhenIdleOne(
                                "DOWN",
                                transparent,
                                renderedButtonsCount,
                                isLastButton,
                                R.id.downCover,
                                views,
                                context
                            );
            views.setImageViewBitmap(R.id.downarrow, CommonUtilities.buildTelldusIcon(
                "down",
                colorIdle,
                80,
                95,
                65,
                context));

            views.setOnClickPendingIntent(R.id.downCover, getPendingSelf(context, ACTION_DOWN, appWidgetId));

            if (methodRequested != null && state == null && isShowingStatus != 1 && methodRequested.equals(METHOD_DOWN)) {
                int colorOnAction = handleBackgroundOnActionOne(
                                        "DOWN",
                                        transparent,
                                        renderedButtonsCount,
                                        isLastButton,
                                        R.id.flash_view_down,
                                        R.id.flashing_indicator_down,
                                        R.id.downCover,
                                        views,
                                        context
                                    );
                views.setImageViewBitmap(R.id.downarrow, CommonUtilities.buildTelldusIcon(
                    "down",
                    colorOnAction,
                    80,
                    95,
                    65,
                    context));
            }
            if (methodRequested != null && isShowingStatus == 1 && methodRequested.equals("256")) {
                if (state != null && state.equals("256")) {
                    views.setImageViewBitmap(R.id.downarrow, CommonUtilities.buildTelldusIcon(
                        "statuscheck",
                        ContextCompat.getColor(context, R.color.widgetGreen),
                        80,
                        95,
                        65,
                        context));
                } else {
                    views.setImageViewBitmap(R.id.downarrow, CommonUtilities.buildTelldusIcon(
                        "statusx",
                        ContextCompat.getColor(context, R.color.widgetRed),
                        80,
                        95,
                        65,
                        context));
                }
                hideFlashIndicator(views, R.id.flashing_indicator_down);
                handleBackgroundPostActionOne(
                    "DOWN",
                    transparent,
                    renderedButtonsCount,
                    isLastButton,
                    R.id.downCover,
                    views,
                    context
                );
            }
            renderedButtonsCount++;
        }

        showMoreActions = (renderedButtonsCount == 4 ) && (buttonsCount > 5);
        if (hasStop && !showMoreActions) {
            views.setViewVisibility(R.id.stopCover, View.VISIBLE);

            Boolean isLastButton = (renderedButtonsCount == (buttonsCount - 1)) || (renderedButtonsCount == (maxButtonsOnWidget - 1));
            int colorIdle = handleBackgroundWhenIdleOne(
                                "STOP",
                                transparent,
                                renderedButtonsCount,
                                isLastButton,
                                R.id.stopCover,
                                views,
                                context
                            );
            views.setImageViewBitmap(R.id.stopicon, CommonUtilities.buildTelldusIcon(
                "stop",
                colorIdle,
                80,
                95,
                65,
                context));


            views.setOnClickPendingIntent(R.id.stopCover, getPendingSelf(context, ACTION_STOP, appWidgetId));

            if (methodRequested != null && state == null && isShowingStatus != 1 && methodRequested.equals(METHOD_STOP)) {
                int colorOnAction = handleBackgroundOnActionOne(
                                        "STOP",
                                        transparent,
                                        renderedButtonsCount,
                                        isLastButton,
                                        R.id.flash_view_stop,
                                        R.id.flashing_indicator_stop,
                                        R.id.stopCover,
                                        views,
                                        context
                                    );
                views.setImageViewBitmap(R.id.stopicon, CommonUtilities.buildTelldusIcon(
                    "stop",
                    colorOnAction,
                    80,
                    95,
                    65,
                    context));
            }
            if (methodRequested != null && isShowingStatus == 1 && methodRequested.equals("512")) {
                if (state != null && state.equals("512")) {
                    views.setImageViewBitmap(R.id.stopicon, CommonUtilities.buildTelldusIcon(
                        "statuscheck",
                        ContextCompat.getColor(context, R.color.widgetGreen),
                        80,
                        95,
                        65,
                        context));
                } else {
                    views.setImageViewBitmap(R.id.stopicon, CommonUtilities.buildTelldusIcon(
                        "statusx",
                        ContextCompat.getColor(context, R.color.widgetRed),
                        80,
                        95,
                        65,
                        context));
                }
                hideFlashIndicator(views, R.id.flashing_indicator_stop);
                handleBackgroundPostActionOne(
                    "STOP",
                    transparent,
                    renderedButtonsCount,
                    isLastButton,
                    R.id.stopCover,
                    views,
                    context
                );
            }
            renderedButtonsCount++;
        }

        showMoreActions = (renderedButtonsCount == 4 ) && (buttonsCount > 5);
        if (hasOff && !showMoreActions) {
            views.setViewVisibility(R.id.offCover, View.VISIBLE);

            Boolean isLastButton = (renderedButtonsCount == (buttonsCount - 1)) || (renderedButtonsCount == (maxButtonsOnWidget - 1));
            int colorIdle = handleBackgroundWhenIdleOne(
                                "OFF",
                                transparent,
                                renderedButtonsCount,
                                isLastButton,
                                R.id.offCover,
                                views,
                                context
                            );
            views.setImageViewBitmap(R.id.iconOff, CommonUtilities.buildTelldusIcon(
                offActionIcon,
                colorIdle,
                80,
                95,
                65,
                context));


            views.setOnClickPendingIntent(R.id.offCover, getPendingSelf(context, ACTION_OFF, appWidgetId));

            if (methodRequested != null && state == null && isShowingStatus != 1 && methodRequested.equals(METHOD_OFF)) {

                int colorOnAction = handleBackgroundOnActionOne(
                                        "OFF",
                                        transparent,
                                        renderedButtonsCount,
                                        isLastButton,
                                        R.id.flash_view_off,
                                        R.id.flashing_indicator_off,
                                        R.id.offCover,
                                        views,
                                        context
                                    );

                views.setImageViewBitmap(R.id.iconOff, CommonUtilities.buildTelldusIcon(
                    offActionIcon,
                    colorOnAction,
                    80,
                    95,
                    65,
                    context));
            }
            if (methodRequested != null && isShowingStatus == 1 && methodRequested.equals("2")) {
                if (state != null && state.equals("2")) {
                    views.setImageViewBitmap(R.id.iconOff, CommonUtilities.buildTelldusIcon(
                        "statuscheck",
                        ContextCompat.getColor(context, R.color.widgetGreen),
                        80,
                        95,
                        65,
                        context));
                } else {
                    views.setImageViewBitmap(R.id.iconOff, CommonUtilities.buildTelldusIcon(
                        "statusx",
                        ContextCompat.getColor(context, R.color.widgetRed),
                        80,
                        95,
                        65,
                        context));
                }
                hideFlashIndicator(views, R.id.flashing_indicator_off);
                handleBackgroundPostActionOne(
                    "OFF",
                    transparent,
                    renderedButtonsCount,
                    isLastButton,
                    R.id.offCover,
                    views,
                    context
                );
            }
            renderedButtonsCount++;
        }

        showMoreActions = (renderedButtonsCount == 4 ) && (buttonsCount > 5);
        if (hasDim && !showMoreActions) {
            views.setViewVisibility(R.id.iconCheck25, View.GONE);
            views.setViewVisibility(R.id.iconCheck50, View.GONE);
            views.setViewVisibility(R.id.iconCheck75, View.GONE);
            views.setViewVisibility(R.id.dimmer25CoverLinear, View.VISIBLE);
            views.setViewVisibility(R.id.dimmer50CoverLinear, View.VISIBLE);
            views.setViewVisibility(R.id.dimmer75CoverLinear, View.VISIBLE);

            showMoreActions = (renderedButtonsCount == 4 ) && (buttonsCount > 5);
            if (!showMoreActions) {
                views.setViewVisibility(R.id.dimmer25Cover, View.VISIBLE);

                Boolean isLastButton = (renderedButtonsCount == (buttonsCount - 1)) || (renderedButtonsCount == (maxButtonsOnWidget - 1));
                int colorIdle = handleBackgroundWhenIdleOne(
                                "DIM25",
                                transparent,
                                renderedButtonsCount,
                                isLastButton,
                                R.id.dimmer25Cover,
                                views,
                                context
                            );
                views.setImageViewBitmap(R.id.dimmer25, CommonUtilities.buildTelldusIcon(
                    "dim25",
                    colorIdle,
                    80,
                    35,
                    65,
                    context));
                views.setTextColor(R.id.txtDimmer25, colorIdle);

                views.setOnClickPendingIntent(R.id.dimmer25Cover, getPendingSelf(context, DIMMER_25, appWidgetId));

                if (methodRequested != null && state == null && isShowingStatus != 1 && methodRequested.equals(METHOD_DIMMER_25)) {
                    int colorOnAction = handleBackgroundOnActionOne(
                                            "DIM25",
                                            transparent,
                                            renderedButtonsCount,
                                            isLastButton,
                                            R.id.flash_view_dim25,
                                            R.id.flashing_indicator_dim25,
                                            R.id.dimmer25Cover,
                                            views,
                                            context
                                        );
                    views.setImageViewBitmap(R.id.dimmer25, CommonUtilities.buildTelldusIcon(
                        "dim25",
                        colorOnAction,
                        80,
                        35,
                        65,
                        context));
                    views.setTextColor(R.id.txtDimmer25, colorOnAction);
                }
                if (methodRequested != null && isShowingStatus == 1) {
                    int checkpoint = 0;
                    if (deviceStateValue != null && !deviceStateValue.equals("")) {
                        int slidervalue = deviceUtils.toSliderValue(Integer.parseInt(deviceStateValue));
                        checkpoint = getClosestCheckPoint(slidervalue);
                    }

                    if (methodRequested != null && methodRequested.equals(METHOD_DIMMER_25)) {
                        if (checkpoint == 25) {
                            views.setViewVisibility(R.id.iconCheck25, View.VISIBLE);
                            views.setViewVisibility(R.id.dimmer25CoverLinear, View.GONE);
                            views.setImageViewBitmap(R.id.iconCheck25, CommonUtilities.buildTelldusIcon(
                                "statuscheck",
                                ContextCompat.getColor(context, R.color.widgetGreen),
                                80,
                                95,
                                65,
                                context));
                        } else {
                            views.setViewVisibility(R.id.iconCheck25, View.VISIBLE);
                            views.setViewVisibility(R.id.dimmer25CoverLinear, View.GONE);
                            views.setImageViewBitmap(R.id.iconCheck25, CommonUtilities.buildTelldusIcon(
                                "statusx",
                                ContextCompat.getColor(context, R.color.widgetRed),
                                80,
                                95,
                                65,
                                context));
                        }
                        hideFlashIndicator(views, R.id.flashing_indicator_dim25);
                        handleBackgroundPostActionOne(
                            "DIM25",
                            transparent,
                            renderedButtonsCount,
                            isLastButton,
                            R.id.dimmer25Cover,
                            views,
                            context
                        );
                    }
                }
                renderedButtonsCount++;
            }

            showMoreActions = (renderedButtonsCount == 4 ) && (buttonsCount > 5);
            if (!showMoreActions) {
                views.setViewVisibility(R.id.dimmer50Cover, View.VISIBLE);

                Boolean isLastButton = (renderedButtonsCount == (buttonsCount - 1)) || (renderedButtonsCount == (maxButtonsOnWidget - 1));
                int colorIdle = handleBackgroundWhenIdleOne(
                                    "DIM50",
                                    transparent,
                                    renderedButtonsCount,
                                    isLastButton,
                                    R.id.dimmer50Cover,
                                    views,
                                    context
                                );
                views.setImageViewBitmap(R.id.dimmer50, CommonUtilities.buildTelldusIcon(
                    "dim",
                    colorIdle,
                    80,
                    35,
                    65,
                    context));
                views.setTextColor(R.id.txtDimmer50, colorIdle);

                views.setOnClickPendingIntent(R.id.dimmer50Cover, getPendingSelf(context, DIMMER_50, appWidgetId));

                if (methodRequested != null && state == null && isShowingStatus != 1 && methodRequested.equals(METHOD_DIMMER_50)) {
                    int colorOnAction = handleBackgroundOnActionOne(
                                            "DIM50",
                                            transparent,
                                            renderedButtonsCount,
                                            isLastButton,
                                            R.id.flash_view_dim50,
                                            R.id.flashing_indicator_dim50,
                                            R.id.dimmer50Cover,
                                            views,
                                            context
                                        );
                    views.setImageViewBitmap(R.id.dimmer50, CommonUtilities.buildTelldusIcon(
                        "dim",
                        colorOnAction,
                        80,
                        35,
                        65,
                        context));
                    views.setTextColor(R.id.txtDimmer50, colorOnAction);
                }
                if (methodRequested != null && isShowingStatus == 1) {
                    int checkpoint = 0;
                    if (deviceStateValue != null && !deviceStateValue.equals("")) {
                        int slidervalue = deviceUtils.toSliderValue(Integer.parseInt(deviceStateValue));
                        checkpoint = getClosestCheckPoint(slidervalue);
                    }
                    if (methodRequested != null && methodRequested.equals(METHOD_DIMMER_50)) {
                        if (checkpoint == 50) {
                            views.setViewVisibility(R.id.iconCheck50, View.VISIBLE);
                            views.setViewVisibility(R.id.dimmer50CoverLinear, View.GONE);
                            views.setImageViewBitmap(R.id.iconCheck50, CommonUtilities.buildTelldusIcon(
                                "statuscheck",
                                ContextCompat.getColor(context, R.color.widgetGreen),
                                80,
                                95,
                                65,
                                context));
                        } else {
                            views.setViewVisibility(R.id.iconCheck50, View.VISIBLE);
                            views.setViewVisibility(R.id.dimmer50CoverLinear, View.GONE);
                            views.setImageViewBitmap(R.id.iconCheck50, CommonUtilities.buildTelldusIcon(
                                "statusx",
                                ContextCompat.getColor(context, R.color.widgetRed),
                                80,
                                95,
                                65,
                                context));
                        }
                        hideFlashIndicator(views, R.id.flashing_indicator_dim50);
                        handleBackgroundPostActionOne(
                            "DIM50",
                            transparent,
                            renderedButtonsCount,
                            isLastButton,
                            R.id.dimmer50Cover,
                            views,
                            context
                        );
                    }
                }
                renderedButtonsCount++;
            }

            showMoreActions = (renderedButtonsCount == 4 ) && (buttonsCount > 5);
            if (!showMoreActions) {
                views.setViewVisibility(R.id.dimmer75Cover, View.VISIBLE);

                Boolean isLastButton = (renderedButtonsCount == (buttonsCount - 1)) || (renderedButtonsCount == (maxButtonsOnWidget - 1));
                int colorIdle = handleBackgroundWhenIdleOne(
                                    "DIM75",
                                    transparent,
                                    renderedButtonsCount,
                                    isLastButton,
                                    R.id.dimmer75Cover,
                                    views,
                                    context
                                );
                views.setImageViewBitmap(R.id.dimmer75, CommonUtilities.buildTelldusIcon(
                    "dim75",
                    colorIdle,
                    80,
                    35,
                    65,
                    context));
                views.setTextColor(R.id.txtDimmer75, colorIdle);

                views.setOnClickPendingIntent(R.id.dimmer75Cover, getPendingSelf(context, DIMMER_75, appWidgetId));

                if (methodRequested != null && state == null && isShowingStatus != 1 && methodRequested.equals(METHOD_DIMMER_75)) {
                    int colorOnAction = handleBackgroundOnActionOne(
                                            "DIM75",
                                            transparent,
                                            renderedButtonsCount,
                                            isLastButton,
                                            R.id.flash_view_dim75,
                                            R.id.flashing_indicator_dim75,
                                            R.id.dimmer75Cover,
                                            views,
                                            context
                                        );
                    views.setImageViewBitmap(R.id.dimmer75, CommonUtilities.buildTelldusIcon(
                        "dim75",
                        colorOnAction,
                        80,
                        35,
                        65,
                        context));
                    views.setTextColor(R.id.txtDimmer75, colorOnAction);
                }
                if (methodRequested != null && isShowingStatus == 1) {
                    int checkpoint = 0;
                    if (deviceStateValue != null && !deviceStateValue.equals("")) {
                        int slidervalue = deviceUtils.toSliderValue(Integer.parseInt(deviceStateValue));
                        checkpoint = getClosestCheckPoint(slidervalue);
                    }
                    if (methodRequested != null && methodRequested.equals(METHOD_DIMMER_75)) {
                        if (checkpoint == 75) {
                            views.setViewVisibility(R.id.iconCheck75, View.VISIBLE);
                            views.setViewVisibility(R.id.dimmer75CoverLinear, View.GONE);
                            views.setImageViewBitmap(R.id.iconCheck75, CommonUtilities.buildTelldusIcon(
                                "statuscheck",
                                ContextCompat.getColor(context, R.color.widgetGreen),
                                80,
                                95,
                                65,
                                context));
                        } else {
                            views.setViewVisibility(R.id.iconCheck75, View.VISIBLE);
                            views.setViewVisibility(R.id.dimmer75CoverLinear, View.GONE);
                            views.setImageViewBitmap(R.id.iconCheck75, CommonUtilities.buildTelldusIcon(
                                "statusx",
                                ContextCompat.getColor(context, R.color.widgetRed),
                                80,
                                95,
                                65,
                                context));
                        }
                        hideFlashIndicator(views, R.id.flashing_indicator_dim75);
                        handleBackgroundPostActionOne(
                            "DIM75",
                            transparent,
                            renderedButtonsCount,
                            isLastButton,
                            R.id.dimmer75Cover,
                            views,
                            context
                        );
                    }
                }
                renderedButtonsCount++;
            }
        }

        showMoreActions = (renderedButtonsCount == 4 ) && (buttonsCount > 5);
        if (hasOn && !showMoreActions) {
            views.setViewVisibility(R.id.onCover, View.VISIBLE);

            Boolean isLastButton = (renderedButtonsCount == (buttonsCount - 1)) || (renderedButtonsCount == (maxButtonsOnWidget - 1));
            int colorIdle = handleBackgroundWhenIdleOne(
                                "ON",
                                transparent,
                                renderedButtonsCount,
                                isLastButton,
                                R.id.onCover,
                                views,
                                context
                            );
            views.setImageViewBitmap(R.id.iconOn, CommonUtilities.buildTelldusIcon(
                onActionIcon,
                colorIdle,
                80,
                95,
                65,
                context));


            views.setOnClickPendingIntent(R.id.onCover, getPendingSelf(context, ACTION_ON, appWidgetId));

            if (methodRequested != null && state == null && isShowingStatus != 1 && methodRequested.equals(METHOD_ON)) {
                int colorOnAction = handleBackgroundOnActionOne(
                                        "ON",
                                        transparent,
                                        renderedButtonsCount,
                                        isLastButton,
                                        R.id.flash_view_on,
                                        R.id.flashing_indicator_on,
                                        R.id.onCover,
                                        views,
                                        context
                                    );
                views.setImageViewBitmap(R.id.iconOn, CommonUtilities.buildTelldusIcon(
                    onActionIcon,
                    colorOnAction,
                    80,
                    95,
                    65,
                    context));
            }
            if (methodRequested != null && isShowingStatus == 1 && methodRequested.equals("1")) {
                if (state != null && state.equals("1")) {
                    views.setImageViewBitmap(R.id.iconOn, CommonUtilities.buildTelldusIcon(
                        "statuscheck",
                        ContextCompat.getColor(context, R.color.widgetGreen),
                        80,
                        95,
                        65,
                        context));
                } else {
                    views.setImageViewBitmap(R.id.iconOn, CommonUtilities.buildTelldusIcon(
                        "statusx",
                        ContextCompat.getColor(context, R.color.widgetRed),
                        80,
                        95,
                        65,
                        context));
                }
                hideFlashIndicator(views, R.id.flashing_indicator_on);
                handleBackgroundPostActionOne(
                    "ON",
                    transparent,
                    renderedButtonsCount,
                    isLastButton,
                    R.id.onCover,
                    views,
                    context
                );
            }
            renderedButtonsCount++;
        }

        // More actions button
        if (renderedButtonsCount == 4 && buttonsCount > 5) {
            views.setViewVisibility(R.id.moreActionsCover, View.VISIBLE);

            int colorIcon = ContextCompat.getColor(context, R.color.brandSecondary);
            if (transparent.equals("dark")) {
                views.setInt(R.id.moreActionsCover, "setBackgroundResource", R.drawable.shape_border_right_round_black);
                colorIcon = ContextCompat.getColor(context, R.color.themeDark);
            } else if (transparent.equals("light")) {
                views.setInt(R.id.moreActionsCover, "setBackgroundResource", R.drawable.shape_border_right_round_white);
                colorIcon = ContextCompat.getColor(context, R.color.white);
            } else {
                views.setInt(R.id.moreActionsCover, "setBackgroundResource", R.drawable.shape_right_rounded_corner);
            }

            views.setImageViewBitmap(R.id.moreActions, CommonUtilities.buildTelldusIcon(
                "overflow",
                colorIcon,
                80,
                95,
                65,
                context));

            views.setOnClickPendingIntent(R.id.moreActionsCover, getPendingSelf(context, ACTION_MORE_ACTIONS, appWidgetId));
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
        } else if (transparent.equals("light")) {
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
        Integer[] primaryShadedButtons = new Integer[]{
            R.id.flashing_indicator_on,
            R.id.flashing_indicator_off,
            R.id.flashing_indicator_bell,
            R.id.flashing_indicator_up,
            R.id.flashing_indicator_down,
            R.id.flashing_indicator_stop,
            R.id.flashing_indicator_dim25,
            R.id.flashing_indicator_dim50,
            R.id.flashing_indicator_dim75,
            };

        List<Integer> list = Arrays.asList(primaryShadedButtons);

        for (int i = 0; i < list.size(); i++) {
            int id = list.get(i);
            views.setViewVisibility(id, View.GONE);
        }
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
                    viewId,
                    views,
                    context
                );
                return ContextCompat.getColor(context, R.color.themeDark);
            } else if (transparent.equals("light")) {
                setCoverBackground(
                    renderedButtonsCount,
                    isLastButton,
                    R.drawable.shape_left_white_round,
                    R.drawable.shape_border_right_round_white,
                    R.drawable.shape_left_white,
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
        } else if (transparent.equals("light")) {
            setCoverBackground(
                renderedButtonsCount,
                isLastButton,
                R.drawable.shape_left_white_round_fill,
                R.drawable.shape_border_right_round_white_fill,
                R.drawable.shape_left_white_fill,
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
                viewId,
                views,
                context
            );
        } else if (transparent.equals("light")) {
            setCoverBackground(
                renderedButtonsCount,
                isLastButton,
                R.drawable.shape_border_left_round_white_fill,
                R.drawable.shape_border_right_round_white_fill,
                R.drawable.shape_left_white_fill,
                viewId,
                views,
                context
            );
        }
    }

    public static void setCoverBackground(
        int renderedButtonsCount, Boolean isLastButton,
        int drawableWhenFirst, int drawableWhenLast, int drawableWhenInMiddle,
        int viewId, RemoteViews views, Context context
        ) {
        if (renderedButtonsCount == 0) {
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
        Intent intent = new Intent(context, NewAppWidget.class);
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
                Intent basicUserActivity = new Intent(context, BasicUserActivity.class);
                basicUserActivity.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                context.startActivity(basicUserActivity);
                return;
            }

            updateUserProfile(widgetId, context);
            return;
        }

        String state = widgetInfo.getState();
        int deviceId = widgetInfo.getDeviceId();

        if (ACTION_BELL.equals(intent.getAction())) {
            db.updateDeviceInfo(METHOD_BELL, null, null, 0, widgetId);
            removeHandlerResetDeviceStateToNull();

            AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
            updateAppWidget(context, widgetManager, widgetId);

            createDeviceApi(deviceId, 4, 0, widgetId, context);
        }
        if (ACTION_UP.equals(intent.getAction())) {
            db.updateDeviceInfo(METHOD_UP, null, null, 0, widgetId);
            removeHandlerResetDeviceStateToNull();

            AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
            updateAppWidget(context, widgetManager, widgetId);

            createDeviceApi(deviceId, 128, 0, widgetId, context);
        }
        if (ACTION_DOWN.equals(intent.getAction())) {
            db.updateDeviceInfo(METHOD_DOWN, null, null, 0, widgetId);
            removeHandlerResetDeviceStateToNull();

            AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
            updateAppWidget(context, widgetManager, widgetId);

            createDeviceApi(deviceId, 256, 0, widgetId, context);
        }
        if (ACTION_STOP.equals(intent.getAction())) {
            db.updateDeviceInfo(METHOD_STOP, null, null, 0, widgetId);
            removeHandlerResetDeviceStateToNull();

            AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
            updateAppWidget(context, widgetManager, widgetId);

            createDeviceApi(deviceId, 512, 0, widgetId, context);
        }
        if (ACTION_OFF.equals(intent.getAction())) {
            db.updateDeviceInfo(METHOD_OFF, null, null, 0, widgetId);
            removeHandlerResetDeviceStateToNull();

            AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
            updateAppWidget(context, widgetManager, widgetId);

            createDeviceApi(deviceId, 2, 0, widgetId, context);
        }
        if (DIMMER_25.equals(intent.getAction())) {
            db.updateDeviceInfo(METHOD_DIMMER_25, null, null, 0, widgetId);
            removeHandlerResetDeviceStateToNull();

            AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
            updateAppWidget(context, widgetManager, widgetId);

            DevicesUtilities deviceUtils = new DevicesUtilities();
            int value = deviceUtils.toDimmerValue(25);
            createDeviceApi(deviceId, 16, value, widgetId, context);
        }
        if (DIMMER_50.equals(intent.getAction())) {
            db.updateDeviceInfo(METHOD_DIMMER_50, null, null, 0, widgetId);
            removeHandlerResetDeviceStateToNull();

            AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
            updateAppWidget(context, widgetManager, widgetId);

            DevicesUtilities deviceUtils = new DevicesUtilities();
            int value = deviceUtils.toDimmerValue(50);
            createDeviceApi(deviceId, 16, value, widgetId, context);
        }
        if (DIMMER_75.equals(intent.getAction())) {
            db.updateDeviceInfo(METHOD_DIMMER_75, null, null, 0, widgetId);
            removeHandlerResetDeviceStateToNull();

            AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
            updateAppWidget(context, widgetManager, widgetId);

            DevicesUtilities deviceUtils = new DevicesUtilities();
            int value = deviceUtils.toDimmerValue(75);
            createDeviceApi(deviceId, 16, value, widgetId, context);
        }
        if (ACTION_ON.equals(intent.getAction())) {
            db.updateDeviceInfo(METHOD_ON, null, null, 0, widgetId);
            removeHandlerResetDeviceStateToNull();

            AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
            updateAppWidget(context, widgetManager, widgetId);

            createDeviceApi(deviceId, 1, 0, widgetId, context);
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

    public void createDeviceApi(final int deviceId, int method, int value, final int widgetId, final Context context) {
        PrefManager prefManager = new PrefManager(context);
        String  accessToken = prefManager.getAccessToken();
        final MyDBHandler db = new MyDBHandler(context);
        String params = "/device/command?id="+deviceId+"&method="+method+"&value="+value;
        deviceAPI.setDeviceState(deviceId, method, value, widgetId, context, new OnAPITaskComplete() {
            @Override
            public void onSuccess(JSONObject response) {
                String error = response.optString("error");
                if (!error.isEmpty() && error != null) {
                    String noDeviceMessage = "Device \""+deviceId+"\" not found!";
                    if (String.valueOf(error).trim().equalsIgnoreCase(noDeviceMessage.trim())) {
                        db.updateDeviceIdDeviceWidget(-1, widgetId);
                    }
                }
                db.updateIsShowingStatus(1, widgetId);
                resetDeviceStateToNull(deviceId, widgetId, context);

                AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                updateAppWidget(context, widgetManager, widgetId);
            }
            @Override
            public void onError(ANError error) {
                db.updateIsShowingStatus(1, widgetId);
                resetDeviceStateToNull(deviceId, widgetId, context);

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
                DeviceInfo widgetInfo = db.findWidgetInfoDevice(widgetId);
                if (widgetInfo != null && widgetInfo.getIsShowingStatus() == 1) {
                    db.updateDeviceInfo(null, null, null, 0, widgetId);
                    AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                    updateAppWidget(context, widgetManager, widgetId);
                }
            }
        };

        handlerResetDeviceStateToNull.postDelayed(runnableResetDeviceStateToNull, 5000);
    }

    public static Integer getClosestCheckPoint(Integer value) {
        if (value == null) {
            return 0;
        }
        Integer[] checkPoints = new Integer[]{25, 50, 75};
        Integer distOne = Math.abs(checkPoints[0] - value);
        Integer distTwo = Math.abs(checkPoints[1] - value);
        Integer distThree = Math.abs(checkPoints[2] - value);
        Integer minOne = Math.min(distOne, distTwo);
        Integer minTwo = Math.min(minOne, distThree);
        if (minTwo == distOne) {
            return checkPoints[0];
        } else if (minTwo == distTwo) {
            return checkPoints[1];
        } else {
            return checkPoints[2];
        }
    }

    public void removeHandlerResetDeviceStateToNull() {
        if (handlerResetDeviceStateToNull != null && runnableResetDeviceStateToNull != null) {
            handlerResetDeviceStateToNull.removeCallbacks(runnableResetDeviceStateToNull);
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
