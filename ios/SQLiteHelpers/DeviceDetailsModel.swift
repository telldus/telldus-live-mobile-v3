//
//  DeviceDetailsModel.swift
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 26/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import Foundation
struct DeviceDetailsModel: SQLTable {
  static let TABLE_NAME = "DeviceDetails"
  static let COLUMN_ID = "id"
  static let COLUMN_NAME = "name"
  static let COLUMN_STATE = "state"
  static let COLUMN_METHODS = "methods"
  static let COLUMN_DEVICE_TYPE = "deviceType"
  static let COLUMN_STATE_VALUE = "stateValue"
  static let COLUMN_USER_ID = "userId"
  static let COLUMN_SEC_STATE_VALUE = "secStateValue"
  static let COLUMN_METHOD_REQUESTED = "methodRequested"
  static let COLUMN_CLIENT_ID = "clientId"
  static let COLUMN_CLIENT_DEVICE_ID = "clientDeviceId"
  static let COLUMN_REQUESTED_STATE_VALUE = "requestedStateValue"
  static let COLUMN_REQUESTED_SEC_STATE_VALUE = "requestedSecStateValue"
  static let COLUMN_USER_EMAIL = "userEmail"
  
  let id: Int
  let name: String
  let state: Int
  let methods: Int
  let deviceType: String
  let stateValue: String
  let userId: String
  let secStateValue: String
  let methodRequested: Int
  let clientId: Int
  let clientDeviceId: Int
  let requestedStateValue: String
  let requestedSecStateValue: String
  let userEmail: String
  
  static var createStatement: String {
    return """
          CREATE TABLE IF NOT EXISTS \(TABLE_NAME)(
            \(COLUMN_ID) INTEGER,
            \(COLUMN_NAME) TEXT,
            \(COLUMN_STATE) INTEGER,
            \(COLUMN_METHODS) INTEGER,
            \(COLUMN_DEVICE_TYPE) TEXT,
            \(COLUMN_STATE_VALUE) TEXT,
            \(COLUMN_USER_ID) TEXT,
            \(COLUMN_SEC_STATE_VALUE) TEXT,
            \(COLUMN_METHOD_REQUESTED) INTEGER,
            \(COLUMN_CLIENT_ID) INTEGER,
            \(COLUMN_CLIENT_DEVICE_ID) INTEGER,
            \(COLUMN_REQUESTED_STATE_VALUE) TEXT,
            \(COLUMN_REQUESTED_SEC_STATE_VALUE) TEXT,
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
          \(COLUMN_STATE),
          \(COLUMN_METHODS),
          \(COLUMN_DEVICE_TYPE),
          \(COLUMN_STATE_VALUE),
          \(COLUMN_USER_ID),
          \(COLUMN_SEC_STATE_VALUE),
          \(COLUMN_METHOD_REQUESTED),
          \(COLUMN_CLIENT_ID),
          \(COLUMN_CLIENT_DEVICE_ID),
          \(COLUMN_REQUESTED_STATE_VALUE),
          \(COLUMN_REQUESTED_SEC_STATE_VALUE),
          \(COLUMN_USER_EMAIL)
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
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
  
  static var deleteAllRecordsCurrentAccountStatement: String {
    return """
          DELETE FROM \(TABLE_NAME) WHERE
          \(COLUMN_USER_ID) = ?;
          """
  }
}
