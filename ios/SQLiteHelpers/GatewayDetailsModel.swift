//
//  GatewayDetailsModel.swift
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 09/12/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import Foundation

struct GatewayDetailsModel: SQLTable {
  static let TABLE_NAME = "GatewayDetails"
  static let COLUMN_ID = "id"
  static let COLUMN_USER_ID = "userId"
  static let COLUMN_TIME_ZONE = "timezone"
  
  let id: Int
  let userId: String
  let timezone: String
  
  static var createStatement: String {
    return """
          CREATE TABLE IF NOT EXISTS \(TABLE_NAME)(
            \(COLUMN_ID) INTEGER,
            \(COLUMN_USER_ID) TEXT,
            \(COLUMN_TIME_ZONE) TEXT,
            PRIMARY KEY (\(COLUMN_ID))
          );
          """
  }
  
  static var insertStatement: String {
    return """
          REPLACE INTO \(TABLE_NAME)
          (
          \(COLUMN_ID),
          \(COLUMN_USER_ID),
          \(COLUMN_TIME_ZONE)
          ) VALUES (?, ?, ?);
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
