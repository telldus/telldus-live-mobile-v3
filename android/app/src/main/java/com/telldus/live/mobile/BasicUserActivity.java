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
import android.os.Bundle;
import android.view.View;
import android.widget.RelativeLayout;
import android.widget.TextView;

import java.text.NumberFormat;
import java.text.DecimalFormat;

import com.google.android.flexbox.FlexboxLayout;

public class BasicUserActivity extends Activity {

    @Override
    public void onCreate(Bundle icicle) {
        super.onCreate(icicle);

        setResult(RESULT_CANCELED);
        setContentView(R.layout.view_with_header_poster);

        RelativeLayout mBackLayout = (RelativeLayout)findViewById(R.id.deviceBack);
        mBackLayout.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });

        updateUIBasic();
    }

    public void updateUIBasic() {
        DecimalFormat df = new DecimalFormat("#.##");
        String euro = getResources().getString(R.string.euro);
        String pm = getResources().getString(R.string.reserved_widget_android_per_month);

        FlexboxLayout p_p_1 = (FlexboxLayout) findViewById(R.id.p_p_1);

        TextView validityInfoText1 = (TextView) p_p_1.findViewById(R.id.validityInfoText);
        validityInfoText1.setText(getResources().getString(R.string.reserved_widget_android_12_months));

        TextView smsCreditText1 = (TextView) p_p_1.findViewById(R.id.smsCreditText);
        smsCreditText1.setText(getResources().getString(R.string.reserved_widget_android_25_sms));

        TextView priceInfoOne1 = (TextView) p_p_1.findViewById(R.id.priceInfoOne);
        priceInfoOne1.setText(euro+df.format(2.10));
        TextView priceInfoTwo1 = (TextView) p_p_1.findViewById(R.id.priceInfoTwo);
        priceInfoTwo1.setText(pm);


        FlexboxLayout p_p_2 = (FlexboxLayout) findViewById(R.id.p_p_2);

        TextView validityInfoText2 = (TextView) p_p_2.findViewById(R.id.validityInfoText);
        validityInfoText2.setText(getResources().getString(R.string.reserved_widget_android_6_months));

        TextView smsCreditText2 = (TextView) p_p_2.findViewById(R.id.smsCreditText);
        smsCreditText2.setText(getResources().getString(R.string.reserved_widget_android_12_sms));

        TextView priceInfoOne2 = (TextView) p_p_2.findViewById(R.id.priceInfoOne);
        priceInfoOne2.setText(euro+df.format(2.50));
        TextView priceInfoTwo2 = (TextView) p_p_2.findViewById(R.id.priceInfoTwo);
        priceInfoTwo2.setText(pm);


        FlexboxLayout p_p_3 = (FlexboxLayout) findViewById(R.id.p_p_3);

        TextView validityInfoText3 = (TextView) p_p_3.findViewById(R.id.validityInfoText);
        validityInfoText3.setText(getResources().getString(R.string.reserved_widget_android_1_month));

        TextView smsCreditText3 = (TextView) p_p_3.findViewById(R.id.smsCreditText);
        smsCreditText3.setText(getResources().getString(R.string.reserved_widget_android_3_sms));

        TextView priceInfoOne3 = (TextView) p_p_3.findViewById(R.id.priceInfoOne);
        priceInfoOne3.setText(euro+NumberFormat.getInstance().format(3));
        TextView priceInfoTwo3 = (TextView) p_p_3.findViewById(R.id.priceInfoTwo);
        priceInfoTwo3.setText(pm);
    }
}
