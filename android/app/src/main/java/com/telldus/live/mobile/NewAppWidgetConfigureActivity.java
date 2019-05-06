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
import android.os.Bundle;
import android.graphics.Typeface;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.CompoundButton;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;
import android.view.Gravity;
import android.widget.RadioButton;
import android.support.v4.content.ContextCompat;

import com.androidnetworking.error.ANError;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.telldus.live.mobile.Database.MyDBHandler;
import com.telldus.live.mobile.Database.PrefManager;
import com.telldus.live.mobile.Model.DeviceInfo;
import com.telldus.live.mobile.Utility.DevicesUtilities;
import com.telldus.live.mobile.API.API;
import com.telldus.live.mobile.API.OnAPITaskComplete;

/**
 * The configuration screen for the {@link NewAppWidget NewAppWidget} AppWidget.
 */
public class NewAppWidgetConfigureActivity extends Activity {

    private static final String ACTION_ON = "ACTION_ON";
    private static final String ACTION_OFF = "ACTION_OFF";
    private ProgressDialog pDialog;
    CharSequence[] deviceNameList = null;
    List<String> nameListItems = new ArrayList<String>();
    Map<Integer, Map> DeviceInfoMap = new HashMap<Integer, Map>();
    Integer id;
    Integer deviceSupportedMethods = 0;
    String deviceTypeCurrent, deviceStateValueCurrent;

    public int selectedDeviceIndex;

    MyDBHandler db = new MyDBHandler(this);

    List<String> idList = new ArrayList<String>();
    CharSequence[] deviceIdList = null;

    //UI

    int mAppWidgetId = AppWidgetManager.INVALID_APPWIDGET_ID;

    private Button btAdd,btnCan;
    private View btSelectDevice, screenCover;
    TextView deviceName, deviceHint, deviceOn, deviceOff, chooseSetting, textTest, deviceText, themeText, tvIcon1;
    ImageView deviceState;
    private AppWidgetManager widgetManager;

    private String accessToken;
    private String expiresIn;
    private String refreshToken;

    private String client_ID;
    private String client_secret;

    int stateID;

    private String sesID;
    MyDBHandler database = new MyDBHandler(this);
    private PrefManager prefManager;
    private String switchStatus = "false";
    private RelativeLayout mBackLayout;

    RadioButton radio_def;
    RadioButton radio_dark;
    RadioButton radio_light;

