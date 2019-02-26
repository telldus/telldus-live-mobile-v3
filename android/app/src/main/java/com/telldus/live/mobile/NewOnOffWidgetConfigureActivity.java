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
import android.app.ActivityManager;
import android.app.ProgressDialog;
import android.appwidget.AppWidgetManager;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.PorterDuff;
import android.graphics.Typeface;
import android.os.Bundle;
import android.support.v7.app.AlertDialog;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.CompoundButton;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.RemoteViews;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;
import android.view.Gravity;

import com.androidnetworking.error.ANError;
import com.androidnetworking.interfaces.JSONObjectRequestListener;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;

import com.telldus.live.mobile.Database.MyDBHandler;
import com.telldus.live.mobile.Database.PrefManager;
import com.telldus.live.mobile.Model.DeviceInfo;
import com.telldus.live.mobile.ServiceBackground.AccessTokenService;
import com.telldus.live.mobile.ServiceBackground.NetworkInfo;
import com.telldus.live.mobile.MainActivity;
import com.telldus.live.mobile.Utility.DevicesUtilities;
import com.telldus.live.mobile.API.API;
import com.telldus.live.mobile.API.OnAPITaskComplete;

public class NewOnOffWidgetConfigureActivity extends Activity {
    private static final String ACTION_ON = "ACTION_ON";
    private static final String ACTION_OFF = "ACTION_OFF";
    private ProgressDialog pDialog;
    CharSequence[] deviceNameList = null;
    List<String> nameListItems = new ArrayList<String>();
    Map<Integer, Map> DeviceInfoMap = new HashMap<Integer, Map>();
    Integer id;
    Integer deviceSupportedMethods = 0;
    String deviceCurrentState, deviceTypeCurrent;

    MyDBHandler db = new MyDBHandler(this);

    List<String> idList = new ArrayList<String>();
    CharSequence[] deviceIdList = null;

    public int selectedDeviceIndex;

    //UI
    int mAppWidgetId = AppWidgetManager.INVALID_APPWIDGET_ID;
    private Button btAdd,btnCan;
    private View btSelectDevice, screenCover;
    TextView deviceName, deviceHint, deviceOn, deviceOff,chooseSetting,textTest, deviceText, settingText, loadingText;
    ImageView deviceState;
    private AppWidgetManager widgetManager;
    private RemoteViews views;
    Switch switch_background;

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
    private ImageView backDevice;
    private RelativeLayout mBackLayout;
    TextView tvIcon1;

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
        accessToken = prefManager.getAccess();
        if (accessToken == "") {
            Intent launchActivity = new Intent(getApplicationContext(), MainActivity.class);
            getApplicationContext().startActivity(launchActivity);
            return;
        }

        createDeviceApi();

        setResult(RESULT_CANCELED);
        setContentView(R.layout.new_on_off_widget_configure);

