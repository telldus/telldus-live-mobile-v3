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
    let theme = configuration.theme
    var owningAccount = ""
    var owningUserId = ""
    
    let dataDict = Utilities().getAuthData()
    if (dataDict == nil) {
      displayType = WidgetViewType.notLoggedInView
    } else if (configuration.item?.identifier != nil) {
      displayType = WidgetViewType.postEditView
      
      var db: SQLiteDatabase? = nil
      do {
        db = try SQLiteDatabase.open(nil)
        if let sensorDetails = db?.sensorDetailsModel(sensorId: Int32(id)!) {
          name = sensorDetails.name
          owningAccount = sensorDetails.userEmail
          owningUserId = sensorDetails.userId
          let activeUserId = dataDict?["uuid"] as? String
          if (owningUserId != activeUserId) {
            displayType = WidgetViewType.notSameAccountView
          }
        }
      } catch {
      }
    }
    
    let entry = SensorSimpleEntry(date: Date(), sensorWidgetStructure: SensorWidgetStructure(
      id: id,
      name: name,
      displayType: displayType,
      theme: theme,
      owningAccount: owningAccount
    ))
    let timeline = Timeline(entries: [entry], policy: .atEnd)
    completion(timeline)
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

