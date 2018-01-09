package com.telldus.live.mobile.Model;

/**
 * Created by crosssales on 1/4/2018.
 */

public class DeviceInfo {
    String action;
    int widgetID;
    int deviceID;
    String deviceName;

    public DeviceInfo(String action, int widgetID, int deviceID, String deviceName) {
        this.action = action;
        this.widgetID = widgetID;
        this.deviceID = deviceID;
        this.deviceName = deviceName;
    }

    public DeviceInfo(String action, int widgetID, int deviceID) {
        this.action = action;
        this.widgetID = widgetID;
        this.deviceID = deviceID;
    }



    public DeviceInfo(){

    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
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
