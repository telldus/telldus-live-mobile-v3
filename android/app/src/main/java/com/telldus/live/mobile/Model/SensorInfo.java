package com.telldus.live.mobile.Model;

/**
 * Created by crosssales on 1/8/2018.
 */

public class SensorInfo {
    int widgetID;
    String WidgetName;
    String WidgetType;
    int DeviceID;

    public SensorInfo(int widgetID, String widgetName, String widgetType, int deviceID) {
        this.widgetID = widgetID;
        WidgetName = widgetName;
        WidgetType = widgetType;
        DeviceID = deviceID;
    }
    public SensorInfo()
    {

    }

    public int getWidgetID() {
        return widgetID;
    }

    public void setWidgetID(int widgetID) {
        this.widgetID = widgetID;
    }

    public String getWidgetName() {
        return WidgetName;
    }

    public void setWidgetName(String widgetName) {
        WidgetName = widgetName;
    }

    public String getWidgetType() {
        return WidgetType;
    }

    public void setWidgetType(String widgetType) {
        WidgetType = widgetType;
    }

    public int getDeviceID() {
        return DeviceID;
    }

    public void setDeviceID(int deviceID) {
        DeviceID = deviceID;
    }
}
