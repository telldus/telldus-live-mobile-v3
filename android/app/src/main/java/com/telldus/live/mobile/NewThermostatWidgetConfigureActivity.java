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
import android.app.ProgressDialog;
import android.appwidget.AppWidgetManager;
import android.content.DialogInterface;
import android.content.Intent;
import android.graphics.Typeface;
import android.os.Bundle;
import androidx.appcompat.app.AlertDialog;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.RadioButton;
import android.widget.RelativeLayout;
import android.widget.TextView;
import android.widget.Toast;
import android.view.Gravity;
import androidx.core.content.ContextCompat;

import com.androidnetworking.error.ANError;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import com.telldus.live.mobile.API.SensorsAPI;
import com.telldus.live.mobile.Database.MyDBHandler;
import com.telldus.live.mobile.Database.PrefManager;
import com.telldus.live.mobile.Model.DeviceInfo;
import com.telldus.live.mobile.Utility.Constants;
import com.telldus.live.mobile.Utility.DevicesUtilities;
import com.telldus.live.mobile.API.API;
import com.telldus.live.mobile.API.OnAPITaskComplete;
import com.telldus.live.mobile.API.GatewaysAPI;

public class NewThermostatWidgetConfigureActivity extends Activity {
    private ProgressDialog pDialog;
    CharSequence[] deviceNameList = null;
    List<String> nameListItems = new ArrayList<String>();
    Map<Integer, Map> DeviceInfoMap = new HashMap<Integer, Map>();
    Integer id;
    Integer deviceSupportedMethods = 0;
    String deviceTypeCurrent;

    MyDBHandler db = new MyDBHandler(this);

    List<String> idList = new ArrayList<String>();
    CharSequence[] deviceIdList = null;

    public int selectedDeviceIndex;
    public int selectedIntervalOptionsIndex = 1;

    //UI
    int mAppWidgetId = AppWidgetManager.INVALID_APPWIDGET_ID;
    private Button btAdd, btnCan;
    private View btSelectDevice, screenCover;
    TextView deviceName, deviceHint, navPosterh2,navPosterh1, deviceText, themeText;
    private AppWidgetManager widgetManager;

    private String accessToken;

    int stateID;
    String deviceCurrentState = null;

    private PrefManager prefManager;
    private RelativeLayout navBackButton;
    TextView tvIcon1;

    View def_cover;
    View dark_cover;
    View light_cover;

    RadioButton radio_def;
    RadioButton radio_dark;
    RadioButton radio_light;

    TextView text_default;
    TextView text_trans_dark;
    TextView text_trans_light;

    private JSONArray JsonsensorList = null;
    private String deviceStateValue = null;

    public static final String ROOT = "fonts/",
            FONTAWESOME = ROOT + "fontawesome-webfont.ttf";


    CharSequence[] intervalOptionsValues = {
            "5", "10", "30", "60",
    };
    int multiplierMilli = 60000;
    private Integer selectInterval = 0;

    ImageView image_def, image_dark, image_light;

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

        setResult(RESULT_CANCELED);
        getAllSensorsAndDevices();
        GatewaysAPI gatewaysAPI = new GatewaysAPI();
        gatewaysAPI.cacheGateways(getApplicationContext());
        setContentView(R.layout.new_on_off_widget_configure);

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
            deviceText = (TextView)findViewById(R.id.deviceText);
            themeText = (TextView)findViewById(R.id.themeText);

