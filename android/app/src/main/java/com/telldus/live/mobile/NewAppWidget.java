package com.telldus.live.mobile;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.RemoteViews;
import android.widget.Toast;

import com.androidnetworking.AndroidNetworking;
import com.androidnetworking.common.Priority;
import com.androidnetworking.error.ANError;
import com.androidnetworking.interfaces.JSONObjectRequestListener;

import org.json.JSONObject;

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
    private static final String ACTION_BELL="ACTION_BELL";
    private static final String ACTION_UP = "ACTION_UP";
    private static final String ACTION_DOWN = "ACTION_DOWN";
    private static final String ACTION_STOP = "ACTION_STOP";

    private PendingIntent pendingIntent;


    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager,
                                int appWidgetId) {
        MyDBHandler db = new MyDBHandler(context);

        CharSequence widgetText = "Telldus";
        String transparent;
        DeviceInfo widgetID=db.findUser(appWidgetId);

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.new_app_widget);

        views.setOnClickPendingIntent(R.id.iconOn,getPendingSelf(context,ACTION_ON,appWidgetId));
        views.setOnClickPendingIntent(R.id.iconOff,getPendingSelf(context,ACTION_OFF,appWidgetId));

        if(widgetID!=null)
        {
            widgetText = widgetID.getDeviceName();
            String action=widgetID.getState();
            if(action.equals("1"))
            {
                views.setViewVisibility(R.id.parentLayout,View.VISIBLE);
                //    Toast.makeText(context,"On",Toast.LENGTH_LONG).show();
                views.setImageViewResource(R.id.iconOn, R.drawable.on_dark);
                views.setImageViewResource(R.id.iconOff,R.drawable.off_light);
                //       ComponentName appWidget = new ComponentName(context, DeviceWidget.class);

            }
            if(action.equals("2"))
            {
                views.setViewVisibility(R.id.parentLayout,View.VISIBLE);
                //  Toast.makeText(context,"OFF",Toast.LENGTH_LONG).show();
                views.setImageViewResource(R.id.iconOn, R.drawable.on_light);
                views.setImageViewResource(R.id.iconOff,R.drawable.off_dark);

            }
            if(action.equals("4"))
            {
                Log.v("BELL","*********************************");
                views.setViewVisibility(R.id.bellLinear,View.VISIBLE);
                views.setOnClickPendingIntent(R.id.bell,getPendingBELL(context,ACTION_BELL,appWidgetId));
            }
            if (action.equals("128")|| action.equals("256")|| action.equals("512"))
            {
                views.setViewVisibility(R.id.updownarrow,View.VISIBLE);
                views.setOnClickPendingIntent(R.id.uparrow,getPendingBELL(context,ACTION_UP,appWidgetId));
                views.setOnClickPendingIntent(R.id.downarrow,getPendingBELL(context,ACTION_DOWN,appWidgetId));
                views.setOnClickPendingIntent(R.id.stopicon,getPendingBELL(context,ACTION_STOP,appWidgetId));
            }


            transparent=widgetID.getTransparent();
            if(transparent.equals("true"))
            {
                views.setInt(R.id.iconWidget,"setBackgroundColor", Color.TRANSPARENT);
                views.setInt(R.id.onLayout,"setBackgroundColor", Color.TRANSPARENT);
                views.setInt(R.id.offLinear,"setBackgroundColor", Color.TRANSPARENT);
            }

        }
        views.setTextViewText(R.id.txtWidgetTitle, widgetText);
        // Instruct the widget manager to update the widget
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        // There may be multiple widgets active, so update all of them
        for (int appWidgetId : appWidgetIds) {


          //  RemoteViews views=new RemoteViews(context.getPackageName(),R.layout.new_app_widget);

         //   views.setOnClickPendingIntent(R.id.iconOn,getPendingSelfIntent(context,ACTION_ON,appWidgetId));
           // views.setOnClickPendingIntent(R.id.iconOff, getPendingSelfIntent(context, ACTION_OFF,appWidgetId));


            //Toast.makeText(context,"Action On-->"+String.valueOf(appWidgetId),Toast.LENGTH_LONG).show();

            //appWidgetManager.updateAppWidget(appWidgetId, views);
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

    private static PendingIntent getPendingBELL(Context context,String action,int id)
    {
        Intent intent=new Intent(context,NewAppWidget.class);
        intent.setAction(action);
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID,id);
        return PendingIntent.getBroadcast(context,id,intent,0);
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
               createDeviceApi(context,widgetID.getDeviceID(),1,wigetID,db,"On");
            }

        }
        if(ACTION_OFF.equals(intent.getAction()))
        {
            // DeviceInfo widgetID=db.findUser(appWidgetId);


            Bundle extras=intent.getExtras();
            int wigetID=extras.getInt(AppWidgetManager.EXTRA_APPWIDGET_ID,AppWidgetManager.INVALID_APPWIDGET_ID);

            DeviceInfo id=db.getSinlgeDeviceID(wigetID);

            String state=id.getState();
            if(state.equals("2"))
            {
                Toast.makeText(context,"Already Turned off",Toast.LENGTH_LONG).show();
            }else
            {
                createDeviceApi(context,id.getDeviceID(),2,wigetID,db,"Off");
            }
        }
        if(ACTION_BELL.equals(intent.getAction()))
        {
            Log.v("ACTION_BELL","AlarmService");
            Bundle extras=intent.getExtras();
            int wigetID=extras.getInt(AppWidgetManager.EXTRA_APPWIDGET_ID,AppWidgetManager.INVALID_APPWIDGET_ID);

            DeviceInfo id=db.getSinlgeDeviceID(wigetID);
            createDeviceApi(context,id.getDeviceID(),4,wigetID,db,"Bell");

        }
        if (ACTION_UP.equals(intent.getAction()))
        {
            //Toast.makeText(context, "Clicked Up", Toast.LENGTH_LONG).show();

            Bundle extras=intent.getExtras();
            int wigetID=extras.getInt(AppWidgetManager.EXTRA_APPWIDGET_ID,AppWidgetManager.INVALID_APPWIDGET_ID);

            DeviceInfo id=db.getSinlgeDeviceID(wigetID);
            createDeviceApi(context,id.getDeviceID(),128,wigetID,db,"UDS");
        }
        if (ACTION_DOWN.equals(intent.getAction()))
        {
            //Toast.makeText(context, "Clicked Down", Toast.LENGTH_LONG).show();
            Bundle extras=intent.getExtras();
            int wigetID=extras.getInt(AppWidgetManager.EXTRA_APPWIDGET_ID,AppWidgetManager.INVALID_APPWIDGET_ID);

            DeviceInfo id=db.getSinlgeDeviceID(wigetID);
            createDeviceApi(context,id.getDeviceID(),256,wigetID,db,"UDS");
        }
        if (ACTION_STOP.equals(intent.getAction()))
        {
           // Toast.makeText(context, "Clicked Stop", Toast.LENGTH_LONG).show();
            Bundle extras=intent.getExtras();
            int wigetID=extras.getInt(AppWidgetManager.EXTRA_APPWIDGET_ID,AppWidgetManager.INVALID_APPWIDGET_ID);

            DeviceInfo id=db.getSinlgeDeviceID(wigetID);
            createDeviceApi(context,id.getDeviceID(),512,wigetID,db,"UDS");
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
        PrefManager prefManager=new PrefManager(context);
        for (int appWidgetId : appWidgetIds) {
            boolean b=db.delete(appWidgetId);
            if(b)
            {
                Toast.makeText(context,"Successfully deleted",Toast.LENGTH_LONG).show();
            }else
            {
                Toast.makeText(context,"Widget not created",Toast.LENGTH_LONG).show();
            }
            int count=db.CountDeviceWidgetValues();

            if(count>0)
            {
                Toast.makeText(context,"have data",Toast.LENGTH_LONG).show();

            }else
            {
                Toast.makeText(context,"No Device",Toast.LENGTH_SHORT).show();
                prefManager.DeviceDB(false);
                prefManager.websocketService(false);
                context.stopService(new Intent(context, MyService.class));

            }
        }
    }

    void createDeviceApi(final Context ctx, int deviceid, int method, final int wigetID, final MyDBHandler db, final String action) {
        PrefManager prefManager=new PrefManager(ctx);
        String  accessToken=prefManager.getAccess();
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
                                RemoteViews remoteViews = new RemoteViews(ctx.getPackageName(), R.layout.new_app_widget);
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
                                RemoteViews remoteViews = new RemoteViews(ctx.getPackageName(), R.layout.new_app_widget);
                                remoteViews.setImageViewResource(R.id.iconOn, R.drawable.on_light);
                                remoteViews.setImageViewResource(R.id.iconOff,R.drawable.off_dark);
                                AppWidgetManager appWidgetManager  = AppWidgetManager.getInstance(ctx);
                                //   appWidgetManager.updateAppWidget(appWidget, remoteViews);
                                appWidgetManager.updateAppWidget(wigetID,remoteViews);

                                Toast.makeText(ctx,"Turn off "+status,Toast.LENGTH_LONG).show();
                            }

                            if(!status.isEmpty()&&status!=null&&action.equals("Bell"))
                            {


                                Toast.makeText(ctx,"SuccessFully",Toast.LENGTH_SHORT).show();

                            }
                            if(!status.isEmpty()&&status!=null&&action.equals("UDS"))
                            {
                                Toast.makeText(ctx,"Success",Toast.LENGTH_LONG).show();
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
