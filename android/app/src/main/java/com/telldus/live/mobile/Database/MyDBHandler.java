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

package com.telldus.live.mobile.Database;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.util.Log;

import java.util.ArrayList;
import java.util.List;

import com.telldus.live.mobile.Model.DeviceInfo;
import com.telldus.live.mobile.Model.SensorInfo;

public class MyDBHandler extends SQLiteOpenHelper {

    private static final int DATABASE_VERSION = 1;
    private static final String DATABASE_NAME = "Telldus.db";

    private static final String TABLE_WIDGET_INFO_DEVICE = "WidgetInfoDevice";
    public static final String WIDGET_ID = "widgetIdDevice";
    public static final String WIDGET_DEVICE_USER_ID = "userId";
    public static final String DEVICE_ID = "deviceId";
    public static final String WIDGET_NAME = "deviceName";
    public static final String WIDGET_STATE = "deviceState";
    public static final String DEVICE_METHODS = "deviceMethods";
    public static final String DEVICE_TYPE = "deviceType";
    public static final String DEVICE_STATE_VALUE = "deviceStateValue";
    public static final String TRANSPARENT = "transparent";

    public static final String TABLE_WIDGET_INFO_SENSOR = "WidgetInfoSensor";
    public static final String SENSOR_WIDGET_ID = "widgetIdSensor";
    public static final String WIDGET_SENSOR_USER_ID = "userId";
    public static final String SENSOR_DEVICE_ID = "sensorId";
    public static final String SENSOR_WIDGET_NAME = "sensorName";
    public static final String SENSOR_VALUE_TYPE = "sensorScaleType";
    public static final String SENSOR_UPDATE = "sensorLastUpdated";
    public static final String SENSOR_VALUE = "sensorValue";
    public static final String SENSOR_UNIT = "sensorUnit";
    public static final String SENSOR_ICON = "sensorIcon";