    TextView text_default;
    TextView text_trans_dark;
    TextView text_trans_light;

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
            Intent basicActivity = new Intent(getApplicationContext(), BasicUserActivity.class);
            basicActivity.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            basicActivity.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TASK);
            getApplicationContext().startActivity(basicActivity);
            return;
        }

        createDeviceApi();

        setResult(RESULT_CANCELED);
        setContentView(R.layout.activity_device_widget_configure);

        String message = getResources().getString(R.string.reserved_widget_android_loading)+"...";
        updateUI(message);
    }

    public void updateUI(String message) {
        mBackLayout = (RelativeLayout)findViewById(R.id.deviceBack);
        mBackLayout.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });

        View infoView = (View)findViewById(R.id.infoView);
        TextView infoText = (TextView)findViewById(R.id.infoText);
        screenCover = (View)findViewById(R.id.screenCover);
        if (DeviceInfoMap.size() == 0) {
            infoView.setVisibility(View.VISIBLE);
            infoText.setText(message);
            screenCover.setVisibility(View.GONE);
        } else {
            widgetManager = AppWidgetManager.getInstance(this);

            infoView.setVisibility(View.GONE);
            screenCover.setVisibility(View.VISIBLE);

            textTest = (TextView)findViewById(R.id.testText);
            chooseSetting = (TextView)findViewById(R.id.chooseSetting);
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

            radio_def = (RadioButton)findViewById(R.id.radio_def);
            radio_dark = (RadioButton)findViewById(R.id.radio_dark);
            radio_light = (RadioButton)findViewById(R.id.radio_light);

            text_default = (TextView)findViewById(R.id.text_default);
            text_trans_dark = (TextView)findViewById(R.id.text_trans_dark);
            text_trans_light = (TextView)findViewById(R.id.text_trans_light);

            radio_def.setChecked(true);
            View def_cover = (View)findViewById(R.id.def_cover);
            def_cover.setBackground(getResources().getDrawable(R.drawable.shape_border_round_sec));
            text_default.setTextColor(ContextCompat.getColor(getApplicationContext(), R.color.brandSecondary));


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
                    String methodRequested = null;
                    String deviceCurrentState = null;
                    DeviceInfo mInsert = new DeviceInfo(
                        deviceCurrentState,
                        mAppWidgetId,
                        id,
                        deviceName.getText().toString(),
                        deviceSupportedMethods,
                        deviceTypeCurrent,
                        deviceStateValueCurrent,
                        switchStatus,
                        currentUserId,
                        methodRequested,
                        0);
                    db.addWidgetDevice(mInsert);
                    NewAppWidget.updateAppWidget(getApplicationContext(),widgetManager,mAppWidgetId);

                    Intent resultValue = new Intent();
                    // Set the results as expected from a 'configure activity'.
                    resultValue.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, mAppWidgetId);
                    setResult(RESULT_OK, resultValue);
                    finish();
                }
            });

            btSelectDevice.setOnClickListener(new View.OnClickListener() {
                AlertDialog ad;
                DevicesUtilities deviceUtils = new DevicesUtilities();
                public void onClick(View view) {
                    final AlertDialog.Builder builder = new AlertDialog.Builder(NewAppWidgetConfigureActivity.this, R.style.MaterialThemeDialog);
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
                                String deviceIcon = deviceUtils.getDeviceIcons(deviceTypeCurrent);
                                tvIcon1.setText(deviceIcon);

                                ad.dismiss();
                            }
                        });
                    ad = builder.show();
                }
            });

            Typeface titleFont = Typeface.createFromAsset(getAssets(),"fonts/RobotoLight.ttf");
            Typeface subtitleFont = Typeface.createFromAsset(getAssets(),"fonts/Roboto-Regular.ttf");
            textTest.setTypeface(titleFont);
            deviceText.setText(getResources().getString(R.string.reserved_widget_android_labelDevice)+":");
            themeText.setText(getResources().getString(R.string.reserved_widget_android_theme)+":");
            chooseSetting.setTypeface(titleFont);
        }
    }

     public void onRadioButtonClicked(View view) {
        // Is the button now checked?
        boolean checked = ((RadioButton) view).isChecked();

        View def_cover = (View)findViewById(R.id.def_cover);
        View dark_cover = (View)findViewById(R.id.dark_cover);
        View light_cover = (View)findViewById(R.id.light_cover);


        // Check which radio button was clicked
        switch(view.getId()) {
            case R.id.radio_def:
                if (checked) {
                    radio_dark.setChecked(false);
                    radio_light.setChecked(false);

                    def_cover.setBackground(getResources().getDrawable(R.drawable.shape_border_round_sec));
                    dark_cover.setBackground(getResources().getDrawable(R.drawable.shape_border_round_gray));
                    light_cover.setBackground(getResources().getDrawable(R.drawable.shape_border_round_gray_fill_prim));

                    text_default.setTextColor(ContextCompat.getColor(getApplicationContext(), R.color.brandSecondary));
                    text_trans_dark.setTextColor(ContextCompat.getColor(getApplicationContext(), R.color.gray));
                    text_trans_light.setTextColor(ContextCompat.getColor(getApplicationContext(), R.color.gray));
                }
                break;
            case R.id.radio_dark:
                if (checked) {
                    radio_def.setChecked(false);
                    radio_light.setChecked(false);

                    def_cover.setBackground(getResources().getDrawable(R.drawable.shape_border_round_gray));
                    dark_cover.setBackground(getResources().getDrawable(R.drawable.shape_border_round_sec));
                    light_cover.setBackground(getResources().getDrawable(R.drawable.shape_border_round_gray_fill_prim));

                    text_default.setTextColor(ContextCompat.getColor(getApplicationContext(), R.color.gray));
                    text_trans_dark.setTextColor(ContextCompat.getColor(getApplicationContext(), R.color.brandSecondary));
                    text_trans_light.setTextColor(ContextCompat.getColor(getApplicationContext(), R.color.gray));
                }
                break;
            case R.id.radio_light:
                if (checked) {
                    radio_dark.setChecked(false);
                    radio_def.setChecked(false);

                    def_cover.setBackground(getResources().getDrawable(R.drawable.shape_border_round_gray));
                    dark_cover.setBackground(getResources().getDrawable(R.drawable.shape_border_round_gray));
                    light_cover.setBackground(getResources().getDrawable(R.drawable.shape_border_round_sec_fill_prim));

                    text_default.setTextColor(ContextCompat.getColor(getApplicationContext(), R.color.gray));
                    text_trans_dark.setTextColor(ContextCompat.getColor(getApplicationContext(), R.color.gray));
                    text_trans_light.setTextColor(ContextCompat.getColor(getApplicationContext(), R.color.brandSecondary));
                }
                break;
        }
    }

    void createDeviceApi() {
        String params = "/devices/list?supportedMethods=951&includeIgnored=1&extras=devicetype,transport,room";
        API endPoints = new API();
        endPoints.callEndPoint(getApplicationContext(), params, new OnAPITaskComplete() {
            @Override
            public void onSuccess(final JSONObject response) {
                String message = getResources().getString(R.string.reserved_widget_android_message_add_widget_no_device_3);
                try {

                    DevicesUtilities deviceUtils = new DevicesUtilities();

                    JSONObject deviceData = new JSONObject(response.toString());
                    JSONArray deviceList = deviceData.getJSONArray("device");

                    for (int i = 0; i < deviceList.length(); i++) {
                        JSONObject curObj = deviceList.getJSONObject(i);
                        String name = curObj.getString("name");
                        stateID = curObj.getInt("state");
                        Integer methods = curObj.getInt("methods");
                        String deviceType = curObj.getString("deviceType");
                        // ToDo : Only statevalue(String) is handled at widget side.
                        // The app has migrated to new/future data structure
                        // "statevalues"(Object).
                        String stateValue = curObj.getString("statevalue");

                        Map<String, Boolean> supportedMethods = deviceUtils.getSupportedMethods(methods);
                        Integer sizeSuppMeth = supportedMethods.size();
                        Boolean hasLearn = supportedMethods.get("LEARN");
                        if (hasLearn != null && hasLearn) {
                            sizeSuppMeth = sizeSuppMeth - 1;
                        }
                        Boolean showDevice = sizeSuppMeth > 2;

                        if (showDevice) {
                            Integer id = curObj.getInt("id");
                            nameListItems.add(name);
                            idList.add(id.toString());

                            Map<String, Object> info = new HashMap<String, Object>();
                            info.put("state", String.valueOf(stateID));
                            info.put("methods", methods);
                            info.put("name", name);
                            info.put("deviceType", deviceType);
                            info.put("stateValue", stateValue);
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
