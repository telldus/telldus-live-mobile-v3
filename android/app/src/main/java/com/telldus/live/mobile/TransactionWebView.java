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
import android.content.Intent;
import android.util.Log;

public class TransactionWebView extends Activity {

    WebView webview;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.transaction_webview);
        webview = (WebView) findViewById(R.id.transaction_webview);
        webview.setWebViewClient(new CustomWebViewClient(getApplicationContext()));
        webview.getSettings().setJavaScriptEnabled(true);
        openURL();
    }

    private void openURL() {
        Bundle extras = getIntent().getExtras();
        String url = extras.getString("URL");
        webview.loadUrl(url);
        webview.requestFocus();
    }
}