    public MyDBHandler(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        String CREATE_USER_TABLE = "CREATE TABLE " +
                TABLE_WIDGET_INFO_DEVICE + "("+ WIDGET_ID + " INTEGER," + DEVICE_ID
                + " INTEGER," + WIDGET_NAME + " TEXT," + WIDGET_STATE + " TEXT," + DEVICE_METHODS
                + " INTEGER," +  DEVICE_TYPE + " TEXT," +  DEVICE_STATE_VALUE + " TEXT," + TRANSPARENT
                + " TEXT," + WIDGET_DEVICE_USER_ID + " TEXT" + ")";

        String CREATE_SENSOR_TABLE = "CREATE TABLE " +
                TABLE_WIDGET_INFO_SENSOR + "("+ SENSOR_WIDGET_ID + " INTEGER," + SENSOR_DEVICE_ID
                + " INTEGER," + SENSOR_WIDGET_NAME + " TEXT," + SENSOR_VALUE_TYPE + " TEXT," + SENSOR_UPDATE
                + " TEXT,"+ SENSOR_VALUE + " TEXT," +  SENSOR_UNIT + " TEXT," +  SENSOR_ICON + " TEXT," + TRANSPARENT
                + " TEXT," + WIDGET_SENSOR_USER_ID + " TEXT" + ")";

        db.execSQL(CREATE_USER_TABLE);
        db.execSQL(CREATE_SENSOR_TABLE);
    }
    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_WIDGET_INFO_DEVICE);
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_WIDGET_INFO_SENSOR);
        onCreate(db);
    }

    public void addUser(DeviceInfo mDeviceInfo) {
        SQLiteDatabase db = this.getWritableDatabase();

        ContentValues values = new ContentValues();
        values.put(WIDGET_ID, mDeviceInfo.getWidgetID());
        values.put(DEVICE_ID, mDeviceInfo.getDeviceID());
        values.put(WIDGET_NAME, mDeviceInfo.getDeviceName());
        values.put(WIDGET_STATE, mDeviceInfo.getState());
        values.put(DEVICE_METHODS, mDeviceInfo.getDeviceMethods());
        values.put(DEVICE_TYPE, mDeviceInfo.getDeviceType());
        values.put(DEVICE_STATE_VALUE, mDeviceInfo.getDeviceStateValue());
        values.put(TRANSPARENT, mDeviceInfo.getTransparent());
        values.put(WIDGET_DEVICE_USER_ID, mDeviceInfo.getUserId());

        //Inserting Row
        db.insert(TABLE_WIDGET_INFO_DEVICE, null, values);
        db.close();
    }

    public void addSensor(SensorInfo mSensorInfo) {
        SQLiteDatabase db = this.getWritableDatabase();

        ContentValues values = new ContentValues();
        values.put(SENSOR_WIDGET_ID, mSensorInfo.getWidgetID());
        values.put(SENSOR_DEVICE_ID, mSensorInfo.getDeviceID());
        values.put(SENSOR_WIDGET_NAME, mSensorInfo.getWidgetName());
        values.put(SENSOR_VALUE_TYPE, mSensorInfo.getWidgetType());
        values.put(SENSOR_UPDATE, mSensorInfo.getSensorUpdate());
        values.put(SENSOR_VALUE, mSensorInfo.getSensorValue());
        values.put(SENSOR_UNIT, mSensorInfo.getSensorUnit());
        values.put(SENSOR_ICON, mSensorInfo.getSensorIcon());
        values.put(TRANSPARENT, mSensorInfo.getTransparent());
        values.put(WIDGET_SENSOR_USER_ID, mSensorInfo.getUserId());

        //Inserting Row
        db.insert(TABLE_WIDGET_INFO_SENSOR, null, values);
        db.close();
    }

    public DeviceInfo findUser(int id) {
        String query = "Select * FROM " + TABLE_WIDGET_INFO_DEVICE + " WHERE " + WIDGET_ID + " =  \"" + id + "\"";
        SQLiteDatabase db = this.getWritableDatabase();
        Cursor cursor = db.rawQuery(query, null);
        DeviceInfo r = new DeviceInfo();

        if (cursor.moveToFirst()) {
            cursor.moveToFirst();

            r.setDeviceName(cursor.getString(2));
            r.setWidgetID(cursor.getInt(0));
            r.setState(cursor.getString(3));
            r.setDeviceMethods(cursor.getInt(4));
            r.setDeviceType(cursor.getString(5));
            r.setDeviceStateValue(cursor.getString(6));
            r.setTransparent(cursor.getString(7));
            r.setUserId(cursor.getString(8));

            cursor.close();
        } else {
            r = null;
        }
        db.close();
        return r;
    }

    public SensorInfo findSensor(int id) {
        String query = "Select * FROM " + TABLE_WIDGET_INFO_SENSOR + " WHERE " + SENSOR_WIDGET_ID + " =  \"" + id + "\"";
        SQLiteDatabase db = this.getWritableDatabase();
        Cursor cursor = db.rawQuery(query, null);
        SensorInfo r = new SensorInfo();

        if (cursor.moveToFirst()) {
            cursor.moveToFirst();

            r.setWidgetID(cursor.getInt(0));
            r.setDeviceID(cursor.getInt(1));
            r.setWidgetName(cursor.getString(2));
            r.setWidgetType(cursor.getString(3));
            r.setSensorUpdate(cursor.getString(4));
            r.setSensorValue(cursor.getString(5));
            r.setSensorUnit(cursor.getString(6));
            r.setSensorIcon(cursor.getString(7));
            r.setTransparent(cursor.getString(8));
            r.setUserId(cursor.getString(9));

            cursor.close();
        } else {
            r = null;
        }
        db.close();
        return r;
    }
    public ArrayList<SensorInfo> findSensorDevice(int id) {
        String selectQuery = "Select * FROM " + TABLE_WIDGET_INFO_SENSOR + " WHERE " + SENSOR_DEVICE_ID + " =  \"" + id + "\"";
        SQLiteDatabase db = this.getWritableDatabase();
        Cursor cursor = db.rawQuery(selectQuery, null);
        ArrayList<SensorInfo> mSensorInfo = new ArrayList<SensorInfo>();

        if (cursor.moveToFirst()) {
            do {
                SensorInfo r = new SensorInfo();
                r.setWidgetID(cursor.getInt(0));
                r.setDeviceID(1);
                r.setWidgetName(cursor.getString(2));
                r.setWidgetType(cursor.getString(3));
                mSensorInfo.add(r);
            } while (cursor.moveToNext());
        }
        cursor.close();

        db.close();
        return mSensorInfo;
    }

    // Login user name and password
    public DeviceInfo getSinlgeDeviceID(int id) {
        String query = "Select * FROM " + TABLE_WIDGET_INFO_DEVICE + " WHERE " + WIDGET_ID + " =  \"" + id + "\"";
        SQLiteDatabase db = this.getWritableDatabase();
        Cursor cursor = db.rawQuery(query, null);
        DeviceInfo r = new DeviceInfo();

        if (cursor.moveToFirst()) {
            cursor.moveToFirst();
            r.setDeviceID(cursor.getInt(1));
            r.setState(cursor.getString(3));
            r.setDeviceMethods(cursor.getInt(4));
            r.setDeviceType(cursor.getString(5));
            r.setDeviceStateValue(cursor.getString(6));
            r.setUserId(cursor.getString(8));

            cursor.close();
        } else {
            r = null;
        }
        db.close();
        return r;

    }

    public boolean updateAction(String action, int id) {
        String val = String.valueOf(id);
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues contentValues = new ContentValues();
        contentValues.put(WIDGET_STATE, action);

        String[] whereArgs = {val};
        int count = db.update(TABLE_WIDGET_INFO_DEVICE, contentValues, WIDGET_ID+" = ?", whereArgs );
        return true;
    }

    public boolean updateDeviceState(String action, int id, String value) {
        String val = String.valueOf(id);
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues contentValues = new ContentValues();
        contentValues.put(WIDGET_STATE, action);
        contentValues.put(DEVICE_STATE_VALUE, value);

        String[] whereArgs = {val};
        int count = db.update(TABLE_WIDGET_INFO_DEVICE, contentValues, DEVICE_ID+" = ?", whereArgs);
        return true;
    }

    public int updateSensorInfo(String value, long time, int Wid) {
        String time1 = String.valueOf(time);
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues contentValues = new ContentValues();
        String id = String.valueOf(Wid);

        contentValues.put(SENSOR_VALUE, value);
        contentValues.put(SENSOR_UPDATE, time1);
        String[] whereArgs = {id};
        int count = db.update(TABLE_WIDGET_INFO_SENSOR, contentValues, SENSOR_WIDGET_ID+" = ?", whereArgs );
        return count;
    }


    public boolean delete(int id) {
        String widget = String.valueOf(id);
        SQLiteDatabase db = this.getWritableDatabase();
        String[] whereArgs = {widget};

        return  db.delete(TABLE_WIDGET_INFO_DEVICE, WIDGET_ID+" = ?", whereArgs) > 0;
    }

    public boolean deleteSensor(int id) {
        String widget = String.valueOf(id);
        SQLiteDatabase db = this.getWritableDatabase();
        String[] whereArgs = {widget};

        return  db.delete(TABLE_WIDGET_INFO_SENSOR, SENSOR_WIDGET_ID+" = ?", whereArgs) > 0;
    }

    public int CountSensorTableValues() {
        SQLiteDatabase db = this.getWritableDatabase();
        String count = "SELECT count(*) FROM " + TABLE_WIDGET_INFO_SENSOR;
        Cursor mcursor = db.rawQuery(count, null);
        mcursor.moveToFirst();
        int icount = mcursor.getInt(0);

        return icount;
    }

    public int CountDeviceWidgetValues() {
        SQLiteDatabase db = this.getWritableDatabase();
        String count = "SELECT count(*) FROM " + TABLE_WIDGET_INFO_DEVICE;
        Cursor mcursor = db.rawQuery(count, null);
        mcursor.moveToFirst();
        int icount = mcursor.getInt(0);

        return icount;
    }

    public ArrayList<String> getAllLabels() {
        ArrayList<String> list = new ArrayList<String>();

        // Select All Query
        String selectQuery = "SELECT  * FROM " + TABLE_WIDGET_INFO_SENSOR;

        SQLiteDatabase db = this.getReadableDatabase();
        Cursor cursor = db.rawQuery(selectQuery, null);//selectQuery,selectedArguments

        // looping through all rows and adding to list
        if (cursor.moveToFirst()) {
            do {
                list.add(cursor.getString(1));//adding 2nd column data
            } while (cursor.moveToNext());
        }
        // closing connection
        cursor.close();
        db.close();

        // returning lables
        return list;
    }

    @Override
    protected void finalize() throws Throwable {
        this.close();
        super.finalize();
    }
}
