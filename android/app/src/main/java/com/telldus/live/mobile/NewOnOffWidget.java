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
import android.graphics.Bitmap;
import android.graphics.Color;
import android.os.Bundle;
import androidx.core.content.ContextCompat;
import android.view.View;
import android.widget.RemoteViews;
import android.os.Handler;
import android.os.Looper;

import com.androidnetworking.error.ANError;

import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;
import java.util.Date;
import java.util.List;
import java.util.Arrays;

import com.telldus.live.mobile.Database.MyDBHandler;
import com.telldus.live.mobile.Database.PrefManager;
import com.telldus.live.mobile.Model.DeviceInfo;
import com.telldus.live.mobile.Utility.Constants;
import com.telldus.live.mobile.Utility.DevicesUtilities;
import com.telldus.live.mobile.Utility.CommonUtilities;
import com.telldus.live.mobile.API.DevicesAPI;
import com.telldus.live.mobile.API.UserAPI;
import com.telldus.live.mobile.API.OnAPITaskComplete;
import com.telldus.live.mobile.Utility.RGBUtilities;
import com.telldus.live.mobile.Utility.WidgetUtilities;

import static android.util.TypedValue.COMPLEX_UNIT_SP;


/**
 * Implementation of App Widget functionality.
 * App Widget Configuration implemented in {@link NewOnOffWidgetConfigureActivity NewOnOffWidgetConfigureActivity}
 */
public class NewOnOffWidget extends AppWidgetProvider {
    private static final String ACTION_ON = "ACTION_ON";
    private static final String ACTION_OFF = "ACTION_OFF";
    private static final String ACTION_BELL = "ACTION_BELL";
    private static final String ACTION_PURCHASE_PRO = "ACTION_PURCHASE_PRO";
    private static final String ACTION_MORE_ACTIONS = "ACTION_MORE_ACTIONS";

    private static final String METHOD_ON = "1";
    private static final String METHOD_OFF = "2";
    private static final String METHOD_BELL = "4";

    private static final int METHOD_RGB = 1024;
    private static final int METHOD_DIM = 16;

    private static final String API_TAG = "SetState1";

    DevicesAPI deviceAPI = new DevicesAPI();

    Handler handlerResetDeviceStateToNull;
    Runnable runnableResetDeviceStateToNull;
    static void updateAppWidget(
        Context context,
        AppWidgetManager appWidgetManager,
        int appWidgetId,
        Map extraArgs
    ) {
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

        int iconWidth = CommonUtilities.getBaseIconWidth(context, appWidgetManager, appWidgetId);
        int fontSize = CommonUtilities.getBaseFontSize(context, appWidgetManager, appWidgetId);
        int fontSizeFour = (int) (fontSize * 0.9);
        int fontSizeFive = (int) (fontSize * 0.6);
        fontSizeFour = fontSizeFour > Constants.widgetTitleMaxSize ? Constants.widgetTitleMaxSize : fontSizeFour;
        int fontSizeSix = (int) (fontSize * 0.45);

        Boolean isSameAccount = userId.trim().equals(currentUserId.trim());
        if (!isSameAccount) {
            RemoteViews remoteViews = WidgetUtilities.setUIWhenDifferentAccount(context, fontSizeFive, userId);
            appWidgetManager.updateAppWidget(appWidgetId, remoteViews);

            return;
        }

        Integer deviceId = DeviceWidgetInfo.getDeviceId();
        if (deviceId.intValue() == -1) {
            RemoteViews remoteViews = WidgetUtilities.setUIWhenItemNotFound(context, (int) (fontSizeFive * 1.2), iconWidth / 2);
            appWidgetManager.updateAppWidget(appWidgetId, remoteViews);
            return;
        }

        String transparent = DeviceWidgetInfo.getTransparent();
        CharSequence widgetText = DeviceWidgetInfo.getDeviceName();
        String state = DeviceWidgetInfo.getState();
        String methodRequested = DeviceWidgetInfo.getMethodRequested();
        Integer methods = DeviceWidgetInfo.getDeviceMethods();
        String deviceType = DeviceWidgetInfo.getDeviceType();
        Integer isShowingStatus = DeviceWidgetInfo.getIsShowingStatus();
        String secondaryStateValue = DeviceWidgetInfo.getSecondaryStateValue();
        String primarySetting = DeviceWidgetInfo.getPrimarySetting();

        String deviceStateValue = DeviceWidgetInfo.getDeviceStateValue();
        deviceStateValue = deviceStateValue == "null" ? "" : deviceStateValue;
        String requestedStateValue = DeviceWidgetInfo.getRequestedStateValue();
        String requestedSecStateValue = DeviceWidgetInfo.getRequestedSecStateValue();

        DevicesUtilities deviceUtils = new DevicesUtilities();
        Map<String, Boolean> supportedMethods = deviceUtils.getSupportedMethods(methods);
        Map<String, String> actionIconSet = deviceUtils.getDeviceActionIcon(deviceType, state, supportedMethods);

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.new_on_off_widget);

