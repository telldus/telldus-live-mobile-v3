//
//  DevicesAPI.swift
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 20/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import Foundation

class DevicesAPI {
  func getDevicesList(completion: @escaping (Dictionary<String, Any>) -> Void)  {
    let api = API()
    api.callEndPoint("\(EndPoints.getDevices.rawValue)?\(GetDevices.supportedMethods.rawValue)=\(Constants.supportedMethods)&\(GetDevices.includeIgnored.rawValue)=1&\(GetDevices.extras.rawValue)=devicetype,transport,room") {result in
      switch result {
      case let .success(data):
        guard let parsedData = api.parseData(data: data["data"] as? Data, model: Devices.self) else {
          completion(["devices": [], "authData": []]);
          return
        }
        guard let authData = data["authData"] as? Dictionary<String, Any> else {
          completion(["devices": [], "authData": []]);
          return
        }
        completion(["devices": parsedData.device!, "authData": authData])
        return;
      case .failure(_):
        completion(["devices": [], "authData": []]);
      }
    }
  }
}
