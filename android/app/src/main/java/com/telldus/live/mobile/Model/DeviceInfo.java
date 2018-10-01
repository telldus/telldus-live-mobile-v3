package com.telldus.live.mobile.Model;



/**
 * Created by crosssales on 1/4/2018.
 */

public class DeviceInfo {
    String state;
    int widgetID;
    int deviceID;
    String deviceName;
    String transparent;

    public DeviceInfo()
    {

    }

    public DeviceInfo(String state, int widgetID, int deviceID, String deviceName,String transparent) {
        this.state = state;
        this.widgetID = widgetID;
        this.deviceID = deviceID;
        this.deviceName = deviceName;
        this.transparent=transparent;
    }

    public String getState() {
        return state;
    }
    public String getTransparent()
    {
        return transparent;
    }
    public void setTransparent(String transparent)
    {
        this.transparent=transparent;
    }

    public void setState(String state) {
        this.state = state;
    }

    public int getWidgetID() {
        return widgetID;
    }

    public void setWidgetID(int widgetID) {
        this.widgetID = widgetID;
    }

    public int getDeviceID() {
        return deviceID;
    }

    public void setDeviceID(int deviceID) {
        this.deviceID = deviceID;
    }

    public String getDeviceName() {
        return deviceName;
    }

    public void setDeviceName(String deviceName) {
        this.deviceName = deviceName;
    }
}
