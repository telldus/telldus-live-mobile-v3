package com.telldus.live.mobile.Model;

public class GatewayInfo {
    int id;
    String userId;
    String timezone;

    public GatewayInfo() {
    }

    public GatewayInfo(int id, String userId, String timezone) {
        this.id = id;
        this.userId = userId;
        this.timezone = timezone;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getId() {
        return this.id;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUserId() {
        return this.userId;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public String getTimezone() {
        return this.timezone;
    }
}
