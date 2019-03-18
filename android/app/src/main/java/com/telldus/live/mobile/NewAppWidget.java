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
import android.util.Log;
import android.view.View;
import android.widget.RemoteViews;
import android.widget.Toast;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Typeface;
import android.os.Handler;
import android.os.Looper;

import com.androidnetworking.error.ANError;
import com.androidnetworking.interfaces.JSONObjectRequestListener;

import org.json.JSONObject;

import java.util.Map;

import com.telldus.live.mobile.Database.MyDBHandler;
import com.telldus.live.mobile.Database.PrefManager;
import com.telldus.live.mobile.Model.DeviceInfo;
import com.telldus.live.mobile.Utility.DevicesUtilities;
import com.telldus.live.mobile.API.DevicesAPI;
import com.telldus.live.mobile.API.OnAPITaskComplete;

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

        CharSequence widgetText = "Telldus";
        String transparent;
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
            return;
        }

        widgetText = DeviceWidgetInfo.getDeviceName();
        String state = DeviceWidgetInfo.getState();
        String deviceType = DeviceWidgetInfo.getDeviceType();
        String deviceStateValue = DeviceWidgetInfo.getDeviceStateValue();
        Integer methods = DeviceWidgetInfo.getDeviceMethods();
        String methodRequested = DeviceWidgetInfo.getMethodRequested();
        Integer isShowingStatus = DeviceWidgetInfo.getIsShowingStatus();

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

        Integer deviceId = DeviceWidgetInfo.getDeviceId();
        if (deviceId.intValue() == -1) {
            views.removeAllViews(R.id.widget_content_cover);
            views.setTextViewText(R.id.txtWidgetTitle, "Device not found");
            appWidgetManager.updateAppWidget(appWidgetId, views);
            return;
        }

        int renderedButtonsCount = 0;
        int maxButtonsOnWidget = 5;
        Boolean showMoreActions = (renderedButtonsCount == 4 ) && (buttonsCount > 5);

        views.setViewVisibility(R.id.widget_content_cover, View.VISIBLE);
        if (hasBell && !showMoreActions) {
            views.setViewVisibility(R.id.bellCover,View.VISIBLE);
            views.setTextViewText(R.id.bell, "bell");
            views.setTextColor(R.id.bell, ContextCompat.getColor(context, R.color.brandSecondary));
            views.setInt(R.id.bell, "setBackgroundColor", Color.TRANSPARENT);
            views.setTextViewTextSize(R.id.bell, COMPLEX_UNIT_SP, Float.parseFloat("26"));

            views.setOnClickPendingIntent(R.id.bellCover, getPendingSelf(context, ACTION_BELL, appWidgetId));

            Boolean isLastButton = (renderedButtonsCount == (buttonsCount - 1)) || (renderedButtonsCount == (maxButtonsOnWidget - 1));
            if (renderedButtonsCount == 0) {
                views.setInt(R.id.bellCover, "setBackgroundResource", R.drawable.shape_left_rounded_corner);
            } else if (isLastButton) {
                views.setInt(R.id.bellCover, "setBackgroundResource", R.drawable.shape_right_rounded_corner);
            } else {
                views.setInt(R.id.bellCover, "setBackgroundColor", ContextCompat.getColor(context, R.color.lightGray));
            }
            if (methodRequested != null && state == null && isShowingStatus != 1 && methodRequested.equals(METHOD_BELL)) {
                if (renderedButtonsCount == 0) {
                    views.setInt(R.id.bellCover, "setBackgroundResource", R.drawable.shape_left_rounded_corner_secondary_fill);
                } else if (isLastButton) {
                    views.setInt(R.id.bellCover, "setBackgroundResource", R.drawable.shape_right_rounded_corner_secondary_fill);
                } else {
                    views.setInt(R.id.bellCover, "setBackgroundColor", ContextCompat.getColor(context, R.color.brandSecondary));
                }
                views.setTextColor(R.id.bell, ContextCompat.getColor(context, R.color.white));
            }
            if (methodRequested != null && isShowingStatus == 1 && methodRequested.equals("4")) {
                if (state == null || !state.equals("4")) {
                    views.setTextViewText(R.id.bell, "statusx");
                    views.setTextColor(R.id.bell, ContextCompat.getColor(context, R.color.widgetRed));
                    views.setTextViewTextSize(R.id.bell, COMPLEX_UNIT_SP, Float.parseFloat("22"));
                } else {
                    views.setTextViewText(R.id.bell, "statuscheck");
                    views.setTextColor(R.id.bell, ContextCompat.getColor(context, R.color.widgetGreen));
                    views.setTextViewTextSize(R.id.bell, COMPLEX_UNIT_SP, Float.parseFloat("22"));
                }
            }

            renderedButtonsCount++;
        }

        showMoreActions = (renderedButtonsCount == 4 ) && (buttonsCount > 5);
        if (hasUp && !showMoreActions) {
            views.setViewVisibility(R.id.upCover, View.VISIBLE);
            views.setTextViewText(R.id.uparrow, "up");
            views.setTextColor(R.id.uparrow, ContextCompat.getColor(context, R.color.brandSecondary));
            views.setInt(R.id.uparrow, "setBackgroundColor", Color.TRANSPARENT);
            views.setTextViewTextSize(R.id.uparrow, COMPLEX_UNIT_SP, Float.parseFloat("26"));

            views.setOnClickPendingIntent(R.id.upCover, getPendingSelf(context, ACTION_UP, appWidgetId));

            Boolean isLastButton = (renderedButtonsCount == (buttonsCount - 1)) || (renderedButtonsCount == (maxButtonsOnWidget - 1));
            if (renderedButtonsCount == 0) {
                views.setInt(R.id.upCover, "setBackgroundResource", R.drawable.shape_left_rounded_corner);
            } else if (isLastButton && methodRequested == null) {
                views.setInt(R.id.upCover, "setBackgroundResource", R.drawable.shape_right_rounded_corner);
            } else {
                views.setInt(R.id.upCover, "setBackgroundColor", ContextCompat.getColor(context, R.color.lightGray));
            }
            if (methodRequested != null && state == null && isShowingStatus != 1 && methodRequested.equals(METHOD_UP)) {
                if (renderedButtonsCount == 0) {
                    views.setInt(R.id.upCover, "setBackgroundResource", R.drawable.shape_left_rounded_corner_secondary_fill);
                } else if (isLastButton) {
                    views.setInt(R.id.upCover, "setBackgroundResource", R.drawable.shape_right_rounded_corner_secondary_fill);
                } else {
                    views.setInt(R.id.upCover, "setBackgroundColor", ContextCompat.getColor(context, R.color.brandSecondary));
                }
                views.setTextColor(R.id.uparrow, ContextCompat.getColor(context, R.color.white));
            }
            if (methodRequested != null && isShowingStatus == 1 && methodRequested.equals("128")) {
                if (state != null && state.equals("128")) {
                    views.setTextViewText(R.id.uparrow, "statuscheck");
                    views.setTextColor(R.id.uparrow, ContextCompat.getColor(context, R.color.widgetGreen));
                    views.setTextViewTextSize(R.id.uparrow, COMPLEX_UNIT_SP, Float.parseFloat("22"));
                } else {
                    views.setTextViewText(R.id.uparrow, "statusx");
                    views.setTextColor(R.id.uparrow, ContextCompat.getColor(context, R.color.widgetRed));
                    views.setTextViewTextSize(R.id.uparrow, COMPLEX_UNIT_SP, Float.parseFloat("22"));
                }
            }
            renderedButtonsCount++;
        }

        showMoreActions = (renderedButtonsCount == 4 ) && (buttonsCount > 5);
        if (hasDown && !showMoreActions) {
            views.setViewVisibility(R.id.downCover, View.VISIBLE);
            views.setTextViewText(R.id.downarrow, "down");
            views.setTextColor(R.id.downarrow, ContextCompat.getColor(context, R.color.brandSecondary));
            views.setInt(R.id.downarrow, "setBackgroundColor", Color.TRANSPARENT);
            views.setTextViewTextSize(R.id.downarrow, COMPLEX_UNIT_SP, Float.parseFloat("26"));

            views.setOnClickPendingIntent(R.id.downCover, getPendingSelf(context, ACTION_DOWN, appWidgetId));

            Boolean isLastButton = (renderedButtonsCount == (buttonsCount - 1)) || (renderedButtonsCount == (maxButtonsOnWidget - 1));
            if (renderedButtonsCount == 0) {
                views.setInt(R.id.downCover, "setBackgroundResource", R.drawable.shape_left_rounded_corner);
            } else if (isLastButton) {
                views.setInt(R.id.downCover, "setBackgroundResource", R.drawable.shape_right_rounded_corner);
            } else {
                views.setInt(R.id.downCover, "setBackgroundColor", ContextCompat.getColor(context, R.color.lightGray));
            }
            if (methodRequested != null && state == null && isShowingStatus != 1 && methodRequested.equals(METHOD_DOWN)) {
                if (renderedButtonsCount == 0) {
                    views.setInt(R.id.downCover, "setBackgroundResource", R.drawable.shape_left_rounded_corner_secondary_fill);
                } else if (isLastButton) {
                    views.setInt(R.id.downCover, "setBackgroundResource", R.drawable.shape_right_rounded_corner_secondary_fill);
                } else {
                    views.setInt(R.id.downCover, "setBackgroundColor", ContextCompat.getColor(context, R.color.brandSecondary));
                }
                views.setTextColor(R.id.downarrow, ContextCompat.getColor(context, R.color.white));
            }
            if (methodRequested != null && isShowingStatus == 1 && methodRequested.equals("256")) {
                if (state != null && state.equals("256")) {
                    views.setTextViewText(R.id.downarrow, "statuscheck");
                    views.setTextColor(R.id.downarrow, ContextCompat.getColor(context, R.color.widgetGreen));
                    views.setTextViewTextSize(R.id.downarrow, COMPLEX_UNIT_SP, Float.parseFloat("22"));
                } else {
                    views.setTextViewText(R.id.downarrow, "statusx");
                    views.setTextColor(R.id.downarrow, ContextCompat.getColor(context, R.color.widgetRed));
                    views.setTextViewTextSize(R.id.downarrow, COMPLEX_UNIT_SP, Float.parseFloat("22"));
                }
            }
            renderedButtonsCount++;
        }

        showMoreActions = (renderedButtonsCount == 4 ) && (buttonsCount > 5);
        if (hasStop && !showMoreActions) {
            views.setViewVisibility(R.id.stopCover, View.VISIBLE);
            views.setTextViewText(R.id.stopicon, "stop");
            views.setTextColor(R.id.stopicon, ContextCompat.getColor(context, R.color.brandPrimary));
            views.setInt(R.id.stopicon, "setBackgroundColor", Color.TRANSPARENT);
            views.setTextViewTextSize(R.id.stopicon, COMPLEX_UNIT_SP, Float.parseFloat("26"));

            views.setOnClickPendingIntent(R.id.stopCover, getPendingSelf(context, ACTION_STOP, appWidgetId));

            Boolean isLastButton = (renderedButtonsCount == (buttonsCount - 1)) || (renderedButtonsCount == (maxButtonsOnWidget - 1));
            if (renderedButtonsCount == 0) {
                views.setInt(R.id.stopCover, "setBackgroundResource", R.drawable.shape_left_rounded_corner);
            } else if (isLastButton) {
                views.setInt(R.id.stopCover, "setBackgroundResource", R.drawable.shape_right_rounded_corner);
            } else {
                views.setInt(R.id.stopCover, "setBackgroundColor", ContextCompat.getColor(context, R.color.lightGray));
            }
            if (methodRequested != null && state == null && isShowingStatus != 1 && methodRequested.equals(METHOD_STOP)) {
                if (renderedButtonsCount == 0) {
                    views.setInt(R.id.stopCover, "setBackgroundResource", R.drawable.shape_left_rounded_corner_primary_fill);
                } else if (isLastButton) {
                    views.setInt(R.id.stopCover, "setBackgroundResource", R.drawable.shape_right_rounded_corner_primary_fill);
                } else {
                    views.setInt(R.id.stopCover, "setBackgroundColor", ContextCompat.getColor(context, R.color.brandPrimary));
                }
                views.setTextColor(R.id.stopicon, ContextCompat.getColor(context, R.color.white));
            }
            if (methodRequested != null && isShowingStatus == 1 && methodRequested.equals("512")) {
                if (state != null && state.equals("512")) {
                    views.setTextViewText(R.id.stopicon, "statuscheck");
                    views.setTextColor(R.id.stopicon, ContextCompat.getColor(context, R.color.widgetGreen));
                    views.setTextViewTextSize(R.id.stopicon, COMPLEX_UNIT_SP, Float.parseFloat("22"));
                } else {
                    views.setTextViewText(R.id.stopicon, "statusx");
                    views.setTextColor(R.id.stopicon, ContextCompat.getColor(context, R.color.widgetRed));
                    views.setTextViewTextSize(R.id.stopicon, COMPLEX_UNIT_SP, Float.parseFloat("22"));
                }
            }
            renderedButtonsCount++;
        }

        showMoreActions = (renderedButtonsCount == 4 ) && (buttonsCount > 5);
        if (hasOff && !showMoreActions) {
            views.setViewVisibility(R.id.offCover, View.VISIBLE);
            views.setTextViewText(R.id.iconOff, offActionIcon);
            views.setTextColor(R.id.iconOff, ContextCompat.getColor(context, R.color.brandPrimary));
            views.setInt(R.id.iconOff, "setBackgroundColor", Color.TRANSPARENT);
            views.setTextViewTextSize(R.id.iconOff, COMPLEX_UNIT_SP, Float.parseFloat("26"));

            views.setOnClickPendingIntent(R.id.offCover, getPendingSelf(context, ACTION_OFF, appWidgetId));

            Boolean isLastButton = (renderedButtonsCount == (buttonsCount - 1)) || (renderedButtonsCount == (maxButtonsOnWidget - 1));
            if (renderedButtonsCount == 0) {
                views.setInt(R.id.offCover, "setBackgroundResource", R.drawable.shape_left_rounded_corner);
            } else if (isLastButton) {
                views.setInt(R.id.offCover, "setBackgroundResource", R.drawable.shape_right_rounded_corner);
            } else {
                views.setInt(R.id.offCover, "setBackgroundColor", ContextCompat.getColor(context, R.color.lightGray));
            }
            if (methodRequested != null && state == null && isShowingStatus != 1 && methodRequested.equals(METHOD_OFF)) {
                if (renderedButtonsCount == 0) {
                    views.setInt(R.id.offCover, "setBackgroundResource", R.drawable.shape_left_rounded_corner_primary_fill);
                } else if (isLastButton) {
                    views.setInt(R.id.offCover, "setBackgroundResource", R.drawable.shape_left_rounded_corner_primary_fill);
                } else {
                    views.setInt(R.id.offCover, "setBackgroundColor", ContextCompat.getColor(context, R.color.brandPrimary));
                }
                views.setTextColor(R.id.iconOff, ContextCompat.getColor(context, R.color.white));
            }
            if (methodRequested != null && isShowingStatus == 1 && methodRequested.equals("2")) {
                if (state != null && state.equals("2")) {
                    views.setTextViewText(R.id.iconOff, "statuscheck");
                    views.setTextColor(R.id.iconOff, ContextCompat.getColor(context, R.color.widgetGreen));
                    views.setTextViewTextSize(R.id.iconOff, COMPLEX_UNIT_SP, Float.parseFloat("19"));
                } else {
                    views.setTextViewText(R.id.iconOff, "statusx");
                    views.setTextColor(R.id.iconOff, ContextCompat.getColor(context, R.color.widgetRed));
                    views.setTextViewTextSize(R.id.iconOff, COMPLEX_UNIT_SP, Float.parseFloat("19"));
                }
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
                views.setTextViewText(R.id.dimmer25, "dim25");
                views.setTextColor(R.id.dimmer25, ContextCompat.getColor(context, R.color.brandSecondary));
                views.setTextColor(R.id.txtDimmer25, ContextCompat.getColor(context, R.color.brandSecondary));
                views.setOnClickPendingIntent(R.id.dimmer25Cover, getPendingSelf(context, DIMMER_25, appWidgetId));
                Boolean isLastButton = (renderedButtonsCount == (buttonsCount - 1)) || (renderedButtonsCount == (maxButtonsOnWidget - 1));
                if (renderedButtonsCount == 0) {
                    views.setInt(R.id.dimmer25Cover, "setBackgroundResource", R.drawable.shape_left_rounded_corner);
                } else if (isLastButton) {
                    views.setInt(R.id.dimmer25Cover, "setBackgroundResource", R.drawable.shape_right_rounded_corner);
                } else {
                    views.setInt(R.id.dimmer25Cover, "setBackgroundColor", ContextCompat.getColor(context, R.color.lightGray));
                }
                if (methodRequested != null && state == null && isShowingStatus != 1 && methodRequested.equals(METHOD_DIMMER_25)) {
                    if (renderedButtonsCount == 0) {
                        views.setInt(R.id.dimmer25Cover, "setBackgroundResource", R.drawable.shape_left_rounded_corner_secondary_fill);
                    } else if (isLastButton) {
                        views.setInt(R.id.dimmer25Cover, "setBackgroundResource", R.drawable.shape_right_rounded_corner_secondary_fill);
                    } else {
                        views.setInt(R.id.dimmer25Cover, "setBackgroundColor", ContextCompat.getColor(context, R.color.brandSecondary));
                    }
                    views.setTextColor(R.id.dimmer25, ContextCompat.getColor(context, R.color.white));
                    views.setTextColor(R.id.txtDimmer25, ContextCompat.getColor(context, R.color.white));
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
                            views.setTextViewText(R.id.iconCheck25, "statuscheck");
                            views.setTextColor(R.id.iconCheck25, ContextCompat.getColor(context, R.color.widgetGreen));
                            views.setTextViewTextSize(R.id.iconCheck25, COMPLEX_UNIT_SP, Float.parseFloat("22"));
                        } else {
                            views.setViewVisibility(R.id.iconCheck25, View.VISIBLE);
                            views.setViewVisibility(R.id.dimmer25CoverLinear, View.GONE);
                            views.setTextViewText(R.id.iconCheck25, "statusx");
                            views.setTextColor(R.id.iconCheck25, ContextCompat.getColor(context, R.color.widgetRed));
                            views.setTextViewTextSize(R.id.iconCheck25, COMPLEX_UNIT_SP, Float.parseFloat("22"));
                        }
                    }
                }
                renderedButtonsCount++;
            }

            showMoreActions = (renderedButtonsCount == 4 ) && (buttonsCount > 5);
            if (!showMoreActions) {
                views.setViewVisibility(R.id.dimmer50Cover, View.VISIBLE);
                views.setTextViewText(R.id.dimmer50, "dim");
                views.setTextColor(R.id.dimmer50, ContextCompat.getColor(context, R.color.brandSecondary));
                views.setTextColor(R.id.txtDimmer50, ContextCompat.getColor(context, R.color.brandSecondary));
                views.setOnClickPendingIntent(R.id.dimmer50Cover, getPendingSelf(context, DIMMER_50, appWidgetId));
                Boolean isLastButton = (renderedButtonsCount == (buttonsCount - 1)) || (renderedButtonsCount == (maxButtonsOnWidget - 1));
                if (isLastButton) {
                    views.setInt(R.id.dimmer50Cover, "setBackgroundResource", R.drawable.shape_right_rounded_corner);
                } else {
                    views.setInt(R.id.dimmer50Cover, "setBackgroundColor", ContextCompat.getColor(context, R.color.lightGray));
                }
                if (methodRequested != null && state == null && isShowingStatus != 1 && methodRequested.equals(METHOD_DIMMER_50)) {
                    if (isLastButton) {
                        views.setInt(R.id.dimmer50Cover, "setBackgroundResource", R.drawable.shape_right_rounded_corner_secondary_fill);
                    } else {
                        views.setInt(R.id.dimmer50Cover, "setBackgroundColor", ContextCompat.getColor(context, R.color.brandSecondary));
                    }
                    views.setTextColor(R.id.dimmer50, ContextCompat.getColor(context, R.color.white));
                    views.setTextColor(R.id.txtDimmer50, ContextCompat.getColor(context, R.color.white));
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
                            views.setTextViewText(R.id.iconCheck50, "statuscheck");
                            views.setTextColor(R.id.iconCheck50, ContextCompat.getColor(context, R.color.widgetGreen));
                            views.setTextViewTextSize(R.id.iconCheck50, COMPLEX_UNIT_SP, Float.parseFloat("22"));
                        } else {
                            views.setViewVisibility(R.id.iconCheck50, View.VISIBLE);
                            views.setViewVisibility(R.id.dimmer50CoverLinear, View.GONE);
                            views.setTextViewText(R.id.iconCheck50, "statusx");
                            views.setTextColor(R.id.iconCheck50, ContextCompat.getColor(context, R.color.widgetRed));
                            views.setTextViewTextSize(R.id.iconCheck50, COMPLEX_UNIT_SP, Float.parseFloat("22"));
                        }
                    }
                }
                renderedButtonsCount++;
            }

            showMoreActions = (renderedButtonsCount == 4 ) && (buttonsCount > 5);
            if (!showMoreActions) {
                views.setViewVisibility(R.id.dimmer75Cover, View.VISIBLE);
                views.setTextViewText(R.id.dimmer75, "dim75");
                views.setTextColor(R.id.dimmer75, ContextCompat.getColor(context, R.color.brandSecondary));
                views.setTextColor(R.id.txtDimmer75, ContextCompat.getColor(context, R.color.brandSecondary));
                views.setOnClickPendingIntent(R.id.dimmer75Cover, getPendingSelf(context, DIMMER_75, appWidgetId));
                Boolean isLastButton = (renderedButtonsCount == (buttonsCount - 1)) || (renderedButtonsCount == (maxButtonsOnWidget - 1));
                if (isLastButton) {
                    views.setInt(R.id.dimmer75Cover, "setBackgroundResource", R.drawable.shape_right_rounded_corner);
                } else {
                    views.setInt(R.id.dimmer75Cover, "setBackgroundColor", ContextCompat.getColor(context, R.color.lightGray));
                }
                if (methodRequested != null && state == null && isShowingStatus != 1 && methodRequested.equals(METHOD_DIMMER_75)) {
                    if (isLastButton) {
                        views.setInt(R.id.dimmer75Cover, "setBackgroundResource", R.drawable.shape_right_rounded_corner_secondary_fill);
                    } else {
                        views.setInt(R.id.dimmer75Cover, "setBackgroundColor", ContextCompat.getColor(context, R.color.brandSecondary));
                    }
                    views.setTextColor(R.id.dimmer75, ContextCompat.getColor(context, R.color.white));
                    views.setTextColor(R.id.txtDimmer75, ContextCompat.getColor(context, R.color.white));
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
                            views.setTextViewText(R.id.iconCheck75, "statuscheck");
                            views.setTextColor(R.id.iconCheck75, ContextCompat.getColor(context, R.color.widgetGreen));
                            views.setTextViewTextSize(R.id.iconCheck75, COMPLEX_UNIT_SP, Float.parseFloat("22"));
                        } else {
                            views.setViewVisibility(R.id.iconCheck75, View.VISIBLE);
                            views.setViewVisibility(R.id.dimmer75CoverLinear, View.GONE);
                            views.setTextViewText(R.id.iconCheck75, "statusx");
                            views.setTextColor(R.id.iconCheck75, ContextCompat.getColor(context, R.color.widgetRed));
                            views.setTextViewTextSize(R.id.iconCheck75, COMPLEX_UNIT_SP, Float.parseFloat("22"));
                        }
                    }
                }
                renderedButtonsCount++;
            }
        }

        showMoreActions = (renderedButtonsCount == 4 ) && (buttonsCount > 5);
        if (hasOn && !showMoreActions) {
            views.setViewVisibility(R.id.onCover, View.VISIBLE);
            views.setTextViewText(R.id.iconOn, onActionIcon);
            views.setTextColor(R.id.iconOn, ContextCompat.getColor(context, R.color.brandSecondary));
            views.setInt(R.id.iconOn, "setBackgroundColor", Color.TRANSPARENT);
            views.setTextViewTextSize(R.id.iconOn, COMPLEX_UNIT_SP, Float.parseFloat("26"));

            views.setOnClickPendingIntent(R.id.onCover, getPendingSelf(context, ACTION_ON, appWidgetId));

            Boolean isLastButton = (renderedButtonsCount == (buttonsCount - 1)) || (renderedButtonsCount == (maxButtonsOnWidget - 1));
            if (renderedButtonsCount == 0) {
                views.setInt(R.id.onCover, "setBackgroundResource", R.drawable.shape_left_rounded_corner);
            } else if (isLastButton) {
                views.setInt(R.id.onCover, "setBackgroundResource", R.drawable.shape_right_rounded_corner);
            } else {
                views.setInt(R.id.onCover, "setBackgroundColor", ContextCompat.getColor(context, R.color.lightGray));
            }

            if (methodRequested != null && state == null && isShowingStatus != 1 && methodRequested.equals(METHOD_ON)) {
                if (renderedButtonsCount == 0) {
                    views.setInt(R.id.onCover, "setBackgroundResource", R.drawable.shape_left_rounded_corner_secondary_fill);
                } else if (isLastButton) {
                    views.setInt(R.id.onCover, "setBackgroundResource", R.drawable.shape_right_rounded_corner_secondary_fill);
                } else {
                    views.setInt(R.id.onCover, "setBackgroundColor", ContextCompat.getColor(context, R.color.brandSecondary));
                }
                views.setTextColor(R.id.iconOn, ContextCompat.getColor(context, R.color.white));
            }
            if (methodRequested != null && isShowingStatus == 1 && methodRequested.equals("1")) {
                if (state != null && state.equals("1")) {
                    views.setTextViewText(R.id.iconOn, "statuscheck");
                    views.setTextColor(R.id.iconOn, ContextCompat.getColor(context, R.color.widgetGreen));
                    views.setTextViewTextSize(R.id.iconOn, COMPLEX_UNIT_SP, Float.parseFloat("22"));
                } else {
                    views.setTextViewText(R.id.iconOn, "statusx");
                    views.setTextColor(R.id.iconOn, ContextCompat.getColor(context, R.color.widgetRed));
                    views.setTextViewTextSize(R.id.iconOn, COMPLEX_UNIT_SP, Float.parseFloat("22"));
                }
            }
            renderedButtonsCount++;
        }

        // More actions button
        if (renderedButtonsCount == 4 && buttonsCount > 5) {
            views.setViewVisibility(R.id.moreActionsCover, View.VISIBLE);
            views.setInt(R.id.moreActionsCover, "setBackgroundResource", R.drawable.shape_right_rounded_corner);

            views.setOnClickPendingIntent(R.id.moreActionsCover, getPendingSelf(context, ACTION_MORE_ACTIONS, appWidgetId));
        }

        transparent = DeviceWidgetInfo.getTransparent();
        if (transparent.equals("true")) {
            views.setInt(R.id.iconWidget, "setBackgroundColor", Color.TRANSPARENT);
        }

        views.setTextViewText(R.id.txtWidgetTitle, widgetText);
        // Instruct the widget manager to update the widget
        appWidgetManager.updateAppWidget(appWidgetId, views);
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
}
