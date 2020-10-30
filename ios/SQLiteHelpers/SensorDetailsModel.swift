//
//  SensorDetailsModel.swift
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 26/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import Foundation

struct SensorDetailsModel: SQLTable {
  static let TABLE_NAME = "SensorDetails"
  static let COLUMN_ID = "id"
  static let COLUMN_NAME = "name"
  static let COLUMN_USER_ID = "userId"
  static let COLUMN_SENSOR_ID = "sensorId"
  static let COLUMN_CLIENT_ID = "clientId"
  static let COLUMN_LAST_UP = "lastUpdated"
  static let COLUMN_MODEL = "model"
  static let COLUMN_PROTOCOL = "sensorProtocol"
  static let COLUMN_IS_UPDATING = "isUpdating"
  static let COLUMN_USER_EMAIL = "userEmail"
  
  let id: Int
  let name: String
  let userId: String
  let sensorId: Int
  let clientId: Int
  let lastUpdated: Int
  let model: String
  let sensorProtocol: String
  let isUpdating: Int
  let userEmail: String
  
  static var createStatement: String {
    return """
          CREATE TABLE IF NOT EXISTS \(TABLE_NAME)(
            \(COLUMN_ID) INTEGER,
            \(COLUMN_NAME) TEXT,
            \(COLUMN_USER_ID) TEXT,
            \(COLUMN_SENSOR_ID) INTEGER,
            \(COLUMN_CLIENT_ID) INTEGER,
            \(COLUMN_LAST_UP) INTEGER,
            \(COLUMN_MODEL) TEXT,
            \(COLUMN_PROTOCOL) TEXT,
            \(COLUMN_IS_UPDATING) INTEGER,
            \(COLUMN_USER_EMAIL) TEXT,
            PRIMARY KEY (\(COLUMN_ID), \(COLUMN_CLIENT_ID))
          );
          """
  }
  
  static var insertStatement: String {
    return """
          REPLACE INTO \(TABLE_NAME)
          (
          \(COLUMN_ID),
          \(COLUMN_NAME),
          \(COLUMN_USER_ID),
          \(COLUMN_SENSOR_ID),
          \(COLUMN_CLIENT_ID),
          \(COLUMN_LAST_UP),
          \(COLUMN_MODEL),
          \(COLUMN_PROTOCOL),
          \(COLUMN_IS_UPDATING),
          \(COLUMN_USER_EMAIL)
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
          """
  }
  
  static var selectStatement: String {
    return """
          SELECT * FROM \(TABLE_NAME) WHERE
          \(COLUMN_ID) = ?;
          """
  }
  
  static var selectStatementCurrentAccount: String {
    return """
          SELECT * FROM \(TABLE_NAME) WHERE
          \(COLUMN_USER_ID) = ?;
          """
  }
  
  static var selectAllStatement: String {
    return """
          SELECT * FROM \(TABLE_NAME);
          """
  }
}

struct SensorDataModel: SQLTable {
  static let TABLE_NAME = "sensorData"
  static let COLUMN_SENSOR_ID = "sensorId"
  static let COLUMN_USER_ID = "userId"
  static let COLUMN_SCALE = "scale"
  static let COLUMN_VALUE = "value"
  static let COLUMN_NAME = "name"
  static let COLUMN_LAST_UP = "lastUpdated"
  
  var sensorId: Int
  var userId: String
  var scale: Int
  var value: Double
  var name: String
  var lastUpdated: Int
  
  static var createStatement: String {
    return """
          CREATE TABLE IF NOT EXISTS \(TABLE_NAME)(
            \(COLUMN_SENSOR_ID) INTEGER,
            \(COLUMN_USER_ID) TEXT,
            \(COLUMN_SCALE) INTEGER,
            \(COLUMN_VALUE) REAL,
            \(COLUMN_NAME) TEXT,
            \(COLUMN_LAST_UP) INTEGER,
            PRIMARY KEY (\(COLUMN_SENSOR_ID), \(COLUMN_SCALE), \(COLUMN_NAME), \(COLUMN_USER_ID))
            FOREIGN KEY (\(COLUMN_SENSOR_ID))
            REFERENCES \(SensorDetailsModel.TABLE_NAME) (\(SensorDetailsModel.COLUMN_ID))
            ON DELETE SET NULL
          );
          """
  }
  
  static var insertStatement: String {
    return """
          REPLACE INTO \(TABLE_NAME)
          (
            \(COLUMN_SENSOR_ID),
            \(COLUMN_USER_ID),
            \(COLUMN_SCALE),
            \(COLUMN_VALUE),
            \(COLUMN_NAME),
            \(COLUMN_LAST_UP)
          ) VALUES (?, ?, ?, ?, ?, ?);
          """
  }
  
  static var selectStatement: String {
    return """
          SELECT * FROM \(TABLE_NAME) WHERE
          \(COLUMN_SENSOR_ID) = ?;
          """
  }
  
  static var selectStatementCurrentAccount: String {
    return """
          SELECT * FROM \(TABLE_NAME) WHERE
          \(COLUMN_USER_ID) = ?;
          """
  }
  
  static var selectAllStatement: String {
    return """
          SELECT * FROM \(TABLE_NAME);
          """
  }
}
