//
//  SensorData.swift
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 01/06/21.
//  Copyright © 2021 Telldus Technologies AB. All rights reserved.
//

import Foundation

class SensorData: Codable {
  var scale: String
  var value: String
  var name: String
  var lastUpdated: Int
}
