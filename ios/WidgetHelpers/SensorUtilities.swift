//
//  SensorUtilities.swift
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 30/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import Foundation
/**
 This class has sensor related utility methods
 */
struct SensorUtilities {
  /**
   List of string values of wind direction
   */
  let WIND_DIR = [
    String(format: "widget_ios_sensorDirN"),
    String(format: "widget_ios_sensorDirNNE"),
    String(format: "widget_ios_sensorDirNE"),
    String(format: "widget_ios_sensorDirENE"),
    String(format: "widget_ios_sensorDirE"),
    String(format: "widget_ios_sensorDirESE"),
    String(format: "widget_ios_sensorDirSE"),
    String(format: "widget_ios_sensorDirSSE"),
    String(format: "widget_ios_sensorDirS"),
    String(format: "widget_ios_sensorDirSSW"),
    String(format: "widget_ios_sensorDirSW"),
    String(format: "widget_ios_sensorDirWSW"),
    String(format: "widget_ios_sensorDirW"),
    String(format: "widget_ios_sensorDirWNW"),
    String(format: "widget_ios_sensorDirNW"),
    String(format: "widget_ios_sensorDirNNW"),
    String(format: "widget_ios_sensorDirN")
  ]
  
  /**
   Reads a returns contents of sensorConstants JSON file
   */
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
  
  /**
   Reads contents of sensorConstants JSON file and returns "lexical" value as key and Type as value
   */
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
  
  /**
   Reads contents of sensorConstants JSON file and returns the unit matching the sensor type
   */
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
  
