package com.telldus.live.mobile;

import android.app.Activity;
import android.app.ActivityManager;
import android.app.AlertDialog;
import android.app.ProgressDialog;
import android.appwidget.AppWidgetManager;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.graphics.Typeface;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.CompoundButton;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.RemoteViews;
import android.widget.Switch;
import android.widget.TextView;

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
import com.telldus.live.mobile.ServiceBackground.MyService;

/**
 * The configuration screen for the {@link NewSensorWidget NewSensorWidget} AppWidget.
 */
public class NewSensorWidgetConfigureActivity extends Activity {

    int mAppWidgetId = AppWidgetManager.INVALID_APPWIDGET_ID;
    // private EditText etUrl;
    private Button btAdd,button_cancel;
    private View btSelectSensor, btSelectDisplayItem;
    private TextView sensorName, sensorHint, sensorDataName, sensorDataHint,chooseSettingSensor,testText;
    private ImageView imgSensorType;
    private AppWidgetManager widgetManager;
    private RemoteViews views;
    private ProgressDialog pDialog;
    private PrefManager prefManager;
    private String transparent="false";
    Switch switch_background;
    ImageView backSensor;
    private RelativeLayout mSensorBack;

//    String temp=null,hum=null,windAvg=null,windGust=null,rainRate=null,rainTotal=null,luminance=null,
//            watt=null,windDirection=null,uv=null;

    //    CharSequence sensorList[] = new CharSequence[] {"Outdoor Temp", "Indoor Temp", "Fridge", "Freezer"};
   // CharSequence sensorDataList[] = new CharSequence[] {"Temperature", "Humidity", "windAverage","windGust",
    //        "Rain Rate","Rain Total",
    //        "Luminance","UV","Watt","Wind Direction"};
   // CharSequence[] sensorList=null;
    CharSequence[] sensorDataList=null;
    CharSequence[] sensorNameList = null;

    List<String> nameListItems = new ArrayList<String>();


    private Map<String,Integer> DeviceID=new HashMap<String,Integer>();
    private int id;

    private String accessToken;
    private String expiresIn;
    private String tokenType;
    private String scope;
    private String refreshToken;
    private String sesID;
    private String ttl;
    String lastUp,senValue;
    MyDBHandler database=new MyDBHandler(this);
    private JSONArray JsonsensorList;
    JSONObject searchObject;

