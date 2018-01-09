package com.telldus.live.mobile.Database;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

import java.util.ArrayList;
import java.util.List;

import com.telldus.live.mobile.Model.DeviceInfo;
import com.telldus.live.mobile.Model.SensorInfo;

public class MyDBHandler extends SQLiteOpenHelper {

    private static final int DATABASE_VERSION = 1;
    private static final String DATABASE_NAME = "Telldus.db";
    private static final String TABLE_REGISTER = "Widget";

    public static final String WIDGET_ID = "widget_id";
    public static final String DEVICE_ID = "deviceid";
    public static final String WIDGET_NAME = "device_name";
    public static final String WIDGET_ACTION="widget_action";


    public static final String TABLE_SENSOR="sensor";
    public static final String SENSOR_WIDGET_ID = "SENSOR_widget_id";
    public static final String SENSOR_DEVICE_ID = "SENSOR_deviceid";
    public static final String SENSOR_WIDGET_NAME = "SENSOR_device_name";
    public static final String SENSOR_VALUE_TYPE="SENSOR_widget_action";



    public MyDBHandler(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }


    @Override
    public void onCreate(SQLiteDatabase db) {
        String CREATE_USER_TABLE = "CREATE TABLE " +
                TABLE_REGISTER + "("+ WIDGET_ID + " INTEGER," + DEVICE_ID
                + " INTEGER," + WIDGET_NAME + " TEXT," + WIDGET_ACTION + " TEXT" + ")";


        String CREATE_SENSOR_TABLE = "CREATE TABLE " +
                TABLE_SENSOR + "("+ SENSOR_WIDGET_ID + " INTEGER," + SENSOR_DEVICE_ID
                + " INTEGER," + SENSOR_WIDGET_NAME + " TEXT," + SENSOR_VALUE_TYPE + " TEXT" + ")";

        db.execSQL(CREATE_USER_TABLE);
        db.execSQL(CREATE_SENSOR_TABLE);
    }
    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion,
                          int newVersion) {
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_REGISTER);
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_SENSOR);
        onCreate(db);
    }

    public void addUser(DeviceInfo mDeviceInfo) {
        SQLiteDatabase db = this.getWritableDatabase();

        ContentValues values = new ContentValues();
        values.put(WIDGET_ID,mDeviceInfo.getWidgetID());
        values.put(DEVICE_ID,mDeviceInfo.getDeviceID());
        values.put(WIDGET_NAME,mDeviceInfo.getAction());
        values.put(WIDGET_ACTION,"null");

        //Inserting Row
        db.insert(TABLE_REGISTER, null, values);
        db.close();
    }

    public void addSensor(SensorInfo mSensorInfo)
    {
        SQLiteDatabase db = this.getWritableDatabase();

        ContentValues values = new ContentValues();
        values.put(SENSOR_WIDGET_ID,mSensorInfo.getWidgetID());
        values.put(SENSOR_DEVICE_ID,mSensorInfo.getDeviceID());
        values.put(SENSOR_WIDGET_NAME,mSensorInfo.getWidgetName());
        values.put(SENSOR_VALUE_TYPE,mSensorInfo.getWidgetType());

        //Inserting Row
        db.insert(TABLE_SENSOR, null, values);
        db.close();

    }



    public DeviceInfo findUser(int id) {
        String query = "Select * FROM " + TABLE_REGISTER + " WHERE " + WIDGET_ID + " =  \"" + id + "\"";

        SQLiteDatabase db = this.getWritableDatabase();

        Cursor cursor = db.rawQuery(query, null);

        DeviceInfo r = new DeviceInfo();

        if (cursor.moveToFirst()) {
            cursor.moveToFirst();

            r.setDeviceName(cursor.getString(2));
            r.setWidgetID(cursor.getInt(0));
            r.setAction(cursor.getString(3));

            cursor.close();
        } else {
            r = null;
        }
        db.close();
        return r;
    }

    public SensorInfo findSensor(int id) {
        String query = "Select * FROM " + TABLE_SENSOR + " WHERE " + SENSOR_WIDGET_ID + " =  \"" + id + "\"";

        SQLiteDatabase db = this.getWritableDatabase();

        Cursor cursor = db.rawQuery(query, null);

        SensorInfo r = new SensorInfo();

        if (cursor.moveToFirst()) {
            cursor.moveToFirst();

            r.setWidgetName(cursor.getString(2));
            r.setWidgetID(cursor.getInt(0));
            r.setWidgetType(cursor.getString(3));
            r.setDeviceID(1);

            cursor.close();
        } else {
            r = null;
        }
        db.close();
        return r;
    }
    // Login user name and password
    public DeviceInfo getSinlgeDeviceID(int id)
    {

        String query = "Select * FROM " + TABLE_REGISTER + " WHERE " + WIDGET_ID + " =  \"" + id + "\"";

        SQLiteDatabase db = this.getWritableDatabase();

        Cursor cursor = db.rawQuery(query, null);

        DeviceInfo r = new DeviceInfo();

        if (cursor.moveToFirst()) {
            cursor.moveToFirst();
            r.setDeviceID(cursor.getInt(1));


            cursor.close();
        } else {
            r = null;
        }
        db.close();
        return r;

    }
    public boolean updateAction(String action,int id)
    {
        String val=String.valueOf(id);
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues contentValues = new ContentValues();
        //contentValues.put(myDbHelper.NAME,newName);

        contentValues.put(WIDGET_ACTION,action);
        String[] whereArgs= {val};
        int count =db.update(TABLE_REGISTER,contentValues, WIDGET_ID+" = ?",whereArgs );
        return true;
    }


    public  boolean delete(int id)
    {
        String widget=String.valueOf(id);
        SQLiteDatabase db = this.getWritableDatabase();
        String[] whereArgs ={widget};

      //  db.delete(this.TABLE_REGISTER ,WIDGET_ID+" = ?",whereArgs);
        //return  true;
        return  db.delete(this.TABLE_REGISTER ,WIDGET_ID+" = ?",whereArgs)>0;
    }

    public  boolean deleteSensor(int id)
    {
        String widget=String.valueOf(id);
        SQLiteDatabase db = this.getWritableDatabase();
        String[] whereArgs ={widget};

        //  db.delete(this.TABLE_REGISTER ,WIDGET_ID+" = ?",whereArgs);
        //return  true;
        return  db.delete(this.TABLE_SENSOR ,SENSOR_WIDGET_ID+" = ?",whereArgs)>0;
    }




/*
 public RegistCust CheckAvailability(String email)
    {
        SQLiteDatabase db = this.getWritableDatabase();
        String query = "Select * FROM " + TABLE_REGISTER + " WHERE " + COLUMN_EMAIL + " =  \"" + email + "\"";

        Cursor cursor = db.rawQuery(query, null);
        RegistCust reg=new RegistCust();
        if(cursor.moveToFirst())
        {
            cursor.moveToFirst();
            reg.setEmail(cursor.getString(2));

        }
        else {
            reg = null;
        }
        db.close();
        return reg;


    }*/


    public List<String> getAllLabels(){
        List<String> list = new ArrayList<String>();

        // Select All Query
        String selectQuery = "SELECT  * FROM " + TABLE_REGISTER;

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

}
