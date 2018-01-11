package com.telldus.live.mobile.ServiceBackground;

import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.IBinder;
import android.util.Log;
import android.widget.Toast;

import com.telldus.live.mobile.BroadcastReceiver.AEScreenOnOffReceiver;
import com.telldus.live.mobile.Database.MyDBHandler;

/**
 * Created by crosssales on 1/11/2018.
 */

public class AEScreenOnOffService extends Service {
    BroadcastReceiver mReceiver=null;
    MyDBHandler db = new MyDBHandler(this);
    @Override
    public void onCreate() {
        super.onCreate();

        // Toast.makeText(getBaseContext(), "Service on create", Toast.LENGTH_SHORT).show();

        // Register receiver that handles screen on and screen off logic
        IntentFilter filter = new IntentFilter(Intent.ACTION_SCREEN_ON);
        filter.addAction(Intent.ACTION_SCREEN_OFF);
        mReceiver = new AEScreenOnOffReceiver();
        registerReceiver(mReceiver, filter);

    }

    @Override
    public void onStart(Intent intent, int startId) {

        boolean screenOn = false;

        try{

            screenOn = intent.getBooleanExtra("screen_state", false);

        }catch(Exception e){}

       if (!screenOn) {
            Log.v("Screen on/off service","Screen on");
           int count=db.CountSensorTableValues();
           if(count>0)
           {
               startService(new Intent(getApplicationContext(), MyService.class));

           }

        } else {
            Log.v("Screen on/off service","Screen off");
            stopService(new Intent(getApplicationContext(), MyService.class));
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        // TODO Auto-generated method stub
        return null;
    }

    @Override
    public void onDestroy() {

        Log.i("ScreenOnOff", "Service  distroy");
        if(mReceiver!=null)
            unregisterReceiver(mReceiver);

    }
}
