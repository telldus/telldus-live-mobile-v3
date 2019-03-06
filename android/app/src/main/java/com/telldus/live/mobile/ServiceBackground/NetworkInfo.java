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

package com.telldus.live.mobile.ServiceBackground;

import android.app.ActivityManager;
import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.ConnectivityManager;
import android.os.Handler;
import android.os.IBinder;
import android.support.annotation.Nullable;
import android.util.Log;

import com.telldus.live.mobile.BroadcastReceiver.AEScreenOnOffReceiver;
import com.telldus.live.mobile.Database.MyDBHandler;
import com.telldus.live.mobile.Database.PrefManager;
import com.telldus.live.mobile.MyService;
import com.telldus.live.mobile.Utility.helper;

public class NetworkInfo extends Service {
    private Handler handler;
    Runnable mRunnable;
    PrefManager prefManager;

    BroadcastReceiver mReceiver=null;
    MyDBHandler db = new MyDBHandler(this);
    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        IntentFilter filter = new IntentFilter(Intent.ACTION_SCREEN_ON);
        filter.addAction(Intent.ACTION_SCREEN_OFF);
        mReceiver = new AEScreenOnOffReceiver();
        registerReceiver(mReceiver, filter);

    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        Log.i("ScreenOnOff", "Service  distroy");
        if(mReceiver!=null)
            unregisterReceiver(mReceiver);

    }

    @Override
    public void onStart(Intent intent, int startId) {
        super.onStart(intent, startId);
        prefManager = new PrefManager(this);
        boolean screenOff = false;

        try{
            screenOff = intent.getBooleanExtra("screen_state", false);

        }catch(Exception e){}

       if (!screenOff) {
            Log.v("Screen on/off service","Screen on");
           {
               helper.screenOff = true;
               boolean b = isMyServiceRunning(MyService.class);
               if (!b)
               {
                 //  HandlerForNetwork();
                   startService(new Intent(getApplicationContext(), MyService.class));
               }
           }

        } else {
           //handler.removeCallbacks(mRunnable);
            helper.screenOff = false;
            Log.v("Screen on/off service","Screen off");
           boolean b=isMyServiceRunning(MyService.class);
          if (b) {
               stopService(new Intent(getApplicationContext(), MyService.class));
               Log.v("Services Stopped","screen on");
           }
        }
    }

    public void HandlerForNetwork()
    {
        handler = new Handler();
        mRunnable = new Runnable() {
            public void run() {
                boolean res=isNetworkConnected();
                if(!res)
                {
                    boolean sensorDB = prefManager.getSensorDB();
                    boolean deviceDB = prefManager.getDeviceDB();

                    if (sensorDB || deviceDB) {
                        getApplicationContext().stopService(new Intent(getApplicationContext(), MyService.class));
                    }
                }else
                {
                    boolean web_service=prefManager.getWebService();
                    if(!web_service) {
                        prefManager.websocketService(true);
                        Intent serviceIntent = new Intent(getApplicationContext(), MyService.class);
                        startService(serviceIntent);
                    }
                }
                handler.postDelayed(this, 5000);
            }
        };
        handler.postDelayed(mRunnable, 5000);
    }


    private boolean isNetworkConnected() {
        ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);

        return cm.getActiveNetworkInfo() != null;
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
