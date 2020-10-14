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
        SimpleEntry(date: Date(), configuration: HomescreenWidgetIntent())
    }

    func getSnapshot(for configuration: HomescreenWidgetIntent, in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(date: Date(), configuration: configuration)
        completion(entry)
    }

    func getTimeline(for configuration: HomescreenWidgetIntent, in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
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
    let configuration: HomescreenWidgetIntent
}

struct HomescreenWidgetEntryView : View {
    var entry: Provider.Entry

    var body: some View {
        Text(entry.date, style: .time)
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
        IntentConfiguration(kind: kind, intent: HomescreenWidgetIntent.self, provider: Provider()) { entry in
            HomescreenWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Sensor Widget")
        .description("This is an example sensor widget.")
    }
}

struct DeviceWidget: Widget {
    let kind: String = "DeviceWidget"

    var body: some WidgetConfiguration {
        IntentConfiguration(kind: kind, intent: HomescreenWidgetIntent.self, provider: Provider()) { entry in
            HomescreenWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Device Widget")
        .description("This is an example device widget.")
    }
}

struct HomescreenWidget_Previews: PreviewProvider {
    static var previews: some View {
        HomescreenWidgetEntryView(entry: SimpleEntry(date: Date(), configuration: HomescreenWidgetIntent()))
            .previewContext(WidgetPreviewContext(family: .systemSmall))
    }
}
