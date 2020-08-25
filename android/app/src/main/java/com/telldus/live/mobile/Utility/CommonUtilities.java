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

import android.appwidget.AppWidgetManager;
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
import android.os.Bundle;
import android.util.DisplayMetrics;
import android.util.TypedValue;
import android.view.View;
import android.widget.RemoteViews;

import androidx.core.content.ContextCompat;

import com.telldus.live.mobile.Database.PrefManager;
import com.telldus.live.mobile.R;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.telldus.live.mobile.Utility.Constants.BASE_ICON_SIZE_FACTOR;

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
        DisplayMetrics dm = context.getResources().getDisplayMetrics();
        myBitmap.setDensity(dm.densityDpi);
        Canvas myCanvas = new Canvas(myBitmap);

        Paint paintBG = new Paint();
        paintBG.setAntiAlias(true);
        paintBG.setColor(colorBG);
        paintBG.setStyle(Paint.Style.FILL);
        RectF rectF = new RectF(left, 0, myCanvas.getWidth(), myCanvas.getHeight());
        myCanvas.setDensity(dm.densityDpi);
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

    public static HashMap getWidgetDimensions(AppWidgetManager appWidgetManager, int appWidgetId) {
        // See the dimensions and
        Bundle options = appWidgetManager.getAppWidgetOptions(appWidgetId);
        // Get min width and height.
        int minWidth = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH);
        int minHeight = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT);

        if (minWidth <= 0) {
            minWidth = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_WIDTH);
        }
        if (minHeight <= 0) {
            minHeight = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT);
        }

        if (minWidth <= 0) {
            minWidth = 50;
        }
        if (minHeight <= 0) {
            minHeight = 50;
        }

        HashMap dim = new HashMap();
        dim.put("width", minWidth);
        dim.put("height", minHeight);
        return dim;
    }

    public static int getAttributeForStyling(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        HashMap dimensions = getWidgetDimensions(appWidgetManager, appWidgetId);
        int width = Integer.parseInt(dimensions.get("width").toString());
        int height = Integer.parseInt(dimensions.get("height").toString());
        int attribute = height < width ? height : width;
        return width;
    }

    public static int getBaseFontSize(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        int attribute = getAttributeForStyling(context, appWidgetManager, appWidgetId);
        PrefManager prefManager = new PrefManager(context);
        return (int) (attribute * prefManager.getTextFontSizeFactor());
    }

    public static int getBaseIconWidth(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        float density = context.getResources().getDisplayMetrics().density;
        int attribute = getAttributeForStyling(context, appWidgetManager, appWidgetId);
        return (int) (attribute * BASE_ICON_SIZE_FACTOR);
    }

    public static boolean isNearly1By1(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        HashMap dimensions = getWidgetDimensions(appWidgetManager, appWidgetId);
        Double width = Double.parseDouble(dimensions.get("width").toString());
        Double height = Double.parseDouble(dimensions.get("height").toString());

        int minWidth = 50;
        Double ratioW = width / minWidth;
        Double ratioH = height / minWidth;

        Boolean flagOne = (ratioW <= 1.5 && ratioW >= 0.5) && (ratioH <= 1.5 && ratioH >= 0.5);

        if (!flagOne) {
            return flagOne;
        }

        Double max = Math.max(width, height);
        Double min = Math.min(width, height);

        Double ratio = max / min;

        return ratio <= 1.5 && ratio >= 0.5;
    }

    public static int handleBackgroundWhenIdleOne(
            String button, String transparent,
            int renderedButtonsCount, Boolean isLastButton,
            int viewId, RemoteViews views, Context context) {

        if (transparent.equals("dark")) {
            setCoverBackground(
                    renderedButtonsCount,
                    isLastButton,
                    R.drawable.shape_left_black_round,
                    R.drawable.shape_border_right_round_black,
                    R.drawable.shape_left_black,
                    R.drawable.shape_border_round_black_fill,
                    viewId,
                    views,
                    context
            );
            return ContextCompat.getColor(context, R.color.themeDark);
        } else if (transparent.equals("light") || transparent.equals("true")) {
            setCoverBackground(
                    renderedButtonsCount,
                    isLastButton,
                    R.drawable.shape_left_white_round,
                    R.drawable.shape_border_right_round_white,
                    R.drawable.shape_left_white,
                    R.drawable.shape_border_round_white_fill,
                    viewId,
                    views,
                    context
            );
            return ContextCompat.getColor(context, R.color.white);
        } else {
            setCoverBackground(
                    renderedButtonsCount,
                    isLastButton,
                    R.drawable.shape_left_rounded_corner,
                    R.drawable.shape_right_rounded_corner,
                    R.drawable.button_background_no_bordradi,
                    R.drawable.button_background,
                    viewId,
                    views,
                    context
            );
            if (isPrimaryShade(button)) {
                return ContextCompat.getColor(context, R.color.brandPrimary);
            }
            return ContextCompat.getColor(context, R.color.brandSecondary);
        }
    }

    public static void handleBackgroundPostActionOne(
            String button, String transparent,
            int renderedButtonsCount, Boolean isLastButton,
            int viewId, RemoteViews views, Context context) {
        if (transparent.equals("dark")) {
            setCoverBackground(
                    renderedButtonsCount,
                    isLastButton,
                    R.drawable.shape_border_left_round_black_fill,
                    R.drawable.shape_border_right_round_black_fill,
                    R.drawable.shape_left_black_fill,
                    R.drawable.shape_border_round_black_fill,
                    viewId,
                    views,
                    context
            );
        } else if (transparent.equals("light") || transparent.equals("true")) {
            setCoverBackground(
                    renderedButtonsCount,
                    isLastButton,
                    R.drawable.shape_border_left_round_white_fill,
                    R.drawable.shape_border_right_round_white_fill,
                    R.drawable.shape_left_white_fill,
                    R.drawable.shape_border_round_white_fill,
                    viewId,
                    views,
                    context
            );
        }
    }

    public static int handleBackgroundOnActionOne(
            String button, String transparent,
            int renderedButtonsCount, Boolean isLastButton,
            int flashViewId, int flashCoverId,
            int viewId, RemoteViews views, Context context) {

        if (transparent.equals("dark")) {
            setCoverBackground(
                    renderedButtonsCount,
                    isLastButton,
                    R.drawable.shape_left_black_round_fill,
                    R.drawable.shape_border_right_round_black_fill,
                    R.drawable.shape_left_black_fill,
                    R.drawable.shape_border_round_black_fill,
                    viewId,
                    views,
                    context
            );
            showFlashIndicator(
                    views,
                    flashViewId,
                    flashCoverId,
                    R.drawable.shape_circle_white_fill
            );
            return ContextCompat.getColor(context, R.color.white);
        } else if (transparent.equals("light") || transparent.equals("true")) {
            setCoverBackground(
                    renderedButtonsCount,
                    isLastButton,
                    R.drawable.shape_left_white_round_fill,
                    R.drawable.shape_border_right_round_white_fill,
                    R.drawable.shape_left_white_fill,
                    R.drawable.shape_border_round_white_fill,
                    viewId,
                    views,
                    context
            );
            showFlashIndicator(
                    views,
                    flashViewId,
                    flashCoverId,
                    R.drawable.shape_circle_black_fill
            );
            return ContextCompat.getColor(context, R.color.themeDark);
        } else {
            if (isPrimaryShade(button)) {
                setCoverBackground(
                        renderedButtonsCount,
                        isLastButton,
                        R.drawable.shape_left_rounded_corner_primary_fill,
                        R.drawable.shape_right_rounded_corner_primary_fill,
                        R.drawable.button_background_no_bordradi_primary_fill,
                        R.drawable.button_background_primary_fill,
                        viewId,
                        views,
                        context
                );
            } else {
                setCoverBackground(
                        renderedButtonsCount,
                        isLastButton,
                        R.drawable.shape_left_rounded_corner_secondary_fill,
                        R.drawable.shape_right_rounded_corner_secondary_fill,
                        R.drawable.button_background_no_bordradi_secondary_fill,
                        R.drawable.button_background_secondary_fill,
                        viewId,
                        views,
                        context
                );
            }
            showFlashIndicator(
                    views,
                    flashViewId,
                    flashCoverId,
                    R.drawable.shape_circle_white_fill
            );
            return ContextCompat.getColor(context, R.color.white);
        }
    }

    public static void setCoverBackground(
            int renderedButtonsCount, Boolean isLastButton,
            int drawableWhenFirst, int drawableWhenLast, int drawableWhenInMiddle, int drawableWhenTheOnly,
            int viewId, RemoteViews views, Context context
    ) {

        if (renderedButtonsCount == 0 && isLastButton) {
            views.setInt(viewId, "setBackgroundResource", drawableWhenTheOnly);
        } else if (renderedButtonsCount == 0) {
            views.setInt(viewId, "setBackgroundResource", drawableWhenFirst);
        } else if (isLastButton) {
            views.setInt(viewId, "setBackgroundResource", drawableWhenLast);
        } else {
            views.setInt(viewId, "setBackgroundResource", drawableWhenInMiddle);
        }
    }

    public static void showFlashIndicator(RemoteViews views, int visibleFlashId, int flashId, int drawable) {
        hideAllFlashIndicators(views);

        views.setInt(visibleFlashId, "setBackgroundResource", drawable);
        views.setViewVisibility(flashId, View.VISIBLE);
    }

    public static Boolean isPrimaryShade(String button) {
        String[] primaryShadedButtons = new String[]{"OFF", "STOP"};

        List<String> list = Arrays.asList(primaryShadedButtons);

        return list.contains(button);
    }

    public static boolean hasMethod(Map<String, Boolean> supportedMethods, String methodName) {
        return ((supportedMethods.get(methodName) != null) && supportedMethods.get(methodName));
    }

    public static void hideAllFlashIndicators(RemoteViews views) {
        Integer[] flash_indicators = new Integer[]{
                R.id.flashing_indicator_on,
                R.id.flashing_indicator_off,
                R.id.flashing_indicator_rgb,
                R.id.flashing_indicator_dim,
                R.id.flashing_indicator_on_off,
                R.id.flashing_indicator_bell,
                R.id.flashing_indicator_up,
                R.id.flashing_indicator_down,
                R.id.flashing_indicator_stop,
                R.id.flashing_indicator_dim25,
                R.id.flashing_indicator_dim50,
                R.id.flashing_indicator_dim75,
        };

        List<Integer> list = Arrays.asList(flash_indicators);

        for (int i = 0; i < list.size(); i++) {
            int id = list.get(i);
            views.setViewVisibility(id, View.GONE);
        }
    }

    public static void hideFlashIndicator(RemoteViews views, int flashId) {
        views.setViewVisibility(flashId, View.GONE);
    }
}