  /**
   Returns a sensor's prepared info like, unit label and more by matching name and scale with  sensorConstants JSON file
   */
  func getSensorInfo(name: String, scale: Int, value: Double) -> Dictionary<String, Any> {
    var info: Dictionary<String, Any> = [:]
    var unit: String = ""
    info["label"] = String(format: "widget_ios_unknown")
    info["icon"] = "sensor"
    info["iconUniC"] = "\u{e911}"
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
      info["label"] = String(format: "widget_ios_labelHumidity")
      info["icon"] = "humidity"
      info["iconUniC"] = "\u{e910}"
      return info
    }
    if (name == "temp") {
      info["label"] = String(format: "widget_ios_labelTemperature")
      info["icon"] = "temperature"
      info["iconUniC"] = "\u{e90d}"
      return info
    }
    if (name == "rrate" || name == "rtot") {
      let label = name == "rrate" ? String(format: "widget_ios_labelRainRate") : String(format: "widget_ios_labelRainTotal")
      info["label"] = label
      info["icon"] = "rain"
      info["iconUniC"] = "\u{e90e}"
      return info
    }
    if (name == "wgust" || name == "wavg" || name == "wdir") {
      var label = name == "wgust" ? String(format: "widget_ios_labelWindGust") : String(format: "widget_ios_labelWindAverage")
      info["icon"] = "wind"
      info["iconUniC"] = "\u{e904}"
      if (name == "wdir") {
        label = String(format: "widget_ios_labelWindDirection")
        let direction = getWindDirection(value: value)
        info["value"] = direction
      }
      info["label"] = label
      return info
    }
    if (name == "uv") {
      let label = String(format: "widget_ios_labelUVIndex")
      info["label"] = label
      info["icon"] = "uv"
      info["iconUniC"] = "\u{e90c}"
      return info
    }
    if (name == "watt") {
      var label = String(format: "widget_ios_energy")
      if (scale == 0) {
        label = "Accumulated"+" "+"Power"
      }
      if (scale == 2) {
        label = String(format: "widget_ios_labelWatt")
      }
      if (scale == 3) {
        label = String(format: "widget_ios_pulse")
      }
      if (scale == 4) {
        label = String(format: "widget_ios_voltage")
      }
      if (scale == 5) {
        label = String(format: "widget_ios_current")
      }
      if (scale == 6) {
        label = String(format: "widget_ios_powerFactor")
      }
      info["label"] = label
      info["icon"] = "watt"
      info["iconUniC"] = "\u{e90a}"
      return info
    }
    if (name == "lum") {
      let label = String(format: "widget_ios_labelLuminance")
      info["label"] = label
      info["icon"] = "luminance"
      info["iconUniC"] = "\u{e90f}"
      return info
    }
    if (name == "dewp") {
      let label = String(format: "widget_ios_labelDewPoint")
      info["label"] = label
      info["icon"] = "humidity"
      info["iconUniC"] = "\u{e910}"
      return info
    }
    if (name  == "barpress") {
      let label = String(format: "widget_ios_labelBarometricPressure")
      info["label"] = label
      info["icon"] = "gauge"
      info["iconUniC"] = "\u{e95e}"
      return info
    }
    if (name == "genmeter") {
      let label = String(format: "widget_ios_labelGenericMeter")
      info["label"] = label
      info["icon"] = "sensor"
      info["iconUniC"] = "\u{e911}"
      return info
    }
    if (name == "co2") {
      let label = "CO2"
      info["label"] = label
      info["icon"] = "co2"
      info["iconUniC"] = "\u{e983}"
      return info
    }
    if (name == "volume") {
      let label = String(format: "widget_ios_labelVolume")
      let icon = scale == 0 ? "volumeliquid" : "volume3d"
      info["label"] = label
      info["icon"] = icon
      info["iconUniC"] = scale == 0 ? "\u{e981}": "\u{e982}";
      return info
    }
    if (name == "loudness") {
      let label = String(format: "widget_ios_labelLoudness")
      info["label"] = label
      info["icon"] = "speaker"
      info["iconUniC"] = "\u{e979}"
      return info
    }
    if (name == "particulatematter2.5") {
      let label = "PM2.5"
      info["label"] = label
      info["icon"] = "pm25"
      info["iconUniC"] = "\u{e984}"
      return info
    }
    if (name == "co") {
      let label = "CO"
      info["label"] = label
      info["icon"] = "co"
      info["iconUniC"] = "\u{e986}"
      return info
    }
    if (name == "weight") {
      let label = String(format: "widget_ios_labelWeight")
      info["label"] = label
      info["icon"] = "weight"
      info["iconUniC"] = "\u{e985}"
      return info
    }
    if (name == "moisture") {
      let label = String(format: "widget_ios_labelMoisture")
      info["label"] = label
      info["icon"] = "humidity"
      info["iconUniC"] = "\u{e910}"
      return info
    }
    return info
  }
  
  /**
   Returns wind direction as String, from Double value
   */
  func getWindDirection(value: Double) -> String {
    var index = value / 22.5
    index.round(.towardZero)
    if (Int(index) >= 0 && Int(index) <= WIND_DIR.count - 1) {
      return WIND_DIR[Int(index)]
    }
    return ""
  }
  
  /**
   Returns sensor last updated value as Date Object
   */
  func getLastUpdatedDate(lastUpdated: Int) -> Date? {
    guard lastUpdated != -1 else {
      return nil
    }
    return Date(timeIntervalSince1970: TimeInterval(lastUpdated))
  }
  
  /**
   Returns sensor last updated value as a string
   */
  func getLastUpdatedString(lastUpdated: Int, timezone: String?) -> String {
    guard lastUpdated != -1 else {
      return ""
    }
    let dateFormatter = DateFormatter()
    dateFormatter.timeStyle = DateFormatter.Style.short
    dateFormatter.dateStyle = DateFormatter.Style.short
    if let locale = NSLocale.current.languageCode {
      dateFormatter.locale = Locale(identifier:locale)
    }
    dateFormatter.timeZone = timezone != nil ? TimeZone(identifier: timezone!) : .current
    return dateFormatter.string(from: Date(timeIntervalSince1970: TimeInterval(lastUpdated)))
  }
  
  /**
   Checks if sensor last updated timestamp is too old
   */
  func isTooOld(lastUpdated: Int) -> Bool {
    guard lastUpdated != -1 else {
      return true
    }
    let currentTime = Date().timeIntervalSince1970
    let timeAgo = currentTime - TimeInterval(lastUpdated);
    let limit = TimeInterval(24 * 3600);
    return timeAgo >= limit
  }
  
  /**
   Check if sensor value is large(in length)
   */
  func isValueLarge(value: String) -> Bool {
    return value.count > 3
  }
}
