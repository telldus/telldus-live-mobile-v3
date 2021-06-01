//
//  Sensors.swift
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 01/06/21.
//  Copyright © 2021 Telldus Technologies AB. All rights reserved.
//

import Foundation

class Sensors: Decodable {
  var sensor: [Sensor]?

  private enum CodingKeys: String, CodingKey {
      case sensor = "sensor"
  }
}
