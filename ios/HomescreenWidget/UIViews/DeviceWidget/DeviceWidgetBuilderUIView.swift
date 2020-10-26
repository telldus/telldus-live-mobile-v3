//
//  DeviceWidgetBuilderUIView.swift
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 22/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import WidgetKit
import SwiftUI
import Intents

struct DeviceProvider: IntentTimelineProvider {
  func placeholder(in context: Context) -> DeviceSimpleEntry {
    DeviceSimpleEntry(date: Date(), deviceDetails: DeviceDetails(
      id: "",
      name: "",
      displayType: WidgetViewType.preEditView
    ))
  }
  
  func getSnapshot(for configuration: DeviceWidgetIntent, in context: Context, completion: @escaping (DeviceSimpleEntry) -> ()) {
    var displayType = WidgetViewType.preEditView
    if (context.isPreview) {
      displayType = WidgetViewType.preview
    }
    let entry = DeviceSimpleEntry(date: Date(), deviceDetails: DeviceDetails(
      id: "",
      name: "",
      displayType: displayType
    ))
    completion(entry)
  }
  
  func getTimeline(for configuration: DeviceWidgetIntent, in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
    
    let name = configuration.item?.displayString ?? ""
    let id = configuration.item?.identifier ?? ""
    var displayType = WidgetViewType.preEditView
    if (configuration.item?.identifier != nil) {
      displayType = WidgetViewType.postEditView
    }
    
    let entry = DeviceSimpleEntry(date: Date(), deviceDetails: DeviceDetails(
      id: id,
      name: name,
      displayType: displayType
    ))
    
    let timeline = Timeline(entries: [entry], policy: .atEnd)
    completion(timeline)
  }
}

struct DeviceSimpleEntry: TimelineEntry {
  let date: Date
  let deviceDetails: DeviceDetails
}

struct DeviceWidgetEntryView : View {
  var entry: DeviceProvider.Entry
  
  var body: some View {
    let data = WidgetModule().getSecureData()
    if (data == nil) {
      return AnyView(NotLoggedInView())
    } else {
      return AnyView(DeviceWidgetUIViewProvider(deviceDetails: entry.deviceDetails))
    }
  }
}

struct DeviceWidgetBuilderUIView: Widget {
  let kind: String = "DeviceWidget"
  
  var body: some WidgetConfiguration {
    IntentConfiguration(kind: kind, intent: DeviceWidgetIntent.self, provider: DeviceProvider()) { entry in
      DeviceWidgetEntryView(entry: entry)
    }
    .configurationDisplayName("Device Widget")
    .description("This is an example device widget.")
    .supportedFamilies([.systemSmall, .systemMedium])
  }
}
