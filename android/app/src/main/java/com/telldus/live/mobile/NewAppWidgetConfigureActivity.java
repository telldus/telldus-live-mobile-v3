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
import android.app.AlertDialog;
import android.app.ProgressDialog;
import android.appwidget.AppWidgetManager;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.PorterDuff;
import android.os.Bundle;
import android.graphics.Typeface;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.CompoundButton;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.RemoteViews;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;
import android.view.Gravity;

import com.androidnetworking.AndroidNetworking;
import com.androidnetworking.common.Priority;
import com.androidnetworking.error.ANError;
import com.androidnetworking.interfaces.JSONObjectRequestListener;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.telldus.live.mobile.Database.MyDBHandler;
import com.telldus.live.mobile.Database.PrefManager;
import com.telldus.live.mobile.Model.DeviceInfo;
import com.telldus.live.mobile.ServiceBackground.AccessTokenService;
import com.telldus.live.mobile.ServiceBackground.NetworkInfo;
import com.telldus.live.mobile.MainActivity;

/**
 * The configuration screen for the {@link NewAppWidget NewAppWidget} AppWidget.
 */
public class NewAppWidgetConfigureActivity extends Activity {

    private static final String ACTION_ON = "ACTION_ON";
    private static final String ACTION_OFF="ACTION_OFF";
    private ProgressDialog pDialog;
    CharSequence[] deviceNameList = null;
    List<String> nameListItems = new ArrayList<String>();
    CharSequence[] deviceStateList = null;
    List<String> stateListItems = new ArrayList<String>();
    Map<String,Integer> DeviceID=new HashMap<String,Integer>();
    int id;
    Integer methods = 0;

    MyDBHandler db = new MyDBHandler(this);

    //UI

    int mAppWidgetId = AppWidgetManager.INVALID_APPWIDGET_ID;

    private Button btAdd,btnCan;
    private View btSelectDevice;
    TextView deviceName, deviceHint, deviceOn, deviceOff,chooseSetting,textTest,deviceText,settingText,tvIcon1;
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
        setContentView(R.layout.activity_device_widget_configure);
        views = new RemoteViews(this.getPackageName(), R.layout.new_app_widget);
        widgetManager = AppWidgetManager.getInstance(this);

        textTest = (TextView)findViewById(R.id.testText);
        chooseSetting = (TextView)findViewById(R.id.chooseSetting);
        deviceName = (TextView) findViewById(R.id.txtDeviceName);
        deviceHint = (TextView) findViewById(R.id.txtDeviceHint);
        backDevice = (ImageView)findViewById(R.id.backdevice);
        mBackLayout = (RelativeLayout)findViewById(R.id.deviceBack);
        btnCan = (Button)findViewById(R.id.btn_cancel);
        switch_background = (Switch)findViewById(R.id.switch_background);
        btAdd = (Button) findViewById(R.id.btAdd);
        btSelectDevice = (View) findViewById(R.id.btSelectDevice);
        deviceText = (TextView)findViewById(R.id.deviceText);
        settingText = (TextView)findViewById(R.id.settingText);

        // switch_background.getThumbDrawable().setColorFilter(Color.GRAY, PorterDuff.Mode.MULTIPLY);
        // switch_background.getTrackDrawable().setColorFilter(Color.DKGRAY, PorterDuff.Mode.MULTIPLY);

        Typeface iconFont = FontManager.getTypeface(getApplicationContext(), FontManager.FONTAWESOME);
        tvIcon1 = (TextView) findViewById(R.id.tvIcon1);
        tvIcon1.setTypeface(iconFont);

        mBackLayout.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });

        btnCan.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });

        switch_background.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
                // do something, the isChecked will be
                // true if the switch is in the On position
                if (isChecked) {
                    switchStatus="true";
                    // switch_background.getThumbDrawable().setColorFilter(isChecked ? getResources().getColor(R.color.lightblue) : Color.WHITE, PorterDuff.Mode.MULTIPLY);
                    // switch_background.getTrackDrawable().setColorFilter(!isChecked ? Color.BLACK : Color.GRAY, PorterDuff.Mode.MULTIPLY);
                } else {
                    switchStatus="false";
                    // switch_background.getThumbDrawable().setColorFilter(isChecked ? Color.BLACK : Color.GRAY, PorterDuff.Mode.MULTIPLY);
                    // switch_background.getTrackDrawable().setColorFilter(!isChecked ? Color.DKGRAY : Color.WHITE, PorterDuff.Mode.MULTIPLY);
                }
            }
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
                if (id == 0) {
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
                    deviceStateVal[0],
                    mAppWidgetId,
                    id,
                    deviceName.getText().toString(),
                    methods,
                    switchStatus);
                db.addUser(mInsert);
                NewAppWidget.updateAppWidget(getApplicationContext(),widgetManager,mAppWidgetId);


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

        btSelectDevice.setOnClickListener(new View.OnClickListener() {
            public int checkedItem;
            AlertDialog ad;
            public void onClick(View view) {
                final AlertDialog.Builder builder = new AlertDialog.Builder(NewAppWidgetConfigureActivity.this, R.style.MaterialThemeDialog);
                builder.setTitle(R.string.pick_device)
                    .setSingleChoiceItems(deviceNameList, checkedItem, new DialogInterface.OnClickListener() {
                        public void onClick(DialogInterface dialog, int which) {
                            deviceName.setText(deviceNameList[which]);
                            id=DeviceID.get(deviceNameList[which]);

                            // deviceHint.setText(null);
                            deviceStateVal[0] = (String) deviceStateList[which];
                            Toast.makeText(getApplicationContext(),deviceStateVal[0].toString(),Toast.LENGTH_LONG).show();
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
    }



    void createDeviceApi() {
    accessToken=prefManager.getAccess();
        AndroidNetworking.get("https://api3.telldus.com/oauth2/devices/list?supportedMethods=951&includeIgnored=1")
            .addHeaders("Content-Type", "application/json")
            .addHeaders("Accpet", "application/json")
            .addHeaders("Authorization", "Bearer " + accessToken)
            .setPriority(Priority.LOW)
            .build()
            .getAsJSONObject(new JSONObjectRequestListener() {
                @Override
                public void onResponse(JSONObject response) {
                    try {

                        JSONObject deviceData = new JSONObject(response.toString());
                        JSONArray deviceList = deviceData.getJSONArray("device");

                        for (int i = 0; i < deviceList.length(); i++) {
                            JSONObject curObj = deviceList.getJSONObject(i);
                            String name = curObj.getString("name");
                            stateID = curObj.getInt("state");

                            if (stateID == 1 || stateID == 2 || stateID == 4 || stateID == 128 ||stateID == 256 || stateID == 512 || stateID == 16) {
                                Integer id = curObj.getInt("id");
                                DeviceID.put(name, id);
                                nameListItems.add(name);
                                stateListItems.add(String.valueOf(stateID));
                            }
                        }
                        deviceNameList = nameListItems.toArray(new CharSequence[nameListItems.size()]);
                        deviceStateList = stateListItems.toArray(new CharSequence[stateListItems.size()]);
                    } catch (JSONException e) {
                        e.printStackTrace();
                    };
                }
                @Override
                public void onError(ANError anError) {
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
