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


public enum Sensor {
    NONE(""),
    Temperature("temp"),
    Watt("watt"),
    Humidity("humidity"),
    Luminance("lum"),
    UV("uv"),
    Rain_rate("rrate"),
    Rain_total("rtot"),
    Wind_direction("wdir"),
    Wind_average("wavg"),
    Wgust("wgust");

    private String sensor_type;
    private Sensor(final String sensor_type){
        this.sensor_type=sensor_type;
    }


    public static Sensor fromString(final String pLanguage) {
        for (Sensor l : values()) {

            if (l.toString().equals(pLanguage)) {
                return l;
            }
        }
        return null;
    }


    public static String getStringValueFromLang(final String lan) {
        for (Sensor status : Sensor.values()) {
            if (status.toString().equals(lan)) {
                return status.name();
            }
        }
        return null;
    }
    public static String getValueLang(String lan)
    {
        for(Sensor status:Sensor.values())
        {
            if(status.name().equals(lan))
            {
                return status.toString();
            }
        }
        return null;
    }



    @Override
    public String toString() {
        return sensor_type;
    }



}