    @Override
    public void onCreate(Bundle icicle) {
        super.onCreate(icicle);


        prefManager=new PrefManager(this);
        File fileAuth = new File(getApplicationContext().getFilesDir().getAbsolutePath() + "/RNFS-BackedUp/auth.txt");
        if (fileAuth.exists()) {
            Log.d("File exists?", "Yes");

            //Read text from file
            StringBuilder text = new StringBuilder();

            try {
                BufferedReader br = new BufferedReader(new FileReader(fileAuth));
                String line;
                while ((line = br.readLine()) != null) {
                    text.append(line);
                    text.append('\n');
                }
                br.close();
            } catch (IOException e) {
                e.printStackTrace();
            }

            try {
                JSONObject authInfo = new JSONObject(String.valueOf(text));
                accessToken = String.valueOf(authInfo.getString("access_token"));
                expiresIn = String.valueOf(authInfo.getString("expires_in"));
                tokenType = String.valueOf(authInfo.getString("token_type"));
                scope = String.valueOf(authInfo.getString("scope"));
                refreshToken = String.valueOf(authInfo.getString("refresh_token"));
                prefManager.AccessTokenDetails(accessToken,expiresIn);

                Log.d("Auth token", accessToken);
                Log.d("Expires in", expiresIn);
                Log.d("Token type", tokenType);
                Log.d("Scope", scope);
                Log.d("Refresh token", refreshToken);

                createSensorApi();
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }


        File fileSession = new File(getApplicationContext().getFilesDir().getAbsolutePath() + "/RNFS-BackedUp/session.txt");
        if (fileSession.exists()) {
            Log.d("File exists?", "Yes");
            //Read text from file
            StringBuilder text = new StringBuilder();

            try {
                BufferedReader br = new BufferedReader(new FileReader(fileSession));
                String line;
                while ((line = br.readLine()) != null) {
                    text.append(line);
                    text.append('\n');
                }
                br.close();
            } catch (IOException e) {
                e.printStackTrace();
            }

            try {
                JSONObject authInfo = new JSONObject(String.valueOf(text));
                sesID = String.valueOf(authInfo.getString("sessionId"));
                ttl = String.valueOf(authInfo.getString("ttl"));

                Log.d("Session ID", sesID);
                Log.d("Expires in", ttl);
                prefManager.saveSessionID(sesID,ttl);

            } catch (JSONException e) {
                e.printStackTrace();
            }
        }
/*
        prefManager.AccessTokenDetails("3db77e79f8c2d88c8fe9f6914a3c43da0ff038d1","232323");
        prefManager.saveSessionID("26758c97-0cf7-426a-9ec0-8b56f56de976","23422323");
        createSensorApi();*/
        setResult(RESULT_CANCELED);

     //   setContentView(R.layout.activity_sensor_widget_configure);

        // activity stuffs
        setContentView(R.layout.activity_sensor_widget_configure);
        /*if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            Window w = getWindow(); // in Activity's onCreate() for instance
            w.setFlags(WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS, WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS);
        }*/

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
        imgSensorType = (ImageView) findViewById(R.id.imgSensorType);
        btAdd = (Button) findViewById(R.id.btAdd);
        switch_background=(Switch)findViewById(R.id.switch_background);

        chooseSettingSensor=(TextView)findViewById(R.id.chooseSettingSensor);
        testText=(TextView)findViewById(R.id.testTextSensor);

       /* Typeface font = Typeface.createFromAsset(getAssets(), "fonts/Lato-Light.ttf");
        testText.setTypeface(font);
        chooseSettingSensor.setTypeface(font);
        sensorName.setTypeface(font);
        sensorHint.setTypeface(font);
        sensorDataName.setTypeface(font);
        sensorDataHint.setTypeface(font);*/
        mSensorBack=(RelativeLayout)findViewById(R.id.sensorBack);

        mSensorBack.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });
        button_cancel=(Button)findViewById(R.id.button_cancel);
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
                if(isChecked)
                {
                    transparent="true";
                }else
                {
                    transparent="false";

                }
            }
        });

        btAdd.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {

                SensorInfo mSensorInfo=new SensorInfo(mAppWidgetId,sensorName.getText().toString(),
                        sensorDataName.getText().toString(),id,senValue,lastUp,transparent);
                database.addSensor(mSensorInfo);
                views.setTextViewText(R.id.txtSensorType, sensorName.getText());
                views.setImageViewResource(R.id.iconSensor, R.drawable.sensor);
                //  widgetManager.updateAppWidget(mAppWidgetId, views);
                NewSensorWidget.updateAppWidget(getApplicationContext(),widgetManager,mAppWidgetId);

                boolean b=isMyServiceRunning(MyService.class);
                if (!b)
                {
                    startService(new Intent(getApplicationContext(), MyService.class));
                    // startService(new Intent(getApplicationContext(), AEScreenOnOffService.class));
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
                AlertDialog.Builder builder = new AlertDialog.Builder(NewSensorWidgetConfigureActivity.this);
                builder.setTitle(R.string.pick_sensor)
                        .setSingleChoiceItems(sensorNameList, checkedItem, new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialog, int which) {

                                //refersh datatype
                                sensorDataName.setText("Select data item");
                                sensorDataHint.setText("Tap to change value to display");

                                sensorName.setText(sensorNameList[which]);

                            //    sensorHint.setText(null);
                                id=DeviceID.get(sensorNameList[which]);
                                String str=String.valueOf(sensorNameList[which]);

                                String temp=null,hum=null,windAvg=null,windGust=null,rainRate=null,rainTotal=null,luminance=null,
                                        watt=null,windDirection=null,uv=null;
                                List<String> sensorValue=new ArrayList<String>();

                                    searchObject=new JSONObject();

                                for (int i = 0; i < JsonsensorList.length(); i++) {
                                    try {
                                        JSONObject currObject = JsonsensorList.getJSONObject(i);
                                        String sensorname = currObject.getString("name");
                                        if(sensorname.equals(str))
                                        {
                                            searchObject = currObject;
                                            Log.v("SearchObject",searchObject.toString(10));
                                            temp=searchObject.optString("temp");
                                            hum=searchObject.optString("humidity");
                                            luminance=searchObject.optString("lum");
                                            uv=searchObject.optString("uv");
                                            rainRate=searchObject.optString("rrate");
                                            rainTotal=searchObject.optString("rtot");
                                            windDirection=searchObject.optString("wdir");
                                            windAvg=searchObject.optString("wavg");
                                            windGust=searchObject.optString("wgust");
                                            watt=searchObject.optString("watt");
                                            lastUp=searchObject.optString("lastUpdated");


                                            Log.v("lastUpdated",lastUp);
                                            Log.v("temp",temp);
                                            Log.v("hum",hum);
                                            Log.v("luminance",luminance);
                                            Log.v("uv",uv);
                                            Log.v("rainRate",rainRate);
                                            Log.v("rainTotal",rainTotal);
                                            Log.v("windDirection",windDirection);
                                            Log.v("windAvg",windAvg);
                                            Log.v("windGust",windGust);
                                            Log.v("Watt",watt);

                                            if(watt!=null&!watt.equals(""))
                                            {
                                                sensorValue.add("watt");
                                            }

                                            if(temp!=null && !temp.equals(""))
                                            {
                                                sensorValue.add("temp");
                                            }
                                            if(hum!=null && !hum.equals(""))
                                            {
                                                sensorValue.add("humidity");

                                            }
                                            if(luminance!=null && !luminance.equals(""))
                                            {
                                                sensorValue.add("lum");
                                            }
                                            if(uv!=null&& !uv.equals(""))
                                            {
                                                sensorValue.add("uv");
                                            }
                                            if(rainRate!=null&& !rainRate.equals(""))
                                            {
                                                sensorValue.add("rrate");
                                            }
                                            if(rainTotal!=null&& !rainTotal.equals(""))
                                            {
                                                sensorValue.add("rtot");
                                            }
                                            if(windDirection!=null&& !windDirection.equals(""))
                                            {
                                                sensorValue.add("wdir");
                                            }
                                            if(windAvg!=null&& !windAvg.equals(""))
                                            {
                                                sensorValue.add("wavg");
                                            }
                                            if(windGust!=null&& !windGust.equals(""))
                                            {
                                                sensorValue.add("wgust");
                                            }

                                            sensorDataList = sensorValue.toArray(new CharSequence[sensorValue.size()]);
                                        }
                                    }
                                    catch (Exception e)
                                    {

                                    }
                              }
                                ad.dismiss();
                            }
                        });
                ad=builder.show();
            }
        });
        btSelectDisplayItem = (View) findViewById(R.id.btSelectDisplayItem);
        btSelectDisplayItem.setOnClickListener(new View.OnClickListener() {
            public int checkedItem;
            AlertDialog ad1;
            @Override
            public void onClick(View view) {

                AlertDialog.Builder builder = new AlertDialog.Builder(NewSensorWidgetConfigureActivity.this);
                builder.setTitle(R.string.pick_sensor_data)
                        .setSingleChoiceItems(sensorDataList, checkedItem, new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialogInterface, int i) {
                                sensorDataName.setText(sensorDataList[i]);

                                try {
                                   senValue = searchObject.getString(String.valueOf(sensorDataList[i]));

                                }catch (Exception ex)
                                {
                                    ex.printStackTrace();
                                }
                             //   sensorDataHint.setText(null);
                                ad1.dismiss();
                            }
                        });
                ad1=builder.show();
            }
        });
    }
    void createSensorApi() {
   //     accessToken=prefManager.getAccess();

        Log.d("&&&&&&&&&&&&&&&&&&&&&&&", "&&&&&&&&&&&&&&&&&&&&&&&&&&");

        pDialog = new ProgressDialog(NewSensorWidgetConfigureActivity.this);
        pDialog.setMax(5);
        pDialog.setMessage("Please wait...");
        pDialog.setCancelable(false);
        pDialog.show();

        AndroidNetworking.get("https://api.telldus.com/oauth2/sensors/list?includeValues=1")
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
                                if(name!=null&&!name.equals("null"))
                                {
                                    Integer id=curObj.getInt("id");
                                    String last=String.valueOf(curObj.getLong("lastUpdated"));
                                    DeviceID.put(name,id);
                                    Log.d("&&&&&&&&&&&&&&&&&&&&&&&", name);
                                    nameListItems.add(name);
                                    Log.v("Sensor response",response.toString());
                                }
                            }
                            sensorNameList = nameListItems.toArray(new CharSequence[nameListItems.size()]);
                         if (pDialog.isShowing())
                                pDialog.dismiss();
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }
                    }
                   @Override
                    public void onError(ANError anError) {
                        Log.v("AnError",anError.toString());
                        if (pDialog.isShowing())
                            pDialog.dismiss();
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