            btnCan = (Button)findViewById(R.id.btn_cancel);
            btnCan.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    finish();
                }
            });

            def_cover = (View)findViewById(R.id.def_cover);
            dark_cover = (View)findViewById(R.id.dark_cover);
            light_cover = (View)findViewById(R.id.light_cover);

            text_default = (TextView)findViewById(R.id.text_default);
            text_trans_dark = (TextView)findViewById(R.id.text_trans_dark);
            text_trans_light = (TextView)findViewById(R.id.text_trans_light);

            radio_def = (RadioButton)findViewById(R.id.radio_def);
            radio_dark = (RadioButton)findViewById(R.id.radio_dark);
            radio_light = (RadioButton)findViewById(R.id.radio_light);

            image_def = (ImageView)findViewById(R.id.image_def);
            image_dark = (ImageView)findViewById(R.id.image_dark);
            image_light = (ImageView)findViewById(R.id.image_light);

            image_def.setImageResource(R.drawable.widget_thermostat_default);
            image_dark.setImageResource(R.drawable.widget_thermostat_dark);
            image_light.setImageResource(R.drawable.widget_thermostat_light);

            TextView settingText = (TextView) findViewById(R.id.settingText);
            View btSelectPollInterval = (View)findViewById(R.id.btSelectPollInterval);
            TextView sensorRepeatIntervalLabel = (TextView) findViewById(R.id.labelSelectPoll);

            radio_def.setChecked(true);
            View def_cover = (View)findViewById(R.id.def_cover);
            def_cover.setBackground(getResources().getDrawable(R.drawable.shape_border_round_black));
            text_default.setTextColor(ContextCompat.getColor(getApplicationContext(), R.color.black));

            settingText.setVisibility(View.VISIBLE);
            btSelectPollInterval.setVisibility(View.VISIBLE);
            settingText.setTypeface(subtitleFont);
            settingText.setText(getResources().getString(R.string.reserved_widget_android_settings)+":");

            selectInterval = multiplierMilli * Integer.parseInt(intervalOptionsValues[0].toString());

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

            tvIcon1 = (TextView) findViewById(R.id.tvIcon1);
            tvIcon1.setText("device-alt");

            Intent intent = getIntent();
            Bundle extras = intent.getExtras();
            if (extras != null) {
                mAppWidgetId = extras.getInt(
                        AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID);
            }

            // If this activity was started with an intent without an app widget ID, finish with an error.
            if (mAppWidgetId == AppWidgetManager.INVALID_APPWIDGET_ID) {
                finish();
                return;
            }

            btAdd = (Button) findViewById(R.id.btAdd);
            btAdd.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    if (id == null || id == 0 ) {// ToDo: translate
                        Toast toast = Toast.makeText(getApplicationContext(),"You have not chosen any device. Please select a device to add as widget.",Toast.LENGTH_LONG);
                        toast.setGravity(Gravity.TOP , 0, 0);
                        toast.show();
                        return;
                    }

                    String trans = "default";
                    if (radio_dark.isChecked()) {
                        trans = "dark";
                    }
                    if (radio_light.isChecked()) {
                        trans = "light";
                    }

                    String currentUserId = prefManager.getUserId();
                    String currentUserUuid = prefManager.getUserUuid();
                    String methodRequested = null;
                    String requestedStateValue = null;
                    String requestedSecStateValue = null;

                    Map<String, Object> dInfoMap = DeviceInfoMap.get(id);
                    int clientDeviceId = dInfoMap.get("clientDeviceId") != null ? Integer.parseInt(dInfoMap.get("clientDeviceId").toString(), 10) : -1;
                    int clientId = dInfoMap.get("clientId") != null ? Integer.parseInt(dInfoMap.get("clientId").toString(), 10) : -1;
                    String secondaryStateValue = dInfoMap.get("secondaryStateValue") != null ? dInfoMap.get("secondaryStateValue").toString() : null;

                    DeviceInfo mInsert = new DeviceInfo(
                            deviceCurrentState,
                            mAppWidgetId,
                            id,
                            deviceName.getText().toString(),
                            deviceSupportedMethods,
                            deviceTypeCurrent,
                            deviceStateValue,
                            trans,
                            currentUserId,
                            methodRequested,
                            0,
                            selectInterval,
                            clientDeviceId,
                            clientId,
                            secondaryStateValue,
                            null, // As of now set only for RGB[control option]
                            null, // As of now set only for RGB[control option]
                            requestedStateValue,
                            requestedSecStateValue,
                            currentUserUuid
                        );
                    db.addWidgetDevice(mInsert);

                    NewThermostatWidget.updateAppWidget(getApplicationContext(), widgetManager, mAppWidgetId, new HashMap());

                    Intent resultValue = new Intent();
                    // Set the results as expected from a 'configure activity'.
                    resultValue.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, mAppWidgetId);
                    setResult(RESULT_OK, resultValue);
                    finish();
                }
            });

            btSelectDevice = (View) findViewById(R.id.btSelectDevice);
            btSelectDevice.setOnClickListener(new View.OnClickListener() {
                AlertDialog ad;
                DevicesUtilities deviceUtils = new DevicesUtilities();
                public void onClick(View view) {
                    final AlertDialog.Builder builder = new AlertDialog.Builder(NewThermostatWidgetConfigureActivity.this
                            ,R.style.MaterialThemeDialog);
                    builder.setTitle(R.string.reserved_widget_android_pick_device)
                            .setSingleChoiceItems(deviceNameList, selectedDeviceIndex, new DialogInterface.OnClickListener() {
                                public void onClick(DialogInterface dialog, int which) {
                                    selectedDeviceIndex = which;
                                    deviceName.setText(deviceNameList[which]);
                                    id = Integer.parseInt(String.valueOf(deviceIdList[which]));

                                    Map<String, Object> info = DeviceInfoMap.get(id);

                                    deviceSupportedMethods = Integer.parseInt(info.get("methods").toString());
                                    deviceStateValue = info.get("deviceStateValue") == null ? null : info.get("deviceStateValue").toString();

                                    deviceTypeCurrent = info.get("deviceType").toString();
                                    String deviceIcon = deviceUtils.getDeviceIcons(deviceTypeCurrent);
                                    tvIcon1.setText(deviceIcon);

                                    deviceCurrentState = info.get("state").toString();

                                    Map<String, Boolean> supportedMethods = deviceUtils.getSupportedMethods(deviceSupportedMethods);
                                    Boolean hasThermo = ((supportedMethods.get("THERMOSTAT") != null) && supportedMethods.get("THERMOSTAT"));

                                    ad.dismiss();
                                }
                            });
                    ad = builder.show();
                }
            });

            final CharSequence[] intervalOptions = {
                    getResources().getString(R.string.reserved_widget_android_label_update_interval_0),
                    getResources().getString(R.string.reserved_widget_android_label_update_interval_1),
                    getResources().getString(R.string.reserved_widget_android_label_update_interval_2),
                    getResources().getString(R.string.reserved_widget_android_label_update_interval_3),
            };

            btSelectPollInterval.setOnClickListener(new View.OnClickListener() {
                AlertDialog ad;

                @Override
                public void onClick(View view) {
                    AlertDialog.Builder builder = new AlertDialog.Builder(NewThermostatWidgetConfigureActivity.this, R.style.MaterialThemeDialog);
                    builder.setSingleChoiceItems(intervalOptions, selectedIntervalOptionsIndex, new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialog, int which) {
                            sensorRepeatIntervalLabel.setText(intervalOptions[which]);

                            selectedIntervalOptionsIndex = which;
                            String selected = intervalOptions[which].toString();
                            Integer selectedValue = Integer.parseInt(intervalOptionsValues[which].toString());
                            selectInterval = selectedValue * multiplierMilli;

                            ad.dismiss();
                        }
                    });
                    ad = builder.show();
                }
            });

            deviceName.setTypeface(subtitleFont);
            deviceHint.setTypeface(subtitleFont);
            deviceText.setTypeface(subtitleFont);
            deviceText.setText(getResources().getString(R.string.reserved_widget_android_labelDevice)+":");
            themeText.setText(getResources().getString(R.string.reserved_widget_android_theme)+":");
            themeText.setTypeface(subtitleFont);
            btAdd.setTypeface(subtitleFont);
            btnCan.setTypeface(subtitleFont);
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

    void getAllDevices() {
        String params = "/devices/list?supportedMethods="+Constants.supportedMethods+"&includeIgnored=1&extras=devicetype,transport,room";
        API endPoints = new API();
        endPoints.callEndPoint(getApplicationContext(), params, "DeviceApi2", new OnAPITaskComplete() {
            @Override
            public void onSuccess(final JSONObject response, HashMap<String, String> authData) {
                String message = getResources().getString(R.string.reserved_widget_android_message_add_widget_no_device_2);
                try {

                    String deviceStateValueLocal = null, secondaryStateValue = null;

                    DevicesUtilities deviceUtils = new DevicesUtilities();

                    JSONObject deviceData = new JSONObject(response.toString());
                    JSONArray deviceList = deviceData.getJSONArray("device");

                    for (int i = 0; i < deviceList.length(); i++) {
                        JSONObject curObj = deviceList.getJSONObject(i);
                        String name = curObj.getString("name");
                        stateID = curObj.getInt("state");
                        Integer methods = curObj.getInt("methods");
                        String deviceType = curObj.getString("deviceType");
                        JSONArray stateValues = curObj.getJSONArray("stateValues");

                        Map<String, Boolean> supportedMethods = deviceUtils.getSupportedMethods(methods);
                        Integer sizeSuppMeth = supportedMethods.size();
                        Boolean hasLearn = supportedMethods.get("LEARN");
                        if (hasLearn != null && hasLearn) {
                            sizeSuppMeth = sizeSuppMeth - 1;
                        }

                        Boolean hasThermo = ((supportedMethods.get("THERMOSTAT") != null) && supportedMethods.get("THERMOSTAT"));
                        Boolean showDevice = hasThermo;

                        Integer clientDeviceId = curObj.getInt("clientDeviceId");
                        Integer clientId = curObj.getInt("client");

                        if (hasThermo) {
                            if (JsonsensorList != null) {
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
                                                    deviceStateValueLocal = value;
                                                }
                                            }
                                        }
                                    }
                                    catch (Exception e) {
                                    }
                                }
                            }
                            if (stateValues != null && stateValues.length() > 0) {
                                try {

                                    ArrayList<Map> modes = deviceUtils.getKnownModesThermostat(getApplicationContext());

                                    for (int ii = 0; ii < stateValues.length(); ii++) {

                                        JSONObject stateAndVal = stateValues.getJSONObject(ii);
                                        String item = deviceUtils.methods.get(Integer.parseInt(stateAndVal.getString("state"), 10));

                                        if (item != null && item.equalsIgnoreCase("THERMOSTAT") && stateAndVal.getJSONObject("value") != null) {
                                            JSONObject setpoint = stateAndVal.getJSONObject("value").getJSONObject("setpoint");
                                            if (setpoint != null) {
                                                for (int j = 0; j < modes.size(); j++) {
                                                    Map m = modes.get(j);
                                                    if (setpoint.length() == 1) {

                                                        Iterator<String> setpointKeys = setpoint.keys();
                                                        String setpointKey = setpointKeys.next();
                                                        if (setpointKey.equalsIgnoreCase(m.get("mode").toString())) {
                                                            stateID = Integer.parseInt(m.get("id").toString(), 10);
                                                            secondaryStateValue = setpoint.optString(setpointKey);
                                                        }
                                                    } else {
                                                        if (stateAndVal.getJSONObject("value").getString("mode").equalsIgnoreCase(m.get("mode").toString())) {
                                                            stateID = Integer.parseInt(m.get("id").toString(), 10);
                                                            secondaryStateValue = setpoint.optString(stateAndVal.getJSONObject("value").getString("mode"));
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                catch (Exception e) {
                                }
                            }
                        }

                        if (showDevice) {
                            Integer id = curObj.getInt("id");
                            nameListItems.add(name);
                            idList.add(id.toString());

                            Map<String, Object> info = new HashMap<String, Object>();
                            info.put("state", String.valueOf(stateID));
                            info.put("methods", methods);
                            info.put("name", name);
                            info.put("deviceType", deviceType);
                            info.put("deviceStateValue", deviceStateValueLocal);
                            info.put("secondaryStateValue", secondaryStateValue);
                            info.put("clientDeviceId", clientDeviceId);
                            info.put("clientId", clientId);
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


    void getAllSensorsAndDevices() {
        String params = "/sensors/list?includeValues=1&includeScale=1";
        SensorsAPI sensorsAPI = new SensorsAPI();
        sensorsAPI.getSensorsList(params, getApplicationContext(), "SensorsApi", new OnAPITaskComplete() {
            @Override
            public void onSuccess(final JSONObject response, HashMap<String, String> authData) {
                try {
                    JSONObject sensorData = new JSONObject(response.toString());
                    JsonsensorList = sensorData.getJSONArray("sensor");
                } catch (JSONException e) {
                    e.printStackTrace();
                }
                getAllDevices();
            }
            @Override
            public void onError(ANError error) {
                getAllDevices();
            }
        });
    }
}
