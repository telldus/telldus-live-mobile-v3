//
//  APICacher.swift
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 27/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import Foundation

struct APICacher {
  func cacheAPIData() {
    var db: SQLiteDatabase? = nil
    do {
      db = try SQLiteDatabase.open(nil)
      try db?.createTable(table: DeviceDetailsModel.self)
    } catch {
      return
    }
    
    DevicesAPI().getDevicesList() {devices in
      for device in devices {
        let did = device["id"] as? String;
        guard did != nil else {
          continue
        }
        let id = Int(did!)!
        let name = device["name"] as! String;
        var state: Int? = nil
        if let _state = device["methods"] as? Int {
          state = _state
        }
        var methods: Int? = nil
        if let _methods = device["methods"] as? Int {
          methods = _methods
        }
        guard state != nil && methods != nil else {
          continue
        }
        var deviceType = ""
        if let _deviceType = device["deviceType"] as? String {
          deviceType = _deviceType
        }
        let stateValue = ""
        let deviceDetailsModel = DeviceDetailsModel(
          id: id,
          name: name,
          state: state!,
          methods: methods!,
          deviceType: deviceType,
          stateValue: stateValue
        )
        do {
          try db?.insertDeviceDetailsModel(deviceDetailsModel: deviceDetailsModel)
        } catch {
        }
      }
    }
    SensorsAPI().getSensorsList() {itemsList in
    }
  }
}
