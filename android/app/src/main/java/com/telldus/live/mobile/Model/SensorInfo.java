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
    int widgetId;
    String sensorName;
    String sensorDisplayType;
    int sensorId;
    String sensorValue;
    String sensorUnit;
    String sensorIcon;
    String sensorUpdate;
    String transparent;
    String userId;
    Integer updateInterval;

    public SensorInfo(int widgetId, String sensorName, String sensorDisplayType, int sensorId, String sensorValue, String sensorUnit,
    String sensorIcon, String sensorUpdate, String transparent, String userId, Integer updateInterval) {
        this.widgetId = widgetId;
        this.sensorName = sensorName;
        this.sensorDisplayType = sensorDisplayType;
        this.sensorId = sensorId;
        this.sensorValue = sensorValue;
        this.sensorUnit = sensorUnit;
        this.sensorIcon = sensorIcon;
        this.sensorUpdate = sensorUpdate;
        this.transparent = transparent;
        this.userId = userId;
        this.updateInterval = updateInterval;
    }

    public SensorInfo() {

    }

    public String getTransparent() {
        return transparent;
    }

    public void setTransparent(String transparent) {
        this.transparent=transparent;
    }

    public int getWidgetId() {
        return widgetId;
    }

    public void setWidgetId(int widgetId) {
        this.widgetId = widgetId;
    }

    public String getSensorName() {
        return sensorName;
    }

    public void setSensorName(String sensorName) {
        this.sensorName = sensorName;
    }

    public String getSensorDisplayType() {
        return sensorDisplayType;
    }

    public void setSensorDisplayType(String sensorDisplayType) {
        this.sensorDisplayType = sensorDisplayType;
    }

    public int getSensorId() {
        return sensorId;
    }

    public void setSensorId(int sensorId) {
        this.sensorId = sensorId;
    }

    public String getSensorValue() {
        return sensorValue;
    }

    public void setSensorValue(String sensorValue) {
        this.sensorValue = sensorValue;
    }

    public String getSensorUnit() {
        return sensorUnit;
    }

    public void setSensorUnit(String sensorUnit) {
        this.sensorUnit = sensorUnit;
    }

    public String getSensorIcon() {
        return sensorIcon;
    }

    public void setSensorIcon(String sensorIcon) {
        this.sensorIcon = sensorIcon;
    }

    public String getSensorUpdate() {
        return sensorUpdate;
    }

    public void setSensorUpdate(String sensorUpdate) {
        this.sensorUpdate = sensorUpdate;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Integer getUpdateInterval() {
        return updateInterval;
    }

    public void setUpdateInterval(Integer updateInterval) {
        this.updateInterval = updateInterval;
    }
}
