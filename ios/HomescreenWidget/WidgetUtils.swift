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
  
  static let previewPostEditSensorWidgetStructure = SensorWidgetStructure(id: "1",
                                                                          name: "Aeotec Smart Switch",
                                                                          label: "Temperature",
                                                                          icon: "\u{e911}",
                                                                          value: "32",
                                                                          unit: "°C",
                                                                          luTime: Int(Date().timeIntervalSince1970),
                                                                          displayType: WidgetViewType.postEditView,
                                                                          owningAccount: "developer@telldus.com",
                                                                          timezone: nil)
  
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
    var owningAccount = ""
    var owningUserId = ""
    var timezone = TimeZone.current.identifier
    
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
        displayType: .notLoggedInView,
        owningAccount: owningAccount,
        timezone: timezone
      ))
      return
    } else if (configuration.item?.identifier != nil) {
      let pro = dataDict?["pro"] as? Int
      let _isBasicUser = isBasicUser(pro: pro)
      displayType = _isBasicUser ? .upgradeToPremiumView : .postEditView
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
            let clientId = sensorDetails.clientId;
            if let gatewayDetails = db?.gatewayDetailsModel(gatewayId: Int32(clientId)) {
              timezone = gatewayDetails.timezone
            }
            
            let activeUserId = dataDict?["uuid"] as? String
            if (owningUserId != activeUserId) {
              displayType = .notSameAccountView
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
            displayType = _isBasicUser ? .upgradeToPremiumView : .preEditView
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
          owningAccount: owningAccount,
          timezone: timezone
        ))
        return
      }
    } else {
      let pro = dataDict?["pro"] as? Int
      let _isBasicUser = isBasicUser(pro: pro)
      completion(SensorWidgetStructure(
        id: id,
        name: name,
        label: "",
        icon: "",
        value: "",
        unit: "",
        luTime: -1,
        displayType: _isBasicUser ? .upgradeToPremiumView : displayType,
        owningAccount: owningAccount,
        timezone:  timezone
      ))
    }
  }
  
  func isBasicUser (pro: Int?) -> Bool {
    return pro == nil || (Double(pro!) < Date().timeIntervalSince1970)
  }
}
