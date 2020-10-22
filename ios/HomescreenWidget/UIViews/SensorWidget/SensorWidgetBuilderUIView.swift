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
    SensorSimpleEntry(date: Date(), sensorDetails: SensorDetails(
      id: "",
      name: "",
      displayType: WidgetViewType.preEditView
    ))
  }
  
  func getSnapshot(for configuration: SensorWidgetIntent, in context: Context, completion: @escaping (SensorSimpleEntry) -> ()) {
    var displayType = WidgetViewType.preEditView
    if (context.isPreview) {
      displayType = WidgetViewType.preview
    }
    let entry = SensorSimpleEntry(date: Date(), sensorDetails: SensorDetails(
      id: "",
      name: "",
      displayType: displayType
    ))
    completion(entry)
  }
  
  func getTimeline(for configuration: SensorWidgetIntent, in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
    var entries: [SensorSimpleEntry] = []
    
    // Generate a timeline consisting of five entries an hour apart, starting from the current date.
    let currentDate = Date()
    for hourOffset in 0 ..< 5 {
      let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate)!
      let name = configuration.item?.displayString ?? ""
      let id = configuration.item?.identifier ?? ""
      var displayType = WidgetViewType.postEditView
      if (configuration.item?.identifier == nil) {
        displayType = WidgetViewType.preEditView
      }
      let entry = SensorSimpleEntry(date: entryDate, sensorDetails: SensorDetails(
        id: id,
        name: name,
        displayType: displayType
      ))
      entries.append(entry)
    }
    
    let timeline = Timeline(entries: entries, policy: .atEnd)
    completion(timeline)
  }
}

struct SensorSimpleEntry: TimelineEntry {
  let date: Date
  let sensorDetails: SensorDetails
}

struct SensorWidgetEntryView : View {
  var entry: SensorProvider.Entry
  
  var body: some View {
    let data = WidgetModule().getSecureData()
    if (data == nil) {
      return AnyView(NotLoggedInView())
    }
    return AnyView(SensorWidgetUIViewProvider(sensorDetails: entry.sensorDetails))
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
  }
}

