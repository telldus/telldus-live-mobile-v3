//
//  DeviceDetailsModel.swift
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 26/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import Foundation
struct DeviceDetailsModel: SQLTable {
  static let DEVICE_DETAILS_TABLE_NAME = "DeviceDetails"
  static let DEVICE_DETAILS_COLUMN_ID = "id"
  static let DEVICE_DETAILS_COLUMN_NAME = "name"
  static let DEVICE_DETAILS_COLUMN_STATE = "state"
  static let DEVICE_DETAILS_COLUMN_METHODS = "methods"
  static let DEVICE_DETAILS_COLUMN_DEVICE_TYPE = "deviceType"
  static let DEVICE_DETAILS_COLUMN_STATE_VALUE = "stateValue"
  
  let id: Int
  let name: String
  let state: Int
  let methods: Int
  let deviceType: String
  let stateValue: String
  
  static var createStatement: String {
    return """
          CREATE TABLE IF NOT EXISTS \(DEVICE_DETAILS_TABLE_NAME)(
            \(DEVICE_DETAILS_COLUMN_ID) INTEGER PRIMARY KEY NOT NULL,
            \(DEVICE_DETAILS_COLUMN_NAME) TEXT,
            \(DEVICE_DETAILS_COLUMN_STATE) INTEGER,
            \(DEVICE_DETAILS_COLUMN_METHODS) INTEGER,
            \(DEVICE_DETAILS_COLUMN_DEVICE_TYPE) TEXT,
            \(DEVICE_DETAILS_COLUMN_STATE_VALUE) TEXT
          );
          """
  }
  
  static var insertStatement: String {
    return """
          REPLACE INTO \(DEVICE_DETAILS_TABLE_NAME)
          (
          \(DEVICE_DETAILS_COLUMN_ID),
          \(DEVICE_DETAILS_COLUMN_NAME),
          \(DEVICE_DETAILS_COLUMN_STATE),
          \(DEVICE_DETAILS_COLUMN_METHODS),
          \(DEVICE_DETAILS_COLUMN_DEVICE_TYPE),
          \(DEVICE_DETAILS_COLUMN_STATE_VALUE)
          ) VALUES (?, ?, ?, ?, ?, ?);
          """
  }
  
  static var selectStatement: String {
    return """
          SELECT * FROM \(DEVICE_DETAILS_TABLE_NAME) WHERE
          \(DEVICE_DETAILS_COLUMN_ID) = ?;
          """
  }
  
  static var selectAllStatement: String {
    return """
          SELECT * FROM \(DEVICE_DETAILS_TABLE_NAME);
          """
  }
}
