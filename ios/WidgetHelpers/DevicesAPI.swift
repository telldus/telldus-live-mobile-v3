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
    API().callEndPoint("/devices/list?supportedMethods=\(Constants.supportedMethods)&includeIgnored=1&extras=devicetype,transport,room") {result in
      switch result {
      case let .success(data):
        guard let dataNew = data["result"] as? [String:Any] else {
          completion(["devices": [], "authData": []]);
          return
        }
        guard let authData = data["authData"] as? Dictionary<String, Any> else {
          completion(["devices": [], "authData": []]);
          return
        }
        guard let devices = dataNew["device"] as? Array<Dictionary<String, Any>> else {
          completion(["devices": [], "authData": []]);
          return
        }
        completion(["devices": devices, "authData": authData])
        return;
      case .failure(_):
        completion(["devices": [], "authData": []]);
      }
    }
  }
}
