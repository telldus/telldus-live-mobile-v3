//
//  Sensor.swift
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 01/06/21.
//  Copyright © 2021 Telldus Technologies AB. All rights reserved.
//

import Foundation

class Sensor: Codable {
  
  var id: String
  var name: String?
  var sensorId: String
  var client: String
  var lastUpdated:  Int
  var model: String
  var sensorProtocol: String
  var data: [SensorData]?
  
  private enum CodingKeys: String, CodingKey {
    case id = "id"
    case name = "name"
    case sensorId = "sensorId"
    case client = "client"
    case lastUpdated = "lastUpdated"
    case model = "model"
    case sensorProtocol = "protocol"
    case data = "data"
  }
}
