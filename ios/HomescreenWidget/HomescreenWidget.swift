//
//  HomescreenWidget.swift
//  HomescreenWidget
//
//  Created by Rimnesh Fernandez on 07/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import WidgetKit
import SwiftUI
import Intents

struct Provider: IntentTimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), configuration: DeviceWidgetIntent())
    }

    func getSnapshot(for configuration: DeviceWidgetIntent, in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(date: Date(), configuration: configuration)
        completion(entry)
    }

    func getTimeline(for configuration: DeviceWidgetIntent, in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        var entries: [SimpleEntry] = []

        // Generate a timeline consisting of five entries an hour apart, starting from the current date.
        let currentDate = Date()
        for hourOffset in 0 ..< 5 {
            let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate)!
            let entry = SimpleEntry(date: entryDate, configuration: configuration)
            entries.append(entry)
        }

        let timeline = Timeline(entries: entries, policy: .atEnd)
        completion(timeline)
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let configuration: DeviceWidgetIntent
}

struct HomescreenWidgetEntryView : View {
    var entry: Provider.Entry

    var body: some View {
        Text("Device Widget")
    }
}

struct SensorProvider: IntentTimelineProvider {
    func placeholder(in context: Context) -> SensorSimpleEntry {
      SensorSimpleEntry(date: Date(), configuration: SensorWidgetIntent())
    }

    func getSnapshot(for configuration: SensorWidgetIntent, in context: Context, completion: @escaping (SensorSimpleEntry) -> ()) {
        let entry = SensorSimpleEntry(date: Date(), configuration: configuration)
        completion(entry)
    }

    func getTimeline(for configuration: SensorWidgetIntent, in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        var entries: [SensorSimpleEntry] = []

        // Generate a timeline consisting of five entries an hour apart, starting from the current date.
        let currentDate = Date()
        for hourOffset in 0 ..< 5 {
            let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate)!
            let entry = SensorSimpleEntry(date: entryDate, configuration: configuration)
            entries.append(entry)
        }

        let timeline = Timeline(entries: entries, policy: .atEnd)
        completion(timeline)
    }
}

struct SensorSimpleEntry: TimelineEntry {
    let date: Date
    let configuration: SensorWidgetIntent
}

struct SensorWidgetEntryView : View {
    var entry: SensorProvider.Entry

    var body: some View {
        Text("Sensor Widget")
    }
}

@main
struct HomescreenWidget: WidgetBundle {

  @WidgetBundleBuilder
  var body: some Widget {
    DeviceWidget()
    SensorWidget()
  }
}

struct SensorWidget: Widget {
    let kind: String = "SensorWidget"

    var body: some WidgetConfiguration {
        IntentConfiguration(kind: kind, intent: SensorWidgetIntent.self, provider: SensorProvider()) { entry in
          SensorWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Sensor Widget")
        .description("This is an example sensor widget.")
    }
}

struct DeviceWidget: Widget {
    let kind: String = "DeviceWidget"

    var body: some WidgetConfiguration {
        IntentConfiguration(kind: kind, intent: DeviceWidgetIntent.self, provider: Provider()) { entry in
            HomescreenWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Device Widget")
        .description("This is an example device widget.")
    }
}

struct HomescreenWidget_Previews: PreviewProvider {
    static var previews: some View {
        HomescreenWidgetEntryView(entry: SimpleEntry(date: Date(), configuration: DeviceWidgetIntent()))
            .previewContext(WidgetPreviewContext(family: .systemSmall))
    }
}

struct SensorWidget_Previews: PreviewProvider {
    static var previews: some View {
      SensorWidgetEntryView(entry: SensorSimpleEntry(date: Date(), configuration: SensorWidgetIntent()))
            .previewContext(WidgetPreviewContext(family: .systemSmall))
    }
}
