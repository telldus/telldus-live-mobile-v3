//
//  DeviceWidgetUIViewProvider.swift
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 14/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import SwiftUI
import WidgetKit

struct DeviceWidgetUIViewProvider: View {
  
  let deviceDetails: DeviceDetails
  @Environment(\.widgetFamily) var family: WidgetFamily
  
  @available(iOS 13.0.0, *)
  var body: some View {
    switch deviceDetails.displayType {
    case .preview:
      switch family {
      case .systemSmall:
        return AnyView(DWPreviewSmallUIView())
      case .systemMedium:
        return AnyView(DWPreviewMediumUIView())
      case .systemLarge:
        return AnyView(DWPreviewLargeUIView())
      default:
        return AnyView(DWPreviewSmallUIView())
      }
    case .preEditView:
      return AnyView(EditWidgetInfoUIView())
    case .postEditView:
      switch family {
      case .systemSmall:
        return AnyView(DeviceWidgetSmallUIView(deviceDetails: deviceDetails))
      case .systemMedium:
        return AnyView(DeviceWidgetMediumUIView(deviceDetails: deviceDetails))
      case .systemLarge:
        return AnyView(DeviceWidgetLargeUIView(deviceDetails: deviceDetails))
      default:
        return AnyView(DeviceWidgetSmallUIView(deviceDetails: deviceDetails))
      }
    }
  }
}
