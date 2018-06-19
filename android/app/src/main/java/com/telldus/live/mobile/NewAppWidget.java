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
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Typeface;

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
    private static final String DIMMER_OFF = "ACTION_TRIM";
    private static final String DIMMER_ON = "ACTION_DIMMERONE";
    private static final String DIMMER_25 = "ACTION_DIMMERTWO";
    private static final String DIMMER_50 = "ACTION_DIMMERTHREE";
    private static final String DIMMER_75 = "ACTION_DIMMERFOUR";

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
                                    /* if(action.equals("1"))
                                     {

                                         views.setViewVisibility(R.id.parentLayout,View.VISIBLE);

                                       //  views.setImageViewResource(R.id.iconOn, R.drawable.on_dark);
                                       //  views.setImageViewResource(R.id.iconOff,R.drawable.off_light);
                                         views.setImageViewBitmap(R.id.iconOn,buildUpdate("ondark",context,"#FFFFFF",80,70));
                                         views.setImageViewBitmap(R.id.iconOff,buildUpdate("offdark",context,"#1b365d",80,70));
                                         views.setInt(R.id.onLayout,"setBackgroundColor",Color.parseColor("#E26901"));
                                         views.setInt(R.id.offLinear,"setBackgroundColor",Color.parseColor("#FFFFFF"));
                                     }
                                     if(action.equals("2"))
                                     {
                                         views.setViewVisibility(R.id.parentLayout,View.VISIBLE);
                                         //  Toast.makeText(context,"OFF",Toast.LENGTH_LONG).show();
                                       //  views.setImageViewResource(R.id.iconOn, R.drawable.on_light);
                                         views.setImageViewResource(R.id.iconOff,R.drawable.off_dark);
                         //
                                         views.setImageViewBitmap(R.id.iconOn,buildUpdate("ondark",context,"#E26901",80,70));
                                         views.setImageViewBitmap(R.id.iconOff,buildUpdate("offdark",context,"#FFFFFF",80,70));
                                         views.setInt(R.id.onLayout,"setBackgroundColor",Color.parseColor("#FFFFFF"));
                                         views.setInt(R.id.offLinear,"setBackgroundColor",Color.parseColor("#1b365d"));

                                     }*/
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
                                     if (action.equals("16"))
                                     {
                                            views.setViewVisibility(R.id.seekbarlayout, View.VISIBLE);
                                             views.setImageViewBitmap(R.id.dimmerOn, buildUpdate("ondark", context, "#E26901", 70, 70));
                                             views.setImageViewBitmap(R.id.dimmerOff, buildUpdate("offdark", context, "#1A365D", 70, 80));
                                             views.setImageViewBitmap(R.id.dimmer25, buildUpdate("dim25", context, "#E26901", 60, 80));
                                             views.setImageViewBitmap(R.id.dimmer75, buildUpdate("dim75", context, "#E26901", 60, 80));
                                             views.setImageViewBitmap(R.id.dimmer50, buildUpdate("dim", context, "#E26901", 60, 80));

                                             views.setOnClickPendingIntent(R.id.dimmerOff, getPendingBELL(context, DIMMER_OFF, appWidgetId));
                                             views.setOnClickPendingIntent(R.id.dimmerOn, getPendingBELL(context, DIMMER_ON, appWidgetId));
                                             views.setOnClickPendingIntent(R.id.dimmer25, getPendingBELL(context, DIMMER_25, appWidgetId));
                                             views.setOnClickPendingIntent(R.id.dimmer50, getPendingBELL(context, DIMMER_50, appWidgetId));
                                             views.setOnClickPendingIntent(R.id.dimmer75, getPendingBELL(context, DIMMER_75, appWidgetId));
                                         /*   views.setViewVisibility(R.id.uibulb1, View.VISIBLE);
                                         views.setViewVisibility(R.id.emptybulb1, View.VISIBLE);
                                         views.setViewVisibility(R.id.emptybulb2, View.VISIBLE);
                                         views.setViewVisibility(R.id.emptybulb3, View.VISIBLE);
                                         views.setViewVisibility(R.id.emptybulb4, View.VISIBLE);

                                         views.setOnClickPendingIntent(R.id.uibulb1,getPendingBELL(context,ACTION_TRIM,appWidgetId));
                                         views.setOnClickPendingIntent(R.id.emptybulb1,getPendingBELL(context,ACTION_DIMMERONE,appWidgetId));
                                         views.setOnClickPendingIntent(R.id.emptybulb2,getPendingBELL(context,ACTION_DIMMERTWO,appWidgetId));
                                         views.setOnClickPendingIntent(R.id.emptybulb3,getPendingBELL(context,ACTION_DIMMERTHREE,appWidgetId));
                                         views.setOnClickPendingIntent(R.id.emptybulb4,getPendingBELL(context,ACTION_DIMMERFOUR,appWidgetId));
                         */

                                     }


                                     transparent=widgetID.getTransparent();
                                     if(transparent.equals("true"))
                                     {
                                         views.setInt(R.id.iconWidget,"setBackgroundColor", Color.TRANSPARENT);
                                         views.setInt(R.id.onLayout,"setBackgroundColor", Color.TRANSPARENT);
                                         views.setInt(R.id.offLinear,"setBackgroundColor", Color.TRANSPARENT);
                                         views.setInt(R.id.bellWidget, "setBackgroundColor", Color.TRANSPARENT);
                                         views.setInt(R.id.updownarrowwidget, "setBackgroundColor", Color.TRANSPARENT);
                                         views.setInt(R.id.dimmerWidget, "setBackgroundColor", Color.TRANSPARENT);
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

/*
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
      }*/
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
      if (DIMMER_OFF.equals(intent.getAction()))
      {


          PrefManager prefManager=new PrefManager(context);
          String status=prefManager.getDimmer();
          String  accessToken=prefManager.getAccess();
          Bundle extras=intent.getExtras();
          int wigetID=extras.getInt(AppWidgetManager.EXTRA_APPWIDGET_ID,AppWidgetManager.INVALID_APPWIDGET_ID);
          AppWidgetManager appWidgetManager  = AppWidgetManager.getInstance(context);

          DeviceInfo id=db.getSinlgeDeviceID(wigetID);


          createAPIDIMMER(id.getDeviceID(),2,accessToken,"0",wigetID,context,prefManager);

          Toast.makeText(context,"Dimmer-0",Toast.LENGTH_LONG).show();

          RemoteViews remoteViews = new RemoteViews(context.getPackageName(), R.layout.new_app_widget);

          remoteViews.setInt(R.id.dimmerOff,"setBackgroundColor", Color.parseColor("#E26901"));
          remoteViews.setImageViewBitmap(R.id.dimmerOff,buildUpdate("offdark",context,"#FFFFFF",70,80));

          remoteViews.setInt(R.id.dimmer25,"setBackgroundColor",Color.parseColor("#FFFFFF"));
          remoteViews.setImageViewBitmap(R.id.dimmer25,buildUpdate("dim25",context,"#E26901",60,80));
          remoteViews.setInt(R.id.dimmer50,"setBackgroundColor",Color.parseColor("#FFFFFF"));
          remoteViews.setImageViewBitmap(R.id.dimmer50,buildUpdate("dim",context,"#E26901",60,80));
          remoteViews.setInt(R.id.dimmer75,"setBackgroundColor",Color.parseColor("#FFFFFF"));
          remoteViews.setImageViewBitmap(R.id.dimmer75,buildUpdate("dim75",context,"#E26901",60,80));
          remoteViews.setInt(R.id.dimmerOn,"setBackgroundColor",Color.parseColor("#FFFFFF"));
          remoteViews.setImageViewBitmap(R.id.dimmerOn,buildUpdate("ondark",context,"#E26901",70,70));
          remoteViews.setTextColor(R.id.txtDimmer25,Color.parseColor("#E26901"));
          remoteViews.setTextColor(R.id.txtDimmer75,Color.parseColor("#E26901"));
          remoteViews.setTextColor(R.id.txtDimmer50,Color.parseColor("#E26901"));

          remoteViews.setTextColor(R.id.txtDimmer25,Color.parseColor("#E26901"));
          remoteViews.setTextColor(R.id.txtDimmer75,Color.parseColor("#E26901"));
          remoteViews.setTextColor(R.id.txtDimmer50,Color.parseColor("#E26901"));




         /* remoteViews.setViewVisibility(R.id.uibulb2, View.GONE);
          remoteViews.setViewVisibility(R.id.uibulb3, View.GONE);
          remoteViews.setViewVisibility(R.id.uibulb4, View.GONE);
          remoteViews.setViewVisibility(R.id.uibulb5, View.GONE);
          remoteViews.setViewVisibility(R.id.emptybulb1, View.VISIBLE);
          remoteViews.setViewVisibility(R.id.emptybulb2, View.VISIBLE);
          remoteViews.setViewVisibility(R.id.emptybulb3, View.VISIBLE);
          remoteViews.setViewVisibility(R.id.emptybulb4, View.VISIBLE);
*/

          appWidgetManager.updateAppWidget(wigetID,remoteViews);

      }
      if (DIMMER_25.equals(intent.getAction())) {

          PrefManager prefManager = new PrefManager(context);
          String status = prefManager.getDimmer();
          String accessToken = prefManager.getAccess();
          Bundle extras = intent.getExtras();
          int wigetID = extras.getInt(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID);
          AppWidgetManager appWidgetManager  = AppWidgetManager.getInstance(context);


          DeviceInfo id = db.getSinlgeDeviceID(wigetID);
          createAPIDIMMER(id.getDeviceID(), 25, accessToken, "25", wigetID, context, prefManager);

          Toast.makeText(context,"Dimmer-25",Toast.LENGTH_LONG).show();

          RemoteViews remoteViews = new RemoteViews(context.getPackageName(), R.layout.new_app_widget);

          remoteViews.setInt(R.id.dimmer25,"setBackgroundColor", Color.parseColor("#E26901"));
          remoteViews.setImageViewBitmap(R.id.dimmer25,buildUpdate("dim25",context,"#FFFFFF",60,80));

          remoteViews.setInt(R.id.dimmerOff,"setBackgroundColor",Color.parseColor("#FFFFFF"));
          remoteViews.setImageViewBitmap(R.id.dimmerOff,buildUpdate("offdark",context,"#1A365D",70,80));
          remoteViews.setInt(R.id.dimmer50,"setBackgroundColor",Color.parseColor("#FFFFFF"));
          remoteViews.setImageViewBitmap(R.id.dimmer50,buildUpdate("dim",context,"#E26901",60,80));
          remoteViews.setInt(R.id.dimmer75,"setBackgroundColor",Color.parseColor("#FFFFFF"));
          remoteViews.setImageViewBitmap(R.id.dimmer75,buildUpdate("dim75",context,"#E26901",60,80));
          remoteViews.setInt(R.id.dimmerOn,"setBackgroundColor",Color.parseColor("#FFFFFF"));
          remoteViews.setImageViewBitmap(R.id.dimmerOn,buildUpdate("ondark",context,"#E26901",70,70));

          remoteViews.setTextColor(R.id.txtDimmer25,Color.parseColor("#FFFFFF"));
          remoteViews.setTextColor(R.id.txtDimmer75,Color.parseColor("#E26901"));
          remoteViews.setTextColor(R.id.txtDimmer50,Color.parseColor("#E26901"));



        /*  remoteViews.setViewVisibility(R.id.emptybulb1, View.GONE);
          remoteViews.setViewVisibility(R.id.uibulb2, View.VISIBLE);
          remoteViews.setViewVisibility(R.id.emptybulb2, View.VISIBLE);
          remoteViews.setViewVisibility(R.id.emptybulb3, View.VISIBLE);
          remoteViews.setViewVisibility(R.id.emptybulb4, View.VISIBLE);
          remoteViews.setViewVisibility(R.id.uibulb3, View.GONE);
          remoteViews.setViewVisibility(R.id.uibulb4, View.GONE);
          remoteViews.setViewVisibility(R.id.uibulb5, View.GONE);
        */  appWidgetManager.updateAppWidget(wigetID,remoteViews);
      }
      if (DIMMER_50.equals(intent.getAction())) {

          PrefManager prefManager = new PrefManager(context);
          String status = prefManager.getDimmer();
          String accessToken = prefManager.getAccess();
          Bundle extras = intent.getExtras();
          int wigetID = extras.getInt(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID);
          AppWidgetManager appWidgetManager  = AppWidgetManager.getInstance(context);


          DeviceInfo id = db.getSinlgeDeviceID(wigetID);
          createAPIDIMMER(id.getDeviceID(), 50, accessToken, "50", wigetID, context, prefManager);

          Toast.makeText(context,"Dimmer-50",Toast.LENGTH_LONG).show();

          RemoteViews remoteViews = new RemoteViews(context.getPackageName(), R.layout.new_app_widget);

          remoteViews.setInt(R.id.dimmer50,"setBackgroundColor", Color.parseColor("#E26901"));
          remoteViews.setImageViewBitmap(R.id.dimmer50,buildUpdate("dim",context,"#FFFFFF",60,80));

          remoteViews.setInt(R.id.dimmerOff,"setBackgroundColor",Color.parseColor("#FFFFFF"));
          remoteViews.setImageViewBitmap(R.id.dimmerOff,buildUpdate("offdark",context,"#1A365D",70,80));
          remoteViews.setInt(R.id.dimmer25,"setBackgroundColor",Color.parseColor("#FFFFFF"));
          remoteViews.setImageViewBitmap(R.id.dimmer25,buildUpdate("dim25",context,"#E26901",60,80));
          remoteViews.setInt(R.id.dimmer75,"setBackgroundColor",Color.parseColor("#FFFFFF"));
          remoteViews.setImageViewBitmap(R.id.dimmer75,buildUpdate("dim75",context,"#E26901",60,80));
          remoteViews.setInt(R.id.dimmerOn,"setBackgroundColor",Color.parseColor("#FFFFFF"));
          remoteViews.setImageViewBitmap(R.id.dimmerOn,buildUpdate("ondark",context,"#E26901",70,70));


          remoteViews.setTextColor(R.id.txtDimmer25,Color.parseColor("#E26901"));
          remoteViews.setTextColor(R.id.txtDimmer75,Color.parseColor("#E26901"));
          remoteViews.setTextColor(R.id.txtDimmer50,Color.parseColor("#FFFFFF"));

         /* remoteViews.setViewVisibility(R.id.emptybulb2, View.GONE);
          remoteViews.setViewVisibility(R.id.uibulb3, View.VISIBLE);
          remoteViews.setViewVisibility(R.id.emptybulb1, View.VISIBLE);
          remoteViews.setViewVisibility(R.id.emptybulb3, View.VISIBLE);
          remoteViews.setViewVisibility(R.id.emptybulb4, View.VISIBLE);
          remoteViews.setViewVisibility(R.id.uibulb2, View.GONE);
          remoteViews.setViewVisibility(R.id.uibulb4, View.GONE);
          remoteViews.setViewVisibility(R.id.uibulb5, View.GONE);
         */ appWidgetManager.updateAppWidget(wigetID,remoteViews);
      }
      if (DIMMER_75.equals(intent.getAction())) {

          PrefManager prefManager = new PrefManager(context);
          String status = prefManager.getDimmer();
          String accessToken = prefManager.getAccess();
          Bundle extras = intent.getExtras();
          int wigetID = extras.getInt(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID);
          AppWidgetManager appWidgetManager  = AppWidgetManager.getInstance(context);


          DeviceInfo id = db.getSinlgeDeviceID(wigetID);
          createAPIDIMMER(id.getDeviceID(), 75, accessToken, "75", wigetID, context, prefManager);

          Toast.makeText(context,"Dimmer-75",Toast.LENGTH_LONG).show();

          RemoteViews remoteViews = new RemoteViews(context.getPackageName(), R.layout.new_app_widget);


          remoteViews.setInt(R.id.dimmer75,"setBackgroundColor", Color.parseColor("#E26901"));
          remoteViews.setImageViewBitmap(R.id.dimmer75,buildUpdate("dim75",context,"#FFFFFF",60,80));

          remoteViews.setInt(R.id.dimmerOff,"setBackgroundColor",Color.parseColor("#FFFFFF"));
          remoteViews.setImageViewBitmap(R.id.dimmerOff,buildUpdate("offdark",context,"#1A365D",70,80));
          remoteViews.setInt(R.id.dimmer25,"setBackgroundColor",Color.parseColor("#FFFFFF"));
          remoteViews.setImageViewBitmap(R.id.dimmer25,buildUpdate("dim25",context,"#E26901",60,80));
          remoteViews.setInt(R.id.dimmer50,"setBackgroundColor",Color.parseColor("#FFFFFF"));
          remoteViews.setImageViewBitmap(R.id.dimmer50,buildUpdate("dim",context,"#E26901",60,80));
          remoteViews.setInt(R.id.dimmerOn,"setBackgroundColor",Color.parseColor("#FFFFFF"));
          remoteViews.setImageViewBitmap(R.id.dimmerOn,buildUpdate("ondark",context,"#E26901",70,70));

          remoteViews.setTextColor(R.id.txtDimmer25,Color.parseColor("#E26901"));
          remoteViews.setTextColor(R.id.txtDimmer75,Color.parseColor("#FFFFFF"));
          remoteViews.setTextColor(R.id.txtDimmer50,Color.parseColor("#E26901"));

         /* remoteViews.setViewVisibility(R.id.emptybulb3, View.GONE);
          remoteViews.setViewVisibility(R.id.uibulb4, View.VISIBLE);
          remoteViews.setViewVisibility(R.id.emptybulb1, View.VISIBLE);
          remoteViews.setViewVisibility(R.id.emptybulb2, View.VISIBLE);
          remoteViews.setViewVisibility(R.id.emptybulb4, View.VISIBLE);
          remoteViews.setViewVisibility(R.id.uibulb2, View.GONE);
          remoteViews.setViewVisibility(R.id.uibulb3, View.GONE);
          remoteViews.setViewVisibility(R.id.uibulb5, View.GONE);
         */ appWidgetManager.updateAppWidget(wigetID,remoteViews);
      }
      if (DIMMER_ON.equals(intent.getAction())) {

          PrefManager prefManager = new PrefManager(context);
          String status = prefManager.getDimmer();
          String accessToken = prefManager.getAccess();
          Bundle extras = intent.getExtras();
          int wigetID = extras.getInt(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID);
          AppWidgetManager appWidgetManager  = AppWidgetManager.getInstance(context);


          DeviceInfo id = db.getSinlgeDeviceID(wigetID);
          createAPIDIMMER(id.getDeviceID(), 1, accessToken, "1", wigetID, context, prefManager);

          Toast.makeText(context,"Dimmer-100",Toast.LENGTH_LONG).show();

          RemoteViews remoteViews = new RemoteViews(context.getPackageName(), R.layout.new_app_widget);



          remoteViews.setInt(R.id.dimmerOn,"setBackgroundColor", Color.parseColor("#E26901"));
          remoteViews.setImageViewBitmap(R.id.dimmerOn,buildUpdate("ondark",context,"#FFFFFF",70,70));

          remoteViews.setInt(R.id.dimmerOff,"setBackgroundColor",Color.parseColor("#FFFFFF"));
          remoteViews.setImageViewBitmap(R.id.dimmerOff,buildUpdate("offdark",context,"#1A365D",70,80));
          remoteViews.setInt(R.id.dimmer25,"setBackgroundColor",Color.parseColor("#FFFFFF"));
          remoteViews.setImageViewBitmap(R.id.dimmer25,buildUpdate("dim25",context,"#E26901",60,80));
          remoteViews.setInt(R.id.dimmer50,"setBackgroundColor",Color.parseColor("#FFFFFF"));
          remoteViews.setImageViewBitmap(R.id.dimmer50,buildUpdate("dim",context,"#E26901",60,80));
          remoteViews.setInt(R.id.dimmer75,"setBackgroundColor",Color.parseColor("#FFFFFF"));
          remoteViews.setImageViewBitmap(R.id.dimmer75,buildUpdate("dim75",context,"#E26901",60,80));
          remoteViews.setTextColor(R.id.txtDimmer25,Color.parseColor("#E26901"));
          remoteViews.setTextColor(R.id.txtDimmer75,Color.parseColor("#E26901"));
          remoteViews.setTextColor(R.id.txtDimmer50,Color.parseColor("#E26901"));


          /*remoteViews.setViewVisibility(R.id.emptybulb4, View.GONE);
          remoteViews.setViewVisibility(R.id.uibulb5, View.VISIBLE);
          remoteViews.setViewVisibility(R.id.emptybulb1, View.VISIBLE);
          remoteViews.setViewVisibility(R.id.emptybulb2, View.VISIBLE);
          remoteViews.setViewVisibility(R.id.emptybulb3, View.VISIBLE);
          remoteViews.setViewVisibility(R.id.uibulb2, View.GONE);
          remoteViews.setViewVisibility(R.id.uibulb3, View.GONE);
          remoteViews.setViewVisibility(R.id.uibulb4, View.GONE);
          */appWidgetManager.updateAppWidget(wigetID,remoteViews);


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


    void createAPIDIMMER(int deviceid, int value, String accessToken, final String action, final int wigetID,
                         final Context ctx, final PrefManager prefManager)
    {
        String str="https://api3.telldus.com/oauth2/device/command?id="+deviceid+"&method="+16+"&value="+value;

            AndroidNetworking.get(str)
                    .addHeaders("Content-Type", "application/json")
                    .addHeaders("Accpet", "application/json")
                    .addHeaders("Authorization", "Bearer " + accessToken)
                    .setPriority(Priority.LOW)
                    .build()
                    .getAsJSONObject(new JSONObjectRequestListener() {
                        @Override
                        public void onResponse(JSONObject response) {

                            String status=response.optString("status");
                            String error=response.optString("error");
                            RemoteViews remoteViews = new RemoteViews(ctx.getPackageName(), R.layout.new_app_widget);
                            AppWidgetManager appWidgetManager  = AppWidgetManager.getInstance(ctx);
                            if(!status.isEmpty()&&status!=null&&action.equals("0")) {


                              //  remoteViews.setViewVisibility(R.id.uibulb1, View.VISIBLE);


                                // remoteViews.setTextViewText(R.id.uibulb1,"0");
                                prefManager.setDimmer("0");
                            //    appWidgetManager.updateAppWidget(wigetID,remoteViews);

                            }
                            if(!status.isEmpty()&&status!=null&&action.equals("25")) {

                            //    remoteViews.setViewVisibility(R.id.uibulb2, View.VISIBLE);

                                // remoteViews.setTextViewText(R.id.uibulb1,"0");
                                prefManager.setDimmer("25");
                            //    appWidgetManager.updateAppWidget(wigetID,remoteViews);

                            }
                            if(!status.isEmpty()&&status!=null&&action.equals("50")) {

                              //  remoteViews.setViewVisibility(R.id.uibulb3, View.VISIBLE);


                                // remoteViews.setTextViewText(R.id.uibulb1,"0");
                                prefManager.setDimmer("50");
                            //    appWidgetManager.updateAppWidget(wigetID,remoteViews);

                            }
                            if(!status.isEmpty()&&status!=null&&action.equals("75")) {

                              //  remoteViews.setViewVisibility(R.id.uibulb4, View.VISIBLE);

                                // remoteViews.setTextViewText(R.id.uibulb1,"0");
                                prefManager.setDimmer("75");
                            //    appWidgetManager.updateAppWidget(wigetID,remoteViews);

                            }
                            if(!status.isEmpty()&&status!=null&&action.equals("1")) {

                            //    remoteViews.setViewVisibility(R.id.uibulb5, View.VISIBLE);

                                // remoteViews.setTextViewText(R.id.uibulb1,"0");
                                prefManager.setDimmer("1");
                            //    appWidgetManager.updateAppWidget(wigetID,remoteViews);


                            }

                            if(!error.isEmpty()&&error!=null)
                            {

                                Toast.makeText(ctx,error,Toast.LENGTH_LONG).show();
                            }

                        }

                        @Override
                        public void onError(ANError anError) {

                        }
                    });
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
                              RemoteViews views = new RemoteViews(ctx.getPackageName(), R.layout.new_app_widget);
                           //   remoteViews.setImageViewResource(R.id.iconOn, R.drawable.on_dark);
                           //   remoteViews.setImageViewResource(R.id.iconOff,R.drawable.off_light);
                              AppWidgetManager appWidgetManager  = AppWidgetManager.getInstance(ctx);
                              //   appWidgetManager.updateAppWidget(appWidget, remoteViews);
                             // appWidgetManager.updateAppWidget(wigetID,views);
                              views.setImageViewBitmap(R.id.iconOn,buildUpdate("ondark",ctx,"#E26901",80,70));
                              views.setImageViewBitmap(R.id.iconOff,buildUpdate("offdark",ctx,"#FFFFFF",80,70));
                              views.setInt(R.id.onLayout,"setBackgroundColor",Color.parseColor("#FFFFFF"));
                              views.setInt(R.id.offLinear,"setBackgroundColor",Color.parseColor("#1A365D"));
                              appWidgetManager.updateAppWidget(wigetID,views);

                              Toast.makeText(ctx,"Turn on  "+status,Toast.LENGTH_LONG).show();
                            }

                            if(!status.isEmpty()&&status!=null&&action.equals("Off"))
                            {
                              boolean b=db.updateAction("2",wigetID);
                              RemoteViews remoteViews = new RemoteViews(ctx.getPackageName(), R.layout.new_app_widget);
                           //   remoteViews.setImageViewResource(R.id.iconOn, R.drawable.on_light);
                           //   remoteViews.setImageViewResource(R.id.iconOff,R.drawable.off_dark);
                              remoteViews.setImageViewBitmap(R.id.iconOn,buildUpdate("ondark",ctx,"#FFFFFF",80,70));
                              remoteViews.setImageViewBitmap(R.id.iconOff,buildUpdate("offdark",ctx,"#1A365D",80,70));
                              remoteViews.setInt(R.id.onLayout,"setBackgroundColor",Color.parseColor("#E26901"));
                              remoteViews.setInt(R.id.offLinear,"setBackgroundColor",Color.parseColor("#FFFFFF"));

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

    public static Bitmap buildUpdate(String fontNmae, Context context,String color,float y,float x)
    {
        Bitmap myBitmap = Bitmap.createBitmap(160, 84, Bitmap.Config.ARGB_4444);
        Canvas myCanvas = new Canvas(myBitmap);
        Paint paint = new Paint();

        // Typeface iconFont = Typeface.createFromAsset(context.getAssets(),"fonts/Comfortaa_Thin.ttf");
        Typeface iconFont = FontManager.getTypeface(context, FontManager.FONTAWESOME);

        paint.setAntiAlias(true);
        paint.setSubpixelText(true);
        paint.setTypeface(iconFont);
        paint.setStyle(Paint.Style.FILL);
        paint.setColor(Color.parseColor(color));
        paint.setTextSize(85);
        paint.setTextAlign(Paint.Align.CENTER);
        myCanvas.drawText(fontNmae, x, y, paint);
        return myBitmap;
    }
}
