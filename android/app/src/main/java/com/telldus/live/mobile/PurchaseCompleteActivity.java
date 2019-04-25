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

package com.telldus.live.mobile;

import android.app.Activity;
import android.webkit.WebViewClient;
import android.webkit.WebView;
import android.os.Bundle;
import android.util.Log;
import android.widget.TextView;
import android.view.View;
import android.widget.Button;

public class PurchaseCompleteActivity extends Activity {

    WebView webview;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.purchase_complete_activity);

        Bundle extras = getIntent().getExtras();
        String pack = extras.getString("pack");

        TextView posterTwo = (TextView) findViewById(R.id.posterTwo);
        posterTwo.setText(getResources().getString(R.string.reserved_widget_android_thank_purchase)+"!");

        TextView header = (TextView) findViewById(R.id.header);
        header.setText(getResources().getString(R.string.reserved_widget_android_thank_purchase)+"!");

        TextView info = (TextView) findViewById(R.id.info);
        info.setText(getResources().getString(R.string.reserved_widget_android_payment_complete_info)+":");

        String smsInfo = getResources().getString(R.string.reserved_widget_android_25_sms_c);
        String packInfo = getResources().getString(R.string.reserved_widget_android_12_months_pa);

        if (pack.equals("prohalfyear")) {
            smsInfo = getResources().getString(R.string.reserved_widget_android_12_sms_c);
            packInfo = getResources().getString(R.string.reserved_widget_android_6_months_pa);
        } else if (pack.equals("promonth")) {
            smsInfo = getResources().getString(R.string.reserved_widget_android_3_sms_c);
            packInfo = getResources().getString(R.string.reserved_widget_android_1_month_pa);
        }

        TextView textMonthInfo = (TextView) findViewById(R.id.textMonthInfo);
        textMonthInfo.setText(packInfo.toUpperCase());
        TextView textSMSInfo = (TextView) findViewById(R.id.textSMSInfo);
        textSMSInfo.setText(smsInfo.toUpperCase());

        Button btContinue = (Button) findViewById(R.id.btContinue);
        btContinue.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });
    }
}