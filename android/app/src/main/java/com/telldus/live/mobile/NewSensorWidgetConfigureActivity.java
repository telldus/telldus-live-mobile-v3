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
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.PorterDuff;
import android.graphics.Typeface;
import android.os.Bundle;
import android.util.Log;
import android.view.TextureView;
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
import com.telldus.live.mobile.Model.SensorInfo;
import com.telldus.live.mobile.ServiceBackground.NetworkInfo;
import com.telldus.live.mobile.MainActivity;
import com.telldus.live.mobile.Utility.SensorsUtilities;
import com.telldus.live.mobile.API.API;
import com.telldus.live.mobile.API.OnAPITaskComplete;

public class NewSensorWidgetConfigureActivity extends Activity {

    int mAppWidgetId = AppWidgetManager.INVALID_APPWIDGET_ID;
    private Button btAdd, button_cancel;
    private View btSelectSensor, btSelectDisplayItem, screenCover, btSelectPollInterval;
    private TextView sensorName, sensorHint, sensorDataName, sensorDataHint, chooseSettingSensor,
    testText, sensorText, settingText, valueText, imgSensorType, loadingText, imgSensorTypeEdit, sensorRepeatIntervalLabel;
    private AppWidgetManager widgetManager;
    private RemoteViews views;
    private ProgressDialog pDialog;
    private PrefManager prefManager;
    private String transparent = "false";
    Switch switch_background;
    ImageView backSensor;
    private RelativeLayout mSensorBack;

    CharSequence[] sensorDataList = null;
    CharSequence[] sensorNameList = null;
    CharSequence[] sensorIdList = null;
    CharSequence[] intervalOptions = {
        "Update every 10 minutes", "Update every 30 minutes", "Update every 1 hour",
    };
    CharSequence[] intervalOptionsValues = {
        "10", "30", "60",
    };
    int multiplierMilli = 60000;

    List<String> nameListItems = new ArrayList<String>();
    List<String> idList = new ArrayList<String>();

    private Integer id, selectInterval = multiplierMilli * Integer.parseInt(intervalOptionsValues[0].toString());

    Map<String, Map> SensorInfoMap = new HashMap<String, Map>();

    private String accessToken;
    private String expiresIn;
    private String refreshToken;
    private String sesID;
    String lastUp, senValue, senUnit, senIcon;
    MyDBHandler database = new MyDBHandler(this);
    private JSONArray JsonsensorList;
    JSONObject searchObject;

    private String client_ID;
    private String client_secret;

    public int selectedSensorIndex = -1, selectedSensorValueIndex = -1, selectedIntervalOptionsIndex = 0;


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
        createSensorsApi();

        setResult(RESULT_CANCELED);
        setContentView(R.layout.activity_sensor_widget_configure);

