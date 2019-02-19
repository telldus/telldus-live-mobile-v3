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

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Typeface;
import android.os.Bundle;
import android.view.View;
import android.widget.RemoteViews;
import android.widget.Toast;
import android.util.Log;

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
 * App Widget Configuration implemented in {@link NewOnOffWidgetConfigureActivity NewOnOffWidgetConfigureActivity}
 */
public class NewOnOffWidget extends AppWidgetProvider {
    private static final String ACTION_ON = "ACTION_ON";
    private static final String ACTION_OFF = "ACTION_OFF";


    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager,
                                int appWidgetId) {

        PrefManager prefManager = new PrefManager(context);
        String accessToken = prefManager.getAccess();
        // On log out, only prefManager is cleared and not DB, so we do not want device to show back again during the
        // socket update.
        if (accessToken == "") {
            return;
        }

        MyDBHandler db = new MyDBHandler(context);

        CharSequence widgetText = "Telldus";
        String transparent;
        DeviceInfo widgetID = db.findUser(appWidgetId);

        if (widgetID != null) {
            widgetText = widgetID.getDeviceName();
            String state = widgetID.getState();
            Integer methods = widgetID.getDeviceMethods();

            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.new_on_off_widget);

            if (state.equals("1")) {
                views.setOnClickPendingIntent(R.id.iconOn,getPendingSelf(context,ACTION_ON,appWidgetId));
                views.setViewVisibility(R.id.parentLayout, View.VISIBLE);
                views.setImageViewBitmap(R.id.iconOn,buildUpdate("ondark",context,"#FFFFFF",80,70));
                views.setInt(R.id.onLayout,"setBackgroundColor",Color.parseColor("#E26901"));

                if (methods == 0) {
                    views.setViewVisibility(R.id.offLinear, View.GONE);
                }

                if (methods != 0) {
                    views.setImageViewBitmap(R.id.iconOff,buildUpdate("offdark",context,"#1b365d",80,70));
                    views.setInt(R.id.offLinear,"setBackgroundColor",Color.parseColor("#FFFFFF"));
                }
            }
            if (state.equals("2")) {
                views.setOnClickPendingIntent(R.id.iconOff,getPendingSelf(context,ACTION_OFF,appWidgetId));
                views.setViewVisibility(R.id.parentLayout,View.VISIBLE);
                views.setImageViewBitmap(R.id.iconOff,buildUpdate("offdark",context,"#FFFFFF",80,70));
                views.setInt(R.id.offLinear,"setBackgroundColor",Color.parseColor("#1b365d"));

                if (methods == 0) {
                    views.setViewVisibility(R.id.onLayout, View.GONE);
                }

                if (methods != 0) {
                    views.setImageViewBitmap(R.id.iconOn,buildUpdate("ondark",context,"#E26901",80,70));
                    views.setInt(R.id.onLayout,"setBackgroundColor",Color.parseColor("#FFFFFF"));
                }
            }
            transparent = widgetID.getTransparent();
            if (transparent.equals("true")) {
                views.setInt(R.id.iconWidget,"setBackgroundColor", Color.TRANSPARENT);
                views.setInt(R.id.onLayout,"setBackgroundColor", Color.TRANSPARENT);
                views.setInt(R.id.offLinear,"setBackgroundColor", Color.TRANSPARENT);
                views.setInt(R.id.bellWidget, "setBackgroundColor", Color.TRANSPARENT);
                views.setInt(R.id.updownarrowwidget, "setBackgroundColor", Color.TRANSPARENT);
                views.setInt(R.id.dimmerWidget, "setBackgroundColor", Color.TRANSPARENT);
            }

            views.setTextViewText(R.id.txtWidgetTitle, widgetText);
            // Instruct the widget manager to update the widget
            appWidgetManager.updateAppWidget(appWidgetId, views);
        }
    }

    public static Bitmap buildUpdate(String fontNmae, Context context, String color, float y, float x)
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

    private static PendingIntent getPendingSelf(Context context, String action, int id) {
        Intent intent = new Intent(context, NewOnOffWidget.class);
        intent.setAction(action);
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID,id);
        return PendingIntent.getBroadcast(context, id, intent, 0);
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        // There may be multiple widgets active, so update all of them
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onDeleted(Context context, int[] appWidgetIds) {
        // When the user deletes the widget, delete the preference associated with it.
        MyDBHandler db = new MyDBHandler(context);
        PrefManager prefManager = new PrefManager(context);
        for (int appWidgetId : appWidgetIds) {
            boolean b = db.delete(appWidgetId);
            if (b) {
                Toast.makeText(context,"Successfully deleted",Toast.LENGTH_LONG).show();
            } else {
                Toast.makeText(context,"Widget not created",Toast.LENGTH_LONG).show();
            }
            int count = db.CountDeviceWidgetValues();

            if (count > 0) {
                Toast.makeText(context,"have data",Toast.LENGTH_LONG).show();

            } else {
                Toast.makeText(context,"No Device",Toast.LENGTH_SHORT).show();
                prefManager.DeviceDB(false);
                prefManager.websocketService(false);
                context.stopService(new Intent(context, MyService.class));
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
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);

        MyDBHandler db = new MyDBHandler(context);

        if (ACTION_ON.equals(intent.getAction())) {
            String accessToken = "";
            String expiresIn;
            String refreshToken;

            Bundle extras = intent.getExtras();
            int wigetID = extras.getInt(AppWidgetManager.EXTRA_APPWIDGET_ID,AppWidgetManager.INVALID_APPWIDGET_ID);
            DeviceInfo widgetID = db.getSinlgeDeviceID(wigetID);

            String state = widgetID.getState();
            if (state.equals("1")) {
                Toast.makeText(context,"Already Turned on",Toast.LENGTH_LONG).show();
            } else {
                createDeviceApi(context,widgetID.getDeviceID(),1,wigetID,db,"On");
            }
        }
        if (ACTION_OFF.equals(intent.getAction())) {

            Bundle extras = intent.getExtras();
            int wigetID = extras.getInt(AppWidgetManager.EXTRA_APPWIDGET_ID,AppWidgetManager.INVALID_APPWIDGET_ID);

            DeviceInfo id = db.getSinlgeDeviceID(wigetID);

            String state = id.getState();
            if (state.equals("2")) {
                Toast.makeText(context,"Already Turned off",Toast.LENGTH_LONG).show();
            } else {
                createDeviceApi(context,id.getDeviceID(),2,wigetID,db,"Off");
            }
        }
    }
    void createDeviceApi(final Context ctx, int deviceid, int method, final int wigetID, final MyDBHandler db, final String action) {
        PrefManager prefManager = new PrefManager(ctx);
        String  accessToken = prefManager.getAccess();
        String str="https://api3.telldus.com/oauth2/device/command?id="+deviceid+"&method="+method+"&value=null";

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

                            String status = response.optString("status");
                            String error = response.optString("error");

                            if (!status.isEmpty() && status != null && action.equals("On")) {
                                boolean b = db.updateAction("1",wigetID);
                                RemoteViews views = new RemoteViews(ctx.getPackageName(), R.layout.new_on_off_widget);

                                AppWidgetManager appWidgetManager  = AppWidgetManager.getInstance(ctx);

                                views.setImageViewBitmap(R.id.iconOn,buildUpdate("ondark",ctx,"#E26901",80,70));
                                views.setImageViewBitmap(R.id.iconOff,buildUpdate("offdark",ctx,"#FFFFFF",80,70));
                                views.setInt(R.id.onLayout,"setBackgroundColor",Color.parseColor("#FFFFFF"));
                                views.setInt(R.id.offLinear,"setBackgroundColor",Color.parseColor("#1b365d"));
                                appWidgetManager.updateAppWidget(wigetID,views);

                                Toast.makeText(ctx,"Turn on  "+status,Toast.LENGTH_LONG).show();
                            }

                            if (!status.isEmpty() && status != null && action.equals("Off")) {
                                boolean b = db.updateAction("2",wigetID);
                                RemoteViews remoteViews = new RemoteViews(ctx.getPackageName(), R.layout.new_on_off_widget);

                                remoteViews.setImageViewBitmap(R.id.iconOn,buildUpdate("ondark",ctx,"#FFFFFF",80,70));
                                remoteViews.setImageViewBitmap(R.id.iconOff,buildUpdate("offdark",ctx,"#1b365d",80,70));
                                remoteViews.setInt(R.id.onLayout,"setBackgroundColor",Color.parseColor("#E26901"));
                                remoteViews.setInt(R.id.offLinear,"setBackgroundColor",Color.parseColor("#FFFFFF"));

                                AppWidgetManager appWidgetManager  = AppWidgetManager.getInstance(ctx);
                                appWidgetManager.updateAppWidget(wigetID,remoteViews);

                                Toast.makeText(ctx,"Turn off "+status,Toast.LENGTH_LONG).show();
                            }

                            if(!status.isEmpty() && status != null && action.equals("Bell")) {
                                Toast.makeText(ctx,"SuccessFully",Toast.LENGTH_SHORT).show();
                            }
                            if (!status.isEmpty() && status != null && action.equals("UDS")) {
                                Toast.makeText(ctx,"Success",Toast.LENGTH_LONG).show();
                            }

                            if (!error.isEmpty() && error != null) {
                                Toast.makeText(ctx,error,Toast.LENGTH_LONG).show();
                            }

                            if (!error.isEmpty() && error != null && action.equals("Off")) {
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
