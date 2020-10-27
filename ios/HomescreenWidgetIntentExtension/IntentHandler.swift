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
    var db: SQLiteDatabase? = nil
    var itemsList: Array<DeviceDetailsModel> = []
    do {
      db = try SQLiteDatabase.open(nil)
      itemsList = db?.deviceDetailsModels() as! Array<DeviceDetailsModel>
    } catch {
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
    SensorsAPI().getSensorsList() {itemsList in
      var items = [SensorsList]()
      for item in itemsList {
        if (item.data.count > 0) {
          let sensorIntentObject =
            SensorsList(identifier: item.id, display: item.name)
          items.append(sensorIntentObject)
        }
      }
      completion(INObjectCollection(items: items), nil)
    }
  }
  
  func provideValueOptionsCollection(for intent: SensorWidgetIntent, with completion: @escaping (INObjectCollection<SensorValuesList>?, Error?) -> Swift.Void) {
    let item: SensorsList = intent.item ?? SensorsList(identifier: "", display: "")
    let selectedSensorId = item.identifier!
    var sensorValues: Array<Dictionary<String, Any>> = []
    SensorsAPI().getSensorsList() {itemsList in
      for item in itemsList {
        if (item.id == selectedSensorId) {
          sensorValues = item.data
          break
        }
      }
      var items = [SensorValuesList]()
      if (sensorValues.count > 0) {
        for valueInfo in sensorValues {
          let name = valueInfo["name"] as! String
          let scale = valueInfo["scale"] as! String
          let key = "\(name)_\(scale)"
          items.append(SensorValuesList(
            identifier: key,
            display: name
          ))
        }
      }
      
      completion(INObjectCollection(items: items), nil)
    }
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
