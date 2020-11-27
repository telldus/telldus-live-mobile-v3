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
import android.graphics.Typeface;
import android.os.Bundle;
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

import com.telldus.live.mobile.API.SensorsAPI;
import com.telldus.live.mobile.Database.MyDBHandler;
import com.telldus.live.mobile.Database.PrefManager;
import com.telldus.live.mobile.Model.SensorInfo;
import com.telldus.live.mobile.Utility.SensorsUtilities;
import com.telldus.live.mobile.API.API;
import com.telldus.live.mobile.API.OnAPITaskComplete;

public class NewSensorWidgetConfigureActivity extends Activity {

    int appWidgetId = AppWidgetManager.INVALID_APPWIDGET_ID;
    private Button btAdd, button_cancel;
    private View btSelectSensor, btSelectDisplayItem, screenCover, btSelectPollInterval;
    private TextView sensorName, sensorHint, sensorDataName, sensorDataHint, navPosterh2, navPosterh1, sensorText, settingText, valueText, imgSensorType, imgSensorTypeEdit, sensorRepeatIntervalLabel;
    private AppWidgetManager widgetManager;
    private ProgressDialog pDialog;
    private PrefManager prefManager;
    Switch switch_background;
    ImageView backSensor;
    private RelativeLayout navBackButton;

