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
import com.telldus.live.mobile.Utility.Sensor;

/**
 * The configuration screen for the {@link NewSensorWidget NewSensorWidget} AppWidget.
 */
public class NewSensorWidgetConfigureActivity extends Activity {

    int mAppWidgetId = AppWidgetManager.INVALID_APPWIDGET_ID;
    // private EditText etUrl;
    private Button btAdd,button_cancel;
    private View btSelectSensor, btSelectDisplayItem;
    private TextView sensorName, sensorHint, sensorDataName, sensorDataHint,chooseSettingSensor,testText,sensorText,settingText,valueText,tvIcon1,imgSensorType;
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

    private String client_ID;
    private String client_secret;
    private String grant_Type;
    private String user_name;
    private String password;
    Typeface iconFont;



    @Override
    public void onCreate(Bundle icicle) {
        super.onCreate(icicle);


        prefManager=new PrefManager(this);
        boolean avail=prefManager.getAvailability();
        if(!avail) {
            File fileAuth = new File(getApplicationContext().getFilesDir().getAbsolutePath() + "/auth.txt");
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
                    prefManager.AccessTokenDetails(accessToken, expiresIn);

                    Log.d("Auth token", accessToken);
                    Log.d("Expires in", expiresIn);
                    Log.d("Token type", tokenType);
                    Log.d("Scope", scope);
                    Log.d("Refresh token", refreshToken);


                    client_ID = String.valueOf(authInfo.getString("client_id"));
                    client_secret = String.valueOf(authInfo.getString("client_secret"));
                    grant_Type = String.valueOf(authInfo.getString("grant_type"));
                    user_name = String.valueOf(authInfo.getString("username"));
                    password = String.valueOf(authInfo.getString("password"));


                    prefManager.timeStampAccessToken(expiresIn);
                    prefManager.AccessTokenDetails(accessToken, expiresIn);
                    prefManager.infoAccessToken(client_ID, client_secret, grant_Type, user_name, password, refreshToken);


                    createSensorApi();
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }


            File fileSession = new File(getApplicationContext().getFilesDir().getAbsolutePath() + "/session.txt");
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
                    prefManager.saveSessionID(sesID, ttl);

                } catch (JSONException e) {
                    e.printStackTrace();
                }
                prefManager.checkAvailability(true);
            }

        }else
        {
            createSensorApi();
        }


        /*client_ID="XUTEKUFEJUBRUYA8E6UPH3ZUSPERAZUG";
        client_secret="NUKU6APRAKATRESPECHEX3WECRAPHUCA";
        grant_Type="password";
        user_name="developer@telldus.com";
        password="developer";
        refreshToken="89342c1e2c06d8e80aee7fed52eb666e62c931d8";

        prefManager.infoAccessToken(client_ID,client_secret,grant_Type,user_name,password,refreshToken);

        prefManager.saveSessionID("c87662c7bcebb21434610519bb7e480e0643ebee","10800");
        prefManager.AccessTokenDetails("3b450e2b5ca08615908c313f6ac85f792b9bdd8a","10800");

        createSensorApi();*/

        setResult(RESULT_CANCELED);

     //   setContentView(R.layout.activity_sensor_widget_configure);

        // activity stuffs
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
        button_cancel=(Button)findViewById(R.id.button_cancel);
        switch_background=(Switch)findViewById(R.id.switch_background);
        chooseSettingSensor=(TextView)findViewById(R.id.chooseSettingSensor);
        testText=(TextView)findViewById(R.id.testTextSensor);
        settingText = (TextView)findViewById(R.id.settingText);
        valueText = (TextView)findViewById(R.id.valueText);
        sensorText = (TextView)findViewById(R.id.sensorText);



        mSensorBack=(RelativeLayout)findViewById(R.id.sensorBack);
      //  switch_background.getThumbDrawable().setColorFilter(Color.GRAY, PorterDuff.Mode.MULTIPLY);

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

        // switch_background.getThumbDrawable().setColorFilter(Color.GRAY, PorterDuff.Mode.MULTIPLY);
        // switch_background.getTrackDrawable().setColorFilter(Color.DKGRAY, PorterDuff.Mode.MULTIPLY);

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
                if(isChecked)
                {
                    transparent="true";
                    // switch_background.getThumbDrawable().setColorFilter(isChecked ? getResources().getColor(R.color.lightblue) : Color.WHITE, PorterDuff.Mode.MULTIPLY);
                    // switch_background.getTrackDrawable().setColorFilter(!isChecked ? Color.BLACK : Color.GRAY, PorterDuff.Mode.MULTIPLY);
                }else
                {
                    transparent="false";
                    // switch_background.getThumbDrawable().setColorFilter(isChecked ? Color.BLACK : Color.GRAY, PorterDuff.Mode.MULTIPLY);
                    // switch_background.getTrackDrawable().setColorFilter(!isChecked ? Color.DKGRAY : Color.WHITE, PorterDuff.Mode.MULTIPLY);
                }
            }
        });

        btAdd.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                boolean token_service=prefManager.getTokenService();

                boolean b=isMyServiceRunning(NetworkInfo.class);
                if (!b)
                {
                    startService(new Intent(getApplicationContext(), NetworkInfo.class));
                    // startService(new Intent(getApplicationContext(), AEScreenOnOffService.class));
                }

                boolean b1=prefManager.getSensorDB();
                if(!b1)
                {
                    prefManager.sensorDB(true);
                }

                if(!token_service) {
                    prefManager.TokenService(true);
                    // Service for Access token
                    Intent serviceIntent = new Intent(getApplicationContext(), AccessTokenService.class);
                    startService(serviceIntent);
                }else
                {
                    Toast.makeText(getApplicationContext(),"service already running",Toast.LENGTH_SHORT).show();
                }

                SensorInfo mSensorInfo=new SensorInfo(mAppWidgetId,sensorName.getText().toString(),
                        Sensor.getValueLang(sensorDataName.getText().toString()),id,senValue,lastUp,transparent);
                database.addSensor(mSensorInfo);
                views.setTextViewText(R.id.txtSensorType, sensorName.getText());
              //  views.setImageViewResource(R.id.iconSensor, R.drawable.sensor);
                //  widgetManager.updateAppWidget(mAppWidgetId, views);
                NewSensorWidget.updateAppWidget(getApplicationContext(),widgetManager,mAppWidgetId);

            /*    boolean b11=isMyServiceRunning(MyService.class);
                if (!b11)
                {
                    startService(new Intent(getApplicationContext(), MyService.class));
                    // startService(new Intent(getApplicationContext(), AEScreenOnOffService.class));
                }*/

                boolean web_service=prefManager.getWebService();
                if(!web_service) {
                    prefManager.websocketService(true);
                    // Service for Access token
                    Intent serviceIntent = new Intent(getApplicationContext(), MyService.class);
                    startService(serviceIntent);
                }else
                {
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
                                                 if(!sensorValue.contains("Watt"))
                                                 sensorValue.add(Sensor.getStringValueFromLang("watt"));
                                             }

                                             if(temp!=null && !temp.equals(""))
                                             {
                                                 if(!sensorValue.contains("Temperature"))
                                                 sensorValue.add(Sensor.getStringValueFromLang("temp"));
                                             }
                                             if(hum!=null && !hum.equals(""))
                                             {
                                                 if(!sensorValue.contains("Humidity"))
                                                 sensorValue.add(Sensor.getStringValueFromLang("humidity"));

                                             }
                                             if(luminance!=null && !luminance.equals(""))
                                             {
                                                 if(!sensorValue.contains("Luminance"))
                                                     sensorValue.add(Sensor.getStringValueFromLang("lum"));
                                             }
                                             if(uv!=null&& !uv.equals(""))
                                             {
                                                 if(!sensorValue.contains("Uv"))
                                                     sensorValue.add(Sensor.getStringValueFromLang("uv"));
                                             }
                                             if(rainRate!=null&& !rainRate.equals(""))
                                             {
                                                 if(!sensorValue.contains("Rain_rate"))
                                                     sensorValue.add(Sensor.getStringValueFromLang("rrate"));
                                             }
                                             if(rainTotal!=null&& !rainTotal.equals(""))
                                             {
                                                 if(!sensorValue.contains("Rain_total"))
                                                     sensorValue.add(Sensor.getStringValueFromLang("rtot"));
                                             }
                                             if(windDirection!=null&& !windDirection.equals(""))
                                             {
                                                 if(!sensorValue.contains("Wind_direction"))
                                                     sensorValue.add(Sensor.getStringValueFromLang("wdir"));
                                             }
                                             if(windAvg!=null&& !windAvg.equals(""))
                                             {
                                                 if(!sensorValue.contains("Wind_average"))
                                                     sensorValue.add(Sensor.getStringValueFromLang("wavg"));
                                             }
                                             if(windGust!=null&& !windGust.equals(""))
                                             {
                                                 if(!sensorValue.contains("Wgust"))
                                                     sensorValue.add(Sensor.getStringValueFromLang("wgust"));
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

                AlertDialog.Builder builder = new AlertDialog.Builder(NewSensorWidgetConfigureActivity.this, R.style.MaterialThemeDialog);
                builder.setTitle(R.string.pick_sensor_data)
                        .setSingleChoiceItems(sensorDataList, checkedItem, new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialogInterface, int i) {
                                sensorDataName.setText(sensorDataList[i]);

                                try {
                                  String iconName="";
                                  String sensorIcon=sensorDataList[i].toString();
                                  String str=Sensor.getValueLang(sensorIcon);
                                  Log.i("sensorIcon",Sensor.getValueLang(sensorIcon));

                                  senValue = searchObject.getString(str);


                                  if(str.equals("wgust")||str.equals("wavg")||str.equals("wdir"))
                                  {

                                      iconName = "wind";


                                  }else if(str.equals("watt"))
                                  {

                                      iconName = "watt";

                                  } else if (str.equals("temp"))
                                  {

                                      iconName = "temperature";

                                  }else if(str.equals("humidity"))
                                  {

                                      iconName = "humidity";


                                  }else if(str.equals("lum"))
                                  {

                                      iconName = "luminance";

                                  }else if(str.equals("rrate")|| str.equals("rtot"))
                                  {

                                      iconName = "rain";

                                  }else if(str.equals("uv"))
                                  {

                                      iconName = "uv";

                                  }
                                  imgSensorType.setText(iconName);
                                  imgSensorType.setTextSize(50f);
                                  imgSensorType.setBackground(null);
                                  imgSensorType.setTypeface(iconFont);
                                   // imgSensorType.setImageBitmap(buildUpdate(iconName,getApplicationContext()));


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


    public static Bitmap buildUpdate(String time, Context context)
    {
        Bitmap myBitmap = Bitmap.createBitmap(160, 84, Bitmap.Config.ARGB_8888);
        Canvas myCanvas = new Canvas(myBitmap);
        Paint paint = new Paint();

        // Typeface iconFont = Typeface.createFromAsset(context.getAssets(),"fonts/Comfortaa_Thin.ttf");
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
        accessToken=prefManager.getAccess();

        Log.d("&&&&&&&&&&&&&&&&&&&&&&&", "&&&&&&&&&&&&&&&&&&&&&&&&&&");

     /*   pDialog = new ProgressDialog(NewSensorWidgetConfigureActivity.this);
        pDialog.setMax(5);
        pDialog.setMessage("Please wait...");
        pDialog.setCancelable(false);
        pDialog.show();*/

        AndroidNetworking.get("https://api3.telldus.com/oauth2/sensors/list?includeValues=1")
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
                        /* if (pDialog.isShowing())
                                pDialog.dismiss();*/
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }
                    }
                   @Override
                    public void onError(ANError anError) {
                       Log.v("AnError", anError.toString());
                      /* if (pDialog.isShowing()) {
                           pDialog.dismiss();

                       }*/
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
