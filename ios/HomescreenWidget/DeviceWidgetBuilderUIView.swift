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
    DeviceSimpleEntry(date: Date(), deviceDetails: DeviceDetails(id: "", name: "Placeholder"))
  }
  
  func getSnapshot(for configuration: DeviceWidgetIntent, in context: Context, completion: @escaping (DeviceSimpleEntry) -> ()) {
    let entry = DeviceSimpleEntry(date: Date(), deviceDetails: DeviceDetails(id: "", name: "Snapshot"))
    completion(entry)
  }
  
  func getTimeline(for configuration: DeviceWidgetIntent, in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
    var entries: [DeviceSimpleEntry] = []
    
    // Generate a timeline consisting of five entries an hour apart, starting from the current date.
    let currentDate = Date()
    for hourOffset in 0 ..< 5 {
      let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate)!
      let name = configuration.item?.displayString ?? "no name"
      let id = configuration.item?.identifier ?? ""
      let entry = DeviceSimpleEntry(date: entryDate, deviceDetails: DeviceDetails(id: id, name: name))
      entries.append(entry)
    }
    
    let timeline = Timeline(entries: entries, policy: .atEnd)
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
      return AnyView(DeviceWidgetView(deviceDetails: entry.deviceDetails))
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
  }
}
