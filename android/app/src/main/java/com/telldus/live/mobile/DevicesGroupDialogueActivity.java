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
import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup;
import android.view.ViewTreeObserver;
import android.view.Window;
import android.view.ViewGroup.LayoutParams;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.ImageView;
import android.content.Context;
import android.content.Intent;
import android.appwidget.AppWidgetManager;
import androidx.core.content.ContextCompat;
import android.os.Handler;
import android.os.Looper;
import com.google.android.material.slider.Slider;

import org.json.JSONObject;
import org.w3c.dom.Text;

import com.androidnetworking.error.ANError;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Arrays;
import java.util.List;

import com.google.android.flexbox.FlexboxLayout;
import com.skydoves.colorpickerview.ActionMode;
import com.skydoves.colorpickerview.ColorEnvelope;
import com.skydoves.colorpickerview.ColorPickerView;
import com.skydoves.colorpickerview.listeners.ColorEnvelopeListener;
import com.skydoves.colorpickerview.listeners.ColorListener;
import com.telldus.live.mobile.Database.MyDBHandler;
import com.telldus.live.mobile.Database.PrefManager;
import com.telldus.live.mobile.Model.DeviceInfo;
import com.telldus.live.mobile.Utility.Constants;
import com.telldus.live.mobile.Utility.DevicesUtilities;
import com.telldus.live.mobile.API.DevicesAPI;
import com.telldus.live.mobile.API.OnAPITaskComplete;
import com.telldus.live.mobile.Utility.CommonUtilities;

import static android.util.TypedValue.COMPLEX_UNIT_SP;

public class DevicesGroupDialogueActivity extends Activity {

    private static final String METHOD_ON = "1";
    private static final String METHOD_OFF = "2";
    private static final String METHOD_BELL = "4";
    private static final String METHOD_UP = "128";
    private static final String METHOD_DOWN = "256";
    private static final String METHOD_STOP = "512";
    private static final String METHOD_DIM = "16";

    private static final int METHOD_RGB = 1024;

    private static final String API_TAG = "SetState2";

    DevicesAPI deviceAPI = new DevicesAPI();

    private String rgbSelectedSwatch = null;

    final DevicesUtilities deviceUtils = new DevicesUtilities();


    private Handler handlerResetDeviceStateToNull;
    private Runnable runnableResetDeviceStateToNull;

    Handler callEndPointHandler;
    Runnable callEndPointRunnable;

    int currentColorControlled;

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

        CharSequence deviceName = getResources().getString(R.string.reserved_widget_android_unknown);
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
        deviceStateValue = deviceStateValue == "null" ? "" : deviceStateValue;
        Integer methods = DeviceWidgetInfo.getDeviceMethods();
        String methodRequested = DeviceWidgetInfo.getMethodRequested();
        Integer isShowingStatus = DeviceWidgetInfo.getIsShowingStatus();
        String primarySetting = DeviceWidgetInfo.getPrimarySetting();
        String secondaryStateValue = DeviceWidgetInfo.getSecondaryStateValue();
        Map<String, Boolean> supportedMethods = deviceUtils.getSupportedMethods(methods);
        Map<String, String> actionIconSet = deviceUtils.getDeviceActionIcon(deviceType, state, supportedMethods);

        final String stateValue = deviceStateValue;

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
        Boolean hasRGB = ((supportedMethods.get("RGB") != null) && supportedMethods.get("RGB"));

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

        int width = Resources.getSystem().getDisplayMetrics().widthPixels;
        float d = context.getResources().getDisplayMetrics().density;

