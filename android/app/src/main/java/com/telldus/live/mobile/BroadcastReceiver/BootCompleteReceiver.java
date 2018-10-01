package com.telldus.live.mobile.BroadcastReceiver;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Handler;
import android.widget.Toast;

import com.telldus.live.mobile.Database.PrefManager;
import com.telldus.live.mobile.ServiceBackground.AccessTokenService;
import com.telldus.live.mobile.MyService;
import com.telldus.live.mobile.ServiceBackground.NetworkInfo;

/**
 * Created by crosssales on 1/11/2018.
 */

public class BootCompleteReceiver extends BroadcastReceiver {
    PrefManager prefManager;
    private Handler handler;
    Runnable r;

    @Override
    public void onReceive(Context context, Intent intent) {
        prefManager=new PrefManager(context);


        Intent networkService=new Intent(context, NetworkInfo.class);
        context.startActivity(networkService);


        boolean serivce=prefManager.getWebService();
        if(serivce) {

            Toast.makeText(context,"Myservice turned on",Toast.LENGTH_SHORT).show();
            Intent service = new Intent(context, MyService.class);
            context.startService(service);
        }
/*
        Intent screenOffOn = new Intent(context, AEScreenOnOffService.class);
        context.startService(screenOffOn);*/

        boolean res=prefManager.getTokenService();
        if(res)
        {
            Intent service1 = new Intent(context, AccessTokenService.class);
            context.startService(service1);
        }

    }

}
