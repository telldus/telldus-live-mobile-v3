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

struct WidgetItem {
  var id: String;
  var name: String;
}

extension IntentHandler: DeviceWidgetIntentHandling {
  func provideItemOptionsCollection(for intent: DeviceWidgetIntent, with completion: @escaping (INObjectCollection<DevicesList>?, Error?) -> Void) {
    DevicesAPI().getDevicesList() {itemsList in
      var items = [DevicesList]()
      for item in itemsList {
        let deviceIntentObject =
          DevicesList(identifier: item.id, display: item.name)
        items.append(deviceIntentObject)
      }
      completion(INObjectCollection(items: items), nil)
    }
  }
}

extension IntentHandler: SensorWidgetIntentHandling {
  func provideItemOptionsCollection(for intent: SensorWidgetIntent, with completion: @escaping (INObjectCollection<SensorsList>?, Error?) -> Void) {
    SensorsAPI().getSensorsList() {itemsList in
      var items = [SensorsList]()
      for item in itemsList {
        let sensorIntentObject =
          SensorsList(identifier: item.id, display: item.name)
        items.append(sensorIntentObject)
      }
      completion(INObjectCollection(items: items), nil)
    }
  }
  
  func provideValueOptionsCollection(for intent: SensorWidgetIntent, with completion: @escaping (INObjectCollection<SensorValuesList>?, Error?) -> Swift.Void) {
    var items = [SensorValuesList]()
    completion(INObjectCollection(items: items), nil)
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
