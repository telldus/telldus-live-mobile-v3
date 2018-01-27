package com.telldus.live.mobile;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.util.Log;
import android.widget.RemoteViews;
import android.widget.Toast;

import com.androidnetworking.AndroidNetworking;
import com.androidnetworking.common.Priority;
import com.androidnetworking.error.ANError;
import com.androidnetworking.interfaces.JSONObjectRequestListener;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;

import com.telldus.live.mobile.Database.MyDBHandler;
import com.telldus.live.mobile.Database.PrefManager;
import com.telldus.live.mobile.Model.DeviceInfo;

/**
 * Implementation of App Widget functionality.
 * App Widget Configuration implemented in {@link NewAppWidgetConfigureActivity NewAppWidgetConfigureActivity}
 */
public class NewAppWidget extends AppWidgetProvider {

    private static final String ACTION_ON = "ACTION_ON";
    private static final String ACTION_OFF="ACTION_OFF";


    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager,
                                int appWidgetId) {
        MyDBHandler db = new MyDBHandler(context);

        CharSequence widgetText = "Telldus";
        String transparent;

        DeviceInfo widgetID=db.findUser(appWidgetId);
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.configurable_device_widget);

        views.setOnClickPendingIntent(R.id.iconOn,getPendingSelf(context,ACTION_ON,appWidgetId));
        views.setOnClickPendingIntent(R.id.iconOff,getPendingSelf(context,ACTION_OFF,appWidgetId));

        if(widgetID!=null)
        {
            widgetText = widgetID.getDeviceName();
            String action=widgetID.getState();
            if(action.equals("1"))
            {
                //    Toast.makeText(context,"On",Toast.LENGTH_LONG).show();
                views.setImageViewResource(R.id.iconOn, R.drawable.on_dark);
                views.setImageViewResource(R.id.iconOff,R.drawable.off_light);
                //       ComponentName appWidget = new ComponentName(context, DeviceWidget.class);


            }
            if(action.equals("2"))
            {
                //  Toast.makeText(context,"OFF",Toast.LENGTH_LONG).show();
                views.setImageViewResource(R.id.iconOn, R.drawable.on_light);
                views.setImageViewResource(R.id.iconOff,R.drawable.off_dark);

            }
            transparent=widgetID.getTransparent();
            if(transparent.equals("true"))
            {
                views.setInt(R.id.iconWidget,"setBackgroundColor", Color.TRANSPARENT);
                views.setInt(R.id.onLayout,"setBackgroundColor", Color.TRANSPARENT);
                views.setInt(R.id.offLinear,"setBackgroundColor", Color.TRANSPARENT);
            }

        }
        /*views.setInt(R.id.iconWidget,"setBackgroundColor", Color.TRANSPARENT);
        views.setInt(R.id.onLayout,"setBackgroundColor", Color.TRANSPARENT);
        views.setInt(R.id.offLinear,"setBackgroundColor", Color.TRANSPARENT);*/

        views.setTextViewText(R.id.txtWidgetTitle, widgetText);
        // Instruct the widget manager to update the widget
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        // There may be multiple widgets active, so update all of them
        for (int appWidgetId : appWidgetIds) {


            RemoteViews views=new RemoteViews(context.getPackageName(),R.layout.configurable_device_widget);

            views.setOnClickPendingIntent(R.id.iconOn,getPendingSelfIntent(context,ACTION_ON,appWidgetId));
            views.setOnClickPendingIntent(R.id.iconOff, getPendingSelfIntent(context, ACTION_OFF,appWidgetId));

            //Toast.makeText(context,"Action On-->"+String.valueOf(appWidgetId),Toast.LENGTH_LONG).show();

            appWidgetManager.updateAppWidget(appWidgetId, views);
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    protected PendingIntent getPendingSelfIntent(Context context, String action, int id) {
        Intent intent = new Intent(context, getClass());
        intent.setAction(action);
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID,id);
        return PendingIntent.getBroadcast(context, id, intent, 0);
    }


    private static PendingIntent getPendingSelf(Context context, String action, int id) {
        Intent intent = new Intent(context, NewAppWidget.class);
        intent.setAction(action);
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID,id);
        return PendingIntent.getBroadcast(context, id, intent, 0);
    }


    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);

        MyDBHandler db = new MyDBHandler(context);


        if (ACTION_ON.equals(intent.getAction())) {
            String accessToken="";
            String expiresIn;
            String tokenType;
            String scope;
            String refreshToken;

            Bundle extras=intent.getExtras();
            int wigetID=extras.getInt(AppWidgetManager.EXTRA_APPWIDGET_ID,AppWidgetManager.INVALID_APPWIDGET_ID);
            DeviceInfo widgetID=db.getSinlgeDeviceID(wigetID);

            String state=widgetID.getState();
            if(state.equals("1"))
            {
                Toast.makeText(context,"Already Turned on",Toast.LENGTH_LONG).show();
            }else
            {
                // createDeviceApi(context,widgetID.getDeviceID(),1,wigetID,db,"On",accessToken);


                File fileAuth = new File(context.getFilesDir().getAbsolutePath() + "/RNFS-BackedUp/auth.txt");
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

                        Log.d("Auth token", accessToken);
                        Log.d("Expires in", expiresIn);
                        Log.d("Token type", tokenType);
                        Log.d("Scope", scope);
                        Log.d("Refresh token", refreshToken);

                        createDeviceApi(context,widgetID.getDeviceID(),1,wigetID,db,"On",accessToken);
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                }
               // createDeviceApi(context,widgetID.getDeviceID(),1,wigetID,db,"On",accessToken);
            }




        }
        if(ACTION_OFF.equals(intent.getAction()))
        {
            // DeviceInfo widgetID=db.findUser(appWidgetId);

            String accessToken="";
            String expiresIn;
            String tokenType;
            String scope;
            String refreshToken;

            Bundle extras=intent.getExtras();
            int wigetID=extras.getInt(AppWidgetManager.EXTRA_APPWIDGET_ID,AppWidgetManager.INVALID_APPWIDGET_ID);

            DeviceInfo id=db.getSinlgeDeviceID(wigetID);

            String state=id.getState();
            if(state.equals("2"))
            {
                Toast.makeText(context,"Already Turned off",Toast.LENGTH_LONG).show();
            }else
            {
                File fileAuth = new File(context.getFilesDir().getAbsolutePath() + "/RNFS-BackedUp/auth.txt");
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

                        Log.d("Auth token", accessToken);
                        Log.d("Expires in", expiresIn);
                        Log.d("Token type", tokenType);
                        Log.d("Scope", scope);
                        Log.d("Refresh token", refreshToken);

                        createDeviceApi(context,id.getDeviceID(),2,wigetID,db,"Off",accessToken);
                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                }
              //  createDeviceApi(context,id.getDeviceID(),2,wigetID,db,"Off",accessToken);
            }
        }
    }


    @Override
    public void onEnabled(Context context) {
        // Enter relevant functionality for when the first widget is created
    }

    @Override
    public void onDisabled(Context context) {
        // Enter relevant functionality for when the last widget is disabled
    }

    @Override
    public void onDeleted(Context context, int[] appWidgetIds) {
        super.onDeleted(context, appWidgetIds);
        MyDBHandler db = new MyDBHandler(context);
        for (int appWidgetId : appWidgetIds) {
            boolean b=db.delete(appWidgetId);
            if(b)
            {
                Toast.makeText(context,"Successfully deleted",Toast.LENGTH_LONG).show();
            }else
            {
                Toast.makeText(context,"Widget not created",Toast.LENGTH_LONG).show();
            }
        }
    }

    void createDeviceApi(final Context ctx, int deviceid, int method, final int wigetID, final MyDBHandler db, final String action,String accessToken) {
     //   PrefManager prefManager=new PrefManager(ctx);
      //  accessToken=prefManager.getAccess();
        String str="https://api3.telldus.com/oauth2/device/command?id="+deviceid+"&method="+method+"&value=null";
        Log.v("***********",str);
        AndroidNetworking.get("https://api3.telldus.com/oauth2/device/command?id="+deviceid+"&method="+method+"&value=null")
                .addHeaders("Content-Type", "application/json")
                .addHeaders("Accpet", "application/json")
                .addHeaders("Authorization", "Bearer " + accessToken)
                .setPriority(Priority.LOW)
                .build()
                .getAsJSONObject(new JSONObjectRequestListener() {
                    @Override
                    public void onResponse(JSONObject response) {
                        try {
                            Log.v("------->",response.toString());

                            String status=response.optString("status");
                            String error=response.optString("error");

                            if(!status.isEmpty()&&status!=null&&action.equals("On"))
                            {
                                boolean b=db.updateAction("1",wigetID);
                                RemoteViews remoteViews = new RemoteViews(ctx.getPackageName(), R.layout.configurable_device_widget);
                                remoteViews.setImageViewResource(R.id.iconOn, R.drawable.on_dark);
                                remoteViews.setImageViewResource(R.id.iconOff,R.drawable.off_light);
                                AppWidgetManager appWidgetManager  = AppWidgetManager.getInstance(ctx);
                                //   appWidgetManager.updateAppWidget(appWidget, remoteViews);
                                appWidgetManager.updateAppWidget(wigetID,remoteViews);

                                Toast.makeText(ctx,"Turn on  "+status,Toast.LENGTH_LONG).show();
                            }

                            if(!status.isEmpty()&&status!=null&&action.equals("Off"))
                            {
                                boolean b=db.updateAction("2",wigetID);
                                RemoteViews remoteViews = new RemoteViews(ctx.getPackageName(), R.layout.configurable_device_widget);
                                remoteViews.setImageViewResource(R.id.iconOn, R.drawable.on_light);
                                remoteViews.setImageViewResource(R.id.iconOff,R.drawable.off_dark);
                                AppWidgetManager appWidgetManager  = AppWidgetManager.getInstance(ctx);
                                //   appWidgetManager.updateAppWidget(appWidget, remoteViews);
                                appWidgetManager.updateAppWidget(wigetID,remoteViews);

                                Toast.makeText(ctx,"Turn off "+status,Toast.LENGTH_LONG).show();
                            }


                            if(!error.isEmpty()&&error!=null)
                            {

                                Toast.makeText(ctx,error,Toast.LENGTH_LONG).show();
                            }


                            if(!error.isEmpty()&&error!=null&&action.equals("Off"))
                            {

                                Toast.makeText(ctx,error,Toast.LENGTH_LONG).show();
                            }


                        } catch (Exception e) {
                            e.printStackTrace();
                        };
                    }

                    @Override
                    public void onError(ANError anError) {

                    }
                });
    }
}