        updateUI();
    }

    public void updateUI() {

        mBackLayout = (RelativeLayout)findViewById(R.id.deviceBack);
        mBackLayout.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });

        loadingText = (TextView)findViewById(R.id.loadingText);
        screenCover = (View)findViewById(R.id.screenCover);
        if (DeviceInfoMap.size() == 0) {
            loadingText.setVisibility(View.VISIBLE);
            screenCover.setVisibility(View.GONE);
        } else {
            views = new RemoteViews(this.getPackageName(), R.layout.new_app_widget);
            widgetManager = AppWidgetManager.getInstance(this);

            loadingText.setVisibility(View.GONE);
            screenCover.setVisibility(View.VISIBLE);

            textTest = (TextView)findViewById(R.id.testText);
            chooseSetting = (TextView)findViewById(R.id.chooseSetting);
            deviceName = (TextView) findViewById(R.id.txtDeviceName);
            deviceHint = (TextView) findViewById(R.id.txtDeviceHint);
            backDevice = (ImageView)findViewById(R.id.backdevice);
            deviceText = (TextView)findViewById(R.id.deviceText);
            settingText = (TextView)findViewById(R.id.settingText);

            views.setViewVisibility(R.id.offLinear, View.GONE);

            btnCan = (Button)findViewById(R.id.btn_cancel);
            btnCan.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    finish();
                }
            });

            switch_background = (Switch)findViewById(R.id.switch_background);

            tvIcon1 = (TextView) findViewById(R.id.tvIcon1);
            tvIcon1.setText("device-alt");

            switch_background.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
                public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
                    // do something, the isChecked will be
                    // true if the switch is in the On position
                    if (isChecked)  {
                        switchStatus = "true";
                    } else {
                        switchStatus = "false";
                    }
                }
            });

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
                    if (id == 0) {// ToDo: translate
                        Toast toast = Toast.makeText(getApplicationContext(),"You have not chosen any device. Please select a device to add as widget.",Toast.LENGTH_LONG);
                        toast.setGravity(Gravity.TOP , 0, 0);
                        toast.show();
                        return;
                    }

                    boolean b = isMyServiceRunning(NetworkInfo.class);
                    if (!b) {
                        startService(new Intent(getApplicationContext(), NetworkInfo.class));
                    }

                    boolean b1 = prefManager.getDeviceDB();
                    if (!b1) {
                        prefManager.DeviceDB(true);
                    }


                    boolean token_service = prefManager.getTokenService();
                    if (!token_service) {
                        prefManager.TokenService(true);
                        // Service for Access token
                        Intent serviceIntent = new Intent(getApplicationContext(), AccessTokenService.class);
                        startService(serviceIntent);
                    } else {
                        Toast.makeText(getApplicationContext(),"service already running",Toast.LENGTH_SHORT).show();
                    }
                    views.setTextViewText(R.id.txtWidgetTitle, deviceName.getText());

                    DeviceInfo mInsert = new DeviceInfo(
                        deviceCurrentState,
                        mAppWidgetId,
                        id,
                        deviceName.getText().toString(),
                        deviceSupportedMethods,
                        deviceTypeCurrent,
                        "", // As of now deviceStateValue does matters for only DIM devices.
                        switchStatus);
                    db.addUser(mInsert);

                    NewOnOffWidget.updateAppWidget(getApplicationContext(),widgetManager,mAppWidgetId);


                    boolean web_service = prefManager.getWebService();
                    if (!web_service) {
                        prefManager.websocketService(true);
                        // Service for Access token
                        Intent serviceIntent = new Intent(getApplicationContext(), MyService.class);
                        startService(serviceIntent);
                    } else {
                        Toast.makeText(getApplicationContext(),"service already running",Toast.LENGTH_SHORT).show();
                    }


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
                    builder.setTitle(R.string.pick_device)
                            .setSingleChoiceItems(deviceNameList, selectedDeviceIndex, new DialogInterface.OnClickListener() {
                                public void onClick(DialogInterface dialog, int which) {
                                    selectedDeviceIndex = which;
                                    deviceName.setText(deviceNameList[which]);
                                    id = Integer.parseInt(String.valueOf(deviceIdList[which]));

                                    Map<String, Object> info = DeviceInfoMap.get(id);

                                    deviceSupportedMethods = Integer.parseInt(info.get("methods").toString());
                                    deviceCurrentState = info.get("state").toString();

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
            settingText.setTypeface(subtitleFont);
            btAdd.setTypeface(subtitleFont);
            btnCan.setTypeface(subtitleFont);
            switch_background.setTypeface(subtitleFont);
        }
    }

    void createDeviceApi() {
        String params = "devices/list?supportedMethods=1975&includeIgnored=1&extras=devicetype,transport,room";
        API endPoints = new API();
        endPoints.callEndPoint(getApplicationContext(), params, new OnAPITaskComplete() {
            @Override
            public void onSuccess(final JSONObject response) {
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
                        Boolean showDevice = sizeSuppMeth <= 2;

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
                    updateUI();
                } catch (JSONException e) {
                    updateUI();
                    e.printStackTrace();
                };
            }
            @Override
            public void onError(ANError error) {
                updateUI();
            }
        });
    }

    private boolean isMyServiceRunning(Class<?> serviceClass) {
        ActivityManager manager = (ActivityManager) getSystemService(Context.ACTIVITY_SERVICE);
        for (ActivityManager.RunningServiceInfo service : manager.getRunningServices(Integer.MAX_VALUE)) {
            if (serviceClass.getName().equals(service.service.getClassName())) {
                return true;
            }
        }
        return false;
    }
}
