package com.telldus.live.mobile.BroadcastReceiver;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

import com.telldus.live.mobile.ServiceBackground.AEScreenOnOffService;

/**
 * Created by crosssales on 1/11/2018.
 */

public class AEScreenOnOffReceiver extends BroadcastReceiver {
    private boolean screenOff;

    @Override
    public void onReceive(Context context, Intent intent) {

        //Toast.makeText(context, "BroadcastReceiver", Toast.LENGTH_SHORT).show();


        if (intent.getAction().equals(Intent.ACTION_SCREEN_OFF)) {

            screenOff = true;

        } else if (intent.getAction().equals(Intent.ACTION_SCREEN_ON)) {

            screenOff = false;

        }

        // Toast.makeText(context, "BroadcastReceiver :"+screenOff, Toast.LENGTH_SHORT).show();

        // Send Current screen ON/OFF value to service
        Intent i = new Intent(context, AEScreenOnOffService.class);
        i.putExtra("screen_state", screenOff);
        context.startService(i);
    }
}
