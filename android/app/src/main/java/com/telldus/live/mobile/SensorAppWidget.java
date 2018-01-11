package com.telldus.live.mobile;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;
import android.widget.Toast;

import com.telldus.live.mobile.Database.MyDBHandler;
import com.telldus.live.mobile.Model.DeviceInfo;
import com.telldus.live.mobile.Model.SensorInfo;
import com.telldus.live.mobile.ServiceBackground.MyService;

/**
 * Implementation of App Widget functionality.
 * App Widget Configuration implemented in {@link SensorAppWidgetConfigureActivity SensorAppWidgetConfigureActivity}
 */
public class SensorAppWidget extends AppWidgetProvider {

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager,
                                int appWidgetId) {
        MyDBHandler db = new MyDBHandler(context);
        SensorInfo widgetID=db.findSensor(appWidgetId);


        CharSequence widgetText = "sample";


        if(widgetID!=null)
        {
            widgetText = widgetID.getWidgetName();
            String type=widgetID.getWidgetType();


        }
        // Construct the RemoteViews object
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.configurable_sensor_widget);
        views.setTextViewText(R.id.txtSensorType, widgetText);

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

    @Override
    public void onDeleted(Context context, int[] appWidgetIds) {
        // When the user deletes the widget, delete the preference associated with it.
        MyDBHandler db = new MyDBHandler(context);
        for (int appWidgetId : appWidgetIds) {
            boolean b=db.deleteSensor(appWidgetId);
            if(b)
            {
                Toast.makeText(context,"Successfully deleted",Toast.LENGTH_LONG).show();
            }else
            {
                Toast.makeText(context,"Widget not created",Toast.LENGTH_LONG).show();
            }
            int count=db.CountSensorTableValues();
            if(count>0)
            {
                Toast.makeText(context,"have data",Toast.LENGTH_LONG).show();

            }else
            {
                context.stopService(new Intent(context, MyService.class));
                //Toast.makeText(context,String.valueOf(count)+"Count<0",Toast.LENGTH_LONG).show();
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
}
