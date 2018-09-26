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

import com.androidnetworking.AndroidNetworking;
import com.androidnetworking.common.Priority;
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
/**
 * The configuration screen for the {@link NewOnOffWidget NewOnOffWidget} AppWidget.
 */
public class NewOnOffWidgetConfigureActivity extends Activity {
    private static final String ACTION_ON = "ACTION_ON";
    private static final String ACTION_OFF="ACTION_OFF";
    private ProgressDialog pDialog;
    CharSequence[] deviceNameList = null;
    List<String> nameListItems = new ArrayList<String>();
    CharSequence[] deviceStateList = null;
    List<String> stateListItems = new ArrayList<String>();
    Map<String,Integer> DeviceID=new HashMap<String,Integer>();
    int id;


    //  List<String> mList=new ArrayList<String>();

    MyDBHandler db = new MyDBHandler(this);


    //UI

    int mAppWidgetId = AppWidgetManager.INVALID_APPWIDGET_ID;
    //    private EditText etUrl;
    private Button btAdd,btnCan;
    private View btSelectDevice;
    TextView deviceName, deviceHint, deviceOn, deviceOff,chooseSetting,textTest, deviceText, settingText;
    ImageView deviceState;
    private AppWidgetManager widgetManager;
    private RemoteViews views;
    Switch switch_background;


    private String accessToken;
    private String expiresIn;
    private String tokenType;
    private String scope;
    private String refreshToken;

    private String client_ID;
    private String client_secret;
    private String grant_Type;
    private String user_name;
    private String password;


    int stateID;

    private String sesID;
    private String ttl;
    MyDBHandler database=new MyDBHandler(this);
    private PrefManager prefManager;
    private String switchStatus="false";
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


                    createDeviceApi();
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
            createDeviceApi();
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
        setContentView(R.layout.new_on_off_widget_configure);
        views = new RemoteViews(this.getPackageName(), R.layout.new_app_widget);
        widgetManager = AppWidgetManager.getInstance(this);

        textTest=(TextView)findViewById(R.id.testText);
        chooseSetting=(TextView)findViewById(R.id.chooseSetting);
        deviceName = (TextView) findViewById(R.id.txtDeviceName);
        deviceHint = (TextView) findViewById(R.id.txtDeviceHint);
        backDevice=(ImageView)findViewById(R.id.backdevice);
        deviceText = (TextView)findViewById(R.id.deviceText);
        settingText = (TextView)findViewById(R.id.settingText);

