//
//  DeviceWidgetModel.swift
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 26/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import Foundation
struct DeviceWidgetModel: SQLTable {
  static let DEVICE_WIDGET_TABLE_NAME = "WidgetInfoDevice"
  static let DEVICE_WIDGET_COLUMN_WIDGET_ID = "widgetId"
  static let DEVICE_WIDGET_COLUMN_DEVICE_ID = "deviceId"
  static let DEVICE_WIDGET_COLUMN_DEVICE_NAME = "deviceName"
  
  let widgetId: Int
  let deviceId: Int
  let deviceName: String
  
  static var createStatement: String {
    return """
        CREATE TABLE IF NOT EXISTS \(DEVICE_WIDGET_TABLE_NAME)(
          Id INT PRIMARY KEY NOT NULL,
          \(DEVICE_WIDGET_COLUMN_WIDGET_ID) INTEGER
          \(DEVICE_WIDGET_COLUMN_DEVICE_ID) INTEGER
          \(DEVICE_WIDGET_COLUMN_DEVICE_NAME) TEXT
        );
        """
  }
}
