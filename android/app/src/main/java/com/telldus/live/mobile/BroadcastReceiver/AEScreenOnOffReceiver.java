package com.telldus.live.mobile.BroadcastReceiver;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

import com.telldus.live.mobile.ServiceBackground.NetworkInfo;

/**
 * Created by crosssales on 1/11/2018.
 */

public class AEScreenOnOffReceiver extends BroadcastReceiver {
    private boolean screenOff;

    @Override
    public void onReceive(Context context, Intent intent) {


        if (intent.getAction().equals(Intent.ACTION_SCREEN_OFF)) {

            screenOff = true;

        } else if (intent.getAction().equals(Intent.ACTION_SCREEN_ON)) {

            screenOff = false;

        }

        Intent i = new Intent(context, NetworkInfo.class);
        i.putExtra("screen_state", screenOff);
        context.startService(i);
    }
}
