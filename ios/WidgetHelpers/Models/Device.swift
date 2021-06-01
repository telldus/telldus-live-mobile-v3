//
//  Device.swift
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 01/06/21.
//  Copyright © 2021 Telldus Technologies AB. All rights reserved.
//

import Foundation

class Device: Codable {
  var id: String
  var name: String
  var state: Int
  var methods: Int
  var deviceType: String
  var client: String
  var clientDeviceId: String
}
