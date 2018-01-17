package com.telldus.live.mobile;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.PendingIntent;
import android.app.ProgressDialog;
import android.appwidget.AppWidgetManager;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.RemoteViews;
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

import com.telldus.live.mobile.Model.DeviceInfo;

/**
 * The configuration screen for the {@link DeviceWidget DeviceWidget} AppWidget.
 */
public class DeviceWidgetConfigureActivity extends Activity {

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
    TextView deviceName, deviceHint, deviceOn, deviceOff;
    ImageView deviceState;
    private AppWidgetManager widgetManager;
    private RemoteViews views;

    private String accessToken;
    private String expiresIn;
    private String tokenType;
    private String scope;
    private String refreshToken;
    int stateID;

    private String sesID;
    private String ttl;
    MyDBHandler database=new MyDBHandler(this);
    private PrefManager prefManager;


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

               createDeviceApi();
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
        setResult(RESULT_CANCELED);
        setContentView(R.layout.activity_device_widget_configure);
        views = new RemoteViews(this.getPackageName(), R.layout.configurable_device_widget);
        widgetManager = AppWidgetManager.getInstance(this);

//        createDeviceApi();


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
       Toast.makeText(getApplicationContext(),String.valueOf(mAppWidgetId),Toast.LENGTH_LONG).show();
        final String[] deviceStateVal = {"0"};
        deviceName = (TextView) findViewById(R.id.txtDeviceName);
        deviceHint = (TextView) findViewById(R.id.txtDeviceHint);


        btAdd = (Button) findViewById(R.id.btAdd);
        btAdd.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                views.setTextViewText(R.id.txtWidgetTitle, deviceName.getText());

                DeviceInfo mInsert=new DeviceInfo(deviceStateVal[0],mAppWidgetId,id,deviceName.getText().toString());
                db.addUser(mInsert);
                  DeviceWidget.updateAppWidget(getApplicationContext(),widgetManager,mAppWidgetId);
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
                final AlertDialog.Builder builder = new AlertDialog.Builder(DeviceWidgetConfigureActivity.this);
                builder.setTitle(R.string.pick_device)
                        .setSingleChoiceItems(deviceNameList, checkedItem, new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface dialog, int which) {
                                deviceName.setText(deviceNameList[which]);
                                id=DeviceID.get(deviceNameList[which]);

                                deviceHint.setText(null);
                                deviceStateVal[0] = (String) deviceStateList[which];
                             //   Toast.makeText(getApplicationContext(),deviceStateVal[0].toString(),Toast.LENGTH_LONG).show();
                                ad.dismiss();


                            }
                        });
                ad = builder.show();//   builder.show();
            }
        });


    }



    void createDeviceApi() {
        pDialog = new ProgressDialog(DeviceWidgetConfigureActivity.this);
        pDialog.setMax(5);
        pDialog.setMessage("Please wait...");
        pDialog.setCancelable(false);
        pDialog.show();

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
                           // Log.v("JSON Object",deviceData.toString());
                            JSONArray deviceList = deviceData.getJSONArray("device");




                            for (int i = 0; i < deviceList.length(); i++) {
                                JSONObject curObj = deviceList.getJSONObject(i);
                                String name = curObj.getString("name");
                                stateID = curObj.getInt("state");


                                if (stateID == 1 || stateID == 2) {
                                    Integer id = curObj.getInt("id");
                                    DeviceID.put(name, id);
                                    nameListItems.add(name);
                                    stateListItems.add(String.valueOf(stateID));

                                }
                            }
                            deviceNameList = nameListItems.toArray(new CharSequence[nameListItems.size()]);
                            deviceStateList = stateListItems.toArray(new CharSequence[stateListItems.size()]);
                            if (pDialog.isShowing())
                                pDialog.dismiss();
                         //  Toast.makeText(getApplicationContext(),deviceStateList.toString(),Toast.LENGTH_LONG).show();
                        } catch (JSONException e) {
                            e.printStackTrace();
                        };
                    }

                    @Override
                    public void onError(ANError anError) {
                        if (pDialog.isShowing())
                            pDialog.dismiss();
                    }
                });
    }
}
