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

package com.telldus.live.mobile.BroadcastReceiver;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Handler;
import android.widget.Toast;

import com.telldus.live.mobile.Database.PrefManager;
import com.telldus.live.mobile.ServiceBackground.RestartSensorUpdateAlarmManager;

public class BootCompleteReceiver extends BroadcastReceiver {
    PrefManager prefManager;
    private Handler handler;
    Runnable r;

    @Override
    public void onReceive(Context context, Intent intent) {
        prefManager = new PrefManager(context);

        Intent restartSensorUpdateAlarmManager = new Intent(context, RestartSensorUpdateAlarmManager.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(restartSensorUpdateAlarmManager);
        } else {
            context.startService(restartSensorUpdateAlarmManager);
        }
    }
}
