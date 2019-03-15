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

import android.app.Activity;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup;
import android.view.Window;
import android.widget.Button;
import android.view.ViewGroup.LayoutParams;
import android.widget.TextView;
import android.content.Context;
import android.content.Intent;
import android.appwidget.AppWidgetManager;
import android.util.Log;
import android.support.v4.content.ContextCompat;
import android.graphics.Color;
import android.os.Handler;
import android.os.Looper;

import org.json.JSONObject;

import com.androidnetworking.error.ANError;
import com.androidnetworking.interfaces.JSONObjectRequestListener;

import java.util.Map;

import com.telldus.live.mobile.Database.MyDBHandler;
import com.telldus.live.mobile.Database.PrefManager;
import com.telldus.live.mobile.Model.DeviceInfo;
import com.telldus.live.mobile.Utility.DevicesUtilities;
import com.telldus.live.mobile.API.DevicesAPI;
import com.telldus.live.mobile.API.OnAPITaskComplete;

import static android.util.TypedValue.COMPLEX_UNIT_SP;

public class DevicesGroupDialogueActivity extends Activity {

    private static final String METHOD_ON = "1";
    private static final String METHOD_OFF = "2";
    private static final String METHOD_BELL = "4";
    private static final String METHOD_UP = "128";
    private static final String METHOD_DOWN = "256";
    private static final String METHOD_STOP = "512";
    private static final String METHOD_DIMMER_25 = "16_25";
    private static final String METHOD_DIMMER_50 = "16_50";
    private static final String METHOD_DIMMER_75 = "16_75";

    DevicesAPI deviceAPI = new DevicesAPI();


    private Handler handlerResetDeviceStateToNull;
    private Runnable runnableResetDeviceStateToNull;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        setContentView(R.layout.devices_group_dialogue_activity);

        Intent intent = getIntent();
        Bundle extras = intent.getExtras();

        if (extras == null) {
            return;
        }
        int widgetId = extras.getInt("widgetId", AppWidgetManager.INVALID_APPWIDGET_ID);
        if (widgetId == AppWidgetManager.INVALID_APPWIDGET_ID) {
            return;
        }

