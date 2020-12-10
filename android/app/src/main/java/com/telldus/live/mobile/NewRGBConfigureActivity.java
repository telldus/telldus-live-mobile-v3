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
import android.app.AlertDialog;
import android.app.ProgressDialog;
import android.appwidget.AppWidgetManager;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.res.Resources;
import android.graphics.Color;
import android.graphics.drawable.GradientDrawable;
import android.os.Bundle;
import android.graphics.Typeface;
import android.view.View;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.RelativeLayout;
import android.widget.TextView;
import android.widget.Toast;
import android.view.Gravity;
import android.widget.RadioButton;
import androidx.core.content.ContextCompat;

import com.androidnetworking.error.ANError;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.google.android.flexbox.FlexboxLayout;
import com.google.android.material.slider.Slider;
import com.telldus.live.mobile.Database.MyDBHandler;
import com.telldus.live.mobile.Database.PrefManager;
import com.telldus.live.mobile.Model.DeviceInfo;
import com.telldus.live.mobile.Utility.Constants;
import com.telldus.live.mobile.Utility.DevicesUtilities;
import com.telldus.live.mobile.API.API;
import com.telldus.live.mobile.API.OnAPITaskComplete;
import com.telldus.live.mobile.API.GatewaysAPI;

/**
 * The configuration screen for the {@link NewRGBWidget NewRGBWidget} AppWidget.
 */
public class NewRGBConfigureActivity extends Activity {

    private static final String ACTION_ON = "ACTION_ON";
    private static final String ACTION_OFF = "ACTION_OFF";
    private ProgressDialog pDialog;
    CharSequence[] deviceNameList = null;
    List<String> nameListItems = new ArrayList<String>();
    Map<Integer, Map> DeviceInfoMap = new HashMap<Integer, Map>();
    Integer id;
    Integer deviceSupportedMethods = 0;
    String deviceTypeCurrent, deviceStateValueCurrent, secondaryStateValue;

    public int selectedDeviceIndex;

    MyDBHandler db = new MyDBHandler(this);

    List<String> idList = new ArrayList<String>();
    CharSequence[] deviceIdList = null;

    //UI

    int mAppWidgetId = AppWidgetManager.INVALID_APPWIDGET_ID;

    private Button btAdd,btnCan;
    private View btSelectDevice, screenCover;
    TextView deviceName, deviceHint, navPosterh2, navPosterh1, deviceText, themeText, tvIcon1;
    private AppWidgetManager widgetManager;

    private String accessToken;
    private String primarySetting = "picker", secondarySetting = null;

    int stateID;

    private String sesID;
    MyDBHandler database = new MyDBHandler(this);
    private PrefManager prefManager;
    private RelativeLayout navBackButton;

    View def_cover,
            dark_cover,
            light_cover,
            rgb_control_options;

    RadioButton radio_def,
            radio_dark,
            radio_light;

    TextView text_default,
            text_trans_dark,
            text_trans_light,
            rgb_control_options_label;

    ImageView image_def, image_dark, image_light;

    DevicesUtilities deviceUtils = new DevicesUtilities();

    @Override
    public void onCreate(Bundle icicle) {
        super.onCreate(icicle);
        prefManager = new PrefManager(this);
        accessToken = prefManager.getAccessToken();
        if (accessToken == "") {
            Intent launchActivity = new Intent(getApplicationContext(), MainActivity.class);
            launchActivity.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            launchActivity.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TASK);
            getApplicationContext().startActivity(launchActivity);
            return;
        }