        mBackLayout=(RelativeLayout)findViewById(R.id.deviceBack);
        mBackLayout.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });
        btnCan=(Button)findViewById(R.id.btn_cancel);
        btnCan.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });


        switch_background=(Switch)findViewById(R.id.switch_background);
        // switch_background.getThumbDrawable().setColorFilter(Color.GRAY, PorterDuff.Mode.MULTIPLY);
        // switch_background.getTrackDrawable().setColorFilter(Color.DKGRAY, PorterDuff.Mode.MULTIPLY);



        Typeface iconFont = FontManager.getTypeface(getApplicationContext(), FontManager.FONTAWESOME);
        tvIcon1 = (TextView) findViewById(R.id.tvIcon1);
        tvIcon1.setText("device-alt");
        tvIcon1.setTypeface(iconFont);


        switch_background.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
                // do something, the isChecked will be
                // true if the switch is in the On position
                if(isChecked)
                {
                    switchStatus="true";
                    // switch_background.getThumbDrawable().setColorFilter(isChecked ? getResources().getColor(R.color.lightblue) : Color.WHITE, PorterDuff.Mode.MULTIPLY);
                    // switch_background.getTrackDrawable().setColorFilter(!isChecked ? Color.BLACK : Color.GRAY, PorterDuff.Mode.MULTIPLY);

                }else
                {
                    switchStatus="false";
                    // switch_background.getThumbDrawable().setColorFilter(isChecked ? Color.BLACK : Color.GRAY, PorterDuff.Mode.MULTIPLY);
                    // switch_background.getTrackDrawable().setColorFilter(!isChecked ? Color.DKGRAY : Color.WHITE, PorterDuff.Mode.MULTIPLY);

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
        //    Toast.makeText(getApplicationContext(),String.valueOf(mAppWidgetId),Toast.LENGTH_LONG).show();
        final String[] deviceStateVal = {"0"};


        btAdd = (Button) findViewById(R.id.btAdd);
        btAdd.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                //    Toast.makeText(getApplicationContext(),deviceStateVal[0].toString(),Toast.LENGTH_SHORT).show();



                boolean b=isMyServiceRunning(NetworkInfo.class);
                if (!b)
                {
                    startService(new Intent(getApplicationContext(), NetworkInfo.class));
                    // startService(new Intent(getApplicationContext(), AEScreenOnOffService.class));
                }

                boolean b1=prefManager.getDeviceDB();
                if(!b1)
                {
                    prefManager.DeviceDB(true);
                }


                boolean token_service=prefManager.getTokenService();
                if(!token_service) {
                    prefManager.TokenService(true);
                    // Service for Access token
                    Intent serviceIntent = new Intent(getApplicationContext(), AccessTokenService.class);
                    startService(serviceIntent);
                }else
                {
                    Toast.makeText(getApplicationContext(),"service already running",Toast.LENGTH_SHORT).show();
                }
                views.setTextViewText(R.id.txtWidgetTitle, deviceName.getText());



                DeviceInfo mInsert=new DeviceInfo(deviceStateVal[0],mAppWidgetId,id,deviceName.getText().toString(),switchStatus);
                db.addUser(mInsert);
                NewOnOffWidget.updateAppWidget(getApplicationContext(),widgetManager,mAppWidgetId);


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


        btSelectDevice = (View) findViewById(R.id.btSelectDevice);
        btSelectDevice.setOnClickListener(new View.OnClickListener() {
            public int checkedItem;
            AlertDialog ad;
            public void onClick(View view) {
                final AlertDialog.Builder builder = new AlertDialog.Builder(NewOnOffWidgetConfigureActivity.this
                        ,R.style.MaterialThemeDialog);
                builder.setTitle(R.string.pick_device)
                        .setSingleChoiceItems(deviceNameList, checkedItem, new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface dialog, int which) {
                                deviceName.setText(deviceNameList[which]);
                                id=DeviceID.get(deviceNameList[which]);

                                //    deviceHint.setText(null);
                                deviceStateVal[0] = (String) deviceStateList[which];
                                Toast.makeText(getApplicationContext(),deviceStateVal[0].toString(),Toast.LENGTH_LONG).show();
                                ad.dismiss();


                            }
                        });
                ad = builder.show();//   builder.show();
            }
        });
        //AwesomeFont--
        //   Typeface iconFont = FontManager.getTypeface(getApplicationContext(), FontManager.FONTAWESOME);

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



        //  deviceText.setTypeface(iconFont);



    }


    void createDeviceApi() {
        accessToken=prefManager.getAccess();
      /*  pDialog = new ProgressDialog(NewAppWidgetConfigureActivity.this);
        pDialog.setMax(5);
        pDialog.setMessage("Please wait...");
        pDialog.setCancelable(false);
        pDialog.show();*/

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
                            Log.v("JSON Object",deviceData.toString());
                            JSONArray deviceList = deviceData.getJSONArray("device");

                            for (int i = 0; i < deviceList.length(); i++) {
                                JSONObject curObj = deviceList.getJSONObject(i);
                                String name = curObj.getString("name");
                                stateID = curObj.getInt("state");

                                if (stateID == 1 || stateID == 2 /*||stateID == 4 || stateID == 128 ||stateID == 256 || stateID == 512 || stateID == 16*/) {
                                    Integer id = curObj.getInt("id");
                                    DeviceID.put(name, id);
                                    nameListItems.add(name);
                                    stateListItems.add(String.valueOf(stateID));
                                }
                            }
                            deviceNameList = nameListItems.toArray(new CharSequence[nameListItems.size()]);
                            deviceStateList = stateListItems.toArray(new CharSequence[stateListItems.size()]);
                          /*  if (pDialog.isShowing())
                                pDialog.dismiss();*/
                            //  Toast.makeText(getApplicationContext(),deviceStateList.toString(),Toast.LENGTH_LONG).show();
                        } catch (JSONException e) {
                            e.printStackTrace();
                        };
                    }

                    @Override
                    public void onError(ANError anError) {
                       /* if (pDialog.isShowing())
                        {

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
