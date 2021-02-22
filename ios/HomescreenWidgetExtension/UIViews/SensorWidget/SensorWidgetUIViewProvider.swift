//
//  SensorWidgetUIViewProvider.swift
//  HomescreenWidgetExtension
//
//  Created by Rimnesh Fernandez on 22/02/21.
//  Copyright © 2021 Telldus Technologies AB. All rights reserved.
//

import SwiftUI
import WidgetKit

struct SensorWidgetUIViewProvider: View {
  
  let sensorWidgetStructure: SensorWidgetStructure
  @Environment(\.widgetFamily) var family: WidgetFamily
  
  @available(iOS 13.0.0, *)
  var body: some View {
    switch sensorWidgetStructure.displayType {
    case .preview:
        return AnyView(SWPreviewSmallUIView(sensorWidgetStructure: sensorWidgetStructure))
    case .preEditView:
      return AnyView(EditWidgetInfoUIView())
    case .postEditView:
        return AnyView(SensorWidgetSmallUIView(sensorWidgetStructure: sensorWidgetStructure))
    case .notLoggedInView:
        return AnyView(NotLoggedInView())
    case .notSameAccountView:
        return AnyView(NotSameAccountUIView(owningAccount: sensorWidgetStructure.owningAccount))
    case .upgradeToPremiumView:
        return AnyView(PurchasePremiumUIView())
    }
  }
}

struct SensorWidgetUIViewProvider_Previews: PreviewProvider {
  static var previews: some View {
    Group {
      SensorWidgetUIViewProvider(sensorWidgetStructure: WidgetUtils.previewPostEditSensorWidgetStructure).previewContext(WidgetPreviewContext(family: .systemSmall))
    }
  }
}
