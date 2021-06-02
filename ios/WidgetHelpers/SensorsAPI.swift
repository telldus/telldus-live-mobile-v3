//
//  SensorsAPI.swift
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 19/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import Foundation

class SensorsAPI {
  func getSensorsList(completion: @escaping (Dictionary<String, Any>) -> Void)  {
    let api = API()
    api.callEndPoint("/sensors/list?includeValues=1&includeScale=1") {result in
      switch result {
      case let .success(data):
        guard let parsedData = api.parseData(data: data["data"] as? Data, model: Sensors.self) else {
          completion(["sensors": [], "authData": []]);
          return
        }
        guard let authData = data["authData"] as? Dictionary<String, Any> else {
          completion(["sensors": [], "authData": []]);
          return
        }
        completion(["sensors": parsedData.sensor!, "authData": authData])
        return;
      case .failure(_):
        completion(["sensors": [], "authData": []]);
      }
    }
  }
  
  func getSensorInfo(sensorId: Int, completion: @escaping (Dictionary<String, Any>) -> Void)  {
    let api = API()
    api.callEndPoint("/sensor/info?id=\(sensorId)") {result in
      switch result {
      case let .success(data):
        guard let sensor = api.parseData(data: data["data"] as? Data, model: Sensor.self) else {
          completion(["sensor": [], "authData": []]);
          return
        }
        guard let authData = data["authData"] as? Dictionary<String, Any> else {
          completion(["sensor": [], "authData": []]);
          return
        }
        completion(["sensor": sensor, "authData": authData])
        return;
      case .failure(_):
        completion(["sensor": [], "authData": []]);
      }
    }
  }
}

