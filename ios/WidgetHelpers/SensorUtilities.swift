//
//  SensorUtilities.swift
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 30/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import Foundation
struct SensorUtilities {
  let WIND_DIR = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
    "N"
  ]
  
  func getConstants() -> Dictionary<String, Any>? {
    guard let path = Bundle.main.path(forResource: "sensorConstants", ofType: "json") else {
      return nil
    }
    let url = URL(fileURLWithPath: path)
    do {
      let data = try Data(contentsOf: url)
      let json = try JSONSerialization.jsonObject(with: data, options: .mutableContainers)
      guard let array = json as? Dictionary<String, Any> else {
        return nil
      }
      return array
    } catch {
      return nil
    }
  }
  
  func getSensorTypes() ->  Dictionary<String, String> {
    let sensorConstants = getConstants()
    var names: Dictionary<String, String> = [:]
    guard sensorConstants != nil else {
      return names
    }
    
    let sensorTypesDict = sensorConstants!["sensorTypesDict"] as? Dictionary<String, Dictionary<String, Any>>
    guard sensorTypesDict != nil else {
      return names
    }
    for item in sensorTypesDict! {
      let lexical = item.value["lexical"] as? String
      if lexical != nil {
        names[lexical!] = item.key
      }
    }
    return names
  }
  
  func getSensorUnits(sensorType: String) -> Dictionary<String, String> {
    var units: Dictionary<String, String> = [:]
    let sensorConstants = getConstants()
    guard sensorConstants != nil else {
      return units
    }
    
    let sensorTypesDict = sensorConstants!["sensorTypesDict"] as? Dictionary<String, Dictionary<String, Any>>
    guard sensorTypesDict != nil else {
      return units
    }
    
    let unitTypes = sensorConstants!["unitTypes"] as? Dictionary<String, Any>
    guard unitTypes != nil else {
      return units
    }
    
    let currentSensorType = sensorTypesDict![sensorType]
    let sensorScales = currentSensorType!["scale"] as? Array<Any>
    guard sensorScales != nil else {
      return units
    }
    let _sensorScales = sensorScales!
    let _unitTypes = unitTypes!
    for value in _sensorScales {
      let k = value as! String
      let sensorScale = _unitTypes[k] as? Array<Any>
      if sensorScale != nil {
        let key = sensorScale![0] as! Int
        let val = sensorScale![1] as! String
        units[String(key)] = val
      }
    }
    
    return units
  }
  
  func getSensorInfo(name: String, scale: Int, value: Double) -> Dictionary<String, Any> {
    var info: Dictionary<String, Any> = [:]
    var unit: String = ""
    info["label"] = "Unknown"
    info["icon"] = "sensor"
    info["unit"] = unit
    info["value"] = value
    info["name"] = name
    info["scale"] = scale
    
    let sensorTypes = getSensorTypes()
    let sensorType = sensorTypes[name]
    let sensorUnits = getSensorUnits(sensorType: sensorType!)
    guard sensorUnits.count > 0 else {
      return info
    }
    var _unit = sensorUnits[String(scale)]
    _unit = _unit == nil ? "" : _unit
    unit = _unit!
    
    info["unit"] = unit
    
    if (name == "humidity") {
      info["label"] = "Humidity"
      info["icon"] = "humidity"
      return info
    }
    if (name == "temp") {
      info["label"] = "Temperature"
      info["icon"] = "temperature"
      return info
    }
    if (name == "rrate" || name == "rtot") {
      let label = name == "rrate" ? "Rain Rate" : "Rain Total"
      info["label"] = label
      info["icon"] = "rain"
      return info
    }
    if (name == "wgust" || name == "wavg" || name == "wdir") {
      var label = name == "wgust" ? "Wind Gust" : "Wind Average"
      info["icon"] = "wind"
      if (name == "wdir") {
        label = "Wind Direction"
        let direction = getWindDirection(value: value)
        info["value"] = direction
      }
      info["label"] = label
      return info
    }
    if (name == "uv") {
      let label = "UV Index"
      info["label"] = label
      info["icon"] = "uv"
      return info
    }
    if (name == "watt") {
      var label = "Energy"
      if (scale == 0) {
        label = "Accumulated"+" "+"Power"
      }
      if (scale == 2) {
        label = "Power"
      }
      if (scale == 3) {
        label = "Pulse"
      }
      if (scale == 4) {
        label = "Voltage"
      }
      if (scale == 5) {
        label = "Current"
      }
      if (scale == 6) {
        label = "Power Factor"
      }
      info["label"] = label
      info["icon"] = "watt"
      return info
    }
    if (name == "lum") {
      let label = "Luminance"
      info["label"] = label
      info["icon"] = "luminance"
      return info
    }
    if (name == "dewp") {
      let label = "Dew Point"
      info["label"] = label
      info["icon"] = "humidity"
      return info
    }
    if (name  == "barpress") {
      let label = "Barometric Pressure"
      info["label"] = label
      info["icon"] = "gauge"
      return info
    }
    if (name == "genmeter") {
      let label = "Generic Meter"
      info["label"] = label
      info["icon"] = "sensor"
      return info
    }
    if (name == "co2") {
      let label = "CO2"
      info["label"] = label
      info["icon"] = "co2"
      return info
    }
    if (name == "volume") {
      let label = "Volume"
      let icon = scale == 0 ? "volumeliquid" : "volume3d"
      info["label"] = label
      info["icon"] = icon
      return info
    }
    if (name == "loudness") {
      let label = "Loudness"
      info["label"] = label
      info["icon"] = "speaker"
      return info
    }
    if (name == "particulatematter2.5") {
      let label = "PM2.5"
      info["label"] = label
      info["icon"] = "pm25"
      return info
    }
    if (name == "co") {
      let label = "CO"
      info["label"] = label
      info["icon"] = "co"
      return info
    }
    if (name == "weight") {
      let label = "Weight"
      info["label"] = label
      info["icon"] = "weight"
      return info
    }
    if (name == "moisture") {
      let label = "Moisture"
      info["label"] = label
      info["icon"] = "humidity"
      return info
    }
    return info
  }
  
  func getWindDirection(value: Double) -> String {
    var index = value / 22.5
    index.round(.towardZero)
    if (Int(index) >= 0 && Int(index) <= WIND_DIR.count - 1) {
      return WIND_DIR[Int(index)]
    }
    return ""
  }
}
