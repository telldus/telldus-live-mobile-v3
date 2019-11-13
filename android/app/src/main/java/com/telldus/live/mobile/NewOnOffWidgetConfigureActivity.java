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
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.graphics.Typeface;
import android.os.Bundle;
import androidx.appcompat.app.AlertDialog;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.CompoundButton;
import android.widget.ImageView;
import android.widget.RadioButton;
import android.widget.RelativeLayout;
import android.widget.Switch;
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
import java.util.List;
import java.util.Map;
import java.text.NumberFormat;
import java.text.DecimalFormat;

import com.telldus.live.mobile.Database.MyDBHandler;
import com.telldus.live.mobile.Database.PrefManager;
import com.telldus.live.mobile.Model.DeviceInfo;
import com.telldus.live.mobile.Utility.DevicesUtilities;
import com.telldus.live.mobile.API.API;
import com.telldus.live.mobile.API.OnAPITaskComplete;

import com.google.android.flexbox.FlexboxLayout;

public class NewOnOffWidgetConfigureActivity extends Activity {
    private static final String ACTION_ON = "ACTION_ON";
    private static final String ACTION_OFF = "ACTION_OFF";
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

    //UI
    int mAppWidgetId = AppWidgetManager.INVALID_APPWIDGET_ID;
    private Button btAdd,btnCan;
    private View btSelectDevice, screenCover;
    TextView deviceName, deviceHint, deviceOn, deviceOff,chooseSetting,textTest, deviceText, themeText;
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
    private ImageView backDevice;
    private RelativeLayout mBackLayout;
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

    public static final String ROOT = "fonts/",
    FONTAWESOME = ROOT + "fontawesome-webfont.ttf";

    public static Typeface getTypeface(Context context, String font) {
        return Typeface.createFromAsset(context.getAssets(), font);
    }

    public static void markAsIconContainer(View v, Typeface typeface) {
        if (v instanceof ViewGroup) {
            ViewGroup vg = (ViewGroup) v;
            for (int i = 0; i < vg.getChildCount(); i++) {
                View child = vg.getChildAt(i);
                markAsIconContainer(child);
            }
        } else if (v instanceof TextView) {
            ((TextView) v).setTypeface(typeface);
        }
    }

    private static void markAsIconContainer(View child) {
    }

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
        createDeviceApi();
        setContentView(R.layout.new_on_off_widget_configure);

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
            backDevice = (ImageView)findViewById(R.id.backdevice);
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

            radio_def.setChecked(true);
            View def_cover = (View)findViewById(R.id.def_cover);
            def_cover.setBackground(getResources().getDrawable(R.drawable.shape_border_round_sec));
            text_default.setTextColor(ContextCompat.getColor(getApplicationContext(), R.color.brandSecondary));

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
                    String methodRequested = null;
                    String deviceCurrentState = null;
                    DeviceInfo mInsert = new DeviceInfo(
                        deviceCurrentState,
                        mAppWidgetId,
                        id,
                        deviceName.getText().toString(),
                        deviceSupportedMethods,
                        deviceTypeCurrent,
                        "", // As of now deviceStateValue does matters for only DIM devices.
                        trans,
                        currentUserId,
                        methodRequested,
                        0);
                    db.addWidgetDevice(mInsert);

                    NewOnOffWidget.updateAppWidget(getApplicationContext(),widgetManager,mAppWidgetId);

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
                    final AlertDialog.Builder builder = new AlertDialog.Builder(NewOnOffWidgetConfigureActivity.this
                            ,R.style.MaterialThemeDialog);
                    builder.setTitle(R.string.reserved_widget_android_pick_device)
                        .setSingleChoiceItems(deviceNameList, selectedDeviceIndex, new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface dialog, int which) {
                                selectedDeviceIndex = which;
                                deviceName.setText(deviceNameList[which]);
                                id = Integer.parseInt(String.valueOf(deviceIdList[which]));

                                Map<String, Object> info = DeviceInfoMap.get(id);

                                deviceSupportedMethods = Integer.parseInt(info.get("methods").toString());

                                deviceTypeCurrent = info.get("deviceType").toString();
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
            chooseSetting.setTypeface(titleFont);
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
        text_trans_light.setTextColor(ContextCompat.getColor(getApplicationContext(), R.color.brandSecondary));
    }

    public void onPressDark() {
        radio_def.setChecked(false);
        radio_light.setChecked(false);

        def_cover.setBackground(getResources().getDrawable(R.drawable.shape_border_round_gray));
        dark_cover.setBackground(getResources().getDrawable(R.drawable.shape_border_round_sec));
        light_cover.setBackground(getResources().getDrawable(R.drawable.shape_border_round_gray_fill_prim));

        text_default.setTextColor(ContextCompat.getColor(getApplicationContext(), R.color.gray));
        text_trans_dark.setTextColor(ContextCompat.getColor(getApplicationContext(), R.color.brandSecondary));
        text_trans_light.setTextColor(ContextCompat.getColor(getApplicationContext(), R.color.gray));
    }

    public void onPressDefault() {
        radio_dark.setChecked(false);
        radio_light.setChecked(false);

        def_cover.setBackground(getResources().getDrawable(R.drawable.shape_border_round_sec));
        dark_cover.setBackground(getResources().getDrawable(R.drawable.shape_border_round_gray));
        light_cover.setBackground(getResources().getDrawable(R.drawable.shape_border_round_gray_fill_prim));

        text_default.setTextColor(ContextCompat.getColor(getApplicationContext(), R.color.brandSecondary));
        text_trans_dark.setTextColor(ContextCompat.getColor(getApplicationContext(), R.color.gray));
        text_trans_light.setTextColor(ContextCompat.getColor(getApplicationContext(), R.color.gray));
    }

    void createDeviceApi() {
        String params = "/devices/list?supportedMethods=4023&includeIgnored=1&extras=devicetype,transport,room";
        API endPoints = new API();
        endPoints.callEndPoint(getApplicationContext(), params, "DeviceApi2", new OnAPITaskComplete() {
            @Override
            public void onSuccess(final JSONObject response) {
                String message = getResources().getString(R.string.reserved_widget_android_message_add_widget_no_device_2);
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

                        Map<String, Boolean> supportedMethods = deviceUtils.getSupportedMethods(methods);
                        Integer sizeSuppMeth = supportedMethods.size();
                        Boolean hasLearn = supportedMethods.get("LEARN");
                        if (hasLearn != null && hasLearn) {
                            sizeSuppMeth = sizeSuppMeth - 1;
                        }
                        Boolean showDevice = sizeSuppMeth <= 2 && sizeSuppMeth > 0;

                        if (showDevice) {
                            Integer id = curObj.getInt("id");
                            nameListItems.add(name);
                            idList.add(id.toString());

                            Map<String, Object> info = new HashMap<String, Object>();
                            info.put("state", String.valueOf(stateID));
                            info.put("methods", methods);
                            info.put("name", name);
                            info.put("deviceType", deviceType);
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