        updateUI();
    }

    public void updateUI() {
        mSensorBack = (RelativeLayout )findViewById(R.id.sensorBack);
        mSensorBack.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });

        loadingText = (TextView)findViewById(R.id.loadingText);
        screenCover = (View)findViewById(R.id.screenCover);
        if (sensorNameList == null) {
            loadingText.setVisibility(View.VISIBLE);
            screenCover.setVisibility(View.GONE);
        } else {
            loadingText.setVisibility(View.GONE);
            screenCover.setVisibility(View.VISIBLE);

            imgSensorTypeEdit = (TextView) findViewById(R.id.imgSensorTypeEdit);
            imgSensorType = (TextView) findViewById(R.id.imgSensorType);
            imgSensorType.setVisibility(View.GONE);

            widgetManager = AppWidgetManager.getInstance(this);
            views = new RemoteViews(this.getPackageName(), R.layout.configurable_sensor_widget);
            // Find the widget id from the intent.
            Intent intent = getIntent();
            Bundle extras = intent.getExtras();
            if (extras != null) {
                mAppWidgetId = extras.getInt(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID);
            }
            if (mAppWidgetId == AppWidgetManager.INVALID_APPWIDGET_ID) {
                finish();
                return;
            }
            sensorName = (TextView) findViewById(R.id.txtSensorName);
            sensorHint = (TextView) findViewById(R.id.txtSensorHint);
            sensorDataName = (TextView) findViewById(R.id.txtSensorDataName);
            sensorDataHint = (TextView) findViewById(R.id.txtSensorDataHint);
            sensorRepeatIntervalLabel = (TextView) findViewById(R.id.labelSelectPoll);

            btAdd = (Button) findViewById(R.id.btAdd);
            button_cancel = (Button) findViewById(R.id.button_cancel);
            switch_background = (Switch) findViewById(R.id.switch_background);
            chooseSettingSensor = (TextView) findViewById(R.id.chooseSettingSensor);
            testText = (TextView) findViewById(R.id.testTextSensor);
            settingText = (TextView) findViewById(R.id.settingText);
            valueText = (TextView) findViewById(R.id.valueText);
            sensorText = (TextView) findViewById(R.id.sensorText);

            Typeface titleFont = Typeface.createFromAsset(getAssets(),"fonts/RobotoLight.ttf");
            Typeface subtitleFont = Typeface.createFromAsset(getAssets(),"fonts/Roboto-Regular.ttf");
            testText.setTypeface(titleFont);
            chooseSettingSensor.setTypeface(titleFont);
            sensorName.setTypeface(subtitleFont);
            sensorDataName.setTypeface(subtitleFont);
            sensorHint.setTypeface(subtitleFont);
            sensorDataHint.setTypeface(subtitleFont);
            settingText.setTypeface(subtitleFont);
            valueText.setTypeface(subtitleFont);
            sensorText.setTypeface(subtitleFont);
            btAdd.setTypeface(subtitleFont);
            button_cancel.setTypeface(subtitleFont);
            switch_background.setTypeface(subtitleFont);

            button_cancel.setOnClickListener(new View.OnClickListener() {
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
                        transparent="true";
                    } else {
                        transparent="false";
                    }
                }
            });

            btAdd.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    if (id == null || id == 0) {
                        Toast toast = Toast.makeText(getApplicationContext(),"You have not chosen any sensor. Please select a sensor to add as widget.",Toast.LENGTH_LONG);
                        toast.setGravity(Gravity.TOP , 0, 0);
                        toast.show();
                        return;
                    }
                    if (senValue == null) {
                        Toast toast = Toast.makeText(getApplicationContext(),"You have not chosen any value to display for sensor. Please select a value from the list.",Toast.LENGTH_LONG);
                        toast.setGravity(Gravity.TOP , 0, 0);
                        toast.show();
                        return;
                    }

                    boolean token_service = prefManager.getTokenService();
                    boolean b = isMyServiceRunning(NetworkInfo.class);
                    if (!b) {
                        startService(new Intent(getApplicationContext(), NetworkInfo.class));
                    }

                    boolean b1 = prefManager.getSensorDB();
                    if (!b1) {
                        prefManager.sensorDB(true);
                    }

                    String currentUserId = prefManager.getUserId();
                    Log.d("TEST selectInterval", String.valueOf(selectInterval));
                    SensorInfo mSensorInfo = new SensorInfo(
                        mAppWidgetId,
                        sensorName.getText().toString(),
                        sensorDataName.getText().toString(),
                        id,
                        senValue,
                        senUnit,
                        senIcon,
                        lastUp,
                        transparent,
                        currentUserId,
                        selectInterval);
                    database.addWidgetSensor(mSensorInfo);
                    views.setTextViewText(R.id.txtSensorType, sensorName.getText());

                    NewSensorWidget.updateAppWidget(getApplicationContext(),widgetManager,mAppWidgetId);

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
            btSelectSensor = (View) findViewById(R.id.btSelectSensor);
            btSelectSensor.setOnClickListener(new View.OnClickListener() {
                AlertDialog ad;

                @Override
                public void onClick(View view) {
                    AlertDialog.Builder builder = new AlertDialog.Builder(NewSensorWidgetConfigureActivity.this, R.style.MaterialThemeDialog);
                    builder.setTitle(R.string.pick_sensor)
                        .setSingleChoiceItems(sensorNameList, selectedSensorIndex, new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialog, int which) {
                                // Reset the previously chosen sensor value, when user choose a different sensor
                                Boolean isSame = String.valueOf(which).equals(String.valueOf(selectedSensorIndex));
                                if ((selectedSensorIndex != -1) && (selectedSensorValueIndex != -1) && !isSame) {
                                    imgSensorTypeEdit.setVisibility(View.VISIBLE);
                                    imgSensorType.setVisibility(View.GONE);

                                    sensorDataName.setText("Select value");
                                    sensorDataHint.setText("Tap to change value to display");

                                    senValue = null;
                                    selectedSensorValueIndex = -1;
                                }

                                selectedSensorIndex = which;
                                sensorName.setText(sensorNameList[which]);

                                id = Integer.parseInt(String.valueOf(sensorIdList[which]));
                                String str = String.valueOf(sensorNameList[which]);
                                String name = null;
                                String scale = null;
                                String value = null;
                                List<String> sensorValue = new ArrayList<String>();
                                searchObject = new JSONObject();
                                SensorsUtilities sc = new SensorsUtilities();

                                for (int i = 0; i < JsonsensorList.length(); i++) {
                                    try {
                                        JSONObject currObject = JsonsensorList.getJSONObject(i);
                                        Integer sensorId = currObject.getInt("id");
                                        if (id.intValue() == sensorId.intValue()) {
                                            searchObject = currObject;
                                            JSONArray SensorData = searchObject.getJSONArray("data");
                                            for (int j = 0; j < SensorData.length(); j++) {
                                                JSONObject currData = SensorData.getJSONObject(j);

                                                lastUp = currData.optString("lastUpdated");
                                                name = currData.optString("name");
                                                scale = currData.optString("scale");
                                                value = currData.optString("value");

                                                Map<String, Object> info = sc.getSensorInfo(name, scale, value, getApplicationContext());
                                                Object label = info.get("label").toString();
                                                Object unit = info.get("unit").toString();
                                                String labelUnit = label+"("+unit+")";
                                                sensorValue.add(labelUnit);
                                                sensorDataList = sensorValue.toArray(new CharSequence[sensorValue.size()]);
                                            }
                                        }
                                    }
                                    catch (Exception e) {
                                    }
                                }
                                ad.dismiss();
                            }
                        });
                    ad = builder.show();
                }
            });
            btSelectDisplayItem = (View) findViewById(R.id.btSelectDisplayItem);
            btSelectDisplayItem.setOnClickListener(new View.OnClickListener() {
                AlertDialog ad1;
                @Override
                public void onClick(View view) {
                    AlertDialog.Builder builder = new AlertDialog.Builder(NewSensorWidgetConfigureActivity.this, R.style.MaterialThemeDialog);
                    builder.setTitle(R.string.pick_sensor_data)
                        .setSingleChoiceItems(sensorDataList, selectedSensorValueIndex, new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialogInterface, int i) {
                                selectedSensorValueIndex = i;
                                sensorDataName.setText(sensorDataList[i]);

                                SensorsUtilities sc = new SensorsUtilities();

                                try {
                                    String iconName = "";
                                    String chosenLabel = sensorDataList[i].toString();
                                    JSONArray SensorData = searchObject.getJSONArray("data");
                                    for (int j = 0; j < SensorData.length(); j++) {
                                        JSONObject currData = SensorData.getJSONObject(j);

                                        String lastUp = currData.optString("lastUpdated");
                                        String name = currData.optString("name");
                                        String scale = currData.optString("scale");
                                        String value = currData.optString("value");

                                        Map<String, Object> info = sc.getSensorInfo(name, scale, value, getApplicationContext());
                                        Object label = info.get("label").toString();
                                        Object unit = info.get("unit").toString();
                                        String labelUnit = label+"("+unit+")";
                                        if (labelUnit.trim().equalsIgnoreCase(chosenLabel.trim())) {
                                            senIcon = info.get("icon").toString();
                                            senValue = info.get("value").toString();
                                            senUnit = String.valueOf(unit);
                                        }
                                    }
                                    imgSensorTypeEdit.setVisibility(View.GONE);
                                    imgSensorType.setText(senIcon);
                                    imgSensorType.setVisibility(View.VISIBLE);
                                } catch (Exception ex) {
                                    ex.printStackTrace();
                                }
                                ad1.dismiss();
                            }
                        });
                    ad1 = builder.show();
                }
            });

            btSelectPollInterval = (View) findViewById(R.id.btSelectPollInterval);
            btSelectPollInterval.setOnClickListener(new View.OnClickListener() {
                AlertDialog ad;

                @Override
                public void onClick(View view) {
                AlertDialog.Builder builder = new AlertDialog.Builder(NewSensorWidgetConfigureActivity.this, R.style.MaterialThemeDialog);
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
        }
    }
    void createSensorsApi() {

        String params = "sensors/list?includeValues=1&includeScale=1";
        API endPoints = new API();
        endPoints.callEndPoint(getApplicationContext(), params, new OnAPITaskComplete() {
            @Override
            public void onSuccess(final JSONObject response) {
                try {
                    JSONObject sensorData = new JSONObject(response.toString());
                    JsonsensorList = sensorData.getJSONArray("sensor");
                    for (int i = 0; i < JsonsensorList.length(); i++) {
                        JSONObject curObj = JsonsensorList.getJSONObject(i);
                        String name = curObj.getString("name");
                        if (name == null || name.equals("null")) {
                            name = "Unknown";
                        }
                        Integer id = curObj.getInt("id");
                        String last = String.valueOf(curObj.getLong("lastUpdated"));
                        nameListItems.add(name);
                        idList.add(id.toString());
                    }
                    sensorNameList = nameListItems.toArray(new CharSequence[nameListItems.size()]);
                    sensorIdList = idList.toArray(new CharSequence[idList.size()]);
                    updateUI();
                } catch (JSONException e) {
                    updateUI();
                    e.printStackTrace();
                }
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