        updateUI(widgetId);
    }

    public void updateUI(final int widgetId) {
        final Context context = getApplicationContext();
        PrefManager prefManager = new PrefManager(context);
        String accessToken = prefManager.getAccessToken();
        // On log out, only prefManager is cleared and not DB, so we do not want device to show back again during the
        // socket update.
        if (accessToken == "") {
            return;
        }

        final MyDBHandler db = new MyDBHandler(context);

        CharSequence deviceName = "Unknown";
        String transparent;
        DeviceInfo DeviceWidgetInfo = db.findWidgetInfoDevice(widgetId);
        if (DeviceWidgetInfo == null) {
            return;
        }

        String userId = DeviceWidgetInfo.getUserId();
        String currentUserId = prefManager.getUserId();
        Boolean isSameAccount = userId.trim().equals(currentUserId.trim());
        if (!isSameAccount) {
            return;
        }

        deviceName = DeviceWidgetInfo.getDeviceName();
        String state = DeviceWidgetInfo.getState();
        String deviceType = DeviceWidgetInfo.getDeviceType();
        String deviceStateValue = DeviceWidgetInfo.getDeviceStateValue();
        Integer methods = DeviceWidgetInfo.getDeviceMethods();
        String methodRequested = DeviceWidgetInfo.getMethodRequested();
        Integer isShowingStatus = DeviceWidgetInfo.getIsShowingStatus();

        final DevicesUtilities deviceUtils = new DevicesUtilities();
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

        final Integer deviceId = DeviceWidgetInfo.getDeviceId();
        if (deviceId.intValue() == -1) {
            return;
        }

        View headerImage = (View) findViewById(R.id.headerImage);
        TextView txtWidgetTitle = (TextView) findViewById(R.id.txtWidgetTitleDialogue);
        txtWidgetTitle.setText(deviceName);
        headerImage.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v) {
                removeHandlerResetDeviceStateToNull();
                DevicesGroupDialogueActivity.this.finish();
            }
        });

        int renderedButtonsCount = 0;
        int maxButtonsOnWidget = 5;
        Boolean showMoreActions = (renderedButtonsCount == 4 ) && (buttonsCount > 5);
        if (hasBell) {
            View bellCover = (View) findViewById(R.id.bellCover);
            TextView bellText = (TextView)findViewById(R.id.bell);
            bellCover.setVisibility(View.VISIBLE);
            bellCover.setElevation(5f);
            LayoutParams layoutParamsB = bellCover.getLayoutParams();
            layoutParamsB.width = 80;
            layoutParamsB.height = 80;
            bellCover.setLayoutParams(layoutParamsB);
            ViewGroup.MarginLayoutParams marginParams = (ViewGroup.MarginLayoutParams) bellCover.getLayoutParams();
            marginParams.setMargins(8, 8, 8, 8);
            bellCover.requestLayout();
            bellText.setText("bell");
            bellText.setTextColor(ContextCompat.getColor(context, R.color.brandSecondary));
            bellText.setBackgroundColor(Color.TRANSPARENT);
            bellText.setTextSize(COMPLEX_UNIT_SP, Float.parseFloat("26"));
            bellCover.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    db.updateDeviceInfo(METHOD_BELL, null, null, 0, widgetId);
                    removeHandlerResetDeviceStateToNull();
                    AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                    updateUI(widgetId);
                    NewAppWidget.updateAppWidget(context, widgetManager, widgetId);

                    createDeviceApi(deviceId, 4, 0, widgetId, context);
                }
            });

            bellCover.setBackgroundResource(R.drawable.button_background_padding);
            if (methodRequested != null && state == null && isShowingStatus != 1 && methodRequested.equals(METHOD_BELL)) {
                bellCover.setBackgroundResource(R.drawable.button_background_secondary_fill_padding);
                bellText.setTextColor(ContextCompat.getColor(context, R.color.white));
            }
            if (methodRequested != null && isShowingStatus == 1 && methodRequested.equals("4")) {
                if (state == null || !state.equals("4")) {
                    bellText.setText("statusx");
                    bellText.setTextColor(ContextCompat.getColor(context, R.color.widgetRed));
                    bellText.setTextSize(COMPLEX_UNIT_SP, Float.parseFloat("23"));
                } else {
                    bellText.setText("statuscheck");
                    bellText.setTextColor(ContextCompat.getColor(context, R.color.widgetGreen));
                    bellText.setTextSize(COMPLEX_UNIT_SP, Float.parseFloat("23"));
                }
            }

            renderedButtonsCount++;
        }

        showMoreActions = (renderedButtonsCount == 4 ) && (buttonsCount > 5);
        if (hasUp) {
            View upCover = (View) findViewById(R.id.upCover);
            TextView upText = (TextView)findViewById(R.id.uparrow);
            upCover.setVisibility(View.VISIBLE);
            upCover.setElevation(5f);
            upText.setText("up");
            upText.setTextColor(ContextCompat.getColor(context, R.color.brandSecondary));
            upText.setBackgroundColor(Color.TRANSPARENT);
            upText.setTextSize(COMPLEX_UNIT_SP, Float.parseFloat("26"));

            LayoutParams layoutParamsB = upCover.getLayoutParams();
            layoutParamsB.width = 80;
            layoutParamsB.height = 80;
            upCover.setLayoutParams(layoutParamsB);
            ViewGroup.MarginLayoutParams marginParams = (ViewGroup.MarginLayoutParams) upCover.getLayoutParams();
            marginParams.setMargins(8, 8, 8, 8);
            upCover.requestLayout();
            upCover.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    db.updateDeviceInfo(METHOD_UP, null, null, 0, widgetId);
                    removeHandlerResetDeviceStateToNull();
                    AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                    updateUI(widgetId);
                    NewAppWidget.updateAppWidget(context, widgetManager, widgetId);

                    createDeviceApi(deviceId, 128, 0, widgetId, context);
                }
            });

            upCover.setBackgroundResource(R.drawable.button_background_padding);
            if (methodRequested != null && state == null && isShowingStatus != 1 && methodRequested.equals(METHOD_UP)) {
                upCover.setBackgroundResource(R.drawable.button_background_secondary_fill_padding);
                upText.setTextColor(ContextCompat.getColor(context, R.color.white));
            }
            if (methodRequested != null && isShowingStatus == 1 && methodRequested.equals("128")) {
                if (state != null && state.equals("128")) {
                    upText.setText("statuscheck");
                    upText.setTextColor(ContextCompat.getColor(context, R.color.widgetGreen));
                    upText.setTextSize(COMPLEX_UNIT_SP, Float.parseFloat("23"));
                } else {
                    upText.setText("statusx");
                    upText.setTextColor(ContextCompat.getColor(context, R.color.widgetRed));
                    upText.setTextSize(COMPLEX_UNIT_SP, Float.parseFloat("23"));
                }
            }

            renderedButtonsCount++;
        }

        showMoreActions = (renderedButtonsCount == 4 ) && (buttonsCount > 5);
        if (hasDown) {
            View downCover = (View) findViewById(R.id.downCover);
            TextView downText = (TextView)findViewById(R.id.downarrow);
            downCover.setVisibility(View.VISIBLE);
            downCover.setElevation(5f);
            downText.setText("down");
            downText.setTextColor(ContextCompat.getColor(context, R.color.brandSecondary));
            downText.setBackgroundColor(Color.TRANSPARENT);
            downText.setTextSize(COMPLEX_UNIT_SP, Float.parseFloat("26"));

            LayoutParams layoutParamsB = downCover.getLayoutParams();
            layoutParamsB.width = 80;
            layoutParamsB.height = 80;
            downCover.setLayoutParams(layoutParamsB);
            ViewGroup.MarginLayoutParams marginParams = (ViewGroup.MarginLayoutParams) downCover.getLayoutParams();
            marginParams.setMargins(8, 8, 8, 8);
            downCover.requestLayout();
            downCover.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    db.updateDeviceInfo(METHOD_DOWN, null, null, 0, widgetId);
                    removeHandlerResetDeviceStateToNull();
                    AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                    updateUI(widgetId);
                    NewAppWidget.updateAppWidget(context, widgetManager, widgetId);

                    createDeviceApi(deviceId, 256, 0, widgetId, context);
                }
            });

            downCover.setBackgroundResource(R.drawable.button_background_padding);
            if (methodRequested != null && state == null && isShowingStatus != 1 && methodRequested.equals(METHOD_DOWN)) {
                downCover.setBackgroundResource(R.drawable.button_background_secondary_fill_padding);
                downText.setTextColor(ContextCompat.getColor(context, R.color.white));
            }
            if (methodRequested != null && isShowingStatus == 1 && methodRequested.equals("256")) {
                if (state != null && state.equals("256")) {
                    downText.setText("statuscheck");
                    downText.setTextColor(ContextCompat.getColor(context, R.color.widgetGreen));
                    downText.setTextSize(COMPLEX_UNIT_SP, Float.parseFloat("23"));
                } else {
                    downText.setText("statusx");
                    downText.setTextColor(ContextCompat.getColor(context, R.color.widgetRed));
                    downText.setTextSize(COMPLEX_UNIT_SP, Float.parseFloat("23"));
                }
            }

            renderedButtonsCount++;
        }

        showMoreActions = (renderedButtonsCount == 4 ) && (buttonsCount > 5);
        if (hasStop) {
            View stopCover = (View) findViewById(R.id.stopCover);
            TextView stopText = (TextView)findViewById(R.id.stopicon);
            stopCover.setVisibility(View.VISIBLE);
            stopCover.setElevation(5f);
            stopText.setText("stop");
            stopText.setTextColor(ContextCompat.getColor(context, R.color.brandPrimary));
            stopText.setBackgroundColor(Color.TRANSPARENT);
            stopText.setTextSize(COMPLEX_UNIT_SP, Float.parseFloat("26"));

            LayoutParams layoutParamsB = stopCover.getLayoutParams();
            layoutParamsB.width = 80;
            layoutParamsB.height = 80;
            stopCover.setLayoutParams(layoutParamsB);
            ViewGroup.MarginLayoutParams marginParams = (ViewGroup.MarginLayoutParams) stopCover.getLayoutParams();
            marginParams.setMargins(8, 8, 8, 8);
            stopCover.requestLayout();
            stopCover.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    db.updateDeviceInfo(METHOD_STOP, null, null, 0, widgetId);
                    removeHandlerResetDeviceStateToNull();
                    AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                    updateUI(widgetId);
                    NewAppWidget.updateAppWidget(context, widgetManager, widgetId);

                    createDeviceApi(deviceId, 512, 0, widgetId, context);
                }
            });

            stopCover.setBackgroundResource(R.drawable.button_background_padding);
            if (methodRequested != null && state == null && isShowingStatus != 1 && methodRequested.equals(METHOD_STOP)) {
                stopCover.setBackgroundResource(R.drawable.button_background_primary_fill_padding);
                stopText.setTextColor(ContextCompat.getColor(context, R.color.white));
            }
            if (methodRequested != null && isShowingStatus == 1 && methodRequested.equals("512")) {
                if (state != null && state.equals("512")) {
                    stopText.setText("statuscheck");
                    stopText.setTextColor(ContextCompat.getColor(context, R.color.widgetGreen));
                    stopText.setTextSize(COMPLEX_UNIT_SP, Float.parseFloat("23"));
                } else {
                    stopText.setText("statusx");
                    stopText.setTextColor(ContextCompat.getColor(context, R.color.widgetRed));
                    stopText.setTextSize(COMPLEX_UNIT_SP, Float.parseFloat("23"));
                }
            }

            renderedButtonsCount++;
        }

        showMoreActions = (renderedButtonsCount == 4 ) && (buttonsCount > 5);
        if (hasOff) {
            View offCover = (View) findViewById(R.id.offCover);
            TextView offText = (TextView)findViewById(R.id.iconOff);
            offCover.setVisibility(View.VISIBLE);
            offCover.setElevation(5f);
            offText.setText(offActionIcon);
            offText.setTextColor(ContextCompat.getColor(context, R.color.brandPrimary));
            offText.setBackgroundColor(Color.TRANSPARENT);
            offText.setTextSize(COMPLEX_UNIT_SP, Float.parseFloat("26"));

            LayoutParams layoutParamsB = offCover.getLayoutParams();
            layoutParamsB.width = 80;
            layoutParamsB.height = 80;
            offCover.setLayoutParams(layoutParamsB);
            ViewGroup.MarginLayoutParams marginParams = (ViewGroup.MarginLayoutParams) offCover.getLayoutParams();
            marginParams.setMargins(8, 8, 8, 8);
            offCover.requestLayout();
            offCover.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    db.updateDeviceInfo(METHOD_OFF, null, null, 0, widgetId);
                    removeHandlerResetDeviceStateToNull();
                    AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                    updateUI(widgetId);
                    NewAppWidget.updateAppWidget(context, widgetManager, widgetId);

                    createDeviceApi(deviceId, 2, 0, widgetId, context);
                }
            });

            offCover.setBackgroundResource(R.drawable.button_background_padding);
            if (methodRequested != null && state == null && isShowingStatus != 1 && methodRequested.equals(METHOD_OFF)) {
                offCover.setBackgroundResource(R.drawable.button_background_primary_fill_padding);
                offText.setTextColor(ContextCompat.getColor(context, R.color.white));
            }
            if (methodRequested != null && isShowingStatus == 1 && methodRequested.equals("2")) {
                if (state != null && state.equals("2")) {
                    offText.setText("statuscheck");
                    offText.setTextColor(ContextCompat.getColor(context, R.color.widgetGreen));
                    offText.setTextSize(COMPLEX_UNIT_SP, Float.parseFloat("23"));
                } else {
                    offText.setText("statusx");
                    offText.setTextColor(ContextCompat.getColor(context, R.color.widgetRed));
                    offText.setTextSize(COMPLEX_UNIT_SP, Float.parseFloat("23"));
                }
            }

            renderedButtonsCount++;
        }

        showMoreActions = (renderedButtonsCount == 4 ) && (buttonsCount > 5);
        if (hasDim) {
            TextView iconCheck25 = (TextView) findViewById(R.id.iconCheck25);
            TextView iconCheck50 = (TextView) findViewById(R.id.iconCheck50);
            TextView iconCheck75 = (TextView) findViewById(R.id.iconCheck75);
            View dimmer25CoverLinear = (View)findViewById(R.id.dimmer25CoverLinear);
            View dimmer50CoverLinear = (View)findViewById(R.id.dimmer50CoverLinear);
            View dimmer75CoverLinear = (View)findViewById(R.id.dimmer75CoverLinear);
            iconCheck25.setVisibility(View.GONE);
            iconCheck50.setVisibility(View.GONE);
            iconCheck75.setVisibility(View.GONE);
            dimmer25CoverLinear.setVisibility(View.VISIBLE);
            dimmer50CoverLinear.setVisibility(View.VISIBLE);
            dimmer75CoverLinear.setVisibility(View.VISIBLE);

            // "25%" dimmer button
                View dimmer25Cover = (View) findViewById(R.id.dimmer25Cover);
                TextView dimmer25 = (TextView)findViewById(R.id.dimmer25);
                TextView txtDimmer25 = (TextView)findViewById(R.id.txtDimmer25);
                dimmer25Cover.setVisibility(View.VISIBLE);
                dimmer25Cover.setElevation(5f);
                dimmer25.setText("dim25");
                dimmer25.setTextColor(ContextCompat.getColor(context, R.color.brandSecondary));
                txtDimmer25.setTextColor(ContextCompat.getColor(context, R.color.brandSecondary));
                dimmer25.setBackgroundColor(Color.TRANSPARENT);

                LayoutParams layoutParamsB = dimmer25Cover.getLayoutParams();
                layoutParamsB.width = 80;
                layoutParamsB.height = 80;
                dimmer25Cover.setLayoutParams(layoutParamsB);
                ViewGroup.MarginLayoutParams marginParams = (ViewGroup.MarginLayoutParams) dimmer25Cover.getLayoutParams();
                marginParams.setMargins(8, 8, 8, 8);
                dimmer25Cover.requestLayout();
                dimmer25Cover.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View view) {
                        db.updateDeviceInfo(METHOD_DIMMER_25, null, null, 0, widgetId);
                        removeHandlerResetDeviceStateToNull();
                        AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                        updateUI(widgetId);
                        NewAppWidget.updateAppWidget(context, widgetManager, widgetId);

                        int value = deviceUtils.toDimmerValue(25);
                        createDeviceApi(deviceId, 16, value, widgetId, context);
                    }
                });

                dimmer25Cover.setBackgroundResource(R.drawable.button_background_padding);

                if (methodRequested != null && state == null && isShowingStatus != 1 && methodRequested.equals(METHOD_DIMMER_25)) {
                    dimmer25Cover.setBackgroundResource(R.drawable.button_background_secondary_fill_padding);
                    dimmer25.setTextColor(ContextCompat.getColor(context, R.color.white));
                    txtDimmer25.setTextColor(ContextCompat.getColor(context, R.color.white));
                }
                if (methodRequested != null && isShowingStatus == 1) {
                    int checkpoint = 0;
                    if (deviceStateValue != null && !deviceStateValue.equals("")) {
                        int slidervalue = deviceUtils.toSliderValue(Integer.parseInt(deviceStateValue));
                        checkpoint = getClosestCheckPoint(slidervalue);
                    }

                    if (methodRequested != null && methodRequested.equals(METHOD_DIMMER_25)) {
                        if (checkpoint == 25) {
                            iconCheck25.setVisibility(View.VISIBLE);
                            dimmer25CoverLinear.setVisibility(View.GONE);
                            iconCheck25.setText("statuscheck");
                            iconCheck25.setTextColor(ContextCompat.getColor(context, R.color.widgetGreen));
                            iconCheck25.setTextSize(COMPLEX_UNIT_SP, Float.parseFloat("23"));
                        } else {
                            iconCheck25.setVisibility(View.VISIBLE);
                            dimmer25CoverLinear.setVisibility(View.GONE);
                            iconCheck25.setText("statusx");
                            iconCheck25.setTextColor(ContextCompat.getColor(context, R.color.widgetRed));
                            iconCheck25.setTextSize(COMPLEX_UNIT_SP, Float.parseFloat("23"));
                        }
                    }
                }
                renderedButtonsCount++;

            // "50%" dimmer button
                View dimmer50Cover = (View) findViewById(R.id.dimmer50Cover);
                TextView dimmer50 = (TextView)findViewById(R.id.dimmer50);
                TextView txtDimmer50 = (TextView)findViewById(R.id.txtDimmer50);
                dimmer50Cover.setVisibility(View.VISIBLE);
                dimmer50Cover.setElevation(5f);
                dimmer50.setText("dim");
                dimmer50.setTextColor(ContextCompat.getColor(context, R.color.brandSecondary));
                txtDimmer50.setTextColor(ContextCompat.getColor(context, R.color.brandSecondary));
                dimmer50.setBackgroundColor(Color.TRANSPARENT);

                layoutParamsB = dimmer50Cover.getLayoutParams();
                layoutParamsB.width = 80;
                layoutParamsB.height = 80;
                dimmer50Cover.setLayoutParams(layoutParamsB);
                marginParams = (ViewGroup.MarginLayoutParams) dimmer50Cover.getLayoutParams();
                marginParams.setMargins(8, 8, 8, 8);
                dimmer50Cover.requestLayout();
                dimmer50Cover.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View view) {
                        db.updateDeviceInfo(METHOD_DIMMER_50, null, null, 0, widgetId);
                        removeHandlerResetDeviceStateToNull();
                        AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                        updateUI(widgetId);
                        NewAppWidget.updateAppWidget(context, widgetManager, widgetId);

                        int value = deviceUtils.toDimmerValue(50);
                        createDeviceApi(deviceId, 16, value, widgetId, context);
                    }
                });

                dimmer50Cover.setBackgroundResource(R.drawable.button_background_padding);
                if (methodRequested != null && state == null && isShowingStatus != 1 && methodRequested.equals(METHOD_DIMMER_50)) {
                    dimmer50Cover.setBackgroundResource(R.drawable.button_background_secondary_fill_padding);
                    dimmer50.setTextColor(ContextCompat.getColor(context, R.color.white));
                    txtDimmer50.setTextColor(ContextCompat.getColor(context, R.color.white));
                }
                if (methodRequested != null && isShowingStatus == 1) {
                    int checkpoint = 0;
                    if (deviceStateValue != null && !deviceStateValue.equals("")) {
                        int slidervalue = deviceUtils.toSliderValue(Integer.parseInt(deviceStateValue));
                        checkpoint = getClosestCheckPoint(slidervalue);
                    }
                    if (methodRequested != null && methodRequested.equals(METHOD_DIMMER_50)) {
                        if (checkpoint == 50) {
                            iconCheck50.setVisibility(View.VISIBLE);
                            dimmer50CoverLinear.setVisibility(View.GONE);
                            iconCheck50.setText("statuscheck");
                            iconCheck50.setTextColor(ContextCompat.getColor(context, R.color.widgetGreen));
                            iconCheck50.setTextSize(COMPLEX_UNIT_SP, Float.parseFloat("23"));
                        } else {
                            iconCheck50.setVisibility(View.VISIBLE);
                            dimmer50CoverLinear.setVisibility(View.GONE);
                            iconCheck50.setText("statusx");
                            iconCheck50.setTextColor(ContextCompat.getColor(context, R.color.widgetRed));
                            iconCheck50.setTextSize(COMPLEX_UNIT_SP, Float.parseFloat("23"));
                        }
                    }
                }
                renderedButtonsCount++;

            // "75%" dimmer button
                View dimmer75Cover = (View) findViewById(R.id.dimmer75Cover);
                TextView dimmer75 = (TextView)findViewById(R.id.dimmer75);
                TextView txtDimmer75 = (TextView)findViewById(R.id.txtDimmer75);
                dimmer75Cover.setVisibility(View.VISIBLE);
                dimmer75Cover.setElevation(5f);
                dimmer75.setText("dim75");
                dimmer75.setTextColor(ContextCompat.getColor(context, R.color.brandSecondary));
                txtDimmer75.setTextColor(ContextCompat.getColor(context, R.color.brandSecondary));
                dimmer75.setBackgroundColor(Color.TRANSPARENT);

                layoutParamsB = dimmer75Cover.getLayoutParams();
                layoutParamsB.width = 80;
                layoutParamsB.height = 80;
                dimmer75Cover.setLayoutParams(layoutParamsB);
                marginParams = (ViewGroup.MarginLayoutParams) dimmer75Cover.getLayoutParams();
                marginParams.setMargins(8, 8, 8, 8);
                dimmer75Cover.requestLayout();
                dimmer75Cover.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View view) {
                        db.updateDeviceInfo(METHOD_DIMMER_75, null, null, 0, widgetId);
                        removeHandlerResetDeviceStateToNull();
                        AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                        updateUI(widgetId);
                        NewAppWidget.updateAppWidget(context, widgetManager, widgetId);

                        int value = deviceUtils.toDimmerValue(75);
                        createDeviceApi(deviceId, 16, value, widgetId, context);
                    }
                });

                dimmer75Cover.setBackgroundResource(R.drawable.button_background_padding);
                if (methodRequested != null && state == null && isShowingStatus != 1 && methodRequested.equals(METHOD_DIMMER_75)) {
                    dimmer75Cover.setBackgroundResource(R.drawable.button_background_secondary_fill_padding);
                    dimmer75.setTextColor(ContextCompat.getColor(context, R.color.white));
                    txtDimmer75.setTextColor(ContextCompat.getColor(context, R.color.white));
                }
                if (methodRequested != null && isShowingStatus == 1) {
                    int checkpoint = 0;
                    if (deviceStateValue != null && !deviceStateValue.equals("")) {
                        int slidervalue = deviceUtils.toSliderValue(Integer.parseInt(deviceStateValue));
                        checkpoint = getClosestCheckPoint(slidervalue);
                    }
                    if (methodRequested != null && methodRequested.equals(METHOD_DIMMER_75)) {
                        if (checkpoint == 75) {
                            iconCheck75.setVisibility(View.VISIBLE);
                            dimmer75CoverLinear.setVisibility(View.GONE);
                            iconCheck75.setText("statuscheck");
                            iconCheck75.setTextColor(ContextCompat.getColor(context, R.color.widgetGreen));
                            iconCheck75.setTextSize(COMPLEX_UNIT_SP, Float.parseFloat("23"));
                        } else {
                            iconCheck75.setVisibility(View.VISIBLE);
                            dimmer75CoverLinear.setVisibility(View.GONE);
                            iconCheck75.setText("statusx");
                            iconCheck75.setTextColor(ContextCompat.getColor(context, R.color.widgetRed));
                            iconCheck75.setTextSize(COMPLEX_UNIT_SP, Float.parseFloat("23"));
                        }
                    }
                }
                renderedButtonsCount++;
        }

        showMoreActions = (renderedButtonsCount == 4 ) && (buttonsCount > 5);
        if (hasOn) {
            View onCover = (View) findViewById(R.id.onCover);
            TextView onText = (TextView)findViewById(R.id.iconOn);
            onCover.setVisibility(View.VISIBLE);
            onCover.setElevation(5f);
            onText.setText(onActionIcon);
            onText.setTextColor(ContextCompat.getColor(context, R.color.brandSecondary));
            onText.setBackgroundColor(Color.TRANSPARENT);
            onText.setTextSize(COMPLEX_UNIT_SP, Float.parseFloat("26"));

            LayoutParams layoutParamsB = onCover.getLayoutParams();
            layoutParamsB.width = 80;
            layoutParamsB.height = 80;
            onCover.setLayoutParams(layoutParamsB);
            ViewGroup.MarginLayoutParams marginParams = (ViewGroup.MarginLayoutParams) onCover.getLayoutParams();
            marginParams.setMargins(8, 8, 8, 8);
            onCover.requestLayout();
            onCover.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    db.updateDeviceInfo(METHOD_ON, null, null, 0, widgetId);
                    removeHandlerResetDeviceStateToNull();
                    AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                    updateUI(widgetId);
                    NewAppWidget.updateAppWidget(context, widgetManager, widgetId);

                    createDeviceApi(deviceId, 1, 0, widgetId, context);
                }
            });

            onCover.setBackgroundResource(R.drawable.button_background_padding);

            if (methodRequested != null && state == null && isShowingStatus != 1 && methodRequested.equals(METHOD_ON)) {
                onCover.setBackgroundResource(R.drawable.button_background_secondary_fill_padding);
                onText.setTextColor(ContextCompat.getColor(context, R.color.white));
            }
            if (methodRequested != null && isShowingStatus == 1 && methodRequested.equals("1")) {
                if (state != null && state.equals("1")) {
                    onText.setText("statuscheck");
                    onText.setTextColor(ContextCompat.getColor(context, R.color.widgetGreen));
                    onText.setTextSize(COMPLEX_UNIT_SP, Float.parseFloat("23"));
                } else {
                    onText.setText("statusx");
                    onText.setTextColor(ContextCompat.getColor(context, R.color.widgetRed));
                    onText.setTextSize(COMPLEX_UNIT_SP, Float.parseFloat("23"));
                }
            }
            renderedButtonsCount++;
        }
    }

    public Integer getClosestCheckPoint(Integer value) {
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
                updateUI(widgetId);
                NewAppWidget.updateAppWidget(context, widgetManager, widgetId);
            }
            @Override
            public void onError(ANError error) {
                db.updateIsShowingStatus(1, widgetId);
                resetDeviceStateToNull(deviceId, widgetId, context);
                AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                updateUI(widgetId);
                NewAppWidget.updateAppWidget(context, widgetManager, widgetId);
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

                    updateUI(widgetId);
                    NewAppWidget.updateAppWidget(context, widgetManager, widgetId);
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
}
