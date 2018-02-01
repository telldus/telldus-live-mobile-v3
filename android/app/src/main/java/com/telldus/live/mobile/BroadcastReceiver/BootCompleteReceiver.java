package com.telldus.live.mobile.BroadcastReceiver;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.widget.Toast;

import com.telldus.live.mobile.Database.PrefManager;
import com.telldus.live.mobile.ServiceBackground.AEScreenOnOffService;
import com.telldus.live.mobile.ServiceBackground.AccessTokenService;
import com.telldus.live.mobile.ServiceBackground.MyService;
import com.telldus.live.mobile.Utility.AccessToken;

/**
 * Created by crosssales on 1/11/2018.
 */

public class BootCompleteReceiver extends BroadcastReceiver {
    PrefManager prefManager;
    @Override
    public void onReceive(Context context, Intent intent) {
        prefManager=new PrefManager(context);

        boolean serivce=prefManager.getWebService();
        if(serivce) {

            Intent service = new Intent(context, MyService.class);
            context.startService(service);
        }else
        {
            Toast.makeText(context,"till now not myservice running",Toast.LENGTH_SHORT).show();
        }
       // Intent screenOffOn = new Intent(context, AEScreenOnOffService.class);
       // context.startService(screenOffOn);



        boolean res=prefManager.getTokenService();
        if(res)
        {
            Intent service1 = new Intent(context, AccessTokenService.class);
            context.startService(service1);
        }else
        {
            Toast.makeText(context,"till now not Accesstoke running",Toast.LENGTH_SHORT).show();
        }


    }
}
