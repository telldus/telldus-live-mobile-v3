package com.telldus.live.mobile.Utility;

import android.content.Context;
import android.graphics.Color;

import androidx.core.content.ContextCompat;

import com.telldus.live.mobile.R;

public class RGBUtilities {

    public static int getSettingColor(String transparent, Object colorControlledFromModalO, String primarySetting, Boolean isControllingRGB, Context context) {
        int settingColor = Color.parseColor("#e26901");
        if (transparent.equals("default")) {
            if (!isControllingRGB) {
                String cL = "#" + Integer.toHexString(ContextCompat.getColor(context, R.color.brandSecondary));
                settingColor = Color.parseColor(cL);
            } else if (colorControlledFromModalO != null) {
                int colorControlledFromModal = Integer.parseInt(colorControlledFromModalO.toString(), 10);
                settingColor = pickOnSettingColorBrightness(colorControlledFromModal, "light");
            } else if (!primarySetting.equalsIgnoreCase("picker") && !primarySetting.equalsIgnoreCase("both")) {
                settingColor = pickOnSettingColorBrightness(Color.parseColor(primarySetting), "light");
            }
        } else if (transparent.equals("light")) {
            if (!isControllingRGB) {
                String cL = "#" + Integer.toHexString(ContextCompat.getColor(context, R.color.themeDark));
                settingColor = Color.parseColor(cL);
            } else if (colorControlledFromModalO != null) {
                int colorControlledFromModal = Integer.parseInt(colorControlledFromModalO.toString(), 10);
                settingColor = pickOnSettingColorBrightness(colorControlledFromModal, "light");
            } else if (!primarySetting.equalsIgnoreCase("picker") && !primarySetting.equalsIgnoreCase("both")) {
                settingColor = pickOnSettingColorBrightness(Color.parseColor(primarySetting), "light");
            }
        } else {
            if (!isControllingRGB) {
                String cL = "#" + Integer.toHexString(ContextCompat.getColor(context, R.color.white));
                settingColor = Color.parseColor(cL);
            } else if (colorControlledFromModalO != null) {
                int colorControlledFromModal = Integer.parseInt(colorControlledFromModalO.toString(), 10);
                settingColor = pickOnSettingColorBrightness(colorControlledFromModal, "light");
            } else if (!primarySetting.equalsIgnoreCase("picker") && !primarySetting.equalsIgnoreCase("both")) {
                settingColor = pickOnSettingColorBrightness(Color.parseColor(primarySetting), "dark");
            }
        }
        return settingColor;
    }

    public static int pickOnSettingColorBrightness(int color, String typeToCheck) {
        DevicesUtilities deviceUtils = new DevicesUtilities();
        int settingColor;

        if (typeToCheck.equals("light")) {
            if (!deviceUtils.isLightColor(color)) {
                settingColor = color;
            } else {
                settingColor = Color.parseColor("#e26901");
            }
        } else {
            if (!deviceUtils.isLightColor(color)) {// TODO check for dark
                settingColor = color;
            } else {
                settingColor = Color.parseColor("#e26901");
            }
        }

        return settingColor;
    }
}
