//
//  SensorsAPI.swift
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 19/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import Foundation

class SensorsAPI {
  func getSensorsList() -> Array<SensorDetails> {
    print("TEST getSensorsList")
    API().callEndPoint("/sensors/list?includeValues=1&includeScale=1") {result in
      print("TEST result : ", result)
    }
    let itemOne = SensorDetails(id: "1", name: "Sensor one name")
    let itemTwo = SensorDetails(id: "2", name: "Sensor two name")
    let itemsList: [SensorDetails] = [itemOne, itemTwo];
    return itemsList;
  }
}