    CharSequence[] sensorDataList = null;
    CharSequence[] sensorNameList = null;
    CharSequence[] sensorIdList = null;
    CharSequence[] intervalOptionsValues = {
        "5", "10", "30", "60",
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

    public int selectedSensorIndex = -1, selectedSensorValueIndex = -1, selectedIntervalOptionsIndex = 1;

    View def_cover;
    View dark_cover;
    View light_cover;

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
            Intent mainActivity = new Intent(getApplicationContext(), MainActivity.class);
            mainActivity.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            mainActivity.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TASK);
            getApplicationContext().startActivity(mainActivity);
            WidgetModule.setOpenPurchase(true);
            return;
        }

        createSensorsApi();

        setResult(RESULT_CANCELED);
        setContentView(R.layout.activity_sensor_widget_configure);

        String message = getResources().getString(R.string.reserved_widget_android_loading)+"...";
        updateUI(message);
    }

    public void updateUI(String message) {
        navBackButton = (RelativeLayout )findViewById(R.id.navBackButton);
        navBackButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });

        View infoView = (View)findViewById(R.id.infoView);
        TextView infoText = (TextView)findViewById(R.id.infoText);
        screenCover = (View)findViewById(R.id.screenCover);

        Typeface titleFont = Typeface.createFromAsset(getAssets(),"fonts/RobotoLight.ttf");
        Typeface subtitleFont = Typeface.createFromAsset(getAssets(),"fonts/Roboto-Regular.ttf");
        navPosterh1 = (TextView) findViewById(R.id.navPosterh1);
        navPosterh2 = (TextView) findViewById(R.id.navPosterh2);
        navPosterh1.setTypeface(titleFont);
        navPosterh2.setTypeface(titleFont);
        navPosterh1.setText(getResources().getString(R.string.reserved_widget_android_sensor_configure_header_one));
        navPosterh2.setText(getResources().getString(R.string.reserved_widget_android_configure_header_two));

        if (sensorNameList == null) {
            infoView.setVisibility(View.VISIBLE);
            infoText.setText(message);
            screenCover.setVisibility(View.GONE);
        } else {
            infoView.setVisibility(View.GONE);
            screenCover.setVisibility(View.VISIBLE);

            imgSensorTypeEdit = (TextView) findViewById(R.id.imgSensorTypeEdit);
            imgSensorType = (TextView) findViewById(R.id.imgSensorType);
            imgSensorType.setVisibility(View.GONE);

            widgetManager = AppWidgetManager.getInstance(this);
            // Find the widget id from the intent.
            Intent intent = getIntent();
            Bundle extras = intent.getExtras();
            if (extras != null) {
                appWidgetId = extras.getInt(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID);
            }
            if (appWidgetId == AppWidgetManager.INVALID_APPWIDGET_ID) {
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
            settingText = (TextView) findViewById(R.id.settingText);
            valueText = (TextView) findViewById(R.id.valueText);
            sensorText = (TextView) findViewById(R.id.sensorText);

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

            sensorName.setTypeface(subtitleFont);
            sensorDataName.setTypeface(subtitleFont);
            sensorHint.setTypeface(subtitleFont);
            sensorDataHint.setTypeface(subtitleFont);
            settingText.setTypeface(subtitleFont);
            settingText.setText(getResources().getString(R.string.reserved_widget_android_settings)+":");
            valueText.setTypeface(subtitleFont);
            valueText.setText(getResources().getString(R.string.reserved_widget_android_sensor_value_to_display)+":");
            sensorText.setTypeface(subtitleFont);
            sensorText.setText(getResources().getString(R.string.reserved_widget_android_labelSensor)+":");
            btAdd.setTypeface(subtitleFont);
            button_cancel.setTypeface(subtitleFont);

            button_cancel.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    finish();
                }
            });

            btAdd.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    if (id == null || id == 0) {
                        Toast toast = Toast.makeText(getApplicationContext(), getResources().getString(R.string.reserved_widget_android_message_sensor_not_selected), Toast.LENGTH_LONG);
                        toast.setGravity(Gravity.TOP , 0, 0);
                        toast.show();
                        return;
                    }
                    if (senValue == null) {
                        Toast toast = Toast.makeText(getApplicationContext(), getResources().getString(R.string.reserved_widget_android_message_sensor_scale_not_selected), Toast.LENGTH_LONG);
                        toast.setGravity(Gravity.TOP , 0, 0);
                        toast.show();
                        return;
                    }

                    String currentUserId = prefManager.getUserId();

                    String trans = "default";
                    if (radio_dark.isChecked()) {
                        trans = "dark";
                    }
                    if (radio_light.isChecked()) {
                        trans = "light";
                    }

                    SensorInfo mSensorInfo = new SensorInfo(
                        appWidgetId,
                        sensorName.getText().toString(),
                        sensorDataName.getText().toString(),
                        id,
                        senValue,
                        senUnit,
                        senIcon,
                        lastUp,
                        trans,
                        currentUserId,
                        selectInterval,
                        "false"
                        );
                    database.addWidgetSensor(mSensorInfo);

                    NewSensorWidget.updateAppWidget(getApplicationContext(), widgetManager, appWidgetId, new HashMap());

                    Intent resultValue = new Intent();
                    // Set the results as expected from a 'configure activity'.
                    resultValue.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
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
                    builder.setTitle(R.string.reserved_widget_android_pick_sensor)
                        .setSingleChoiceItems(sensorNameList, selectedSensorIndex, new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialog, int which) {
                                // Reset the previously chosen sensor value, when user choose a different sensor
                                Boolean isSame = String.valueOf(which).equals(String.valueOf(selectedSensorIndex));
                                if ((selectedSensorIndex != -1) && (selectedSensorValueIndex != -1) && !isSame) {
                                    imgSensorTypeEdit.setVisibility(View.VISIBLE);
                                    imgSensorType.setVisibility(View.GONE);

                                    sensorDataName.setText(R.string.reserved_widget_android_sensor_select_value);
                                    sensorDataHint.setText(R.string.reserved_widget_android_sensor_tap_change_value);

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

                                Object unit = "";
                                Map<String, Object> info = new HashMap<String, Object>();
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

                                                info = sc.getSensorInfo(name, scale, value, getApplicationContext());
                                                Object label = info.get("label").toString();
                                                unit = info.get("unit").toString();
                                                String labelUnit = label+"("+unit+")";
                                                sensorValue.add(labelUnit);
                                                sensorDataList = sensorValue.toArray(new CharSequence[sensorValue.size()]);
                                            }
                                        }
                                    }
                                    catch (Exception e) {
                                    }
                                }
                                if (sensorValue.size() == 1) {
                                    selectedSensorValueIndex = 0;
                                    sensorDataName.setText(sensorDataList[0]);

                                    senIcon = info.get("icon").toString();
                                    senValue = info.get("value").toString();
                                    senUnit = String.valueOf(unit);

                                    imgSensorTypeEdit.setVisibility(View.GONE);
                                    imgSensorType.setText(senIcon);
                                    imgSensorType.setVisibility(View.VISIBLE);
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
                    builder.setTitle(R.string.reserved_widget_android_pick_sensor_data)
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

            final CharSequence[] intervalOptions = {
                getResources().getString(R.string.reserved_widget_android_label_update_interval_0),
                getResources().getString(R.string.reserved_widget_android_label_update_interval_1),
                getResources().getString(R.string.reserved_widget_android_label_update_interval_2),
                getResources().getString(R.string.reserved_widget_android_label_update_interval_3),
            };

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

    void createSensorsApi() {

        String params = "/sensors/list?includeValues=1&includeScale=1";
        SensorsAPI sensorsAPI = new SensorsAPI();
        sensorsAPI.getSensorsList(params, getApplicationContext(), "SensorsApi", new OnAPITaskComplete() {
            @Override
            public void onSuccess(final JSONObject response) {
                String message = getResources().getString(R.string.reserved_widget_android_message_add_widget_no_sensor);
                try {
                    JSONObject sensorData = new JSONObject(response.toString());
                    JsonsensorList = sensorData.getJSONArray("sensor");
                    for (int i = 0; i < JsonsensorList.length(); i++) {
                        JSONObject curObj = JsonsensorList.getJSONObject(i);
                        String name = curObj.getString("name");
                        if (name != null) {
                            Integer id = curObj.getInt("id");
                            String last = String.valueOf(curObj.getLong("lastUpdated"));
                            nameListItems.add(name);
                            idList.add(id.toString());
                        }
                    }
                    sensorNameList = nameListItems.toArray(new CharSequence[nameListItems.size()]);
                    sensorIdList = idList.toArray(new CharSequence[idList.size()]);

                    message = sensorNameList == null ? message : null;
                    updateUI(message);
                } catch (JSONException e) {
                    updateUI(message);
                    e.printStackTrace();
                }
            }
            @Override
            public void onError(ANError error) {
                String message = getResources().getString(R.string.reserved_widget_android_error_networkFailed);
                updateUI(message);
            }
        });
    }
}