        int renderedButtonsCount = 0;
        int maxButtonsOnWidget = 5;
        Boolean showMoreActions = (renderedButtonsCount == 4 ) && (buttonsCount > 5);
        if (hasBell) {
            View bellCover = (View) findViewById(R.id.bellCover);
            ImageView bellText = (ImageView)findViewById(R.id.bell);
            bellCover.setVisibility(View.VISIBLE);
            bellCover.setElevation(5f);
            LayoutParams layoutParamsB = bellCover.getLayoutParams();
            layoutParamsB.width = 80;
            layoutParamsB.height = 80;
            bellCover.setLayoutParams(layoutParamsB);
            ViewGroup.MarginLayoutParams marginParams = (ViewGroup.MarginLayoutParams) bellCover.getLayoutParams();
            marginParams.setMargins(8, 8, 8, 8);
            bellCover.requestLayout();
            bellText.setImageBitmap(CommonUtilities.buildTelldusIcon(
                "bell",
                ContextCompat.getColor(context, R.color.brandSecondary),
                160,
                95,
                95,
                context));
            bellCover.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    db.updateDeviceInfo(METHOD_BELL, null, stateValue, 0, secondaryStateValue, widgetId);
                    removeHandlerResetDeviceStateToNull();
                    AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                    updateUI(widgetId);
                    NewAppWidget.updateAppWidget(context, widgetManager, widgetId, new HashMap());

                    createDeviceApi(deviceId, 4, 0, widgetId, context);
                }
            });

            bellCover.setBackgroundResource(R.drawable.button_background);
            if (methodRequested != null && state == null && isShowingStatus != 1 && methodRequested.equals(METHOD_BELL)) {
                bellCover.setBackgroundResource(R.drawable.button_background_secondary_fill);
                bellText.setImageBitmap(CommonUtilities.buildTelldusIcon(
                    "bell",
                    ContextCompat.getColor(context, R.color.white),
                    160,
                    95,
                    95,
                    context));

                showFlashIndicator(R.id.flash_view_bell, R.id.flashing_indicator_bell, R.drawable.shape_circle_white_fill);
            }
            if (methodRequested != null && isShowingStatus == 1 && methodRequested.equals("4")) {
                if (state == null || !state.equals("4")) {
                    bellText.setImageBitmap(CommonUtilities.buildTelldusIcon(
                        "statusx",
                        ContextCompat.getColor(context, R.color.widgetRed),
                        160,
                        95,
                        95,
                        context));
                } else {
                    bellText.setImageBitmap(CommonUtilities.buildTelldusIcon(
                        "statuscheck",
                        ContextCompat.getColor(context, R.color.widgetGreen),
                        160,
                        95,
                        95,
                        context));
                }
                hideFlashIndicator(R.id.flashing_indicator_bell);
            }

            renderedButtonsCount++;
        }

        showMoreActions = (renderedButtonsCount == 4 ) && (buttonsCount > 5);
        if (hasUp) {
            View upCover = (View) findViewById(R.id.upCover);
            ImageView upText = (ImageView)findViewById(R.id.uparrow);
            upCover.setVisibility(View.VISIBLE);
            upCover.setElevation(5f);
            upText.setImageBitmap(CommonUtilities.buildTelldusIcon(
                "up",
                ContextCompat.getColor(context, R.color.brandSecondary),
                160,
                95,
                95,
                context));

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
                    db.updateDeviceInfo(METHOD_UP, null, stateValue, 0, secondaryStateValue, widgetId);
                    removeHandlerResetDeviceStateToNull();
                    AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                    updateUI(widgetId);
                    NewAppWidget.updateAppWidget(context, widgetManager, widgetId, new HashMap());

                    createDeviceApi(deviceId, 128, 0, widgetId, context);
                }
            });

            upCover.setBackgroundResource(R.drawable.button_background);
            if (methodRequested != null && state == null && isShowingStatus != 1 && methodRequested.equals(METHOD_UP)) {
                upCover.setBackgroundResource(R.drawable.button_background_secondary_fill);
                upText.setImageBitmap(CommonUtilities.buildTelldusIcon(
                    "up",
                    ContextCompat.getColor(context, R.color.white),
                    160,
                    95,
                    95,
                    context));

                showFlashIndicator(R.id.flash_view_up, R.id.flashing_indicator_up, R.drawable.shape_circle_white_fill);
            }
            if (methodRequested != null && isShowingStatus == 1 && methodRequested.equals("128")) {
                if (state != null && state.equals("128")) {
                    upText.setImageBitmap(CommonUtilities.buildTelldusIcon(
                        "statuscheck",
                        ContextCompat.getColor(context, R.color.widgetGreen),
                        160,
                        95,
                        95,
                        context));
                } else {
                    upText.setImageBitmap(CommonUtilities.buildTelldusIcon(
                        "statusx",
                        ContextCompat.getColor(context, R.color.widgetRed),
                        160,
                        95,
                        95,
                        context));
                }
                hideFlashIndicator(R.id.flashing_indicator_up);
            }

            renderedButtonsCount++;
        }

        showMoreActions = (renderedButtonsCount == 4 ) && (buttonsCount > 5);
        if (hasDown) {
            View downCover = (View) findViewById(R.id.downCover);
            ImageView downText = (ImageView)findViewById(R.id.downarrow);
            downCover.setVisibility(View.VISIBLE);
            downCover.setElevation(5f);
            downText.setImageBitmap(CommonUtilities.buildTelldusIcon(
                "down",
                ContextCompat.getColor(context, R.color.brandSecondary),
                160,
                95,
                95,
                context));

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
                    db.updateDeviceInfo(METHOD_DOWN, null, stateValue, 0, secondaryStateValue, widgetId);
                    removeHandlerResetDeviceStateToNull();
                    AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                    updateUI(widgetId);
                    NewAppWidget.updateAppWidget(context, widgetManager, widgetId, new HashMap());

                    createDeviceApi(deviceId, 256, 0, widgetId, context);
                }
            });

            downCover.setBackgroundResource(R.drawable.button_background);
            if (methodRequested != null && state == null && isShowingStatus != 1 && methodRequested.equals(METHOD_DOWN)) {
                downCover.setBackgroundResource(R.drawable.button_background_secondary_fill);
                downText.setImageBitmap(CommonUtilities.buildTelldusIcon(
                    "down",
                    ContextCompat.getColor(context, R.color.white),
                    160,
                    95,
                    95,
                    context));

                showFlashIndicator(R.id.flash_view_down, R.id.flashing_indicator_down, R.drawable.shape_circle_white_fill);
            }
            if (methodRequested != null && isShowingStatus == 1 && methodRequested.equals("256")) {
                if (state != null && state.equals("256")) {
                    downText.setImageBitmap(CommonUtilities.buildTelldusIcon(
                        "statuscheck",
                        ContextCompat.getColor(context, R.color.widgetGreen),
                        160,
                        95,
                        95,
                        context));
                } else {
                    downText.setImageBitmap(CommonUtilities.buildTelldusIcon(
                        "statusx",
                        ContextCompat.getColor(context, R.color.widgetRed),
                        160,
                        95,
                        95,
                        context));
                }
                hideFlashIndicator(R.id.flashing_indicator_down);
            }

            renderedButtonsCount++;
        }

        showMoreActions = (renderedButtonsCount == 4 ) && (buttonsCount > 5);
        if (hasStop) {
            View stopCover = (View) findViewById(R.id.stopCover);
            ImageView stopText = (ImageView)findViewById(R.id.stopicon);
            stopCover.setVisibility(View.VISIBLE);
            stopCover.setElevation(5f);
            stopText.setImageBitmap(CommonUtilities.buildTelldusIcon(
                "stop",
                ContextCompat.getColor(context, R.color.brandPrimary),
                160,
                95,
                95,
                context));

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
                    db.updateDeviceInfo(METHOD_STOP, null, stateValue, 0, secondaryStateValue, widgetId);
                    removeHandlerResetDeviceStateToNull();
                    AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                    updateUI(widgetId);
                    NewAppWidget.updateAppWidget(context, widgetManager, widgetId, new HashMap());

                    createDeviceApi(deviceId, 512, 0, widgetId, context);
                }
            });

            stopCover.setBackgroundResource(R.drawable.button_background);
            if (methodRequested != null && state == null && isShowingStatus != 1 && methodRequested.equals(METHOD_STOP)) {
                stopCover.setBackgroundResource(R.drawable.button_background_primary_fill);
                stopText.setImageBitmap(CommonUtilities.buildTelldusIcon(
                    "stop",
                    ContextCompat.getColor(context, R.color.white),
                    160,
                    95,
                    95,
                    context));

                showFlashIndicator(R.id.flash_view_stop, R.id.flashing_indicator_stop, R.drawable.shape_circle_white_fill);
            }
            if (methodRequested != null && isShowingStatus == 1 && methodRequested.equals("512")) {
                if (state != null && state.equals("512")) {
                    stopText.setImageBitmap(CommonUtilities.buildTelldusIcon(
                        "statuscheck",
                        ContextCompat.getColor(context, R.color.widgetGreen),
                        160,
                        95,
                        95,
                        context));
                } else {
                    stopText.setImageBitmap(CommonUtilities.buildTelldusIcon(
                        "statusx",
                        ContextCompat.getColor(context, R.color.widgetRed),
                        160,
                        95,
                        95,
                        context));
                }
                hideFlashIndicator(R.id.flashing_indicator_stop);
            }

            renderedButtonsCount++;
        }

        showMoreActions = (renderedButtonsCount == 4 ) && (buttonsCount > 5);
        if (hasOff && !hasRGB) {
            View offCover = (View) findViewById(R.id.offCover);
            ImageView offIcon = (ImageView)findViewById(R.id.iconOff);
            offCover.setVisibility(View.VISIBLE);
            offCover.setElevation(5f);
            offIcon.setImageBitmap(CommonUtilities.buildTelldusIcon(
                offActionIcon,
                ContextCompat.getColor(context, R.color.brandPrimary),
                160,
                95,
                95,
                context));

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
                    db.updateDeviceInfo(METHOD_OFF, null, stateValue, 0, secondaryStateValue, widgetId);
                    removeHandlerResetDeviceStateToNull();
                    AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                    updateUI(widgetId);
                    NewAppWidget.updateAppWidget(context, widgetManager, widgetId, new HashMap());

                    createDeviceApi(deviceId, 2, 0, widgetId, context);
                }
            });

            offCover.setBackgroundResource(R.drawable.button_background);
            if (methodRequested != null && state == null && isShowingStatus != 1 && methodRequested.equals(METHOD_OFF)) {
                offCover.setBackgroundResource(R.drawable.button_background_primary_fill);
                offIcon.setImageBitmap(CommonUtilities.buildTelldusIcon(
                    offActionIcon,
                    ContextCompat.getColor(context, R.color.white),
                    160,
                    95,
                    95,
                    context));

                showFlashIndicator(R.id.flash_view_off, R.id.flashing_indicator_off, R.drawable.shape_circle_white_fill);
            }
            if (methodRequested != null && isShowingStatus == 1 && methodRequested.equals("2")) {
                if (state != null && state.equals("2")) {
                    offIcon.setImageBitmap(CommonUtilities.buildTelldusIcon(
                        "statuscheck",
                        ContextCompat.getColor(context, R.color.widgetGreen),
                        160,
                        95,
                        95,
                        context));
                } else {
                    offIcon.setImageBitmap(CommonUtilities.buildTelldusIcon(
                        "statusx",
                        ContextCompat.getColor(context, R.color.widgetRed),
                        160,
                        95,
                        95,
                        context));
                }
                hideFlashIndicator(R.id.flashing_indicator_off);
            }

            renderedButtonsCount++;
        }

        showMoreActions = (renderedButtonsCount == 4 ) && (buttonsCount > 5);
        if (hasDim) {
            View dim_slider_cover = (View) findViewById(R.id.dim_slider_cover);
            dim_slider_cover.setVisibility(View.VISIBLE);

            int sliderWidth = (int) (width * 0.86);
            LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(sliderWidth, LayoutParams.WRAP_CONTENT);
            dim_slider_cover.setLayoutParams(params);

            TextView dim_value = (TextView) findViewById(R.id.dim_value);
            deviceStateValue = (deviceStateValue == null || deviceStateValue.trim().isEmpty()) ? "0" : deviceStateValue;
            int slidervalue = deviceUtils.toSliderValue(Integer.parseInt(deviceStateValue));

            Slider dim_slider = (Slider) findViewById(R.id.dim_slider);

            float currentDimValue = dim_slider.getValue();
            float nextDimValue = Float.parseFloat(deviceStateValue);
            // Setting over and over will trigger "setOnChangeListener" which inturn will result calling API and cause infinite cycle.
            if (nextDimValue != currentDimValue && methodRequested == null) {
                dim_value.setText(String.valueOf(slidervalue)+"%");
                dim_slider.setValue(nextDimValue);
            }

            if (methodRequested != null && state == null && isShowingStatus != 1 && methodRequested.equalsIgnoreCase("16")) {
                int backgroundColorFlash = Color.parseColor("#9C7D69");

                int flashSize = (int) (7 * d);
                Bitmap backgroundFlash = CommonUtilities.getCircularBitmap(flashSize, backgroundColorFlash);
                showFlashIndicatorCommon(R.id.flash_view_common, R.id.flashing_indicator_common, backgroundFlash);
            }
            if (methodRequested != null && isShowingStatus == 1 && methodRequested.equalsIgnoreCase("16")) {
                hideFlashIndicator(R.id.flashing_indicator_common);
            }

            dim_slider.setOnChangeListener(
                    (slider, value) -> {
                        int dimValue = (int) value;
                        if ((int) nextDimValue == dimValue) { // This prevents calling API on slider value reset
                            return;
                        }

                        int newValue = deviceUtils.toSliderValue((int) value);
                        dim_value.setText(String.valueOf(newValue)+"%");

                        if (callEndPointHandler != null) {
                            callEndPointHandler.removeCallbacks(callEndPointRunnable);
                        }

                        // TODO: Workaround since "Slider" does not have an on release listener.
                        callEndPointHandler = new Handler(Looper.getMainLooper());
                        callEndPointRunnable = new Runnable() {
                            @Override
                            public void run() {
                                db.updateDeviceInfo(METHOD_DIM, null, stateValue, 0, secondaryStateValue, widgetId);
                                removeHandlerResetDeviceStateToNull();
                                AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                                updateUI(widgetId);
                                if (!hasRGB) {
                                    NewAppWidget.updateAppWidget(context, widgetManager, widgetId, new HashMap());
                                } else {
                                    if (primarySetting.equalsIgnoreCase("full")) {
                                        NewOnOffWidget.updateAppWidget(context, widgetManager, widgetId, new HashMap());
                                    } else {
                                        Map extraArgs = new HashMap();
                                        NewRGBWidget.updateAppWidget(context, widgetManager, widgetId, new HashMap());
                                    }
                                }

                                createDeviceApi(deviceId, 16, dimValue, widgetId, context);
                            }
                        };
                        callEndPointHandler.postDelayed(callEndPointRunnable, 2000);
                    });

            renderedButtonsCount++;
        }

        showMoreActions = (renderedButtonsCount == 4 ) && (buttonsCount > 5);
        if (hasOn && !hasRGB) {
            View onCover = (View) findViewById(R.id.onCover);
            ImageView onText = (ImageView)findViewById(R.id.iconOn);
            onCover.setVisibility(View.VISIBLE);
            onCover.setElevation(5f);
            onText.setImageBitmap(CommonUtilities.buildTelldusIcon(
                onActionIcon,
                ContextCompat.getColor(context, R.color.brandSecondary),
                160,
                95,
                95,
                context));

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
                    db.updateDeviceInfo(METHOD_ON, null, stateValue, 0, secondaryStateValue, widgetId);
                    removeHandlerResetDeviceStateToNull();
                    AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                    updateUI(widgetId);
                    NewAppWidget.updateAppWidget(context, widgetManager, widgetId, new HashMap());

                    createDeviceApi(deviceId, 1, 0, widgetId, context);
                }
            });

            onCover.setBackgroundResource(R.drawable.button_background);

            if (methodRequested != null && state == null && isShowingStatus != 1 && methodRequested.equals(METHOD_ON)) {
                onCover.setBackgroundResource(R.drawable.button_background_secondary_fill);
                onText.setImageBitmap(CommonUtilities.buildTelldusIcon(
                    onActionIcon,
                    ContextCompat.getColor(context, R.color.white),
                    160,
                    95,
                    95,
                    context));

                showFlashIndicator(R.id.flash_view_on, R.id.flashing_indicator_on, R.drawable.shape_circle_white_fill);
            }
            if (methodRequested != null && isShowingStatus == 1 && methodRequested.equals("1")) {
                if (state != null && state.equals("1")) {
                    onText.setImageBitmap(CommonUtilities.buildTelldusIcon(
                        "statuscheck",
                        ContextCompat.getColor(context, R.color.widgetGreen),
                        160,
                        95,
                        95,
                        context));
                } else {
                    onText.setImageBitmap(CommonUtilities.buildTelldusIcon(
                        "statusx",
                        ContextCompat.getColor(context, R.color.widgetRed),
                        160,
                        95,
                        95,
                        context));
                }
                hideFlashIndicator(R.id.flashing_indicator_on);
            }
            renderedButtonsCount++;
        }

        if (hasRGB) {
            String rgbControl = primarySetting == null ? "picker" : primarySetting;

            String swatchColors[] = Constants.swatchColors;

            FrameLayout rgb_cover =  findViewById(R.id.rgb_control_cover);
            rgb_cover.setVisibility(View.VISIBLE);

            int space = (int)(d * 8 * 6);
            int swatchSize = (int) ((width - space)/ 6);

            LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(swatchSize, swatchSize);

            if (rgbControl.equalsIgnoreCase("picker") || rgbControl.equalsIgnoreCase("full")) {
                ColorPickerView color_picker = findViewById(R.id.colorPickerView);
                color_picker.setVisibility(View.VISIBLE);
                color_picker.setActionMode(ActionMode.LAST);
                color_picker.setColorListener(new ColorEnvelopeListener() {
                    @Override
                    public void onColorSelected(ColorEnvelope envelope, boolean fromUser) {
                        if (fromUser) {
                            rgbSelectedSwatch = null;

                            int pickedColor = envelope.getColor();
                            currentColorControlled = pickedColor;
                            int r = Color.red(pickedColor), g = Color.green(pickedColor), b = Color.blue(pickedColor);

                            db.updateDeviceInfo(String.valueOf(METHOD_RGB), null, stateValue, 0, secondaryStateValue, widgetId);
                            removeHandlerResetDeviceStateToNull();

                            updateUI(widgetId);

                            Map extraArgs = new HashMap();
                            extraArgs.put("colorControlledFromModal", currentColorControlled);

                            AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                            if (primarySetting.equalsIgnoreCase("full")) {
                                NewOnOffWidget.updateAppWidget(context, widgetManager, widgetId, extraArgs);
                            } else {
                                NewRGBWidget.updateAppWidget(context, widgetManager, widgetId, extraArgs);
                            }

                            Map rgb = new HashMap<String, Object>();
                            rgb.put("r", r);
                            rgb.put("g", g);
                            rgb.put("b", b);
                            createDeviceApiRGB(deviceId, METHOD_RGB, rgb, widgetId, context);
                        }
                    }
                });
                color_picker.getViewTreeObserver()
                        .addOnGlobalLayoutListener(new ViewTreeObserver.OnGlobalLayoutListener() {
                            @Override
                            public void onGlobalLayout() {
                                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN) {
                                    color_picker.getViewTreeObserver().removeOnGlobalLayoutListener(this);
                                }
                                else {
                                    color_picker.getViewTreeObserver().removeGlobalOnLayoutListener(this);
                                }
                                if (methodRequested == null && secondaryStateValue != null) {
                                    int currentColor = Color.parseColor(deviceUtils.getMainColorRGB(Integer.parseInt(secondaryStateValue, 10)));
                                    color_picker.selectByHsv(currentColor);
                                }
                            }
                        });
                int sizeColorPicker = (int) (width * 0.6);
                LinearLayout.LayoutParams paramsCPicker = new LinearLayout.LayoutParams(sizeColorPicker, sizeColorPicker);
                paramsCPicker.setMargins((int) (d * 8), (int) (d * 4), (int) (d * 4), (int) (d * 8));
                color_picker.setLayoutParams(paramsCPicker);

                if (methodRequested != null && state == null && isShowingStatus != 1 && methodRequested.equals(String.valueOf(METHOD_RGB))) {
                    int backgroundColorFlash = Color.parseColor("#9C7D69");
                    if (!deviceUtils.isLightColor(currentColorControlled)) {
                        backgroundColorFlash = currentColorControlled;
                    }

                    int flashSize = (int) (7 * d);
                    Bitmap backgroundFlash = CommonUtilities.getCircularBitmap(flashSize, backgroundColorFlash);
                    showFlashIndicatorCommon(R.id.flash_view_common, R.id.flashing_indicator_common, backgroundFlash);
                }
                if (methodRequested != null && isShowingStatus == 1 && methodRequested.equals(String.valueOf(METHOD_RGB))) {
                    hideFlashIndicator(R.id.flashing_indicator_common);
                }
            }

            if (rgbControl.equalsIgnoreCase("swatch") || rgbControl.equalsIgnoreCase("full")) {
                FlexboxLayout insertPoint = (FlexboxLayout) findViewById(R.id.rgb_control_cover_inner);
                insertPoint.setVisibility(View.VISIBLE);
                insertPoint.removeAllViews();

                for (int i = 0; i < swatchColors.length; i++) {
                    params.setMargins((int)(d * 8), (int)(d * 4), 0, (int)(d * 4));

                    LinearLayout swatch = new LinearLayout(this);
                    swatch.setLayoutParams(params);
                    swatch.setBackgroundColor(Color.parseColor(swatchColors[i]));

                    GradientDrawable border = new GradientDrawable();
                    border.setColor(Color.parseColor(swatchColors[i]));
                    if (rgbSelectedSwatch != null && rgbSelectedSwatch.equalsIgnoreCase(swatchColors[i])) {
                        border.setStroke(3, Color.parseColor("#000000"));
                    } else {
                        border.setStroke(1, Color.parseColor("#cccccc"));
                    }
                    border.setCornerRadius(swatchSize / 2);
                    swatch.setBackground(border);

                    swatch.setId(i);
                    swatch.setOnClickListener(new View.OnClickListener() {
                        @Override
                        public void onClick(View view) {
                            int id  = view.getId();
                            rgbSelectedSwatch = swatchColors[id];
                            int pickedColor = Color.parseColor(swatchColors[id]);
                            currentColorControlled = pickedColor;
                            int r = Color.red(pickedColor), g = Color.green(pickedColor), b = Color.blue(pickedColor);

                            db.updateDeviceInfo(String.valueOf(METHOD_RGB), null, stateValue, 0, secondaryStateValue, widgetId);
                            removeHandlerResetDeviceStateToNull();

                            updateUI(widgetId);

                            Map extraArgs = new HashMap();
                            extraArgs.put("colorControlledFromModal", currentColorControlled);

                            AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                            if (primarySetting.equalsIgnoreCase("full")) {
                                NewOnOffWidget.updateAppWidget(context, widgetManager, widgetId, extraArgs);
                            } else {
                                NewRGBWidget.updateAppWidget(context, widgetManager, widgetId, extraArgs);
                            }

                            ColorPickerView colorPicker = findViewById(R.id.colorPickerView);
                            if (colorPicker != null) {
                                colorPicker.selectByHsv(pickedColor);
                            }

                            Map rgb = new HashMap<String, Object>();
                            rgb.put("r", r);
                            rgb.put("g", g);
                            rgb.put("b", b);
                            createDeviceApiRGB(deviceId, METHOD_RGB, rgb, widgetId, context);
                        }
                    });

                    insertPoint.addView(swatch);

                    if (methodRequested != null && state == null && isShowingStatus != 1 && methodRequested.equals(String.valueOf(METHOD_RGB))) {
                        int backgroundColorFlash = Color.parseColor("#9C7D69");
                        if (!deviceUtils.isLightColor(currentColorControlled)) {
                            backgroundColorFlash = currentColorControlled;
                        }

                        int flashSize = (int) (7 * d);
                        Bitmap backgroundFlash = CommonUtilities.getCircularBitmap(flashSize, backgroundColorFlash);
                        showFlashIndicatorCommon(R.id.flash_view_common, R.id.flashing_indicator_common, backgroundFlash);
                    }
                    if (methodRequested != null && isShowingStatus == 1 && methodRequested.equals(String.valueOf(METHOD_RGB))) {
                        hideFlashIndicator(R.id.flashing_indicator_common);
                    }
                }
            }
        }
    }

    public void showFlashIndicator(int visibleFlashId, int flashId, int drawable) {
        hideAllFlashIndicators();

        findViewById(visibleFlashId).setBackgroundResource(drawable);
        findViewById(flashId).setVisibility(View.VISIBLE);
    }

    public void showFlashIndicatorCommon(int visibleFlashId, int flashId, Bitmap drawable) {
        hideAllFlashIndicators();

        ImageView im = (ImageView) findViewById(visibleFlashId);
        im.setImageBitmap(drawable);
        findViewById(flashId).setVisibility(View.VISIBLE);
    }

    public void hideFlashIndicator(int flashId) {
        findViewById(flashId).setVisibility(View.GONE);
    }

    public void hideAllFlashIndicators() {
        Integer[] primaryShadedButtons = new Integer[]{
            R.id.flashing_indicator_on,
            R.id.flashing_indicator_off,
            R.id.flashing_indicator_bell,
            R.id.flashing_indicator_up,
            R.id.flashing_indicator_down,
            R.id.flashing_indicator_stop,
            R.id.flashing_indicator_common,
            };

        List<Integer> list = Arrays.asList(primaryShadedButtons);

        for (int i = 0; i < list.size(); i++) {
            int id = list.get(i);
            View v = findViewById(id);
            if (v != null) {
                v.setVisibility(View.GONE);
            }
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
        final MyDBHandler db = new MyDBHandler(context);

        DeviceInfo widgetInfo = db.findWidgetInfoDevice(widgetId);
        Integer methods = widgetInfo.getDeviceMethods();
        Map<String, Boolean> supportedMethods = deviceUtils.getSupportedMethods(methods);
        Boolean hasRGB = ((supportedMethods.get("RGB") != null) && supportedMethods.get("RGB"));

        deviceAPI.setDeviceState(deviceId, method, value, widgetId, context, API_TAG, new OnAPITaskComplete() {
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
                resetDeviceStateToNull(deviceId, widgetId, context, method);
                AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                updateUI(widgetId);

                if (hasRGB) {
                    String primarySetting = widgetInfo.getPrimarySetting();
                    if (primarySetting.equalsIgnoreCase("full")) {
                        NewOnOffWidget.updateAppWidget(context, widgetManager, widgetId, new HashMap());
                    } else {
                        NewRGBWidget.updateAppWidget(context, widgetManager, widgetId, new HashMap());
                    }
                } else {
                    NewAppWidget.updateAppWidget(context, widgetManager, widgetId, new HashMap());
                }
            }
            @Override
            public void onError(ANError error) {
                db.updateIsShowingStatus(1, widgetId);
                resetDeviceStateToNull(deviceId, widgetId, context, method);
                AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                updateUI(widgetId);

                if (hasRGB) {
                    String primarySetting = widgetInfo.getPrimarySetting();
                    if (primarySetting.equalsIgnoreCase("full")) {
                        NewOnOffWidget.updateAppWidget(context, widgetManager, widgetId, new HashMap());
                    } else {
                        NewRGBWidget.updateAppWidget(context, widgetManager, widgetId, new HashMap());
                    }
                } else {
                    NewAppWidget.updateAppWidget(context, widgetManager, widgetId, new HashMap());
                }
            }
        });
    }

    public void createDeviceApiRGB(final int deviceId, int method, final Map rgb, final int widgetId, final Context context) {
        PrefManager prefManager = new PrefManager(context);
        final MyDBHandler db = new MyDBHandler(context);

        DeviceInfo widgetInfo = db.findWidgetInfoDevice(widgetId);
        String primarySetting = widgetInfo.getPrimarySetting();

        deviceAPI.setDeviceStateRGB(deviceId, method, rgb, widgetId, context, API_TAG, new OnAPITaskComplete() {
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
                resetDeviceStateToNull(deviceId, widgetId, context, method);
                AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                rgbSelectedSwatch = null;
                updateUI(widgetId);

                if (primarySetting.equalsIgnoreCase("full")) {
                    NewOnOffWidget.updateAppWidget(context, widgetManager, widgetId, new HashMap());
                } else {
                    NewRGBWidget.updateAppWidget(context, widgetManager, widgetId, new HashMap());
                }
            }
            @Override
            public void onError(ANError error) {
                db.updateIsShowingStatus(1, widgetId);
                resetDeviceStateToNull(deviceId, widgetId, context, method);
                AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                rgbSelectedSwatch = null;
                updateUI(widgetId);

                if (primarySetting.equalsIgnoreCase("full")) {
                    NewOnOffWidget.updateAppWidget(context, widgetManager, widgetId, new HashMap());
                } else {
                    NewRGBWidget.updateAppWidget(context, widgetManager, widgetId, new HashMap());
                }
            }
        });
    }

    public void resetDeviceStateToNull(final int deviceId, final int widgetId, final Context context, int method) {
        handlerResetDeviceStateToNull = new Handler(Looper.getMainLooper());
        runnableResetDeviceStateToNull = new Runnable() {
            @Override
            public void run() {
                MyDBHandler db = new MyDBHandler(context);
                DeviceInfo widgetInfo = db.findWidgetInfoDevice(widgetId);
                if (widgetInfo != null && widgetInfo.getIsShowingStatus() == 1) {
                    String secondaryStateValue = widgetInfo.getSecondaryStateValue();
                    String stateValue = widgetInfo.getDeviceStateValue();
                    db.updateDeviceInfo(null, null, stateValue, 0, secondaryStateValue, widgetId);
                    AppWidgetManager widgetManager = AppWidgetManager.getInstance(context);
                    updateUI(widgetId);

                    Integer methods = widgetInfo.getDeviceMethods();
                    Map<String, Boolean> supportedMethods = deviceUtils.getSupportedMethods(methods);
                    Boolean hasRGB = ((supportedMethods.get("RGB") != null) && supportedMethods.get("RGB"));
                    if (hasRGB) {
                        String primarySetting = widgetInfo.getPrimarySetting();
                        if (primarySetting.equalsIgnoreCase("full")) {
                            NewOnOffWidget.updateAppWidget(context, widgetManager, widgetId, new HashMap());
                        } else {
                            NewRGBWidget.updateAppWidget(context, widgetManager, widgetId, new HashMap());
                        }
                    } else {
                        NewAppWidget.updateAppWidget(context, widgetManager, widgetId, new HashMap());
                    }
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
