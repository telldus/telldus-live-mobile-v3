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

package com.telldus.live.mobile.Utility;

import android.content.Context;
import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.PorterDuff;
import android.graphics.PorterDuffXfermode;
import android.graphics.Rect;
import android.graphics.RectF;
import android.graphics.Typeface;
import android.graphics.drawable.Drawable;

public class CommonUtilities  {
    public static Bitmap buildTelldusIcon(String icon, int color, int width, int height, int fontSize, Context context) {
        Bitmap myBitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
        Canvas myCanvas = new Canvas(myBitmap);
        Paint paint = new Paint();

        Typeface iconFont = Typeface.createFromAsset(context.getAssets(), "fonts/telldusicons.ttf");

        paint.setAntiAlias(true);
        paint.setSubpixelText(true);
        paint.setTypeface(iconFont);
        paint.setStyle(Paint.Style.FILL);
        paint.setColor(color);
        paint.setTextSize(fontSize);
        paint.setTextAlign(Paint.Align.CENTER);

        int xPos = (myCanvas.getWidth() / 2);
        int yPos = (int) ((myCanvas.getHeight() / 2) - ((paint.descent() + paint.ascent()) / 2)) ;
        myCanvas.drawText(icon, xPos, yPos, paint);

        return myBitmap;
    }

    public static Bitmap buildBitmapImageViewBG(int colorBG, int width, int height, int left, int borderRadi, Context context) {
        Bitmap myBitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
        myBitmap.setDensity((int) context.getResources().getDisplayMetrics().density);
        Canvas myCanvas = new Canvas(myBitmap);

        Paint paintBG = new Paint();
        paintBG.setColor(colorBG);
        paintBG.setStyle(Paint.Style.FILL);
        RectF rectF = new RectF(left, 0, myCanvas.getWidth(), myCanvas.getHeight());
        myCanvas.drawRoundRect(rectF, borderRadi, borderRadi, paintBG);
        myCanvas.drawBitmap(myBitmap, 0, 0, paintBG);

        return myBitmap;
    }

    public static Bitmap getCircularBitmap(int size, int color) {
        Bitmap dstBitmap = Bitmap.createBitmap(
                size, // Width
                size, // Height
                Bitmap.Config.ARGB_8888 // Config
        );
        Canvas canvas = new Canvas(dstBitmap);
        Paint paint = new Paint();
        paint.setAntiAlias(true);
        paint.setColor(color);
        Rect rect = new Rect(0, 0, size, size);
        RectF rectF = new RectF(rect);
        canvas.drawOval(rectF, paint);
        paint.setXfermode(new PorterDuffXfermode(PorterDuff.Mode.SRC_IN));

        canvas.drawBitmap(dstBitmap, 0, 0, paint);

        return dstBitmap;
    }

    public static Bitmap drawableToBitmap (Drawable drawable, int width, int height) {
        Bitmap bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);

        Canvas canvas = new Canvas(bitmap);
        drawable.setBounds(0, 0, canvas.getWidth(), canvas.getHeight());
        drawable.draw(canvas);
        return bitmap;
    }

    public static int getBaseFontSize(Context context) {
        float d = context.getResources().getDisplayMetrics().density;
        int width = Resources.getSystem().getDisplayMetrics().widthPixels;
        return (int) ((width * 0.02) / (d * 0.5));
    }

    public static int getBaseIconWidth(Context context) {
        float d = context.getResources().getDisplayMetrics().density;
        int width = Resources.getSystem().getDisplayMetrics().widthPixels;
        return (int) ((width * 0.12) / (d * 0.5));
    }
}
