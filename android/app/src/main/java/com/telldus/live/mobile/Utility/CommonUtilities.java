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
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.Typeface;

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
}
