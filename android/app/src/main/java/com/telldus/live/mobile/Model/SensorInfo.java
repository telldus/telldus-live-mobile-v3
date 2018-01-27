package com.telldus.live.mobile.Model;

/**
 * Created by crosssales on 1/8/2018.
 */

public class SensorInfo {
    int widgetID;
    String WidgetName;
    String WidgetType;
    int DeviceID;
    String sensorValue;
    String sensorUpdate;
    String transparent;

    public SensorInfo(int widgetID, String widgetName, String widgetType, int deviceID, String sensorValue, String sensorUpdate,String transparent) {
        this.widgetID = widgetID;
        WidgetName = widgetName;
        WidgetType = widgetType;
        DeviceID = deviceID;
        this.sensorValue = sensorValue;
        this.sensorUpdate = sensorUpdate;
        this.transparent=transparent;
    }

    public SensorInfo()
    {

    }
    public String getTransparent()
    {
        return transparent;
    }
    public void setTransparent(String transparent)
    {
        this.transparent=transparent;
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

    public String getSensorValue() {
        return sensorValue;
    }

    public void setSensorValue(String sensorValue) {
        this.sensorValue = sensorValue;
    }

    public String getSensorUpdate() {
        return sensorUpdate;
    }

    public void setSensorUpdate(String sensorUpdate) {
        this.sensorUpdate = sensorUpdate;
    }
}
