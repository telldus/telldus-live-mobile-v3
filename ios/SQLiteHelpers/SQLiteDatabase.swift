//
//  SQLiteDatabase.swift
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 19/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import Foundation
import SQLite3

let pathDir = NSSearchPathForDirectoriesInDomains(
  .documentDirectory, .userDomainMask, true
).first!

class SQLiteDatabase {
  private let dbPointer: OpaquePointer?
  private init(dbPointer: OpaquePointer?) {
    self.dbPointer = dbPointer
  }
  deinit {
    sqlite3_close(dbPointer)
  }
  
  static func open(_ path: String?) throws -> SQLiteDatabase {
    var db: OpaquePointer?
    let _path = path ?? "\(pathDir)/widgetdb.sqlite3";
    if sqlite3_open(_path, &db) == SQLITE_OK {
      return SQLiteDatabase(dbPointer: db)
    } else {
      defer {
        if db != nil {
          sqlite3_close(db)
        }
      }
      if let errorPointer = sqlite3_errmsg(db) {
        let message = String(cString: errorPointer)
        throw SQLiteError.OpenDatabase(message: message)
      } else {
        throw SQLiteError
        .OpenDatabase(message: "No error message provided from sqlite.")
      }
    }
  }
  
  func prepareStatement(sql: String) throws -> OpaquePointer? {
    var statement: OpaquePointer?
    guard sqlite3_prepare_v2(dbPointer, sql, -1, &statement, nil)
            == SQLITE_OK else {
      throw SQLiteError.Prepare(message: errorMessage)
    }
    return statement
  }
  
  func createTable(table: SQLTable.Type) throws {
    let createTableStatement = try prepareStatement(sql: table.createStatement)
    defer {
      sqlite3_finalize(createTableStatement)
    }
    guard sqlite3_step(createTableStatement) == SQLITE_DONE else {
      throw SQLiteError.Step(message: errorMessage)
    }
    print("\(table) table created.")
  }
  
  func insertDeviceWidgetModel(deviceWidgetModel: DeviceWidgetModel) throws {
    let insertSql = """
    INSERT INTO \(DeviceWidgetModel.DEVICE_WIDGET_TABLE_NAME)
    (
    \(DeviceWidgetModel.DEVICE_WIDGET_COLUMN_WIDGET_ID),
    \(DeviceWidgetModel.DEVICE_WIDGET_COLUMN_DEVICE_ID),
    \(DeviceWidgetModel.DEVICE_WIDGET_COLUMN_DEVICE_NAME)) VALUES (?, ?, ?);
    """
    let insertStatement = try prepareStatement(sql: insertSql)
    defer {
      sqlite3_finalize(insertStatement)
    }
    let name: NSString = deviceWidgetModel.deviceName as NSString
    guard
      sqlite3_bind_int(insertStatement, 1, Int32(deviceWidgetModel.widgetId)) == SQLITE_OK  &&
        sqlite3_bind_int(insertStatement, 1, Int32(deviceWidgetModel.deviceId)) == SQLITE_OK  &&
        sqlite3_bind_text(insertStatement, 2, name.utf8String, -1, nil)
        == SQLITE_OK
    else {
      throw SQLiteError.Bind(message: errorMessage)
    }
    guard sqlite3_step(insertStatement) == SQLITE_DONE else {
      throw SQLiteError.Step(message: errorMessage)
    }
    print("TEST Successfully inserted row.")
  }
  
  func deviceWidgetModel(widgetId: Int32) -> DeviceWidgetModel? {
    let querySql = """
    SELECT * FROM \(DeviceWidgetModel.DEVICE_WIDGET_TABLE_NAME) WHERE
    \(DeviceWidgetModel.DEVICE_WIDGET_COLUMN_WIDGET_ID) = ?;
    """
    guard let queryStatement = try? prepareStatement(sql: querySql) else {
      return nil
    }
    defer {
      sqlite3_finalize(queryStatement)
    }
    guard sqlite3_bind_int(queryStatement, 1, widgetId) == SQLITE_OK else {
      return nil
    }
    guard sqlite3_step(queryStatement) == SQLITE_ROW else {
      return nil
    }
    let widgetId = sqlite3_column_int(queryStatement, 0)
    let deviceId = sqlite3_column_int(queryStatement, 1)
    guard let queryResultCol1 = sqlite3_column_text(queryStatement, 2) else {
      print("Query result is nil.")
      return nil
    }
    let deviceName = String(cString: queryResultCol1)
    return DeviceWidgetModel(widgetId: Int(widgetId),
                             deviceId: Int(deviceId),
                             deviceName: deviceName)
  }
  
  var errorMessage: String {
    if let errorPointer = sqlite3_errmsg(dbPointer) {
      let errorMessage = String(cString: errorPointer)
      return errorMessage
    } else {
      return "No error message provided from sqlite."
    }
  }
}
