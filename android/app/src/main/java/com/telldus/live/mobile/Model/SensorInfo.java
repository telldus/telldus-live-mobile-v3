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

package com.telldus.live.mobile.Model;

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
