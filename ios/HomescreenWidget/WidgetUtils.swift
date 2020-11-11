//
//  WidgetUtils.swift
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 28/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import Foundation
import WidgetKit
import SwiftUI

@available(iOS 12.0, *)
struct WidgetUtils {
  static func refreshAllWidgets() {
    if #available(iOS 14.0, *) {
      WidgetCenter.shared.reloadAllTimelines()
    } else {
      // Fallback on earlier versions
    }
  }
  
  func getSensorSimpleEntry(configuration: SensorWidgetIntent, completion: @escaping (SensorWidgetStructure) -> ()) {
    var displayType = WidgetViewType.preEditView
    var name = configuration.item?.displayString ?? ""
    let id = configuration.item?.identifier ?? ""
    let valueIdentifier = configuration.value?.identifier ?? ""
    let theme = configuration.theme
    var owningAccount = ""
    var owningUserId = ""
    
    let dataDict = Utilities().getAuthData()
    if (dataDict == nil) {
      completion(SensorWidgetStructure(
        id: id,
        name: name,
        label: "",
        icon: "",
        value: "",
        unit: "",
        luTime: -1,
        displayType: WidgetViewType.notLoggedInView,
        theme: theme,
        owningAccount: owningAccount
      ))
      return
    } else if (configuration.item?.identifier != nil) {
      displayType = WidgetViewType.postEditView
      APICacher().cacheSensorData(sensorId: Int(id)!) {
        var icon = ""
        var label = ""
        var _value = ""
        var unit: String? = ""
        var lastUpdated: Int = -1
        var db: SQLiteDatabase? = nil
        do {
          db = try SQLiteDatabase.open(nil)
          if let sensorDetails = db?.sensorDetailsModel(sensorId: Int32(id)!) {
            name = sensorDetails.name
            owningAccount = sensorDetails.userEmail
            owningUserId = sensorDetails.userId
            lastUpdated = sensorDetails.lastUpdated;
            let activeUserId = dataDict?["uuid"] as? String
            if (owningUserId != activeUserId) {
              displayType = WidgetViewType.notSameAccountView
            }
            if (configuration.value?.identifier != nil) {
              let sensorData: Array<SensorDataModel> = db?.sensorDataModels(sensorId: Int32(id)!, userId: owningUserId as NSString) as! Array<SensorDataModel>
              for item in sensorData {
                let _valueIdentifier = String(item.scale) + item.name
                if (_valueIdentifier == valueIdentifier) {
                  let info = SensorUtilities().getSensorInfo(name: item.name, scale: item.scale, value: item.value)
                  _value = String(item.value)
                  icon = (info["iconUniC"] as? String)!
                  unit = info["unit"] as? String ?? ""
                  label = info["label"] as? String ?? ""
                }
              }
            }
          } else {
            displayType = WidgetViewType.preEditView
          }
        } catch {
        }
        completion(SensorWidgetStructure(
          id: id,
          name: name,
          label: label,
          icon: icon,
          value: _value,
          unit: unit!,
          luTime: lastUpdated,
          displayType: displayType,
          theme: theme,
          owningAccount: owningAccount
        ))
        return
      }
    } else {
      completion(SensorWidgetStructure(
        id: id,
        name: name,
        label: "",
        icon: "",
        value: "",
        unit: "",
        luTime: -1,
        displayType: displayType,
        theme: theme,
        owningAccount: owningAccount
      ))
  }
}
}
