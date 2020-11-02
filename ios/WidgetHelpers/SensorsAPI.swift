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
    API().callEndPoint("/sensors/list?includeValues=1&includeScale=1") {result in
      switch result {
      case let .success(data):
        guard let dataNew = data["result"] as? [String:Any] else {
          completion(["sensors": [], "authData": []]);
          return
        }
        guard let authData = data["authData"] as? Dictionary<String, Any> else {
          completion(["sensors": [], "authData": []]);
          return
        }
        guard let sensors = dataNew["sensor"] as? Array<Dictionary<String, Any>> else {
          completion(["sensors": [], "authData": []]);
          return
        }
        completion(["sensors": sensors, "authData": authData])
        return;
      case .failure(_):
        completion(["sensors": [], "authData": []]);
      }
    }
  }
  
  func getSensorInfo(sensorId: Int, completion: @escaping (Dictionary<String, Any>) -> Void)  {
    API().callEndPoint("/sensor/info?id=\(sensorId)") {result in
      switch result {
      case let .success(data):
        guard let sensor = data["result"] as? [String:Any] else {
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

