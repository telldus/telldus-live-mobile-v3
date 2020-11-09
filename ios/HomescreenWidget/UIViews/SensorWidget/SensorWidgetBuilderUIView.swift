//
//  SensorWidgetBuilderUIView.swift
//  HomescreenWidgetExtension
//
//  Created by Rimnesh Fernandez on 22/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import WidgetKit
import SwiftUI
import Intents

struct SensorProvider: IntentTimelineProvider {
  func placeholder(in context: Context) -> SensorSimpleEntry {
    SensorSimpleEntry(date: Date(), sensorWidgetStructure: SensorWidgetStructure(
      id: "",
      name: "",
      icon: "",
      value: "",
      unit: "",
      luTime: -1,
      displayType: WidgetViewType.preEditView,
      theme: ThemesList.default,
      owningAccount: ""
    ))
  }
  
  func getSnapshot(for configuration: SensorWidgetIntent, in context: Context, completion: @escaping (SensorSimpleEntry) -> ()) {
    var displayType = WidgetViewType.preEditView
    if (context.isPreview) {
      displayType = WidgetViewType.preview
    }
    let entry = SensorSimpleEntry(date: Date(), sensorWidgetStructure: SensorWidgetStructure(
      id: "",
      name: "",
      icon: "",
      value: "",
      unit: "",
      luTime: -1,
      displayType: displayType,
      theme: ThemesList.default,
      owningAccount: ""
    ))
    completion(entry)
  }
  
  func getTimeline(for configuration: SensorWidgetIntent, in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
    
    var displayType = WidgetViewType.preEditView
    var name = configuration.item?.displayString ?? ""
    let id = configuration.item?.identifier ?? ""
    let valueIdentifier = configuration.value?.identifier ?? ""
    let theme = configuration.theme
    var owningAccount = ""
    var owningUserId = ""
    let updateInterval = configuration.updateInterval?.identifier ?? nil
    
    let dataDict = Utilities().getAuthData()
    if (dataDict == nil) {
      displayType = WidgetViewType.notLoggedInView
      let entry = SensorSimpleEntry(date: Date(), sensorWidgetStructure: SensorWidgetStructure(
        id: id,
        name: name,
        icon: "",
        value: "",
        unit: "",
        luTime: -1,
        displayType: displayType,
        theme: theme,
        owningAccount: owningAccount
      ))
      let timeline = Timeline(entries: [entry], policy: .atEnd)
      completion(timeline)
    } else if (configuration.item?.identifier != nil) {
      displayType = WidgetViewType.postEditView
      APICacher().cacheSensorData(sensorId: Int(id)!) {
        var icon = ""
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
                }
              }
            }
            
          }
        } catch {
        }
        var date = Date()
        if (updateInterval != nil) {
          var value: Int? = nil
          for interval in SensorClass.SensorUpdateInterval {
            if (interval["id"] as? String == updateInterval!) {
              value = interval["valueInMin"] as? Int
              break;
            }
          }
          if value != nil {
            date = Calendar.current.date(byAdding: .minute, value: value!, to: Date())!
          }
        }
        let entry = SensorSimpleEntry(date: date, sensorWidgetStructure: SensorWidgetStructure(
          id: id,
          name: name,
          icon: icon,
          value: _value,
          unit: unit!,
          luTime: lastUpdated,
          displayType: displayType,
          theme: theme,
          owningAccount: owningAccount
        ))
        let timeline = Timeline(entries: [entry], policy: .atEnd)
        completion(timeline)
      }
    } else {
      let entry = SensorSimpleEntry(date: Date(), sensorWidgetStructure: SensorWidgetStructure(
        id: id,
        name: name,
        icon: "",
        value: "",
        unit: "",
        luTime: -1,
        displayType: displayType,
        theme: theme,
        owningAccount: owningAccount
      ))
      let timeline = Timeline(entries: [entry], policy: .atEnd)
      completion(timeline)
    }
  }
}

struct SensorSimpleEntry: TimelineEntry {
  let date: Date
  let sensorWidgetStructure: SensorWidgetStructure
}

struct SensorWidgetEntryView : View {
  var entry: SensorProvider.Entry
  
  var body: some View {
    AnyView(SensorWidgetUIViewProvider(sensorWidgetStructure: entry.sensorWidgetStructure))
  }
}

struct SensorWidgetBuilderUIView: Widget {
  let kind: String = "SensorWidget"
  
  var body: some WidgetConfiguration {
    IntentConfiguration(kind: kind, intent: SensorWidgetIntent.self, provider: SensorProvider()) { entry in
      SensorWidgetEntryView(entry: entry)
    }
    .configurationDisplayName("Sensor Widget")
    .description("This is an example sensor widget.")
    .supportedFamilies([.systemSmall])
  }
}

