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
import com.telldus.live.mobile.Model.SensorInfo;
import com.telldus.live.mobile.ServiceBackground.AccessTokenService;
import com.telldus.live.mobile.ServiceBackground.NetworkInfo;
import com.telldus.live.mobile.MainActivity;
import com.telldus.live.mobile.Utility.SensorsUtilities;

public class NewSensorWidgetConfigureActivity extends Activity {

    int mAppWidgetId = AppWidgetManager.INVALID_APPWIDGET_ID;
    private Button btAdd, button_cancel;
    private View btSelectSensor, btSelectDisplayItem;
    private TextView sensorName, sensorHint, sensorDataName, sensorDataHint, chooseSettingSensor, testText, sensorText, settingText, valueText, tvIcon1, imgSensorType;
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

    List<String> nameListItems = new ArrayList<String>();

    private Map<String,Integer> DeviceID=new HashMap<String,Integer>();
    private int id;

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
    Typeface iconFont;



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
        createSensorApi();

        setResult(RESULT_CANCELED);

        setContentView(R.layout.activity_sensor_widget_configure);

        iconFont = FontManager.getTypeface(getApplicationContext(), FontManager.FONTAWESOME);
        tvIcon1 = (TextView) findViewById(R.id.tvIcon1);
        imgSensorType = (TextView) findViewById(R.id.imgSensorType);
        tvIcon1.setTypeface(iconFont);

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

        btAdd = (Button) findViewById(R.id.btAdd);
        button_cancel = (Button) findViewById(R.id.button_cancel);
        switch_background = (Switch) findViewById(R.id.switch_background);
        chooseSettingSensor = (TextView) findViewById(R.id.chooseSettingSensor);
        testText = (TextView) findViewById(R.id.testTextSensor);
        settingText = (TextView) findViewById(R.id.settingText);
        valueText = (TextView) findViewById(R.id.valueText);
        sensorText = (TextView) findViewById(R.id.sensorText);



        mSensorBack = (RelativeLayout )findViewById(R.id.sensorBack);

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

        mSensorBack.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });
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
                if (id == 0) {
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

                if (!token_service) {
                    prefManager.TokenService(true);
                    // Service for Access token
                    Intent serviceIntent = new Intent(getApplicationContext(), AccessTokenService.class);
                    startService(serviceIntent);
                } else {
                    Toast.makeText(getApplicationContext(),"service already running",Toast.LENGTH_SHORT).show();
                }

                SensorInfo mSensorInfo = new SensorInfo(
                    mAppWidgetId,
                    sensorName.getText().toString(),
                    sensorDataName.getText().toString(),
                    id,
                    senValue,
                    senUnit,
                    senIcon,
                    lastUp,
                    transparent);
                database.addSensor(mSensorInfo);
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
            public int checkedItem;
            AlertDialog ad;

            @Override
            public void onClick(View view) {
                AlertDialog.Builder builder = new AlertDialog.Builder(NewSensorWidgetConfigureActivity.this, R.style.MaterialThemeDialog);
                builder.setTitle(R.string.pick_sensor)
                    .setSingleChoiceItems(sensorNameList, checkedItem, new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialog, int which) {

                            //refersh datatype
                            sensorDataName.setText("Select value");
                            sensorDataHint.setText("Tap to change value to display");

                            imgSensorType.setText("");
                            imgSensorType.setTypeface(iconFont);
                            imgSensorType.setBackgroundResource(R.drawable.penscg);

                            sensorName.setText(sensorNameList[which]);

                            // sensorHint.setText(null);
                            id = DeviceID.get(sensorNameList[which]);
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
                                    String sensorname = currObject.getString("name");
                                    if (sensorname.equals(str)) {
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
            public int checkedItem;
            AlertDialog ad1;
            @Override
            public void onClick(View view) {
                AlertDialog.Builder builder = new AlertDialog.Builder(NewSensorWidgetConfigureActivity.this, R.style.MaterialThemeDialog);
                builder.setTitle(R.string.pick_sensor_data)
                    .setSingleChoiceItems(sensorDataList, checkedItem, new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialogInterface, int i) {
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
                                imgSensorType.setText(senIcon);
                                imgSensorType.setTextSize(50f);
                                imgSensorType.setBackground(null);
                                imgSensorType.setTypeface(iconFont);

                            } catch (Exception ex) {
                                ex.printStackTrace();
                            }
                            ad1.dismiss();
                        }
                    });
                ad1 = builder.show();
            }
        });
    }

    public static Bitmap buildUpdate(String time, Context context) {
        Bitmap myBitmap = Bitmap.createBitmap(160, 84, Bitmap.Config.ARGB_8888);
        Canvas myCanvas = new Canvas(myBitmap);
        Paint paint = new Paint();

        Typeface iconFont = FontManager.getTypeface(context, FontManager.FONTAWESOME);

        paint.setAntiAlias(true);
        paint.setSubpixelText(true);
        paint.setTypeface(iconFont);
        paint.setStyle(Paint.Style.FILL);
        paint.setColor(Color.WHITE);
        paint.setTextSize(65);
        paint.setTextAlign(Paint.Align.CENTER);
        myCanvas.drawText(time, 80, 60, paint);
        return myBitmap;
    }
    void createSensorApi() {
        accessToken = prefManager.getAccess();

        AndroidNetworking.get("https://api3.telldus.com/oauth2/sensors/list?includeValues=1&includeScale=1")
            .addHeaders("Content-Type", "application/json")
            .addHeaders("Accpet", "application/json")
            .addHeaders("Authorization", "Bearer " + accessToken)
            .setPriority(Priority.LOW)
            .build()
            .getAsJSONObject(new JSONObjectRequestListener() {
                @Override
                public void onResponse(JSONObject response) {
                    try {
                        JSONObject sensorData = new JSONObject(response.toString());
                        JsonsensorList = sensorData.getJSONArray("sensor");
                        for (int i = 0; i < JsonsensorList.length(); i++) {
                            JSONObject curObj = JsonsensorList.getJSONObject(i);
                            String name = curObj.getString("name");
                            if (name != null && !name.equals("null")) {
                                Integer id = curObj.getInt("id");
                                String last = String.valueOf(curObj.getLong("lastUpdated"));
                                DeviceID.put(name,id);
                                nameListItems.add(name);
                            }
                        }
                        sensorNameList = nameListItems.toArray(new CharSequence[nameListItems.size()]);
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
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
