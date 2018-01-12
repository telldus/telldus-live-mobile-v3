package com.telldus.live.mobile.Model;

import com.telldus.live.mobile.DeviceWidget;

/**
 * Created by crosssales on 1/4/2018.
 */

public class DeviceInfo {
    String state;
    int widgetID;
    int deviceID;
    String deviceName;

    public DeviceInfo()
    {

    }

    public DeviceInfo(String state, int widgetID, int deviceID, String deviceName) {
        this.state = state;
        this.widgetID = widgetID;
        this.deviceID = deviceID;
        this.deviceName = deviceName;
    }

    public String getState() {
        return state;
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
