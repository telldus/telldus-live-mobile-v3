//
//  APICacher.swift
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 27/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import Foundation

struct APICacher {
  func cacheSensorData(sensorId: Int, completion: @escaping () -> Void) {
    SensorsAPI().getSensorInfo(sensorId: sensorId) {result in
      var db: SQLiteDatabase? = nil
      do {
        db = try SQLiteDatabase.open(nil)
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
      
      guard let sensor = result["sensor"] as? Dictionary<String, Any> else {
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
      let did = sensor["id"] as? String;
      guard did != nil else {
        completion()
        return
      }
      let id = Int(did!)!
      let name = sensor["name"] as? String;
      guard name != nil else {
        completion()
        return
      }
      let lastUpdated = sensor["lastUpdated"] as? Int ?? -1;
      let sensorProtocol = sensor["protocol"] as! String;
      
      guard let dataFromDb = db?.sensorDetailsModel(sensorId: Int32(id)) else {
        completion()
        return
      }
      
      let sensorDetailsModel = SensorDetailsModel(
        id: id,
        name: name!,
        userId: uuid!,
        sensorId: dataFromDb.sensorId,
        clientId: dataFromDb.clientId,
        lastUpdated: lastUpdated,
        model: dataFromDb.model,
        sensorProtocol: sensorProtocol,
        isUpdating: 0,
        userEmail: email!
      )
      do {
        try db?.insertSensorDetailsModel(sensorDetailsModel: sensorDetailsModel)
      } catch {
      }
      
      let data = sensor["data"] as? Array<Dictionary<String, Any>> ?? []
      guard data.count > 0 else {
        completion()
        return
      }
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
          try db?.insertSensorDataModel(sensorDataModel: sensorDataModel)
        } catch {
        }
      }
      
      completion()
    }
  }
  func cacheAPIData(completion: @escaping () -> Void) {
    var db: SQLiteDatabase? = nil
    do {
      db = try SQLiteDatabase.open(nil)
      //      try db?.createTable(table: DeviceDetailsModel.self) // TODO: Enable device widget
      try db?.createTable(table: SensorDetailsModel.self)
      try db?.createTable(table: SensorDataModel.self)
      try db?.createTable(table: GatewayDetailsModel.self)
      
    } catch {
      completion()
      return
    }
    
    guard db != nil else {
      completion()
      return
    }
    
    //    cacheDevicesData(db: db!) {// TODO: Enable device widget
    cacheSensorsData(db: db!) {
      completion()
      cacheGatewaysData(db: db!){
      }
    }
    //    }
  }
  
  func cacheDevicesData(db: SQLiteDatabase, completion: @escaping () -> Void) {
    DevicesAPI().getDevicesList() {result in
      guard let devices = result["devices"] as? [Device] else {
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
      //      db.deleteAllRecordsCurrentAccount(table: DeviceDetailsModel.self, userId: uuid as! NSString) // TODO: Enable device widget
      for device in devices {
        
        let id = Int(device.id)!
        let name = device.name
        let state = device.state
        let methods = device.methods
        let deviceType = device.deviceType
        let stateValue = ""
        let _clientId = device.client
        let clientId = Int(_clientId)!
        let _clientDeviceId = device.clientDeviceId
        let clientDeviceId = Int(_clientDeviceId)!
        
        let deviceDetailsModel = DeviceDetailsModel(
          id: id,
          name: name,
          state: state,
          methods: methods,
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
    
    db.deleteAllRecordsCurrentAccount(table: SensorDetailsModel.self, userId: uuid as! NSString)
    
    for sensor in sensors {
      let did = sensor["id"] as? String;
      guard did != nil else {
        continue
      }
      let id = Int(did!)!
      let name = sensor["name"] as? String;
      guard name != nil else {
        continue
      }
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
      guard data.count > 0 else {
        continue
      }
      let sensorDetailsModel = SensorDetailsModel(
        id: id,
        name: name!,
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

func cacheGatewaysData(db: SQLiteDatabase, completion: @escaping () -> Void) {
  GatewaysAPI().getGatewaysList() {result in
    guard let clients = result["clients"] as? Array<Dictionary<String, Any>> else {
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
    
    db.deleteAllRecordsCurrentAccount(table: GatewayDetailsModel.self, userId: uuid as! NSString)
    
    for client in clients {
      let cid = client["id"] as? String;
      guard cid != nil else {
        continue
      }
      let id = Int(cid!)!
      var timezone = client["timezone"] as? String;
      if timezone == nil {
        timezone = ""
      }
      let gatewayDetailsModel = GatewayDetailsModel(
        id: id,
        userId: uuid!,
        timezone: timezone!
      )
      do {
        try db.insertGatewayDetailsModel(gatewayDetailsModel: gatewayDetailsModel)
      } catch {
      }
    }
    completion()
  }
}
