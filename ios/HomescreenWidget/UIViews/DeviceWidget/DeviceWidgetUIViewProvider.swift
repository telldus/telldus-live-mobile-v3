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
  
  let deviceWidgetStructure: DeviceWidgetStructure
  @Environment(\.widgetFamily) var family: WidgetFamily
  
  @available(iOS 13.0.0, *)
  var body: some View {
    switch deviceWidgetStructure.displayType {
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
        return AnyView(DeviceWidgetSmallUIView(deviceWidgetStructure: deviceWidgetStructure))
      case .systemMedium:
        return AnyView(DeviceWidgetMediumUIView(deviceWidgetStructure: deviceWidgetStructure))
      case .systemLarge:
        return AnyView(DeviceWidgetLargeUIView(deviceWidgetStructure: deviceWidgetStructure))
      default:
        return AnyView(DeviceWidgetSmallUIView(deviceWidgetStructure: deviceWidgetStructure))
      }
    case .notLoggedInView:
      switch family {
      case .systemSmall:
        return AnyView(NotLoggedInView())
      case .systemMedium:
        return AnyView(NotLoggedInView())
      case .systemLarge:
        return AnyView(NotLoggedInView())
      default:
        return AnyView(NotLoggedInView())
      }
    case .notSameAccountView:
      switch family {
      case .systemSmall:
        return AnyView(NotSameAccountUIView(owningAccount: deviceWidgetStructure.owningAccount))
      case .systemMedium:
        return AnyView(NotSameAccountUIView(owningAccount: deviceWidgetStructure.owningAccount))
      case .systemLarge:
        return AnyView(NotSameAccountUIView(owningAccount: deviceWidgetStructure.owningAccount))
      default:
        return AnyView(NotSameAccountUIView(owningAccount: deviceWidgetStructure.owningAccount))
      }
    case .upgradeToPremiumView:
      switch family {
      case .systemSmall:
        return AnyView(DeviceWidgetSmallUIView(deviceWidgetStructure: deviceWidgetStructure))
      case .systemMedium:
        return AnyView(DeviceWidgetMediumUIView(deviceWidgetStructure: deviceWidgetStructure))
      case .systemLarge:
        return AnyView(DeviceWidgetLargeUIView(deviceWidgetStructure: deviceWidgetStructure))
      default:
        return AnyView(DeviceWidgetSmallUIView(deviceWidgetStructure: deviceWidgetStructure))
      }
    }
  }
}
