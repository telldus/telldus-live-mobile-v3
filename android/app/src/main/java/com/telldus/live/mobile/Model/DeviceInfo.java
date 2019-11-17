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

public class DeviceInfo {
    String state;
    int widgetId;
    int deviceId;
    String deviceName;
    Integer methods;
    String transparent;
    String deviceType;
    String deviceStateValue;
    String userId;
    String methodRequested;
    Integer isShowingStatus;
    Integer updateInterval;
    Integer clientDeviceId;
    Integer clientId;

    public DeviceInfo() {
    }

    public DeviceInfo(String state, int widgetId, int deviceId, String deviceName, Integer methods,
    String deviceType, String deviceStateValue, String transparent, String userId, String methodRequested,
                      Integer isShowingStatus, Integer updateInterval, Integer clientDeviceId, Integer clientId) {
        this.state = state;
        this.widgetId = widgetId;
        this.deviceId = deviceId;
        this.deviceName = deviceName;
        this.methods = methods;
        this.transparent = transparent;
        this.deviceType = deviceType;
        this.deviceStateValue = deviceStateValue;
        this.userId = userId;
        this.methodRequested = methodRequested;
        this.isShowingStatus = isShowingStatus;
        this.updateInterval = updateInterval;
        this.clientDeviceId = clientDeviceId;
        this.clientId = clientId;
    }

    public String getState() {
        return state;
    }

    public String getTransparent() {
        return transparent;
    }

    public void setTransparent(String transparent) {
        this.transparent=transparent;
    }

    public void setState(String state) {
        this.state = state;
    }

    public int getWidgetId() {
        return widgetId;
    }

    public void setWidgetId(int widgetId) {
        this.widgetId = widgetId;
    }

    public int getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(int deviceId) {
        this.deviceId = deviceId;
    }

    public String getDeviceName() {
        return deviceName;
    }

    public void setDeviceName(String deviceName) {
        this.deviceName = deviceName;
    }

    public Integer getDeviceMethods() {
        return methods;
    }

    public void setDeviceMethods(Integer methods) {
        this.methods = methods;
    }

    public String getDeviceType() {
        return deviceType;
    }

    public void setDeviceType(String deviceType) {
        this.deviceType = deviceType;
    }

    public String getDeviceStateValue() {
        return deviceStateValue;
    }

    public void setDeviceStateValue(String deviceStateValue) {
        this.deviceStateValue = deviceStateValue;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getMethodRequested() {
        return methodRequested;
    }

    public void setMethodRequested(String methodRequested) {
        this.methodRequested = methodRequested;
    }

    public Integer getIsShowingStatus() {
        return isShowingStatus;
    }

    public void setIsShowingStatus(Integer isShowingStatus) {
        this.isShowingStatus = isShowingStatus;
    }

    public Integer getUpdateInterval() {
        return updateInterval;
    }

    public void setUpdateInterval(Integer updateInterval) {
        this.updateInterval = updateInterval;
    }

    public Integer getClientDeviceid() {
        return clientDeviceId;
    }

    public void setClientDeviceid(Integer clientDeviceId) {
        this.clientDeviceId = clientDeviceId;
    }

    public Integer getClientId() {
        return clientId;
    }

    public void setClientId(Integer clientId) {
        this.clientId = clientId;
    }
}
