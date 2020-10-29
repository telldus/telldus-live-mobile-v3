//
//  IntentHandler.swift
//  HomescreenWidgetIntentExtension
//
//  Created by Rimnesh Fernandez on 14/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import Intents

class IntentHandler: INExtension {
  
  override func handler(for intent: INIntent) -> Any {
    // This is the default implementation.  If you want different objects to handle different intents,
    // you can override this and return the handler you want for that particular intent.
    
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
    completion(INObjectCollection(items: []), nil)
  }
  
  func provideUpdateIntervalOptionsCollection(for intent: SensorWidgetIntent, with completion: @escaping (INObjectCollection<UpdateIntervalList>?, Error?) -> Swift.Void) {
    var items = [UpdateIntervalList]()
    for intervalInfo in SensorClass.SensorUpdateInterval {
      items.append(UpdateIntervalList(
        identifier: intervalInfo["id"] as? String,
        display: intervalInfo["label"] as! String
      ))
    }
    completion(INObjectCollection(items: items), nil)
  }
}
