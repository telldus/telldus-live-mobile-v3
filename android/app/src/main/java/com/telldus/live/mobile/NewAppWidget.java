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

import java.util.Map;

import com.telldus.live.mobile.Database.MyDBHandler;
import com.telldus.live.mobile.Database.PrefManager;
import com.telldus.live.mobile.Model.DeviceInfo;
import com.telldus.live.mobile.Utility.DevicesUtilities;

/**
 * Implementation of App Widget functionality.
 * App Widget Configuration implemented in {@link NewAppWidgetConfigureActivity NewAppWidgetConfigureActivity}
 */
public class NewAppWidget extends AppWidgetProvider {

  private static final String ACTION_ON = "ACTION_ON";
    private static final String ACTION_OFF = "ACTION_OFF";
    private static final String ACTION_BELL = "ACTION_BELL";
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

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.new_app_widget);

        views.setOnClickPendingIntent(R.id.iconOn,getPendingSelf(context,ACTION_ON,appWidgetId));
        views.setOnClickPendingIntent(R.id.iconOff,getPendingSelf(context,ACTION_OFF,appWidgetId));

        if (widgetID != null) {
            widgetText = widgetID.getDeviceName();
            String state = widgetID.getState();
            String deviceType = widgetID.getDeviceType();
            Integer methods = widgetID.getDeviceMethods();

            DevicesUtilities deviceUtils = new DevicesUtilities();
            Map<String, Boolean> supportedMethods = deviceUtils.getSupportedMethods(methods);
            Map<String, String> actionIconSet = deviceUtils.getDeviceActionIcon(deviceType, state, supportedMethods);

            String onActionIcon = actionIconSet.get("TURNON");
            String offActionIcon = actionIconSet.get("TURNOFF");

            if (state.equals("4")) {
                views.setViewVisibility(R.id.bellLinear,View.VISIBLE);
                views.setOnClickPendingIntent(R.id.bell,getPendingBELL(context,ACTION_BELL,appWidgetId));
            }

            if (state.equals("128")|| state.equals("256")|| state.equals("512")) {
                views.setViewVisibility(R.id.updownarrow,View.VISIBLE);
                views.setOnClickPendingIntent(R.id.uparrow,getPendingBELL(context,ACTION_UP,appWidgetId));
                views.setOnClickPendingIntent(R.id.downarrow,getPendingBELL(context,ACTION_DOWN,appWidgetId));
                views.setOnClickPendingIntent(R.id.stopicon,getPendingBELL(context,ACTION_STOP,appWidgetId));
            }

            if (state.equals("16")) {
                views.setViewVisibility(R.id.seekbarlayout, View.VISIBLE);
                views.setImageViewBitmap(R.id.dimmerOn, buildUpdate(onActionIcon, context, "#E26901", 70, 70));
                views.setImageViewBitmap(R.id.dimmerOff, buildUpdate(offActionIcon, context, "#1A365D", 70, 80));
                views.setImageViewBitmap(R.id.dimmer25, buildUpdate("dim25", context, "#E26901", 60, 80));
                views.setImageViewBitmap(R.id.dimmer75, buildUpdate("dim75", context, "#E26901", 60, 80));
                views.setImageViewBitmap(R.id.dimmer50, buildUpdate("dim", context, "#E26901", 60, 80));

                views.setOnClickPendingIntent(R.id.dimmerOff, getPendingBELL(context, DIMMER_OFF, appWidgetId));
                views.setOnClickPendingIntent(R.id.dimmerOn, getPendingBELL(context, DIMMER_ON, appWidgetId));
                views.setOnClickPendingIntent(R.id.dimmer25, getPendingBELL(context, DIMMER_25, appWidgetId));
                views.setOnClickPendingIntent(R.id.dimmer50, getPendingBELL(context, DIMMER_50, appWidgetId));
                views.setOnClickPendingIntent(R.id.dimmer75, getPendingBELL(context, DIMMER_75, appWidgetId));
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
        }
        views.setTextViewText(R.id.txtWidgetTitle, widgetText);
        // Instruct the widget manager to update the widget
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        // There may be multiple widgets active, so update all of them
        for (int appWidgetId : appWidgetIds) {
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

    private static PendingIntent getPendingBELL(Context context,String action,int id) {
        Intent intent = new Intent(context,NewAppWidget.class);
        intent.setAction(action);
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID,id);
        return PendingIntent.getBroadcast(context,id,intent,0);
    }


    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);

        Bundle extras = intent.getExtras();
        if (extras == null) {
            return;
        }

        int wigetID = extras.getInt(AppWidgetManager.EXTRA_APPWIDGET_ID,AppWidgetManager.INVALID_APPWIDGET_ID);
        if (wigetID == AppWidgetManager.INVALID_APPWIDGET_ID) {
            return;
        }

        MyDBHandler db = new MyDBHandler(context);
        DeviceInfo id = db.getSinlgeDeviceID(wigetID);
        if (id == null) {
            return;
        }

        String state = id.getState();
        String deviceType = id.getDeviceType();
        Integer methods = id.getDeviceMethods();

        DevicesUtilities deviceUtils = new DevicesUtilities();
        Map<String, Boolean> supportedMethods = deviceUtils.getSupportedMethods(methods);
        Map<String, String> actionIconSet = deviceUtils.getDeviceActionIcon(deviceType, state, supportedMethods);

        String onActionIcon = actionIconSet.get("TURNON");
        String offActionIcon = actionIconSet.get("TURNOFF");

        if (ACTION_BELL.equals(intent.getAction())) {
            createDeviceApi(context, id.getDeviceID(), 4, wigetID, db, "Bell");
        }
        if (ACTION_UP.equals(intent.getAction())) {
            createDeviceApi(context, id.getDeviceID(), 128, wigetID, db, "UDS");
        }
        if (ACTION_DOWN.equals(intent.getAction())) {
            createDeviceApi(context, id.getDeviceID(), 256, wigetID, db, "UDS");
        }
        if (ACTION_STOP.equals(intent.getAction())) {
            createDeviceApi(context, id.getDeviceID(), 512, wigetID, db, "UDS");
        }
        if (DIMMER_OFF.equals(intent.getAction())) {
            PrefManager prefManager = new PrefManager(context);
            String status = prefManager.getDimmer();
            String  accessToken = prefManager.getAccess();
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);

            createAPIDIMMER(id.getDeviceID(), 2, accessToken, "0", wigetID, context, prefManager);

            Toast.makeText(context, "Dimmer-0", Toast.LENGTH_LONG).show();

            RemoteViews remoteViews = new RemoteViews(context.getPackageName(), R.layout.new_app_widget);

            remoteViews.setInt(R.id.dimmerOff,"setBackgroundColor", Color.parseColor("#E26901"));
            remoteViews.setImageViewBitmap(R.id.dimmerOff,buildUpdate(offActionIcon,context,"#FFFFFF",70,80));

            remoteViews.setInt(R.id.dimmer25,"setBackgroundColor",Color.parseColor("#FFFFFF"));
            remoteViews.setImageViewBitmap(R.id.dimmer25,buildUpdate("dim25",context,"#E26901",60,80));
            remoteViews.setInt(R.id.dimmer50,"setBackgroundColor",Color.parseColor("#FFFFFF"));
            remoteViews.setImageViewBitmap(R.id.dimmer50,buildUpdate("dim",context,"#E26901",60,80));
            remoteViews.setInt(R.id.dimmer75,"setBackgroundColor",Color.parseColor("#FFFFFF"));
            remoteViews.setImageViewBitmap(R.id.dimmer75,buildUpdate("dim75",context,"#E26901",60,80));
            remoteViews.setInt(R.id.dimmerOn,"setBackgroundColor",Color.parseColor("#FFFFFF"));
            remoteViews.setImageViewBitmap(R.id.dimmerOn,buildUpdate(onActionIcon,context,"#E26901",70,70));
            remoteViews.setTextColor(R.id.txtDimmer25,Color.parseColor("#E26901"));
            remoteViews.setTextColor(R.id.txtDimmer75,Color.parseColor("#E26901"));
            remoteViews.setTextColor(R.id.txtDimmer50,Color.parseColor("#E26901"));

            remoteViews.setTextColor(R.id.txtDimmer25,Color.parseColor("#E26901"));
            remoteViews.setTextColor(R.id.txtDimmer75,Color.parseColor("#E26901"));
            remoteViews.setTextColor(R.id.txtDimmer50,Color.parseColor("#E26901"));

            appWidgetManager.updateAppWidget(wigetID,remoteViews);
        }
        if (DIMMER_25.equals(intent.getAction())) {
            PrefManager prefManager = new PrefManager(context);
            String status = prefManager.getDimmer();
            String accessToken = prefManager.getAccess();
            AppWidgetManager appWidgetManager  = AppWidgetManager.getInstance(context);

            createAPIDIMMER(id.getDeviceID(), 25, accessToken, "25", wigetID, context, prefManager);

            Toast.makeText(context,"Dimmer-25",Toast.LENGTH_LONG).show();

            RemoteViews remoteViews = new RemoteViews(context.getPackageName(), R.layout.new_app_widget);

            remoteViews.setInt(R.id.dimmer25,"setBackgroundColor", Color.parseColor("#E26901"));
            remoteViews.setImageViewBitmap(R.id.dimmer25,buildUpdate("dim25",context,"#FFFFFF",60,80));

            remoteViews.setInt(R.id.dimmerOff,"setBackgroundColor",Color.parseColor("#FFFFFF"));
            remoteViews.setImageViewBitmap(R.id.dimmerOff,buildUpdate(offActionIcon,context,"#1A365D",70,80));
            remoteViews.setInt(R.id.dimmer50,"setBackgroundColor",Color.parseColor("#FFFFFF"));
            remoteViews.setImageViewBitmap(R.id.dimmer50,buildUpdate("dim",context,"#E26901",60,80));
            remoteViews.setInt(R.id.dimmer75,"setBackgroundColor",Color.parseColor("#FFFFFF"));
            remoteViews.setImageViewBitmap(R.id.dimmer75,buildUpdate("dim75",context,"#E26901",60,80));
            remoteViews.setInt(R.id.dimmerOn,"setBackgroundColor",Color.parseColor("#FFFFFF"));
            remoteViews.setImageViewBitmap(R.id.dimmerOn,buildUpdate(onActionIcon,context,"#E26901",70,70));

            remoteViews.setTextColor(R.id.txtDimmer25,Color.parseColor("#FFFFFF"));
            remoteViews.setTextColor(R.id.txtDimmer75,Color.parseColor("#E26901"));
            remoteViews.setTextColor(R.id.txtDimmer50,Color.parseColor("#E26901"));

            appWidgetManager.updateAppWidget(wigetID,remoteViews);
        }
        if (DIMMER_50.equals(intent.getAction())) {
            PrefManager prefManager = new PrefManager(context);
            String status = prefManager.getDimmer();
            String accessToken = prefManager.getAccess();
            AppWidgetManager appWidgetManager  = AppWidgetManager.getInstance(context);

            createAPIDIMMER(id.getDeviceID(), 50, accessToken, "50", wigetID, context, prefManager);

            Toast.makeText(context,"Dimmer-50",Toast.LENGTH_LONG).show();

            RemoteViews remoteViews = new RemoteViews(context.getPackageName(), R.layout.new_app_widget);

            remoteViews.setInt(R.id.dimmer50,"setBackgroundColor", Color.parseColor("#E26901"));
            remoteViews.setImageViewBitmap(R.id.dimmer50,buildUpdate("dim",context,"#FFFFFF",60,80));

            remoteViews.setInt(R.id.dimmerOff,"setBackgroundColor",Color.parseColor("#FFFFFF"));
            remoteViews.setImageViewBitmap(R.id.dimmerOff,buildUpdate(offActionIcon,context,"#1A365D",70,80));
            remoteViews.setInt(R.id.dimmer25,"setBackgroundColor",Color.parseColor("#FFFFFF"));
            remoteViews.setImageViewBitmap(R.id.dimmer25,buildUpdate("dim25",context,"#E26901",60,80));
            remoteViews.setInt(R.id.dimmer75,"setBackgroundColor",Color.parseColor("#FFFFFF"));
            remoteViews.setImageViewBitmap(R.id.dimmer75,buildUpdate("dim75",context,"#E26901",60,80));
            remoteViews.setInt(R.id.dimmerOn,"setBackgroundColor",Color.parseColor("#FFFFFF"));
            remoteViews.setImageViewBitmap(R.id.dimmerOn,buildUpdate(onActionIcon,context,"#E26901",70,70));

            remoteViews.setTextColor(R.id.txtDimmer25,Color.parseColor("#E26901"));
            remoteViews.setTextColor(R.id.txtDimmer75,Color.parseColor("#E26901"));
            remoteViews.setTextColor(R.id.txtDimmer50,Color.parseColor("#FFFFFF"));

            appWidgetManager.updateAppWidget(wigetID,remoteViews);
        }
        if (DIMMER_75.equals(intent.getAction())) {
            PrefManager prefManager = new PrefManager(context);
            String status = prefManager.getDimmer();
            String accessToken = prefManager.getAccess();
            AppWidgetManager appWidgetManager  = AppWidgetManager.getInstance(context);

            createAPIDIMMER(id.getDeviceID(), 75, accessToken, "75", wigetID, context, prefManager);

            Toast.makeText(context,"Dimmer-75",Toast.LENGTH_LONG).show();

            RemoteViews remoteViews = new RemoteViews(context.getPackageName(), R.layout.new_app_widget);

            remoteViews.setInt(R.id.dimmer75,"setBackgroundColor", Color.parseColor("#E26901"));
            remoteViews.setImageViewBitmap(R.id.dimmer75,buildUpdate("dim75",context,"#FFFFFF",60,80));

            remoteViews.setInt(R.id.dimmerOff,"setBackgroundColor",Color.parseColor("#FFFFFF"));
            remoteViews.setImageViewBitmap(R.id.dimmerOff,buildUpdate(offActionIcon,context,"#1A365D",70,80));
            remoteViews.setInt(R.id.dimmer25,"setBackgroundColor",Color.parseColor("#FFFFFF"));
            remoteViews.setImageViewBitmap(R.id.dimmer25,buildUpdate("dim25",context,"#E26901",60,80));
            remoteViews.setInt(R.id.dimmer50,"setBackgroundColor",Color.parseColor("#FFFFFF"));
            remoteViews.setImageViewBitmap(R.id.dimmer50,buildUpdate("dim",context,"#E26901",60,80));
            remoteViews.setInt(R.id.dimmerOn,"setBackgroundColor",Color.parseColor("#FFFFFF"));
            remoteViews.setImageViewBitmap(R.id.dimmerOn,buildUpdate(onActionIcon,context,"#E26901",70,70));

            remoteViews.setTextColor(R.id.txtDimmer25,Color.parseColor("#E26901"));
            remoteViews.setTextColor(R.id.txtDimmer75,Color.parseColor("#FFFFFF"));
            remoteViews.setTextColor(R.id.txtDimmer50,Color.parseColor("#E26901"));

            appWidgetManager.updateAppWidget(wigetID,remoteViews);
        }
        if (DIMMER_ON.equals(intent.getAction())) {
            PrefManager prefManager = new PrefManager(context);
            String status = prefManager.getDimmer();
            String accessToken = prefManager.getAccess();
            AppWidgetManager appWidgetManager  = AppWidgetManager.getInstance(context);

            createAPIDIMMER(id.getDeviceID(), 1, accessToken, "1", wigetID, context, prefManager);

            Toast.makeText(context,"Dimmer-100",Toast.LENGTH_LONG).show();

            RemoteViews remoteViews = new RemoteViews(context.getPackageName(), R.layout.new_app_widget);

            remoteViews.setInt(R.id.dimmerOn,"setBackgroundColor", Color.parseColor("#E26901"));
            remoteViews.setImageViewBitmap(R.id.dimmerOn,buildUpdate(onActionIcon,context,"#FFFFFF",70,70));

            remoteViews.setInt(R.id.dimmerOff,"setBackgroundColor",Color.parseColor("#FFFFFF"));
            remoteViews.setImageViewBitmap(R.id.dimmerOff,buildUpdate(offActionIcon,context,"#1A365D",70,80));
            remoteViews.setInt(R.id.dimmer25,"setBackgroundColor",Color.parseColor("#FFFFFF"));
            remoteViews.setImageViewBitmap(R.id.dimmer25,buildUpdate("dim25",context,"#E26901",60,80));
            remoteViews.setInt(R.id.dimmer50,"setBackgroundColor",Color.parseColor("#FFFFFF"));
            remoteViews.setImageViewBitmap(R.id.dimmer50,buildUpdate("dim",context,"#E26901",60,80));
            remoteViews.setInt(R.id.dimmer75,"setBackgroundColor",Color.parseColor("#FFFFFF"));
            remoteViews.setImageViewBitmap(R.id.dimmer75,buildUpdate("dim75",context,"#E26901",60,80));
            remoteViews.setTextColor(R.id.txtDimmer25,Color.parseColor("#E26901"));
            remoteViews.setTextColor(R.id.txtDimmer75,Color.parseColor("#E26901"));
            remoteViews.setTextColor(R.id.txtDimmer50,Color.parseColor("#E26901"));

            appWidgetManager.updateAppWidget(wigetID,remoteViews);
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


    void createAPIDIMMER(int deviceid, int value, String accessToken, final String action, final int wigetID,
                         final Context ctx, final PrefManager prefManager)
    {
        String str = "https://api3.telldus.com/oauth2/device/command?id="+deviceid+"&method="+16+"&value="+value;

            AndroidNetworking.get(str)
                    .addHeaders("Content-Type", "application/json")
                    .addHeaders("Accpet", "application/json")
                    .addHeaders("Authorization", "Bearer " + accessToken)
                    .setPriority(Priority.LOW)
                    .build()
                    .getAsJSONObject(new JSONObjectRequestListener() {
                        @Override
                        public void onResponse(JSONObject response) {

                            String status = response.optString("status");
                            String error = response.optString("error");
                            RemoteViews remoteViews = new RemoteViews(ctx.getPackageName(), R.layout.new_app_widget);
                            AppWidgetManager appWidgetManager  = AppWidgetManager.getInstance(ctx);
                            if (!status.isEmpty() && status != null && action.equals("0")) {
                                prefManager.setDimmer("0");
                            }
                            if (!status.isEmpty() && status != null && action.equals("25")) {
                                prefManager.setDimmer("25");
                            }
                            if (!status.isEmpty() && status != null && action.equals("50")) {
                                prefManager.setDimmer("50");
                            }
                            if (!status.isEmpty() && status != null && action.equals("75")) {
                                prefManager.setDimmer("75");
                            }
                            if (!status.isEmpty() && status != null && action.equals("1")) {
                                prefManager.setDimmer("1");
                            }
                            if (!error.isEmpty() && error != null) {
                                Toast.makeText(ctx,error,Toast.LENGTH_LONG).show();
                            }
                        }

                        @Override
                        public void onError(ANError anError) {

                        }
                    });
    }


    void createDeviceApi(final Context ctx, int deviceid, int method, final int wigetID, final MyDBHandler db, final String action) {
        PrefManager prefManager = new PrefManager(ctx);
        String  accessToken = prefManager.getAccess();
        String str = "https://api3.telldus.com/oauth2/device/command?id="+deviceid+"&method="+method+"&value=null";

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

                                AppWidgetManager appWidgetManager  = AppWidgetManager.getInstance(ctx);
                                updateAppWidget(ctx, appWidgetManager, wigetID);
                            }
                            if (!status.isEmpty() && status != null && action.equals("Off")) {
                                boolean b = db.updateAction("2",wigetID);

                                AppWidgetManager appWidgetManager  = AppWidgetManager.getInstance(ctx);
                                updateAppWidget(ctx, appWidgetManager, wigetID);
                            }
                            if (!status.isEmpty() && status !=null && action.equals("Bell")) {
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
