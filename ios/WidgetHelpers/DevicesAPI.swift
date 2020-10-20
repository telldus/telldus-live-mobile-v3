//
//  DevicesAPI.swift
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 20/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import Foundation

class DevicesAPI {
  func getDevicesList(completion: @escaping (Array<DeviceDetails>) -> Void)  {
    API().callEndPoint("/devices/list?supportedMethods=\(Constants.supportedMethods)&includeIgnored=1&extras=devicetype,transport,room") {result in
      switch result {
      case let .success(data):
        guard let dataNew = data as? [String:Any] else {
          completion([]);
          return
        }
        guard let devices = dataNew["device"] as? Array<Dictionary<String, Any>> else {
          completion([]);
          return
        }
        var itemsList: [DeviceDetails] = []
        for device in devices {
          let id = device["id"] as! String;
          let name = device["name"] as! String;
          let deviceDetails = DeviceDetails(
            id: id,
            name: name
          )
          itemsList.append(deviceDetails)
        }
        completion(itemsList)
        return;
      case .failure(_):
        completion([]);
      }
    }
  }
}