        int pro = prefManager.getPro();
        long now = new Date().getTime() / 1000;
        if (pro == -1 || pro < now) {
           Intent mainActivity = new Intent(getApplicationContext(), MainActivity.class);
            mainActivity.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            mainActivity.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TASK);
            getApplicationContext().startActivity(mainActivity);
            WidgetModule.setOpenPurchase(true);
            return;
        }

        createDeviceApi();
        GatewaysAPI gatewaysAPI = new GatewaysAPI();
        gatewaysAPI.cacheGateways(getApplicationContext());

        setResult(RESULT_CANCELED);
        setContentView(R.layout.activity_device_widget_configure);

        String message = getResources().getString(R.string.reserved_widget_android_loading)+"...";
        updateUI(message);
    }

    public void updateUI(String message) {
        navBackButton = (RelativeLayout)findViewById(R.id.navBackButton);
        navBackButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });

        View infoView = (View)findViewById(R.id.infoView);
        TextView infoText = (TextView)findViewById(R.id.infoText);
        screenCover = (View)findViewById(R.id.screenCover);

        navPosterh1 = (TextView)findViewById(R.id.navPosterh1);
        navPosterh2 = (TextView)findViewById(R.id.navPosterh2);
        Typeface titleFont = Typeface.createFromAsset(getAssets(),"fonts/RobotoLight.ttf");
        Typeface subtitleFont = Typeface.createFromAsset(getAssets(),"fonts/Roboto-Regular.ttf");
        navPosterh1.setTypeface(titleFont);
        navPosterh2.setTypeface(titleFont);
        navPosterh1.setText(getResources().getString(R.string.reserved_widget_android_device_configure_header_one));
        navPosterh2.setText(getResources().getString(R.string.reserved_widget_android_configure_header_two));

        if (DeviceInfoMap.size() == 0) {
            infoView.setVisibility(View.VISIBLE);
            infoText.setText(message);
            screenCover.setVisibility(View.GONE);
        } else {
            widgetManager = AppWidgetManager.getInstance(this);

            infoView.setVisibility(View.GONE);
            screenCover.setVisibility(View.VISIBLE);

            deviceName = (TextView) findViewById(R.id.txtDeviceName);
            deviceHint = (TextView) findViewById(R.id.txtDeviceHint);
            btnCan = (Button)findViewById(R.id.btn_cancel);
            btAdd = (Button) findViewById(R.id.btAdd);
            btSelectDevice = (View) findViewById(R.id.btSelectDevice);
            deviceText = (TextView)findViewById(R.id.deviceText);
            themeText = (TextView)findViewById(R.id.themeText);

            tvIcon1 = (TextView) findViewById(R.id.tvIcon1);
            tvIcon1.setText("device-alt");

            btnCan.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    finish();
                }
            });

            def_cover = (View)findViewById(R.id.def_cover);
            dark_cover = (View)findViewById(R.id.dark_cover);
            light_cover = (View)findViewById(R.id.light_cover);

            radio_def = (RadioButton)findViewById(R.id.radio_def);
            radio_dark = (RadioButton)findViewById(R.id.radio_dark);
            radio_light = (RadioButton)findViewById(R.id.radio_light);

            text_default = (TextView)findViewById(R.id.text_default);
            text_trans_dark = (TextView)findViewById(R.id.text_trans_dark);
            text_trans_light = (TextView)findViewById(R.id.text_trans_light);

            image_def = (ImageView)findViewById(R.id.image_def);
            image_dark = (ImageView)findViewById(R.id.image_dark);
            image_light = (ImageView)findViewById(R.id.image_light);

            image_def.setImageResource(R.drawable.widget_rgb_default);
            image_dark.setImageResource(R.drawable.widget_rgb_dark);
            image_light.setImageResource(R.drawable.widget_rgb_light);

            rgb_control_options = (View)findViewById(R.id.rgb_control_options);
            rgb_control_options.setVisibility(View.VISIBLE);
            rgb_control_options_label = (TextView)findViewById(R.id.rgb_control_options_label);
            rgb_control_options_label.setVisibility(View.VISIBLE);

            radio_def.setChecked(true);
            View def_cover = (View)findViewById(R.id.def_cover);
            def_cover.setBackground(getResources().getDrawable(R.drawable.shape_border_round_black));
            text_default.setTextColor(ContextCompat.getColor(getApplicationContext(), R.color.black));

            def_cover.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    radio_def.setChecked(true);
                    onPressDefault();
                }
            });
            dark_cover.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    radio_dark.setChecked(true);
                    onPressDark();
                }
            });
            light_cover.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    radio_light.setChecked(true);
                    onPressLight();
                }
            });

            int width = Resources.getSystem().getDisplayMetrics().widthPixels;
            float d = getResources().getDisplayMetrics().density;

            String swatchColors[] = Constants.swatchColors;
            FlexboxLayout insertPoint = (FlexboxLayout) findViewById(R.id.rgb_control_cover_inner);
            insertPoint.removeAllViews();

            LinearLayout dimSliderCover = (LinearLayout) findViewById(R.id.dim_slider_cover);
            Slider dimSlider = (Slider) findViewById(R.id.dim_slider);
            TextView dimV = (TextView) findViewById(R.id.dim_value);
            TextView dim_slider_label = (TextView) findViewById(R.id.dim_slider_label);

            int space = (int)(d * 8 * 6);
            int swatchSize = (int) ((width - space)/ 6);

            int borderWhenActive = (int) (5 * d);
            int borderWhenIdle = (int) (1 * d);
            int borderColor = Color.parseColor("#CCCCCC");

            LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(swatchSize , swatchSize);

            ImageView color_picker = findViewById(R.id.colorPickerView);
            FrameLayout colorPickerViewFakeBG = findViewById(R.id.colorPickerViewFakeBG);

            LinearLayout.LayoutParams paramsCPicker = new LinearLayout.LayoutParams(swatchSize, swatchSize);
            color_picker.setLayoutParams(paramsCPicker);

            FrameLayout.LayoutParams paramsCPickerFBG = new FrameLayout.LayoutParams(swatchSize, swatchSize);
            colorPickerViewFakeBG.setLayoutParams(paramsCPickerFBG);

            GradientDrawable borderCP = new GradientDrawable();
            borderCP.setCornerRadius(swatchSize / 2);
            borderCP.setStroke(borderWhenActive, borderColor);
            colorPickerViewFakeBG.setBackground(borderCP);

            color_picker.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    primarySetting = "picker";
                    for (int i = 0; i < swatchColors.length; i++) {
                        GradientDrawable border = new GradientDrawable();
                        border.setColor(Color.parseColor(swatchColors[i]));
                        border.setCornerRadius(swatchSize / 2);
                        border.setStroke(borderWhenIdle, borderColor);
                        findViewById(i).setBackground(border);
                    }

                    image_def.setImageResource(R.drawable.widget_rgb_default);
                    image_dark.setImageResource(R.drawable.widget_rgb_dark);
                    image_light.setImageResource(R.drawable.widget_rgb_light);

                    LinearLayout.LayoutParams paramsCPickerC = new LinearLayout.LayoutParams(swatchSize, swatchSize);
                    color_picker.setLayoutParams(paramsCPickerC);

                    GradientDrawable borderCP = new GradientDrawable();
                    borderCP.setCornerRadius(swatchSize / 2);
                    borderCP.setStroke(borderWhenActive, borderColor);
                    colorPickerViewFakeBG.setBackground(borderCP);

                    dimSliderCover.setVisibility(View.GONE);
                    secondarySetting = null;
                    dim_slider_label.setVisibility(View.GONE);
                }
            });

            for (int i = 0; i < swatchColors.length; i++) {
                params.setMargins((int)(d * 8), (int)(d * 4), 0, (int)(d * 4));

                LinearLayout swatch = new LinearLayout(this);
                swatch.setLayoutParams(params);
                swatch.setBackgroundColor(Color.parseColor(swatchColors[i]));

                GradientDrawable border = new GradientDrawable();
                border.setColor(Color.parseColor(swatchColors[i]));
                border.setStroke(borderWhenIdle, borderColor);
                border.setCornerRadius(swatchSize / 2);
                swatch.setBackground(border);

                swatch.setId(i);
                swatch.setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View view) {
                        int id  = view.getId();
                        String pickedColor = swatchColors[id];
                        primarySetting = pickedColor;

                        image_def.setImageResource(R.drawable.widget_rgb_preset_default);
                        image_dark.setImageResource(R.drawable.widget_rgb_preset_dark);
                        image_light.setImageResource(R.drawable.widget_rgb_preset_light);

                        for (int i = 0; i < swatchColors.length; i++) {
                            GradientDrawable border = new GradientDrawable();
                            border.setColor(Color.parseColor(swatchColors[i]));
                            border.setCornerRadius(swatchSize / 2);
                            if (id == i) {
                                border.setStroke(borderWhenActive, borderColor);
                                findViewById(i).setBackground(border);
                            } else {
                                border.setStroke(borderWhenIdle, borderColor);
                                findViewById(i).setBackground(border);
                            }
                        }

                        GradientDrawable borderCP = new GradientDrawable();
                        borderCP.setCornerRadius(swatchSize / 2);
                        borderCP.setStroke(borderWhenIdle, borderColor);
                        colorPickerViewFakeBG.setBackground(borderCP);

                        dim_slider_label.setVisibility(View.VISIBLE);
                        if (dimSliderCover.getVisibility() != View.VISIBLE) {
                            dimSliderCover.setVisibility(View.VISIBLE);
                            LinearLayout.LayoutParams paramsDIMC = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
                            paramsDIMC.setMargins((int) (d * 10), (int) (d * 5), (int) (d * 10), 0);
                            dimSliderCover.setLayoutParams(paramsDIMC);
                            dimSliderCover.setElevation((int) (d * 2));
                            dimSliderCover.setBackground(getResources().getDrawable(R.drawable.shape));

                            dimV.setText("0%");
                            secondarySetting = "0";
                        }
                    }
                });
                insertPoint.addView(swatch);
            }

            dimSlider.setOnChangeListener(
                    (slider, value) -> {

                        int newValue = deviceUtils.toSliderValue((int) value);
                        dimV.setText(String.valueOf(newValue)+"%");

                        secondarySetting = String.valueOf(newValue);
                    });


            Intent intent = getIntent();
            Bundle extras = intent.getExtras();
            if (extras != null) {
                mAppWidgetId = extras.getInt(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID);
            }

            // If this activity was started with an intent without an app widget ID, finish with an error.
            if (mAppWidgetId == AppWidgetManager.INVALID_APPWIDGET_ID) {
                finish();
                return;
            }
            final String[] deviceStateVal = {"0"};

            btAdd.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    if (id == null || id == 0) {
                        Toast toast = Toast.makeText(getApplicationContext(),"You have not chosen any device. Please select a device to add as widget.",Toast.LENGTH_LONG);
                        toast.setGravity(Gravity.TOP , 0, 0);
                        toast.show();
                        return;
                    }

                    String currentUserId = prefManager.getUserId();
                    String currentUserUuid = prefManager.getUserUuid();
                    String methodRequested = null;
                    String deviceCurrentState = null;
                    String requestedStateValue = null;
                    String requestedSecStateValue = null;

                    String trans = "default";
                    if (radio_dark.isChecked()) {
                        trans = "dark";
                    }
                    if (radio_light.isChecked()) {
                        trans = "light";
                    }

                    DeviceInfo mInsert = new DeviceInfo(
                        deviceCurrentState,
                        mAppWidgetId,
                        id,
                        deviceName.getText().toString(),
                        deviceSupportedMethods,
                        deviceTypeCurrent,
                        deviceStateValueCurrent,
                        trans,
                        currentUserId,
                        methodRequested,
                        0,
                        0, // As of now required/handled only for thermostats
                        -1, // As of now required/handled only for thermostats
                        -1, // As of now required/handled only for thermostats
                        secondaryStateValue,  // As of now required/handled only for thermostats
                        primarySetting,
                            secondarySetting,
                            requestedStateValue,
                            requestedSecStateValue,
                            currentUserUuid
                    );
                    db.addWidgetDevice(mInsert);
                    NewRGBWidget.updateAppWidget(getApplicationContext(), widgetManager, mAppWidgetId, new HashMap());

                    Intent resultValue = new Intent();
                    // Set the results as expected from a 'configure activity'.
                    resultValue.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, mAppWidgetId);
                    setResult(RESULT_OK, resultValue);
                    finish();
                }
            });

            btSelectDevice.setOnClickListener(new View.OnClickListener() {
                AlertDialog ad;
                public void onClick(View view) {
                    final AlertDialog.Builder builder = new AlertDialog.Builder(NewRGBConfigureActivity.this, R.style.MaterialThemeDialog);
                    builder.setTitle(R.string.reserved_widget_android_pick_device)
                        .setSingleChoiceItems(deviceNameList, selectedDeviceIndex, new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface dialog, int which) {
                                selectedDeviceIndex = which;
                                deviceName.setText(deviceNameList[which]);
                                id = Integer.parseInt(String.valueOf(deviceIdList[which]));

                                Map<String, Object> info = DeviceInfoMap.get(id);

                                deviceSupportedMethods = Integer.parseInt(info.get("methods").toString());

                                deviceTypeCurrent = info.get("deviceType").toString();
                                deviceStateValueCurrent = info.get("stateValue").toString();
                                deviceStateValueCurrent = deviceStateValueCurrent == "null" ? "" : deviceStateValueCurrent;
                                String deviceIcon = deviceUtils.getDeviceIcons(deviceTypeCurrent);
                                tvIcon1.setText(deviceIcon);
                                secondaryStateValue = info.get("secondaryStateValue").toString();

                                ad.dismiss();
                            }
                        });
                    ad = builder.show();
                }
            });

            deviceText.setText(getResources().getString(R.string.reserved_widget_android_labelDevice)+":");
            themeText.setText(getResources().getString(R.string.reserved_widget_android_theme)+":");
        }
    }

    public void onRadioButtonClicked(View view) {
        // Is the button now checked?
        boolean checked = ((RadioButton) view).isChecked();

        // Check which radio button was clicked
        switch(view.getId()) {
            case R.id.radio_def:
                if (checked) {
                    onPressDefault();
                }
                break;
            case R.id.radio_dark:
                if (checked) {
                    onPressDark();
                }
                break;
            case R.id.radio_light:
                if (checked) {
                    onPressLight();
                }
                break;
        }
    }

    public void onPressLight() {
        radio_dark.setChecked(false);
        radio_def.setChecked(false);

        def_cover.setBackground(getResources().getDrawable(R.drawable.shape_border_round_gray));
        dark_cover.setBackground(getResources().getDrawable(R.drawable.shape_border_round_gray));
        light_cover.setBackground(getResources().getDrawable(R.drawable.shape_border_round_sec_fill_prim));

        text_default.setTextColor(ContextCompat.getColor(getApplicationContext(), R.color.gray));
        text_trans_dark.setTextColor(ContextCompat.getColor(getApplicationContext(), R.color.gray));
        text_trans_light.setTextColor(ContextCompat.getColor(getApplicationContext(), R.color.black));
    }

    public void onPressDark() {
        radio_def.setChecked(false);
        radio_light.setChecked(false);

        def_cover.setBackground(getResources().getDrawable(R.drawable.shape_border_round_gray));
        dark_cover.setBackground(getResources().getDrawable(R.drawable.shape_border_round_black));
        light_cover.setBackground(getResources().getDrawable(R.drawable.shape_border_round_gray_fill_prim));

        text_default.setTextColor(ContextCompat.getColor(getApplicationContext(), R.color.gray));
        text_trans_dark.setTextColor(ContextCompat.getColor(getApplicationContext(), R.color.black));
        text_trans_light.setTextColor(ContextCompat.getColor(getApplicationContext(), R.color.gray));
    }

    public void onPressDefault() {
        radio_dark.setChecked(false);
        radio_light.setChecked(false);

        def_cover.setBackground(getResources().getDrawable(R.drawable.shape_border_round_black));
        dark_cover.setBackground(getResources().getDrawable(R.drawable.shape_border_round_gray));
        light_cover.setBackground(getResources().getDrawable(R.drawable.shape_border_round_gray_fill_prim));

        text_default.setTextColor(ContextCompat.getColor(getApplicationContext(), R.color.black));
        text_trans_dark.setTextColor(ContextCompat.getColor(getApplicationContext(), R.color.gray));
        text_trans_light.setTextColor(ContextCompat.getColor(getApplicationContext(), R.color.gray));
    }

    void createDeviceApi() {
        String params = "/devices/list?supportedMethods="+Constants.supportedMethods+"&includeIgnored=1&extras=devicetype,transport,room";
        API endPoints = new API();
        endPoints.callEndPoint(getApplicationContext(), params, "DeviceApi1", new OnAPITaskComplete() {
            @Override
            public void onSuccess(final JSONObject response, HashMap<String, String> authData) {
                String message = getResources().getString(R.string.reserved_widget_android_message_add_widget_no_device_3);
                try {

                    JSONObject deviceData = new JSONObject(response.toString());
                    JSONArray deviceList = deviceData.getJSONArray("device");

                    for (int i = 0; i < deviceList.length(); i++) {
                        JSONObject curObj = deviceList.getJSONObject(i);
                        String name = curObj.getString("name");
                        stateID = curObj.getInt("state");
                        Integer methods = curObj.getInt("methods");
                        String deviceType = curObj.getString("deviceType");

                        JSONArray stateValues = curObj.getJSONArray("stateValues");
                        String secondaryStateValueLoc = "", stateValue = "";
                        if (stateValues != null) {
                            for (int j = 0; j < stateValues.length(); j++) {
                                JSONObject stateAndValue = stateValues.getJSONObject(j);
                                String sState = stateAndValue.optString("state");
                                if (Integer.parseInt(sState, 10) == 16) {
                                    stateValue = stateAndValue.optString("value");
                                }
                                if (Integer.parseInt(sState, 10) == 1024) {
                                    secondaryStateValueLoc = stateAndValue.optString("value");
                                }
                            }
                        }

                        Map<String, Boolean> supportedMethods = deviceUtils.getSupportedMethods(methods);

                        Boolean hasRGB = ((supportedMethods.get("RGB") != null) && supportedMethods.get("RGB"));

                        if (hasRGB) {
                            Integer id = curObj.getInt("id");
                            nameListItems.add(name);
                            idList.add(id.toString());
                            Map<String, Object> info = new HashMap<String, Object>();
                            info.put("state", String.valueOf(stateID));
                            info.put("methods", methods);
                            info.put("name", name);
                            info.put("deviceType", deviceType);
                            info.put("stateValue", stateValue); // DIM value
                            info.put("secondaryStateValue", secondaryStateValueLoc); // RGB value
                            DeviceInfoMap.put(id, info);
                        }
                    }
                    deviceNameList = nameListItems.toArray(new CharSequence[nameListItems.size()]);
                    deviceIdList = idList.toArray(new CharSequence[idList.size()]);

                    message = DeviceInfoMap.size() == 0 ? message : null;
                    updateUI(message);
                } catch (JSONException e) {
                    updateUI(message);
                    e.printStackTrace();
                };
            }
            @Override
            public void onError(ANError error) {
                String message = getResources().getString(R.string.reserved_widget_android_error_networkFailed);
                updateUI(message);
            }
        });
    }
}
