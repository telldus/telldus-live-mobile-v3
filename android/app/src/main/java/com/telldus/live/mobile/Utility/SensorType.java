package com.telldus.live.mobile.Utility;

import android.util.Log;

/**
 * Created by crosssales on 11/6/2017.
 */

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
