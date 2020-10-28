//
//  SQLiteDatabase.swift
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 19/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import Foundation
import SQLite3

let pathDir = FileManager().containerURL(forSecurityApplicationGroupIdentifier: "com.telldus.live.mobile")

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
    let _path = path ?? "\(pathDir!)/widgetdb.sqlite3";
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
  }
  
  func insertDeviceDetailsModel(deviceDetailsModel: DeviceDetailsModel) throws {
    let insertStatement = try prepareStatement(sql: DeviceDetailsModel.insertStatement)
    defer {
      sqlite3_finalize(insertStatement)
    }
    let name: NSString = deviceDetailsModel.name as NSString
    let deviceType: NSString = deviceDetailsModel.deviceType as NSString
    let stateValue: NSString = deviceDetailsModel.stateValue as NSString
    let userId: NSString = deviceDetailsModel.userId as NSString
    let secStateValue: NSString = deviceDetailsModel.secStateValue as NSString
    let requestedStateValue: NSString = deviceDetailsModel.requestedStateValue as NSString
    let requestedSecStateValue: NSString = deviceDetailsModel.requestedSecStateValue as NSString
    let userEmail: NSString = deviceDetailsModel.userEmail as NSString
    guard
      sqlite3_bind_int(insertStatement, 1, Int32(deviceDetailsModel.id)) == SQLITE_OK  &&
        sqlite3_bind_text(insertStatement, 2, name.utf8String, -1, nil) == SQLITE_OK &&
        sqlite3_bind_int(insertStatement, 3, Int32(deviceDetailsModel.state)) == SQLITE_OK &&
        sqlite3_bind_int(insertStatement, 4, Int32(deviceDetailsModel.methods)) == SQLITE_OK &&
        sqlite3_bind_text(insertStatement, 5, deviceType.utf8String, -1, nil) == SQLITE_OK &&
        sqlite3_bind_text(insertStatement, 6, stateValue.utf8String, -1, nil) == SQLITE_OK &&
        sqlite3_bind_text(insertStatement, 7, userId.utf8String, -1, nil) == SQLITE_OK &&
        sqlite3_bind_text(insertStatement, 8, secStateValue.utf8String, -1, nil) == SQLITE_OK &&
        sqlite3_bind_int(insertStatement, 9, Int32(deviceDetailsModel.methodRequested)) == SQLITE_OK &&
        sqlite3_bind_int(insertStatement, 10, Int32(deviceDetailsModel.clientId)) == SQLITE_OK &&
        sqlite3_bind_int(insertStatement, 11, Int32(deviceDetailsModel.clientDeviceId)) == SQLITE_OK &&
        sqlite3_bind_text(insertStatement, 12, requestedStateValue.utf8String, -1, nil) == SQLITE_OK &&
        sqlite3_bind_text(insertStatement, 13, requestedSecStateValue.utf8String, -1, nil) == SQLITE_OK &&
        sqlite3_bind_text(insertStatement, 14, userEmail.utf8String, -1, nil) == SQLITE_OK
    else {
      throw SQLiteError.Bind(message: errorMessage)
    }
    guard sqlite3_step(insertStatement) == SQLITE_DONE else {
      throw SQLiteError.Step(message: errorMessage)
    }
  }
  
  func deviceDetailsModel(deviceId: Int32) -> DeviceDetailsModel? {
    guard let queryStatement = try? prepareStatement(sql: DeviceDetailsModel.selectStatement) else {
      return nil
    }
    defer {
      sqlite3_finalize(queryStatement)
    }
    guard sqlite3_bind_int(queryStatement, 1, deviceId) == SQLITE_OK else {
      return nil
    }
    guard sqlite3_step(queryStatement) == SQLITE_ROW else {
      return nil
    }
    let id = sqlite3_column_int(queryStatement, 0)
    guard let queryResultCol1 = sqlite3_column_text(queryStatement, 1) else {
      return nil
    }
    let name = String(cString: queryResultCol1)
    let state = sqlite3_column_int(queryStatement, 2)
    let methods = sqlite3_column_int(queryStatement, 3)
    guard let queryResultCol4 = sqlite3_column_text(queryStatement, 4) else {
      return nil
    }
    let deviceType = String(cString: queryResultCol4)
    guard let queryResultCol5 = sqlite3_column_text(queryStatement, 5) else {
      return nil
    }
    let stateValue = String(cString: queryResultCol5)
    guard let queryResultCol6 = sqlite3_column_text(queryStatement, 6) else {
      return nil
    }
    let userId = String(cString: queryResultCol6)
    guard let queryResultCol7 = sqlite3_column_text(queryStatement, 7) else {
      return nil
    }
    let secStateValue = String(cString: queryResultCol7)
    let methodRequested = sqlite3_column_int(queryStatement, 8)
    let clientId = sqlite3_column_int(queryStatement, 9)
    let clientDeviceId = sqlite3_column_int(queryStatement, 10)
    guard let queryResultCol11 = sqlite3_column_text(queryStatement, 11) else {
      return nil
    }
    let requestedStateValue = String(cString: queryResultCol11)
    guard let queryResultCol12 = sqlite3_column_text(queryStatement, 12) else {
      return nil
    }
    let requestedSecStateValue = String(cString: queryResultCol12)
    guard let queryResultCol13 = sqlite3_column_text(queryStatement, 13) else {
      return nil
    }
    let userEmail = String(cString: queryResultCol13)
    
    return DeviceDetailsModel(
      id: Int(id),
      name: name,
      state: Int(state),
      methods: Int(methods),
      deviceType: deviceType,
      stateValue: stateValue,
      userId: userId,
      secStateValue: secStateValue,
      methodRequested: Int(methodRequested),
      clientId: Int(clientId),
      clientDeviceId: Int(clientDeviceId),
      requestedStateValue: requestedStateValue,
      requestedSecStateValue: requestedSecStateValue,
      userEmail: userEmail
    )
  }
  
  func deviceDetailsModels() -> Array<DeviceDetailsModel?> {
    var data: Array<DeviceDetailsModel?> = []
    guard let queryStatement = try? prepareStatement(sql: DeviceDetailsModel.selectAllStatement) else {
      return data
    }
    defer {
      sqlite3_finalize(queryStatement)
    }
    
    while sqlite3_step(queryStatement) == SQLITE_ROW {
      let id = sqlite3_column_int(queryStatement, 0)
      if let queryResultCol1 = sqlite3_column_text(queryStatement, 1),
         let queryResultCol4 = sqlite3_column_text(queryStatement, 4),
         let queryResultCol5 = sqlite3_column_text(queryStatement, 5)
      {
        let queryResultCol6 = sqlite3_column_text(queryStatement, 6)!
        let queryResultCol7 = sqlite3_column_text(queryStatement, 7)!
        let queryResultCol11 = sqlite3_column_text(queryStatement, 11)!
        let queryResultCol12 = sqlite3_column_text(queryStatement, 12)!
        let queryResultCol13 = sqlite3_column_text(queryStatement, 13)!
        
        let name = String(cString: queryResultCol1)
        let state = sqlite3_column_int(queryStatement, 2)
        let methods = sqlite3_column_int(queryStatement, 3)
        let deviceType = String(cString: queryResultCol4)
        let stateValue = String(cString: queryResultCol5)
        let userId = String(cString: queryResultCol6)
        let secStateValue = String(cString: queryResultCol7)
        let methodRequested = sqlite3_column_int(queryStatement, 8)
        let clientId = sqlite3_column_int(queryStatement, 9)
        let clientDeviceId = sqlite3_column_int(queryStatement, 10)
        let requestedStateValue = String(cString: queryResultCol11)
        let requestedSecStateValue = String(cString: queryResultCol12)
        let userEmail = String(cString: queryResultCol13)
        
        data.append(DeviceDetailsModel(
          id: Int(id),
          name: name,
          state: Int(state),
          methods: Int(methods),
          deviceType: deviceType,
          stateValue: stateValue,
          userId: userId,
          secStateValue: secStateValue,
          methodRequested: Int(methodRequested),
          clientId: Int(clientId),
          clientDeviceId: Int(clientDeviceId),
          requestedStateValue: requestedStateValue,
          requestedSecStateValue: requestedSecStateValue,
          userEmail: userEmail
        ))
      }
    }
    return data;
  }
  
  func countDeviceDetailsModel() -> Int {
    let querySql = """
    SELECT count(*) FROM \(DeviceDetailsModel.DEVICE_DETAILS_TABLE_NAME)
    """
    guard let queryStatement = try? prepareStatement(sql: querySql) else {
      return 0
    }
    defer {
      sqlite3_finalize(queryStatement)
    }
    guard sqlite3_step(queryStatement) == SQLITE_ROW else {
      return 0
    }
    let count = sqlite3_column_int(queryStatement, 0)
    return Int(count)
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