        int pro = prefManager.getPro();
        long now = new Date().getTime() / 1000;
        Boolean isBasicUser = pro == -1 || pro < now;

        Boolean hasOn = CommonUtilities.hasMethod(supportedMethods, "TURNON");
        Boolean hasOff = CommonUtilities.hasMethod(supportedMethods, "TURNOFF");
        Boolean hasRGB = CommonUtilities.hasMethod(supportedMethods, "RGB");
        Boolean hasDIM = CommonUtilities.hasMethod(supportedMethods, "DIM");
        Boolean hasBell = CommonUtilities.hasMethod(supportedMethods, "BELL");

        views.setOnClickPendingIntent(R.id.onCover, getPendingSelf(context, ACTION_ON, appWidgetId));
        views.setOnClickPendingIntent(R.id.offCover, getPendingSelf(context, ACTION_OFF, appWidgetId));

        String onActionIcon = actionIconSet.get("TURNON");
        String offActionIcon = actionIconSet.get("TURNOFF");

        transparent = transparent == null ? "" : transparent;
        if (transparent.equals("dark") || transparent.equals("light") || transparent.equals("true")) {
            views.setInt(R.id.iconWidget, "setBackgroundColor", Color.TRANSPARENT);
        }

        Object normalizeUIO = extraArgs.get("normalizeUI");
        Boolean normalizeUI = normalizeUIO == null ? false : (Boolean) normalizeUIO;

        Boolean isNearly1By1 = CommonUtilities.isNearly1By1(context, appWidgetManager, appWidgetId);

        int renderedButtonsCount = 0;

        // Bell
        if (hasBell) {

            views.setOnClickPendingIntent(R.id.onCover, getPendingSelf(context, ACTION_BELL, appWidgetId));
            views.setViewVisibility(R.id.offCover, View.GONE);

            views.setViewVisibility(R.id.widget_content_cover, View.VISIBLE);
            views.setViewVisibility(R.id.onCover, View.VISIBLE);

            Boolean isLastButton = true;
            int colorIdle = CommonUtilities.handleBackgroundWhenIdleOne(
                    "BELL",
                    transparent,
                    renderedButtonsCount,
                    isLastButton,
                    R.id.onCover,
                    views,
                    context
            );
            views.setImageViewBitmap(R.id.iconOn, CommonUtilities.buildTelldusIcon(
                "bell",
                colorIdle,
                80,
                60,
                40,
                context));

            if (methodRequested != null && isShowingStatus != 1 && state == null && methodRequested.equals("4")) {
                int colorOnAction = CommonUtilities.handleBackgroundOnActionOne(
                        "BELL",
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
                    "bell",
                    colorOnAction,
                    80,
                    60,
                    40,
                    context));
            }

