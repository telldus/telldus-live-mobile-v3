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
import android.util.Log;

import com.telldus.live.mobile.R;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;


public class DevicesUtilities {

    public Map<Integer, String> methods = new HashMap<Integer, String>() {{
        put(1, "TURNON");
        put(2, "TURNOFF");
        put(4, "BELL");
        put(8, "TOGGLE");
        put(16, "DIM");
        put(32, "LEARN");
        put(64, "EXECUTE");
        put(128, "UP");
        put(256, "DOWN");
        put(512, "STOP");
        put(1024, "RGB");
        put(2048, "THERMOSTAT");
    }};

    public Integer getBiggestPower(Integer num) {
        int pow = (int) Math.floor(Math.log(num) / Math.log(2));
        return pow;
    }

    public List<Integer> getParts(Integer num,List<Integer> memo) {
        Integer biggestPower = getBiggestPower(num);
        Double biggestPartD = Math.pow(2, biggestPower);
        Integer biggestPart = biggestPartD.intValue();
        Integer remainder = num - biggestPart;

        List<Integer> newMemo = memo;
        newMemo.add( biggestPart);

        if (remainder < 1) {
            return newMemo;
        }
        return getParts(remainder, newMemo);
    }

    public Map<String, Boolean> getSupportedMethods(Integer methodsAggregate) {
        Map<String, Boolean> methodHashmap = new HashMap<String, Boolean>();
        List<Integer> memo = new ArrayList<Integer>();
        List<Integer> methodNumbers = getParts(methodsAggregate, memo);

        Iterator<Integer> itr = methodNumbers.iterator();
        while (itr.hasNext()) {
            Integer methodNumber = itr.next();
            String item = methods.get(methodNumber);
            if (item != null) {
                methodHashmap.put(item, true);
            }
        }
        return methodHashmap;
    }

    public String getDeviceIcons(String deviceType) {
        switch (deviceType) {
            case "0000001-0001-1000-2005-ACCA54000000":// ToDo: remove support for length "7" once backend is ready
            case "00000001-0001-1000-2005-ACCA54000000":
                return "alarm";
            case "0000002-0001-1000-2005-ACCA54000000":
            case "00000002-0001-1000-2005-ACCA54000000":
                return "group";
            case "0000003-0001-1000-2005-ACCA54000000":
            case "00000003-0001-1000-2005-ACCA54000000":
                return "location";
            case "0000004-0001-1000-2005-ACCA54000000":
            case "00000004-0001-1000-2005-ACCA54000000":
                return "doorclosed";
            case "0000005-0001-1000-2005-ACCA54000000":
            case "00000005-0001-1000-2005-ACCA54000000":
                return "bulb";
            case "0000006-0001-1000-2005-ACCA54000000":
            case "00000006-0001-1000-2005-ACCA54000000":
                return "keyhole";
            case "0000007-0001-1000-2005-ACCA54000000":
            case "00000007-0001-1000-2005-ACCA54000000":
                return "music";
            case "0000008-0001-1000-2005-ACCA54000000":
            case "00000008-0001-1000-2005-ACCA54000000":
                return "gauge";
            case "0000009-0001-1000-2005-ACCA54000000":
            case "00000009-0001-1000-2005-ACCA54000000":
                return "monitoring";
            case "000000A-0001-1000-2005-ACCA54000000":
            case "0000000A-0001-1000-2005-ACCA54000000":
                return "sensor";
            case "000000B-0001-1000-2005-ACCA54000000":
            case "0000000B-0001-1000-2005-ACCA54000000":
                return "user";
            case "000000C-0001-1000-2005-ACCA54000000":
            case "0000000C-0001-1000-2005-ACCA54000000":
                return "remotecontrol";
            case "000000D-0001-1000-2005-ACCA54000000":
            case "0000000D-0001-1000-2005-ACCA54000000":
                return "sensor";
            case "000000E-0001-1000-2005-ACCA54000000":
            case "0000000E-0001-1000-2005-ACCA54000000":
                return "alarm";
            case "000000F-0001-1000-2005-ACCA54000000":
            case "0000000F-0001-1000-2005-ACCA54000000":
                return "speaker";
            case "0000010-0001-1000-2005-ACCA54000000":
            case "00000010-0001-1000-2005-ACCA54000000":
                return "outlet";
            case "0000011-0001-1000-2005-ACCA54000000":
            case "00000011-0001-1000-2005-ACCA54000000":
                return "thermostat";
            case "0000012-0001-1000-2005-ACCA54000000":
            case "00000012-0001-1000-2005-ACCA54000000":
                return "buttononoff";
            case "0000013-0001-1000-2005-ACCA54000000":
            case "00000013-0001-1000-2005-ACCA54000000":
                return "curtain";
            case "0000014-0001-1000-2005-ACCA54000000":
            case "00000014-0001-1000-2005-ACCA54000000":
                return "curtain";
            default:
                return "devicealt";
        }
    }

