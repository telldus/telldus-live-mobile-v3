//
//  APICacher.swift
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 27/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import Foundation

struct APICacher {
  func cacheAPIData(completion: @escaping () -> Void) {
    var db: SQLiteDatabase? = nil
    do {
      db = try SQLiteDatabase.open(nil)
      try db?.createTable(table: DeviceDetailsModel.self)
      try db?.createTable(table: SensorDetailsModel.self)
      try db?.createTable(table: SensorDataModel.self)
    } catch {
      completion()
      return
    }
    
    guard db != nil else {
      completion()
      return
    }
    
    cacheDevicesData(db: db!) {
      cacheSensorsData(db: db!) {
        completion()
      }
    }
  }
  
  func cacheDevicesData(db: SQLiteDatabase, completion: @escaping () -> Void) {
    DevicesAPI().getDevicesList() {result in
      guard let devices = result["devices"] as? Array<Dictionary<String, Any>> else {
        completion()
        return
      }
      guard let authData = result["authData"] as? Dictionary<String, Any> else {
        completion()
        return
      }
      let email = authData["email"] as? String
      let uuid = authData["uuid"] as? String
      guard email != nil && uuid != nil else {
        completion()
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
          try db.insertDeviceDetailsModel(deviceDetailsModel: deviceDetailsModel)
        } catch {
        }
      }
      completion()
    }
  }
}

func cacheSensorsData(db: SQLiteDatabase, completion: @escaping () -> Void) {
  SensorsAPI().getSensorsList() {result in
    guard let sensors = result["sensors"] as? Array<Dictionary<String, Any>> else {
      completion()
      return
    }
    guard let authData = result["authData"] as? Dictionary<String, Any> else {
      completion()
      return
    }
    let email = authData["email"] as? String
    let uuid = authData["uuid"] as? String
    guard email != nil && uuid != nil else {
      completion()
      return
    }
    for sensor in sensors {
      let did = sensor["id"] as? String;
      guard did != nil else {
        continue
      }
      let id = Int(did!)!
      let name = sensor["name"] as! String;
      let _sensorId = sensor["sensorId"] as? String;
      guard _sensorId != nil else {
        continue
      }
      let sensorId = Int(_sensorId!)!
      let _clientId = sensor["client"] as? String;
      guard _clientId != nil else {
        continue
      }
      let clientId = Int(_clientId!)!
      let lastUpdated = sensor["lastUpdated"] as? Int ?? -1;
      let model = sensor["model"] as! String;
      let sensorProtocol = sensor["protocol"] as! String;
      let data = sensor["data"] as? Array<Dictionary<String, Any>> ?? []
      let sensorDetailsModel = SensorDetailsModel(
        id: id,
        name: name,
        userId: uuid!,
        sensorId: Int(sensorId),
        clientId: Int(clientId),
        lastUpdated: lastUpdated,
        model: model,
        sensorProtocol: sensorProtocol,
        isUpdating: 0,
        userEmail: email!
      )
      do {
        try db.insertSensorDetailsModel(sensorDetailsModel: sensorDetailsModel)
        for item in data {
          let _scale = item["scale"] as? String;
          let _value = item["value"] as? String;
          guard _value != nil && _value != nil else {
            continue
          }
          
          let scale = Int(_scale!)!
          let value = Double(_value!)!
          
          let _lastUpdated = item["lastUpdated"] as? Int ?? -1;
          let scaleName = item["name"] as! String;
          
          let sensorDataModel = SensorDataModel(
            sensorId: id,
            userId: uuid!,
            scale: scale,
            value: value,
            name: scaleName,
            lastUpdated: _lastUpdated
          )
          do {
            try db.insertSensorDataModel(sensorDataModel: sensorDataModel)
          } catch {
          }
        }
      } catch {
      }
    }
    completion()
  }
}
