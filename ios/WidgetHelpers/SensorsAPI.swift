//
//  SensorsAPI.swift
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 19/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import Foundation

class SensorsAPI {
  func getSensorsList(completion: @escaping (Array<SensorDetails>) -> Void)  {
    API().callEndPoint("/sensors/list?includeValues=1&includeScale=1") {result in
      switch result {
      case let .success(data):
        guard let dataNew = data as? [String:Any] else {
          completion([]);
          return
        }
        guard let sensors = dataNew["sensor"] as? Array<Dictionary<String, Any>> else {
          completion([]);
          return
        }
        var itemsList: [SensorDetails] = []
        for sensor in sensors {
          let id = sensor["id"] as! String;
          let name = sensor["name"] as! String;
          let sensorDetails = SensorDetails(
            id: id,
            name: name,
            displayType: WidgetViewType.postEditView
          )
          itemsList.append(sensorDetails)
        }
        completion(itemsList)
        return;
      case .failure(_):
        completion([]);
      }
    }
  }
}