    public Map<String, String> getDeviceActionIcon(String deviceType, String state, Map<String, Boolean> supportedMethods) {
        Boolean TURNON = supportedMethods.get("TURNON");
        Boolean TURNOFF = supportedMethods.get("TURNOFF");
        Boolean BELL = supportedMethods.get("BELL");
        Boolean DIM = supportedMethods.get("DIM");
        Boolean UP = supportedMethods.get("UP");
        Boolean DOWN = supportedMethods.get("DOWN");
        Boolean STOP = supportedMethods.get("STOP");

        Map<String, String> actionsIconSet = new HashMap<String, String>();
        actionsIconSet.put("TURNON", "on");
        actionsIconSet.put("TURNOFF", "off");
        actionsIconSet.put("BELL", "bell");
        actionsIconSet.put("DIM", "dim");
        actionsIconSet.put("UP", "up");
        actionsIconSet.put("DOWN", "down");
        actionsIconSet.put("STOP", "stop");

        if (deviceType == null) {
            return actionsIconSet;
        }

        switch(deviceType) {
            case "0000001-0001-1000-2005-ACCA54000000":// ToDo: remove support for length "7" once backend is ready
            case "00000001-0001-1000-2005-ACCA54000000":
                actionsIconSet.put("TURNON", "alarmtriggered");
                actionsIconSet.put("TURNOFF", "alarmtriggered");
                if (state != null && state.equals("2")) {
                    actionsIconSet.put("TURNON", "alarm");
                    actionsIconSet.put("TURNOFF", "alarm");
                }
                if (TURNON != null && TURNON) {
                    actionsIconSet.put("TURNON", "alarmtriggered");
                }
                if (TURNOFF != null && TURNOFF) {
                    actionsIconSet.put("TURNOFF", "alarm");
                }
                return actionsIconSet;

            case "0000004-0001-1000-2005-ACCA54000000":
            case "00000004-0001-1000-2005-ACCA54000000":
                actionsIconSet.put("TURNON", "dooropen");
                actionsIconSet.put("TURNOFF", "dooropen");
                if (state != null && state.equals("2")) {
                    actionsIconSet.put("TURNON", "doorclosed");
                    actionsIconSet.put("TURNOFF", "doorclosed");
                }
                if (TURNON != null && TURNON) {
                    actionsIconSet.put("TURNON", "dooropen");
                }
                if (TURNOFF != null && TURNOFF) {
                    actionsIconSet.put("TURNOFF", "doorclosed");
                }
                return actionsIconSet;

            case "0000006-0001-1000-2005-ACCA54000000":
            case "00000006-0001-1000-2005-ACCA54000000":
                actionsIconSet.put("TURNON", "locked");
                actionsIconSet.put("TURNOFF", "locked");
                if (state != null && state.equals("2")) {
                    actionsIconSet.put("TURNON", "unlocked");
                    actionsIconSet.put("TURNOFF", "unlocked");
                }
                if (TURNON != null && TURNON) {
                    actionsIconSet.put("TURNON", "locked");
                }
                if (TURNOFF != null && TURNOFF) {
                    actionsIconSet.put("TURNOFF", "unlocked");
                }
                return actionsIconSet;

            case "0000009-0001-1000-2005-ACCA54000000":
            case "00000009-0001-1000-2005-ACCA54000000":
                actionsIconSet.put("TURNON", "motion-triggered");
                actionsIconSet.put("TURNOFF", "motion-triggered");
                if (state != null && state.equals("2")) {
                    actionsIconSet.put("TURNON", "motion");
                    actionsIconSet.put("TURNOFF", "motion");
                }
                if (TURNON != null && TURNON) {
                    actionsIconSet.put("TURNON", "motion-triggered");
                }
                if (TURNOFF != null && TURNOFF) {
                    actionsIconSet.put("TURNOFF", "motion");
                }
                return actionsIconSet;

            case "000000B-0001-1000-2005-ACCA54000000":
            case "0000000B-0001-1000-2005-ACCA54000000":
                actionsIconSet.put("TURNON", "userhome");
                actionsIconSet.put("TURNOFF", "userhome");
                if (state != null && state.equals("2")) {
                    actionsIconSet.put("TURNON", "useraway");
                    actionsIconSet.put("TURNOFF", "useraway");
                }
                if (TURNON != null && TURNON) {
                    actionsIconSet.put("TURNON", "userhome");
                }
                if (TURNOFF != null && TURNOFF) {
                    actionsIconSet.put("TURNOFF", "useraway");
                }
                return actionsIconSet;

            case "000000E-0001-1000-2005-ACCA54000000":
            case "0000000E-0001-1000-2005-ACCA54000000":
                actionsIconSet.put("TURNON", "fire");
                actionsIconSet.put("TURNOFF", "fire");
                if (state != null && state.equals("2")) {
                    actionsIconSet.put("TURNON", "off");
                    actionsIconSet.put("TURNOFF", "off");
                }
                if (TURNON != null && TURNON) {
                    actionsIconSet.put("TURNON", "fire");
                }
                if (TURNOFF != null && TURNOFF) {
                    actionsIconSet.put("TURNOFF", "off");
                }
                return actionsIconSet;

            case "0000007-0001-1000-2005-ACCA54000000":
            case "00000007-0001-1000-2005-ACCA54000000":
                actionsIconSet.put("TURNON", "play");
                actionsIconSet.put("TURNOFF", "play");
                if (state != null && state.equals("2")) {
                    actionsIconSet.put("TURNON", "pause");
                    actionsIconSet.put("TURNOFF", "pause");
                }
                if (TURNON != null && TURNON) {
                    actionsIconSet.put("TURNON" ,"play");
                }
                if (TURNOFF != null && TURNOFF) {
                    actionsIconSet.put("TURNOFF", "pause");
                }
                return actionsIconSet;

            default:
                return actionsIconSet;
        }
    }

