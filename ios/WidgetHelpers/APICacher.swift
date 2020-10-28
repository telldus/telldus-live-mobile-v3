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
    DevicesAPI().getDevicesList() {result in
      guard let devices = result["devices"] as? Array<Dictionary<String, Any>> else {
        return
      }
      guard let authData = result["authData"] as? Dictionary<String, Any> else {
        return
      }
      let email = authData["email"] as? String
      let uuid = authData["uuid"] as? String
      guard email != nil && uuid != nil else {
        return
      }
      for device in devices {
        let did = device["id"] as? String;
        guard did != nil else {
          continue
        }
        let id = Int(did!)!
        let name = device["name"] as! String;
        var state: Int? = -1
        if let _state = device["state"] as? Int {
          state = _state
        }
        var methods: Int? = -1
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
        let _clientId = device["client"] as? String;
        guard _clientId != nil else {
          continue
        }
        let clientId = Int(_clientId!)!
        let _clientDeviceId = device["clientDeviceId"] as? String;
        guard _clientDeviceId != nil else {
          continue
        }
        let clientDeviceId = Int(_clientDeviceId!)!
        
        let deviceDetailsModel = DeviceDetailsModel(
          id: id,
          name: name,
          state: state!,
          methods: methods!,
          deviceType: deviceType,
          stateValue: stateValue,
          userId: uuid!,
          secStateValue: "",
          methodRequested: 0,
          clientId: clientId,
          clientDeviceId: clientDeviceId,
          requestedStateValue: "",
          requestedSecStateValue: "",
          userEmail: email!
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
