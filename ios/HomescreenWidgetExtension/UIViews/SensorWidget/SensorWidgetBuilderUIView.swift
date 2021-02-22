//
//  SensorWidgetBuilderUIView.swift
//  HomescreenWidgetExtension
//
//  Created by Rimnesh Fernandez on 22/02/21.
//  Copyright © 2021 Telldus Technologies AB. All rights reserved.
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
      owningAccount: "",
      timezone: nil
    ))
  }
  
  func getSnapshot(for configuration: ConfigurationIntent, in context: Context, completion: @escaping (SensorSimpleEntry) -> ()) {
    var displayType = WidgetViewType.preEditView
    if (context.isPreview) {
      displayType = WidgetViewType.preview
    }
    let entry = SensorSimpleEntry(date: Date(), sensorWidgetStructure: SensorWidgetStructure(
      id: WidgetUtils.previewPostEditSensorWidgetStructure.id,
      name: WidgetUtils.previewPostEditSensorWidgetStructure.name,
      label: WidgetUtils.previewPostEditSensorWidgetStructure.label,
      icon: WidgetUtils.previewPostEditSensorWidgetStructure.icon,
      value: WidgetUtils.previewPostEditSensorWidgetStructure.value,
      unit: WidgetUtils.previewPostEditSensorWidgetStructure.unit,
      luTime: WidgetUtils.previewPostEditSensorWidgetStructure.luTime,
      displayType: WidgetUtils.previewPostEditSensorWidgetStructure.displayType,
      owningAccount: WidgetUtils.previewPostEditSensorWidgetStructure.owningAccount,
      timezone: nil
    ))
    completion(entry)
  }
  
  func getTimeline(for configuration: ConfigurationIntent, in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
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
    IntentConfiguration(kind: kind, intent: ConfigurationIntent.self, provider: SensorProvider()) { entry in
      SensorWidgetEntryView(entry: entry)
    }
    .configurationDisplayName(LocalizedStringKey("sensor_widget"))
    .description("")
    .supportedFamilies([.systemSmall])
  }
}


