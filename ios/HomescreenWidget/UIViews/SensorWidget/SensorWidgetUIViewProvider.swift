//
//  SensorWidgetUIViewProvider.swift
//  HomescreenWidgetExtension
//
//  Created by Rimnesh Fernandez on 14/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import SwiftUI
import WidgetKit

struct SensorWidgetUIViewProvider: View {
  
  let sensorDetails: SensorDetails
  @Environment(\.widgetFamily) var family: WidgetFamily
  
  @available(iOS 13.0.0, *)
  var body: some View {
    switch sensorDetails.displayType {
    case .preview:
      switch family {
      case .systemSmall:
        return AnyView(SWPreviewSmallUIView())
      case .systemMedium:
        return AnyView(SWPreviewMediumUIView())
      case .systemLarge:
        return AnyView(SWPreviewLargeUIView())
      default:
        return AnyView(SWPreviewSmallUIView())
      }
    case .preEditView:
      return AnyView(EditWidgetInfoUIView())
    case .postEditView:
      switch family {
      case .systemSmall:
        return AnyView(SensorWidgetSmallUIView(sensorDetails: sensorDetails))
      case .systemMedium:
        return AnyView(SensorWidgetMediumUIView(sensorDetails: sensorDetails))
      case .systemLarge:
        return AnyView(SensorWidgetLargeUIView(sensorDetails: sensorDetails))
      default:
        return AnyView(SensorWidgetSmallUIView(sensorDetails: sensorDetails))
      }
    }
  }
}

