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

import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.ArrayList;

import java.io.IOException;
import java.io.InputStream;
import java.util.Map;

import org.json.JSONException;
import org.json.JSONObject;
import org.json.JSONArray;

import com.telldus.live.mobile.R;

public class SensorsUtilities {

    public static String[] WIND_DIR = new String[]{
        "N",
        "NNE",
        "NE",
        "ENE",
        "E",
        "ESE",
        "SE",
        "SSE",
        "S",
        "SSW",
        "SW",
        "WSW",
        "W",
        "WNW",
        "NW",
        "NNW",
        "N",
    };

    public String getConstants(Context context) {
        String json = null;
        try {
            InputStream is = context.getAssets().open("data/sensorConstants.json");
            int size = is.available();
            byte[] buffer = new byte[size];
            is.read(buffer);
            is.close();
            json = new String(buffer, "UTF-8");

        } catch (IOException ex) {
            ex.printStackTrace();
            return null;
        }
        return json;
    }

    public Map<String, String> getSensorTypes(Context context) {
        String sensorConstants = this.getConstants(context);
        Map<String, String> names = new HashMap<String, String>();
        if (sensorConstants != null) {
            try {
                JSONObject constantsJSON = new JSONObject(sensorConstants);
                JSONObject sensorTypesDict = constantsJSON.getJSONObject("sensorTypesDict");
                Iterator<String> iter = sensorTypesDict.keys();

                while (iter.hasNext()) {
                    String key = iter.next();
                    JSONObject item = sensorTypesDict.getJSONObject(key);
                    if (item != null) {
                        String lexical = item.getString("lexical");
                        names.put(lexical, key);
                    }
                }
                return names;
            } catch (JSONException e) {
                e.printStackTrace();
                return names;
            }
        }
        return names;
    }

