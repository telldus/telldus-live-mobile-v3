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
  static let updateIntervalInMinutes = 15
  
  func placeholder(in context: Context) -> SensorSimpleEntry {
    SensorSimpleEntry(date: Date(), sensorWidgetStructure: SensorWidgetStructure(
      id: "",
      name: "",
      label: "",
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
      label: "",
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
    let date = Calendar.current.date(byAdding: .minute, value: SensorProvider.updateIntervalInMinutes, to: Date())!
    WidgetUtils().getSensorSimpleEntry(configuration: configuration) {sensorWidgetStructure in
      let entry = SensorSimpleEntry(date: date, sensorWidgetStructure: sensorWidgetStructure)
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

