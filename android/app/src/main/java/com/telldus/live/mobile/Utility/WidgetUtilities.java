package com.telldus.live.mobile.Utility;

import android.content.Context;
import android.widget.RemoteViews;

import androidx.core.content.ContextCompat;

import com.telldus.live.mobile.R;

import static android.util.TypedValue.COMPLEX_UNIT_SP;

public class WidgetUtilities {

    public static RemoteViews setUIWhenItemNotFound(Context context, int textFontSize, int iconWidth) {
        RemoteViews remoteViews = new RemoteViews(context.getPackageName(), R.layout.widget_item_removed);
        remoteViews.setTextViewText(R.id.widgetItemRemovedInfo, context.getResources().getString(R.string.reserved_widget_android_message_device_not_found));
        remoteViews.setImageViewBitmap(R.id.infoIcon, CommonUtilities.buildTelldusIcon(
                "info",
                ContextCompat.getColor(context, R.color.brightRed),
                iconWidth,
                (int) (iconWidth * 0.8),
                (int) (iconWidth * 0.8),
                context));

        remoteViews.setTextViewTextSize(R.id.widgetItemRemovedInfo, COMPLEX_UNIT_SP, textFontSize);
        return remoteViews;
    }

    public static RemoteViews setUIWhenDifferentAccount(Context context, int textFontSize, String userId) {
        RemoteViews remoteViews = new RemoteViews(context.getPackageName(), R.layout.logged_out);
        String preScript = context.getResources().getString(R.string.reserved_widget_android_message_user_logged_out_one);
        String phraseTwo = context.getResources().getString(R.string.reserved_widget_android_message_user_logged_out_two);
        remoteViews.setTextViewText(R.id.loggedOutInfoOne, preScript + ": ");
        remoteViews.setTextViewText(R.id.loggedOutInfoEmail, userId);
        remoteViews.setTextViewText(R.id.loggedOutInfoTwo, phraseTwo);

        remoteViews.setTextViewTextSize(R.id.loggedOutInfoOne, COMPLEX_UNIT_SP, textFontSize);
        remoteViews.setTextViewTextSize(R.id.loggedOutInfoEmail, COMPLEX_UNIT_SP, textFontSize);
        remoteViews.setTextViewTextSize(R.id.loggedOutInfoTwo, COMPLEX_UNIT_SP, textFontSize);
        return remoteViews;
    }
}