    public Map<String, String> getSensorUnits(String sensorType, Context context) {
        Map<String, String> units = new HashMap<String, String>();

        String sensorConstants = this.getConstants(context);

        if (sensorConstants != null) {
            try {
                JSONObject constantsJSON = new JSONObject(sensorConstants);
                JSONObject sensorTypesDict = constantsJSON.getJSONObject("sensorTypesDict");
                JSONObject unitTypes = constantsJSON.getJSONObject("unitTypes");

                JSONObject currentSensorType = new JSONObject();

                Iterator<String> iter = sensorTypesDict.keys();

                while (iter.hasNext()) {
                    String key = iter.next();
                    currentSensorType  = sensorTypesDict.getJSONObject(sensorType);
                }

                if (currentSensorType != null) {
                    JSONArray sensorScales = currentSensorType.getJSONArray("scale");
                    for (int i = 0; i < sensorScales.length(); i++) {
                        JSONArray sensorScale = unitTypes.getJSONArray(sensorScales.getString(i));
                        if (sensorScale != null) {
                            String key = sensorScale.getString(0);
                            units.put(key, sensorScale.getString(1));
                        }
                    }
                }
                return units;
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }

        return units;
    };

    public Map<String, Object> getSensorInfo(String name, String scale, String value, Context context) {
        Map<String, Object> info = new HashMap<String, Object>();
        String unit = "";
        info.put("label", context.getResources().getString(R.string.reserved_widget_android_unknown));
        info.put("icon", "sensor");
        info.put("unit", unit);
        info.put("value", value);
        info.put("name", name);
        info.put("scale", scale);

        Map<String, String> sensorTypes = getSensorTypes(context);
        String sensorType = sensorTypes.get(name);
        Map<String, String> sensorUnits = getSensorUnits(sensorType, context);
        unit = sensorUnits.get(scale);

        unit = unit == null ? "" : unit;
        info.put("unit", unit);

        if (name.equals("humidity")) {
            info.put("label", context.getResources().getString(R.string.reserved_widget_android_accessibilityLabel_sensors_labelHumidity));
            info.put("icon", "humidity");
            return info;
        }
        if (name.equals("temp")) {
            info.put("label", context.getResources().getString(R.string.reserved_widget_android_accessibilityLabel_sensors_labelTemperature));
            info.put("icon", "temperature");
            return info;
        }
        if (name.equals("rrate") || name.equals("rtot")) {
            String label = name.equals("rrate") ?
            context.getResources().getString(R.string.reserved_widget_android_accessibilityLabel_sensors_labelRainRate)
            :
            context.getResources().getString(R.string.reserved_widget_android_accessibilityLabel_sensors_labelRainTotal);
            info.put("label", label);
            info.put("icon", "rain");
            return info;
        }
        if (name.equals("wgust") || name.equals("wavg") || name.equals("wdir")) {
            String label = name.equals("wgust") ?
            context.getResources().getString(R.string.reserved_widget_android_accessibilityLabel_sensors_labelWindGust)
            :
            context.getResources().getString(R.string.reserved_widget_android_accessibilityLabel_sensors_labelWindAverage);
            info.put("icon", "wind");
            if (name.equals("wdir")) {
                label = context.getResources().getString(R.string.reserved_widget_android_accessibilityLabel_sensors_labelWindDirection);
                String direction = getWindDirection(value);
                info.put("value", direction);
            }
            info.put("label", label);
            return info;
        }
        if (name.equals("uv")) {
            String label = context.getResources().getString(R.string.reserved_widget_android_accessibilityLabel_sensors_labelUVIndex);
            info.put("label", label);
            info.put("icon", "uv");
            return info;
        }
        if (name.equals("watt")) {
            String label = context.getResources().getString(R.string.reserved_widget_android_accessibilityLabel_sensors_energy);
            if (scale.equals("0")) {
                label = context.getResources().getString(R.string.reserved_widget_android_accessibilityLabel_sensors_Accumulated)
                +" "+
                context.getResources().getString(R.string.reserved_widget_android_accessibilityLabel_sensors_labelWatt);
            }
            if (scale.equals("2")) {
                label = context.getResources().getString(R.string.reserved_widget_android_accessibilityLabel_sensors_labelWatt);
            }
            if (scale.equals("3")) {
                label = context.getResources().getString(R.string.reserved_widget_android_accessibilityLabel_sensors_pulse);
            }
            if (scale.equals("4")) {
                label = context.getResources().getString(R.string.reserved_widget_android_accessibilityLabel_sensors_voltage);
            }
            if (scale.equals("5")) {
                label = context.getResources().getString(R.string.reserved_widget_android_accessibilityLabel_sensors_current);
            }
            if (scale.equals("6")) {
                label = context.getResources().getString(R.string.reserved_widget_android_accessibilityLabel_sensors_powerFactor);
            }
            info.put("label", label);
            info.put("icon", "watt");
            return info;
        }
        if (name.equals("lum")) {
            String label = context.getResources().getString(R.string.reserved_widget_android_accessibilityLabel_sensors_labelLuminance);
            info.put("label", label);
            info.put("icon", "luminance");
            return info;
        }
        if (name.equals("dewp")) {
            String label = context.getResources().getString(R.string.reserved_widget_android_accessibilityLabel_sensors_labelDewPoint);
            info.put("label", label);
            info.put("icon", "humidity");
            return info;
        }
        if (name .equals("barpress")) {
            String label = context.getResources().getString(R.string.reserved_widget_android_accessibilityLabel_sensors_labelBarometricPressure);
            info.put("label", label);
            info.put("icon", "gauge");
            return info;
        }
        if (name.equals("genmeter")) {
            String label = context.getResources().getString(R.string.reserved_widget_android_accessibilityLabel_sensors_labelGenericMeter);
            info.put("label", label);
            info.put("icon", "sensor");
            return info;
        }
        if (name.equals("co2")) {
            String label = "CO2";
            info.put("label", label);
            info.put("icon", "co2");
            return info;
        }
        if (name.equals("volume")) {
            String label = context.getResources().getString(R.string.reserved_widget_android_accessibilityLabel_sensors_labelVolume);
            String icon = scale.equals("0") ? "volumeliquid" : "volume3d";
            info.put("label", label);
            info.put("icon", icon);
            return info;
        }
        if (name.equals("loudness")) {
            String label = context.getResources().getString(R.string.reserved_widget_android_accessibilityLabel_sensors_labelLoudness);
            info.put("label", label);
            info.put("icon", "speaker");
            return info;
        }
        if (name.equals("particulatematter2.5")) {
            String label = "PM2.5";
            info.put("label", label);
            info.put("icon", "pm25");
            return info;
        }
        if (name.equals("co")) {
            String label = "CO";
            info.put("label", label);
            info.put("icon", "co");
            return info;
        }
        if (name.equals("weight")) {
            String label = context.getResources().getString(R.string.reserved_widget_android_accessibilityLabel_sensors_labelWeight);
            info.put("label", label);
            info.put("icon", "weight");
            return info;
        }
        if (name.equals("moisture")) {
            String label = context.getResources().getString(R.string.reserved_widget_android_accessibilityLabel_sensors_labelMoisture);
            info.put("label", label);
            info.put("icon", "humidity");
            return info;
        }
        return info;
    }

    public String getWindDirection(String value) {
        Double index = Math.floor(Float.parseFloat(value) / 22.5);
        if (index.intValue() <= WIND_DIR.length - 1) {
            return WIND_DIR[index.intValue()];
        }
        return "";
    }
}