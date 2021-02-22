//
//  IntentHandler.swift
//  HomescreenWidgetIntentExtension
//
//  Created by Rimnesh Fernandez on 14/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import Intents
import SwiftUI

class IntentHandler: INExtension {
  static var sensorsLastFetchedTS: Double = 0;
  static var isFetchingSensorsData: Bool = false;
  static let REFETCH_INTERVAL: Double = 60 * 60
  
  override func handler(for intent: INIntent) -> Any {
    // This is the default implementation.  If you want different objects to handle different intents,
    // you can override this and return the handler you want for that particular intent.
    
    // Refresh sensors list/data on pressing edit widget, 1 hour apart
//    let interval = Date().timeIntervalSince1970 - IntentHandler.sensorsLastFetchedTS
//    if intent is SensorWidgetIntent, !IntentHandler.isFetchingSensorsData, (IntentHandler.sensorsLastFetchedTS == 0 || interval > IntentHandler.REFETCH_INTERVAL) {
//      IntentHandler.isFetchingSensorsData = true
//      APICacher().cacheAPIData() {
//        IntentHandler.sensorsLastFetchedTS = Date().timeIntervalSince1970
//        IntentHandler.isFetchingSensorsData = false
//      }
//    }
    return self
  }
  
}

extension IntentHandler: DeviceWidgetIntentHandling {
  func provideItemOptionsCollection(for intent: DeviceWidgetIntent, with completion: @escaping (INObjectCollection<DevicesList>?, Error?) -> Void) {
    let dataDict = Utilities().getAuthData()
    guard dataDict != nil else {
      completion(INObjectCollection(items: []), nil)
      return
    }
    guard let userId = dataDict?["uuid"] as? NSString else {
      completion(INObjectCollection(items: []), nil)
      return
    }
    
    var db: SQLiteDatabase? = nil
    var itemsList: Array<DeviceDetailsModel> = []
    do {
      db = try SQLiteDatabase.open(nil)
      itemsList = db?.deviceDetailsModelsCurrentAccount(userId: userId) as! Array<DeviceDetailsModel>
    } catch {
      completion(INObjectCollection(items: []), nil)
      return
    }
    
    var items = [DevicesList]()
    for item in itemsList {
      let deviceIntentObject =
        DevicesList(identifier: String(item.id), display: item.name)
      items.append(deviceIntentObject)
    }
    completion(INObjectCollection(items: items), nil)
  }
}

extension IntentHandler: SensorWidgetIntentHandling {
  func provideItemOptionsCollection(for intent: SensorWidgetIntent, with completion: @escaping (INObjectCollection<SensorsList>?, Error?) -> Void) {
    let dataDict = Utilities().getAuthData()
    guard dataDict != nil else {
      completion(INObjectCollection(items: []), nil)
      return
    }
    guard let userId = dataDict?["uuid"] as? NSString else {
      completion(INObjectCollection(items: []), nil)
      return
    }
    let pro = dataDict?["pro"] as? Int
    let _isBasicUser = SharedUtils().isBasicUser(pro: pro)
    guard !_isBasicUser else {
      completion(INObjectCollection(items: []), nil)
      return
    }
    
    var db: SQLiteDatabase? = nil
    var itemsList: Array<SensorDetailsModel> = []
    do {
      db = try SQLiteDatabase.open(nil)
      itemsList = db?.sensorDetailsModelsCurrentAccount(userId: userId) as! Array<SensorDetailsModel>
    } catch {
      completion(INObjectCollection(items: []), nil)
      return
    }
    var items = [SensorsList]()
    for item in itemsList {
      let sensorIntentObject =
        SensorsList(identifier: String(item.id), display: item.name)
      items.append(sensorIntentObject)
    }
    completion(INObjectCollection(items: items), nil)
  }
  
  func provideValueOptionsCollection(for intent: SensorWidgetIntent, with completion: @escaping (INObjectCollection<SensorValuesList>?, Error?) -> Swift.Void) {
    
    guard let sensorId = intent.item?.identifier else {
      completion(INObjectCollection(items: []), nil)
      return
    }
    guard let selectedSensorId = Int32(sensorId) else {
      completion(INObjectCollection(items: []), nil)
      return
    }
    
    let dataDict = Utilities().getAuthData()
    guard dataDict != nil else {
      completion(INObjectCollection(items: []), nil)
      return
    }
    guard let userId = dataDict?["uuid"] as? NSString else {
      completion(INObjectCollection(items: []), nil)
      return
    }
    
    var db: SQLiteDatabase? = nil
    var itemsList: Array<SensorDataModel> = []
    do {
      db = try SQLiteDatabase.open(nil)
      itemsList = db?.sensorDataModels(sensorId: selectedSensorId, userId: userId) as! Array<SensorDataModel>
    } catch {
      completion(INObjectCollection(items: []), nil)
      return
    }
    var items = [SensorValuesList]()
    for item in itemsList {
      let id = String(item.scale) + item.name
      let info = SensorUtilities().getSensorInfo(name: item.name, scale: item.scale, value: item.value)
      let label = info["label"] as? String
      let sensorValueIntentObject =
        SensorValuesList(identifier: id, display: NSLocalizedString(label!, comment: ""))
      items.append(sensorValueIntentObject)
    }
    completion(INObjectCollection(items: items), nil)
  }
}
