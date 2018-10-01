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

import android.util.Log;

public enum SensorType {
    temp("1"),
    humidity("2"),
    rrate("4"),
    rtot("8"),
    wgust("64"),
    wavg("32"),
    wdir("16"),
    uv("128"),
    watt("256"),
    lum("512");
        /**
     * Google's String representation of this language.
     */
    private  String language;

//    private static Map map = new HashMap();
       /**
     * Enum constructor.
     *
     * @param pLanguage The language identifier.
     */
    private SensorType(final String pLanguage) {
        language = pLanguage;
    }

    public static SensorType fromString(final String pLanguage) {
        for (SensorType l : values()) {
            Log.v("Sample",l.toString());
            if (l.toString().equals(pLanguage)) {
                return l;
            }
        }
        return null;
    }


    public static String getStringValueFromLang(final String lan) {
        for (SensorType status : SensorType.values()) {
            if (status.toString().equals(lan)) {
                return status.name();

            }
        }
        return null;
    }
    public static String getValueLang(String lan)
    {
        for(SensorType status:SensorType.values())
        {
            if(status.name().equals(lan))
            {
                return status.toString();
            }
        }
        return null;
    }


  /*  static {
        for (Language legEnum : Language.values()) {
            map.put(legEnum.language, legEnum);
        }
    }

    public static Language getLanguage(String legNo) {
        return (Language) map.get(legNo);
    }
*/

    /**
     * Returns the String representation of this language.
     *
     * @return The String representation of this language.
     */
    @Override
    public String toString() {
        return language;
    }
}