            if (methodRequested != null && isShowingStatus == 1 && methodRequested.equals("4")) {
                if (state == null || !state.equals("4")) {
                    views.setImageViewBitmap(R.id.iconOn, CommonUtilities.buildTelldusIcon(
                        "statusx",
                        ContextCompat.getColor(context, R.color.widgetRed),
                        80,
                        60,
                        40,
                        context));
                } else {
                    views.setImageViewBitmap(R.id.iconOn, CommonUtilities.buildTelldusIcon(
                        "statuscheck",
                        ContextCompat.getColor(context, R.color.widgetGreen),
                        80,
                        60,
                        40,
                        context));
                }
                CommonUtilities.hideFlashIndicator(views, R.id.flashing_indicator_on);
                CommonUtilities.handleBackgroundPostActionOne(
                        "BELL",
                        transparent,
                        renderedButtonsCount,
                        isLastButton,
                        R.id.onCover,
                        views,
                        context
                );
            }

            renderedButtonsCount++;

            if (normalizeUI) {
                CommonUtilities.hideFlashIndicator(views, R.id.flashing_indicator_on);
            }
        }

        // OFF
        if (hasOff) {
            views.setViewVisibility(R.id.widget_content_cover, View.VISIBLE);
            views.setViewVisibility(R.id.offCover, View.VISIBLE);

            Boolean isLastButton = false;
            int colorIdle = CommonUtilities.handleBackgroundWhenIdleOne(
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
                    160,
                    85,
                    85,
                    context));

            if (methodRequested != null && isShowingStatus != 1 && state == null && methodRequested.equals("2")) {
                int colorOnAction = CommonUtilities.handleBackgroundOnActionOne(
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
                        160,
                        85,
                        85,
                        context));
            }

            if (methodRequested != null && isShowingStatus == 1 && methodRequested.equals("2")) {
                if (state == null || !state.equals("2")) {
                    views.setImageViewBitmap(R.id.iconOff, CommonUtilities.buildTelldusIcon(
                            "statusx",
                            ContextCompat.getColor(context, R.color.widgetRed),
                            160,
                            85,
                            85,
                            context));
                } else {
                    views.setImageViewBitmap(R.id.iconOff, CommonUtilities.buildTelldusIcon(
                            "statuscheck",
                            ContextCompat.getColor(context, R.color.widgetGreen),
                            160,
                            85,
                            85,
                            context));
                }
                CommonUtilities.hideFlashIndicator(views, R.id.flashing_indicator_off);
                CommonUtilities.handleBackgroundPostActionOne(
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

            if (normalizeUI) {
                CommonUtilities.hideFlashIndicator(views, R.id.flashing_indicator_off);
            }
        }

        if (hasRGB) {
            views.setViewVisibility(R.id.rgb_dynamic_background, View.GONE);

            views.setViewVisibility(R.id.rgbActionCover, View.VISIBLE);

            Boolean isLastButton = false;
            int colorIdle = CommonUtilities.handleBackgroundWhenIdleOne(
                    "RGB",
                    transparent,
                    renderedButtonsCount,
                    isLastButton,
                    R.id.rgbActionCover,
                    views,
                    context
            );

            views.setImageViewBitmap(R.id.palette, CommonUtilities.buildTelldusIcon(
                    "palette",
                    colorIdle,
                    iconWidth,
                    (int) (iconWidth * 0.7),
                    (int) (iconWidth * 0.7),
                    context));

            if (methodRequested != null && isShowingStatus != 1 && state == null && (methodRequested.equals(String.valueOf(METHOD_RGB)))) {
                Object colorControlledFromModalO = extraArgs.get("colorControlledFromModal");
                int settingColor = RGBUtilities.getSettingColor(transparent, colorControlledFromModalO, primarySetting, methodRequested.equals(String.valueOf(METHOD_RGB)), context);

                String cD = "#" + Integer.toHexString(ContextCompat.getColor(context, R.color.themeDark));
                String cL = "#" + Integer.toHexString(ContextCompat.getColor(context, R.color.white));

                int bgColor = settingColor, flashColor = Color.parseColor(cL);
                if (transparent.equals("dark")) {
                    bgColor = Color.parseColor(cD);

                    flashColor = Color.parseColor(cL);
                } else if (transparent.equals("light") || transparent.equals("true")) {
                    bgColor = Color.parseColor(cL);

                    flashColor = Color.parseColor(cD);
                }

                float d = context.getResources().getDisplayMetrics().density;
                int flashSize = (int) (7 * d);
                Bitmap backgroundFlash = CommonUtilities.getCircularBitmap(flashSize, flashColor);

                views.setViewVisibility(R.id.rgb_dynamic_background, View.VISIBLE);
                CommonUtilities.showFlashIndicatorRGB(
                        views,
                        R.id.flash_view_rgb,
                        R.id.flashing_indicator_rgb,
                        backgroundFlash
                );
                views.setImageViewResource(R.id.rgb_dynamic_background, R.drawable.shape_rgb_mask_no_radi);
                views.setImageViewBitmap(R.id.palette, CommonUtilities.buildTelldusIcon(
                        "palette",
                        flashColor,
                        iconWidth,
                        (int) (iconWidth * 0.7),
                        (int) (iconWidth * 0.7),
                        context));
                views.setInt(R.id.rgb_dynamic_background,"setColorFilter", bgColor);
            }

            if (methodRequested != null && isShowingStatus == 1) {
                if (methodRequested.equals(String.valueOf(METHOD_RGB))) {
                    Boolean wasSuccess = state != null && state.equals(String.valueOf(METHOD_RGB));
                    if (secondaryStateValue != null && requestedSecStateValue != null) {
                        int currentColor = Color.parseColor(deviceUtils.getMainColorRGB(Integer.parseInt(secondaryStateValue, 10)));
                        int requestedColor = Integer.parseInt(requestedSecStateValue, 10);
                        int _r = Color.red(currentColor), _g = Color.green(currentColor), _b = Color.blue(currentColor);
                        int r = Color.red(requestedColor), g = Color.green(requestedColor), b = Color.blue(requestedColor);
                        wasSuccess = r == _r && g == _g && b == _b;
                    }
                    if (wasSuccess) {
                        views.setImageViewBitmap(R.id.palette, CommonUtilities.buildTelldusIcon(
                                "statuscheck",
                                ContextCompat.getColor(context, R.color.widgetGreen),
                                160,
                                85,
                                85,
                                context));
                    } else {
                        views.setImageViewBitmap(R.id.palette, CommonUtilities.buildTelldusIcon(
                                "statusx",
                                ContextCompat.getColor(context, R.color.widgetRed),
                                160,
                                85,
                                85,
                                context));
                    }
                    CommonUtilities. hideFlashIndicator(views, R.id.flashing_indicator_rgb);
                    views.setViewVisibility(R.id.rgb_dynamic_background, View.GONE);
                    CommonUtilities.handleBackgroundPostActionOne(
                            "RGB",
                            transparent,
                            renderedButtonsCount,
                            isLastButton,
                            R.id.rgbActionCover,
                            views,
                            context
                    );
                }
            }

            views.setOnClickPendingIntent(R.id.rgbActionCover, getPendingSelf(context, ACTION_MORE_ACTIONS, appWidgetId));

            renderedButtonsCount++;

            if (normalizeUI) {
                CommonUtilities.hideFlashIndicator(views, R.id.flashing_indicator_rgb);
            }
        }

        // DIM
        if (hasDIM) {
            views.setViewVisibility(R.id.iconCheck, View.GONE);
            views.setViewVisibility(R.id.dimmerCoverLinear, View.VISIBLE);
            views.setViewVisibility(R.id.dimmerCover, View.VISIBLE);

            Boolean isLastButton = false;
            int colorIdle = CommonUtilities.handleBackgroundWhenIdleOne(
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
                int colorOnAction = CommonUtilities.handleBackgroundOnActionOne(
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
                if (methodRequested.equals(String.valueOf(METHOD_DIM))) {
                    Boolean wasSuccess = state != null && state.equals(String.valueOf(METHOD_DIM));
                    if (deviceStateValue != null && requestedStateValue != null) {
                        wasSuccess = deviceStateValue.equals(requestedStateValue);
                    }
                    if (wasSuccess) {
                        views.setViewVisibility(R.id.iconCheck, View.VISIBLE);
                        views.setViewVisibility(R.id.dimmerCoverLinear, View.GONE);
                        views.setImageViewBitmap(R.id.iconCheck, CommonUtilities.buildTelldusIcon(
                            "statuscheck",
                            ContextCompat.getColor(context, R.color.widgetGreen),
                                160,
                                85,
                                85,
                            context));
                    } else {
                        views.setViewVisibility(R.id.iconCheck, View.VISIBLE);
                        views.setViewVisibility(R.id.dimmerCoverLinear, View.GONE);
                        views.setImageViewBitmap(R.id.iconCheck, CommonUtilities.buildTelldusIcon(
                            "statusx",
                            ContextCompat.getColor(context, R.color.widgetRed),
                            160,
                            85,
                            85,
                            context));
                    }
                    CommonUtilities.hideFlashIndicator(views, R.id.flashing_indicator_dim);
                    CommonUtilities.handleBackgroundPostActionOne(
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
                CommonUtilities.hideFlashIndicator(views, R.id.flashing_indicator_dim);
            }
        }

        // ON
        if (hasOn) {
            views.setViewVisibility(R.id.widget_content_cover, View.VISIBLE);
            views.setViewVisibility(R.id.onCover, View.VISIBLE);

            Boolean isLastButton = true;
            int colorIdle = CommonUtilities.handleBackgroundWhenIdleOne(
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
                    160,
                    85,
                    85,
                    context));

            if (methodRequested != null && isShowingStatus != 1 && state == null && methodRequested.equals("1")) {
                int colorOnAction = CommonUtilities.handleBackgroundOnActionOne(
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
                        160,
                        85,
                        85,
                        context));
            }

            if (methodRequested != null && isShowingStatus == 1 && methodRequested.equals("1")) {
                CommonUtilities.hideFlashIndicator(views, R.id.flashing_indicator_on);
                if (state == null || !state.equals("1")) {
                    views.setImageViewBitmap(R.id.iconOn, CommonUtilities.buildTelldusIcon(
                            "statusx",
                            ContextCompat.getColor(context, R.color.widgetRed),
                            160,
                            85,
                            85,
                            context));
                } else {
                    views.setImageViewBitmap(R.id.iconOn, CommonUtilities.buildTelldusIcon(
                            "statuscheck",
                            ContextCompat.getColor(context, R.color.widgetGreen),
                            160,
                            85,
                            85,
                            context));
                }
                CommonUtilities.handleBackgroundPostActionOne(
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

            if (normalizeUI) {
                CommonUtilities.hideFlashIndicator(views, R.id.flashing_indicator_on);
            }
        }

        if (isNearly1By1 && renderedButtonsCount > 1) {
            views.setViewVisibility(R.id.iconCheck, View.GONE);
            views.setViewVisibility(R.id.dimmerCoverLinear, View.GONE);
            views.setViewVisibility(R.id.dimmerCover, View.GONE);
            views.setViewVisibility(R.id.offCover, View.GONE);
            views.setViewVisibility(R.id.onCover, View.GONE);
            views.setViewVisibility(R.id.rgbActionCover, View.GONE);

            views.setViewVisibility(R.id.widget_content_cover, View.VISIBLE);
            views.setViewVisibility(R.id.onOffCoverLinear, View.VISIBLE);
            views.setViewVisibility(R.id.onOffCover, View.VISIBLE);

            int colorIdle = CommonUtilities.handleBackgroundWhenIdleOne(
                    "MORE",
                    transparent,
                    0,
                    true,
                    R.id.onOffCover,
                    views,
                    context
            );

            String moreActionsIcon = hasDIM ? "dim25" : "buttononoff";
            int iWidth = iconWidth * 2;
            int iHeight = (int) (iWidth);
            int iFontSize = (int) (iWidth);

            views.setImageViewBitmap(R.id.moreActionsIcon, CommonUtilities.buildTelldusIcon(
                    moreActionsIcon,
                    colorIdle,
                    iWidth,
                    iHeight,
                    iFontSize,
                    context));

            views.setOnClickPendingIntent(R.id.onOffCover, getPendingSelf(context, ACTION_MORE_ACTIONS, appWidgetId));

            if (methodRequested != null && state == null && isShowingStatus != 1) {
                int colorOnAction = CommonUtilities.handleBackgroundOnActionOne(
                        "MORE",
                        transparent,
                        0,
                        true,
                        R.id.flash_view_on_off,
                        R.id.flashing_indicator_on_off,
                        R.id.onOffCover,
                        views,
                        context
                );
                views.setImageViewBitmap(R.id.moreActionsIcon, CommonUtilities.buildTelldusIcon(
                        moreActionsIcon,
                        colorOnAction,
                        iWidth,
                        iHeight,
                        iFontSize,
                        context));
            }

            if (methodRequested != null && isShowingStatus == 1) {
                Boolean wasSuccess = state != null && state.equals(methodRequested);
                if (methodRequested.equals(String.valueOf(METHOD_RGB))) {
                    if (secondaryStateValue != null && requestedSecStateValue != null) {
                        int currentColor = Color.parseColor(deviceUtils.getMainColorRGB(Integer.parseInt(secondaryStateValue, 10)));
                        int requestedColor = Integer.parseInt(requestedSecStateValue, 10);

                        int _r = Color.red(currentColor), _g = Color.green(currentColor), _b = Color.blue(currentColor);
                        int r = Color.red(requestedColor), g = Color.green(requestedColor), b = Color.blue(requestedColor);
                        wasSuccess = r == _r && g == _g && b == _b;
                    }
                } else if (methodRequested.equals(String.valueOf(METHOD_DIM))) {
                    if (deviceStateValue != null && requestedStateValue != null) {
                        wasSuccess = deviceStateValue.equals(requestedStateValue);
                    }
                }

                if (wasSuccess) {
                    views.setViewVisibility(R.id.moreActionsIcon, View.VISIBLE);
                    views.setImageViewBitmap(R.id.moreActionsIcon, CommonUtilities.buildTelldusIcon(
                            "statuscheck",
                            ContextCompat.getColor(context, R.color.widgetGreen),
                            iWidth,
                            iHeight,
                            iFontSize,
                            context));
                } else {
                    views.setViewVisibility(R.id.moreActionsIcon, View.VISIBLE);
                    views.setImageViewBitmap(R.id.moreActionsIcon, CommonUtilities.buildTelldusIcon(
                            "statusx",
                            ContextCompat.getColor(context, R.color.widgetRed),
                            iWidth,
                            iHeight,
                            iFontSize,
                            context));
                }
                CommonUtilities.hideFlashIndicator(views, R.id.flashing_indicator_on_off);
                CommonUtilities.handleBackgroundPostActionOne(
                        "MORE",
                        transparent,
                        0,
                        true,
                        R.id.onOffCover,
                        views,
                        context
                );
            }

            if (normalizeUI) {
                CommonUtilities.hideFlashIndicator(views, R.id.flashing_indicator_on_off);
            }
        } else {
            views.setViewVisibility(R.id.onOffCoverLinear, View.GONE);
            views.setViewVisibility(R.id.onOffCover, View.GONE);
        }

        if (isBasicUser) {
            views.setViewVisibility(R.id.premiumRequiredInfo, View.VISIBLE);
            views.setOnClickPendingIntent(R.id.premiumRequiredInfo, getPendingSelf(context, ACTION_PURCHASE_PRO, appWidgetId));

            iconWidth = (int) (iconWidth * 0.3);
            int padding = (int) (iconWidth * 0.3) + 8;

            views.setImageViewBitmap(R.id.icon_premium, CommonUtilities.drawableToBitmap(context.getDrawable(R.drawable.icon_premium), iconWidth, iconWidth));
            views.setImageViewBitmap(R.id.icon_premium_bg_mask, CommonUtilities.drawableToBitmap(context.getDrawable(R.drawable.shape_circle), iconWidth + padding, iconWidth + padding));
            views.setTextViewTextSize(R.id.textPremiumRequired, COMPLEX_UNIT_SP, fontSizeFive);
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

    private static PendingIntent getPendingSelf(Context context, String action, int id) {
        Intent intent = new Intent(context, NewOnOffWidget.class);
        intent.setAction(action);
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID,id);
        return PendingIntent.getBroadcast(context, id, intent, 0);
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

    @Override
    public void onDeleted(Context context, int[] appWidgetIds) {
        // When the user deletes the widget, delete the preference associated with it.
        MyDBHandler db = new MyDBHandler(context);
        PrefManager prefManager = new PrefManager(context);

        for (int appWidgetId : appWidgetIds) {
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
        String secondaryStateValue = widgetInfo.getSecondaryStateValue();
        String stateValue = widgetInfo.getDeviceStateValue();

        if (ACTION_BELL.equals(intent.getAction()) && methods != 0) {

            db.updateDeviceInfo(METHOD_BELL, null, stateValue, 0, secondaryStateValue, widgetId, null, null);
            removeHandlerResetDeviceStateToNull();

            AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
            updateAppWidget(context, widgetManager, widgetId, new HashMap());

            createDeviceActionApi(context, deviceId, 4, widgetId, db, "Bell");
        }
        if (ACTION_ON.equals(intent.getAction()) && methods != 0) {

            db.updateDeviceInfo(METHOD_ON, null, stateValue, 0, secondaryStateValue, widgetId, null, null);
            removeHandlerResetDeviceStateToNull();

            AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
            updateAppWidget(context, widgetManager, widgetId, new HashMap());

            createDeviceActionApi(context, deviceId, 1, widgetId, db, "On");
        }
        if (ACTION_OFF.equals(intent.getAction()) && methods != 0) {
            db.updateDeviceInfo(METHOD_OFF, null, stateValue, 0, secondaryStateValue, widgetId, null, null);
            removeHandlerResetDeviceStateToNull();

            AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
            updateAppWidget(context, widgetManager, widgetId, new HashMap());

            createDeviceActionApi(context, deviceId, 2, widgetId, db, "Off");
        }
        if (ACTION_MORE_ACTIONS.equals(intent.getAction())) {
            Intent dialogueIntent = new Intent(context, DevicesGroupDialogueActivity.class);
            dialogueIntent.putExtra("widgetId", widgetId);
            dialogueIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS);
            dialogueIntent.putExtra("widgetKey", "NewOnOffWidget");
            context.startActivity(dialogueIntent);
        }
    }

    void createDeviceActionApi(final Context context, final int deviceId, int method, final int widgetId, final MyDBHandler db, final String action) {
        PrefManager prefManager = new PrefManager(context);
        String  accessToken = prefManager.getAccessToken();

        String params = "/device/command?id="+deviceId+"&method="+method+"&value=null";
        deviceAPI.setDeviceState(deviceId, method, 0, widgetId, context, API_TAG, new OnAPITaskComplete() {
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
                updateAppWidget(context, widgetManager, widgetId, new HashMap());
            }
            @Override
            public void onError(ANError error) {
                db.updateIsShowingStatus(1, widgetId);
                resetDeviceStateToNull(deviceId, widgetId, context);

                AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                updateAppWidget(context, widgetManager, widgetId, new HashMap());
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
                    String secondaryStateValue = widgetInfo.getSecondaryStateValue();
                    String stateValue = widgetInfo.getDeviceStateValue();
                    db.updateDeviceInfo(null, null, stateValue, 0, secondaryStateValue, widgetId, null, null);
                    AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                    updateAppWidget(context, widgetManager, widgetId, new HashMap());
                }
            }
        };
        handlerResetDeviceStateToNull.postDelayed(runnableResetDeviceStateToNull, 5000);
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
                wUpdater.updateAllWidgets(context, new HashMap());
            }
            @Override
            public void onError(ANError error) {
            }
        });
    }
}
