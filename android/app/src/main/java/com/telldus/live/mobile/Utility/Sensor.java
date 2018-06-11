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
