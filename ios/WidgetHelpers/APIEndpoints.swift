//
//  APIEndpoints.swift
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 02/06/21.
//  Copyright © 2021 Telldus Technologies AB. All rights reserved.
//

import Foundation

enum EndPoints: String {
  case getClients = "/clients/list"
  case getDevices = "/devices/list"
  case getSensors = "/sensors/list"
  case getSensorInfo = "/sensor/info"
}

enum GetClients: String {
  case extras = "extras"
}

enum GetDevices: String {
  case supportedMethods = "supportedMethods"
  case includeIgnored = "includeIgnored"
  case extras = "extras"
}

enum GetSensors: String {
  case includeValues = "includeValues"
  case includeScale = "includeScale"
}

enum GetSensorInfo: String {
  case id = "id"
}
