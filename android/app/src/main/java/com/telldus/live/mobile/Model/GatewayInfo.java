package com.telldus.live.mobile.Model;

public class GatewayInfo {
    int id;
    String userUuid;
    String timezone;

    public GatewayInfo() {
    }

    public GatewayInfo(int id, String userUuid, String timezone) {
        this.id = id;
        this.userUuid = userUuid;
        this.timezone = timezone;
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getId() {
        return this.id;
    }

    public void setUserUuid(String userUuid) {
        this.userUuid = userUuid;
    }

    public String getUserUuid() {
        return this.userUuid;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public String getTimezone() {
        return this.timezone;
    }
}