    public int toSliderValue (Integer dimmerValue) {
        return (int) Math.round(dimmerValue * 100.0 / 255);
    }

    public int toDimmerValue (Integer sliderValue) {
        return (int) Math.round(sliderValue * 255 / 100.0);
    }

    public ArrayList<Map> getKnownModesThermostat (Context context) {
        Map modeAuto = new HashMap();
        modeAuto.put("label", context.getResources().getString(R.string.reserved_widget_android_label_auto));
        modeAuto.put("icon", "thermostatauto");
        modeAuto.put("mode", "auto");
        modeAuto.put("id", "0");

        Map modeHeat = new HashMap();
        modeHeat.put("label", context.getResources().getString(R.string.reserved_widget_android_label_heat));
        modeHeat.put("icon", "thermostatheat");
        modeHeat.put("mode", "heat");
        modeHeat.put("id", "1");

        Map modeCool = new HashMap();
        modeCool.put("label", context.getResources().getString(R.string.reserved_widget_android_label_cool));
        modeCool.put("icon", "thermostatheatcool");
        modeCool.put("mode", "cool");
        modeCool.put("id", "2");

        Map modeEcoHeat = new HashMap();
        modeEcoHeat.put("label", context.getResources().getString(R.string.reserved_widget_android_label_eco_heat));
        modeEcoHeat.put("icon", "thermostateco");
        modeEcoHeat.put("mode", "eco-heat");
        modeEcoHeat.put("id", "3");

        Map modeEcoCool = new HashMap();
        modeEcoCool.put("label", context.getResources().getString(R.string.reserved_widget_android_label_eco_cool));
        modeEcoCool.put("icon", "thermostateco");
        modeEcoCool.put("mode", "eco-cool");
        modeEcoCool.put("id", "4");

        Map modeHeatCool = new HashMap();
        modeHeatCool.put("label", context.getResources().getString(R.string.reserved_widget_android_label_heat_cool));
        modeHeatCool.put("icon", "thermostatheatcool");
        modeHeatCool.put("mode", "heat-cool");
        modeHeatCool.put("id", "5");

        Map modeManual = new HashMap();
        modeManual.put("label", context.getResources().getString(R.string.reserved_widget_android_label_manual));
        modeManual.put("icon", "thermostatauto");
        modeManual.put("mode", "manual");
        modeManual.put("id", "6");

        Map modeProgram = new HashMap();
        modeProgram.put("label", context.getResources().getString(R.string.reserved_widget_android_label_program));
        modeProgram.put("icon", "thermostatprogram");
        modeProgram.put("mode", "program");
        modeProgram.put("id", "7");

        Map modeDry = new HashMap();
        modeDry.put("label", context.getResources().getString(R.string.reserved_widget_android_label_dry));
        modeDry.put("icon", "thermostatdry");
        modeDry.put("mode", "dry");
        modeDry.put("id", "8");

        Map modeAway = new HashMap();
        modeAway.put("label", context.getResources().getString(R.string.reserved_widget_android_label_away));
        modeAway.put("icon", "thermostataway");
        modeAway.put("mode", "away");
        modeAway.put("id", "9");

        Map modeHG = new HashMap();
        modeHG.put("label", context.getResources().getString(R.string.reserved_widget_android_label_HG));
        modeHG.put("icon", "thermostathg");
        modeHG.put("mode", "hg");
        modeHG.put("id", "10");

        Map modeMax = new HashMap();
        modeMax.put("label", context.getResources().getString(R.string.reserved_widget_android_label_max));
        modeMax.put("icon", "thermostatheat");
        modeMax.put("mode", "max");
        modeMax.put("id", "11");

        Map modeOff = new HashMap();
        modeOff.put("label", context.getResources().getString(R.string.reserved_widget_android_label_off));
        modeOff.put("icon", "off");
        modeOff.put("mode", "off");
        modeOff.put("id", "12");

        Map modeFan = new HashMap();
        modeFan.put("label", context.getResources().getString(R.string.reserved_widget_android_label_fan));
        modeFan.put("icon", "thermostatfan");
        modeFan.put("mode", "fan");
        modeFan.put("id", "13");

        ArrayList<Map> modesList = new ArrayList<Map>();
        modesList.add(modeAuto);
        modesList.add(modeHeat);
        modesList.add(modeCool);
        modesList.add(modeEcoHeat);
        modesList.add(modeEcoCool);
        modesList.add(modeHeatCool);
        modesList.add(modeManual);
        modesList.add(modeProgram);
        modesList.add(modeDry);
        modesList.add(modeAway);
        modesList.add(modeHG);
        modesList.add(modeMax);
        modesList.add(modeOff);
        modesList.add(modeFan);

        return modesList;
    }
}