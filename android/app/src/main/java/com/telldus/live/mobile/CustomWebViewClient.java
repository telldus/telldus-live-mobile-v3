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
import android.util.Log;
import android.webkit.WebResourceRequest;
import android.net.Uri;
import android.graphics.Bitmap;
import android.content.Intent;
import android.content.Context;

import com.telldus.live.mobile.Utility.Constants;

public class CustomWebViewClient extends WebViewClient {
    public Context context;
    public String pack;
    public CustomWebViewClient(Context context, String pack) {
        this.context = context;
        this.pack = pack;
    }

    @Override
    public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest webResourceRequest) {
        Uri url = webResourceRequest.getUrl();
        if (String.valueOf(url).equals(Constants.PURCHASE_SUCCESS_URL+"?status=success")) {
            showPurchaseSuccess();
            return false;
        }
        view.loadUrl(String.valueOf(url));
        return true;
    }

    // public void onPageStarted (WebView view, String url, Bitmap favicon) {
    //     Log.d("TEST onPageStarted", url);
    //     if (url != null && url.equals(Constants.PURCHASE_SUCCESS_URL+"?status=success")) {
    //         showPurchaseSuccess();
    //     }
    // }

    public void showPurchaseSuccess() {
        Intent puchaseCompleteActivity = new Intent(context, PurchaseCompleteActivity.class);
        puchaseCompleteActivity.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_CLEAR_TASK | Intent.FLAG_ACTIVITY_NEW_TASK);
        puchaseCompleteActivity.putExtra("pack", pack);
        context.startActivity(puchaseCompleteActivity);
    }
}