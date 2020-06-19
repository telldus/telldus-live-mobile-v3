package com.telldus.live.mobile;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

import java.lang.reflect.Field;
import java.util.Map;
import java.util.UUID;

public class NativeUtilitiesModule  extends ReactContextBaseJavaModule {

    public NativeUtilitiesModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "NativeUtilitiesModule";
    }

    @ReactMethod
    public void showLocalNotification(ReadableMap notificationData, Promise promise) {
        try {
            String CHANNEL_ID = notificationData.hasKey("channelId") ? notificationData.getString("channelId") : "123";
            String smallIcon = notificationData.hasKey("smallIcon") ? notificationData.getString("smallIcon") : "icon_notif";
            String title = notificationData.hasKey("title") ? notificationData.getString("title") : "";
            String text = notificationData.hasKey("text") ? notificationData.getString("text") : "";
            String notificationId = notificationData.hasKey("notificationId") ? notificationData.getString("notificationId") : UUID.randomUUID().toString();
            String color = notificationData.hasKey("color") ? notificationData.getString("color") : "#fff";
            ReadableMap userInfo = notificationData.hasKey("userInfo") ? notificationData.getMap("userInfo") : null;

            Context context = getReactApplicationContext();
            Intent intent = new Intent(context, NativeUtilitiesModule.class);
            if (userInfo != null) {
                Bundle userInfoBundle = Arguments.toBundle(userInfo);
                intent.putExtra("userInfo", userInfoBundle);
            }

            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, 0);

            NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                    .setSmallIcon(getResId(smallIcon, R.drawable.class))
                    .setContentTitle(title)
                    .setContentText(text)
                    .setColor(Color.parseColor(color))
                    .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                    // Set the intent that will fire when the user taps the notification
                    .setContentIntent(pendingIntent)
                    .setAutoCancel(true);

            if (notificationData.hasKey("bigText")) {
                ReadableMap bigText = notificationData.getMap("bigText");

                NotificationCompat.BigTextStyle bt = new NotificationCompat.BigTextStyle();
                bt.bigText(bigText.getString("text"));
                if (bigText.hasKey("contentTitle")) {
                    bt = bt.setBigContentTitle(bigText.getString("contentTitle"));
                }
                if (bigText.hasKey("summaryText")) {
                    bt = bt.setSummaryText(bigText.getString("summaryText"));
                }
                builder = builder.setStyle(bt);
            }

            NotificationManagerCompat notificationManager = NotificationManagerCompat.from(context);

            // notificationId is a unique int for each notification that you must define
            notificationManager.notify(notificationId.hashCode(), builder.build());
            promise.resolve(1);
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    @ReactMethod
    public void createNotificationChannel(ReadableMap channelData, Promise promise) {
        try {
            Context context = getReactApplicationContext();
            String channelName = channelData.hasKey("channelName") ? channelData.getString("channelName") : "";
            String channelDescription = channelData.hasKey("channelDescription") ? channelData.getString("channelDescription") : "";
            String CHANNEL_ID = channelData.hasKey("channelId") ? channelData.getString("channelId") : "123";

        // Create the NotificationChannel, but only on API 26+ because
        // the NotificationChannel class is new and not in the support library
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            int importance = NotificationManager.IMPORTANCE_HIGH;
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, channelName, importance);
            channel.setDescription(channelDescription);
            channel.enableVibration(true);
            // Register the channel with the system; you can't change the importance
            // or other notification behaviors after this
            NotificationManager notificationManager = context.getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }
        promise.resolve(1);
    } catch (Exception e) {
        promise.reject(e);
    }
    }

    public static int getResId(String resName, Class<?> c) {

        try {
            Field idField = c.getDeclaredField(resName);
            return idField.getInt(idField);
        } catch (Exception e) {
            e.printStackTrace();
            return -1;
        }
    }

}
