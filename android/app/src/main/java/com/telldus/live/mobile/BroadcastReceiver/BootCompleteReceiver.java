package com.telldus.live.mobile.BroadcastReceiver;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

import com.telldus.live.mobile.ServiceBackground.AEScreenOnOffService;
import com.telldus.live.mobile.ServiceBackground.MyService;

/**
 * Created by crosssales on 1/11/2018.
 */

public class BootCompleteReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        Intent service = new Intent(context, MyService.class);
        context.startService(service);
        Intent screenOffOn = new Intent(context, AEScreenOnOffService.class);
        context.startService(screenOffOn);


    }
}
