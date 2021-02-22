//
//  SensorClass.swift
//  HomescreenWidgetExtension
//
//  Created by Rimnesh Fernandez on 22/02/21.
//  Copyright © 2021 Telldus Technologies AB. All rights reserved.
//

import Foundation

class SensorClass {
  static let intervalOne: Dictionary<String, Any> = [
    "id": "1",
    "label": "Update every 5 minutes",
    "valueInMin": 5,
  ]
  static let intervalTwo: Dictionary<String, Any> = [
    "id": "2",
    "label": "Update every 10 minutes",
    "valueInMin": 10,
  ]
  static let intervalThree: Dictionary<String, Any> = [
    "id": "3",
    "label": "Update every 30 minutes",
    "valueInMin": 30,
  ]
  static let intervalFour: Dictionary<String, Any> = [
    "id": "4",
    "label": "Update every 1 hour",
    "valueInMin": 60,
  ]
  static let SensorUpdateInterval: [Dictionary<String, Any>] = [
    intervalOne,
    intervalTwo,
    intervalThree,
    intervalFour
  ]
}
