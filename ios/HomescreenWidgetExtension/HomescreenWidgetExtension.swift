//
//  HomescreenWidgetExtension.swift
//  HomescreenWidgetExtension
//
//  Created by Rimnesh Fernandez on 21/02/21.
//  Copyright © 2021 Telldus Technologies AB. All rights reserved.
//

import WidgetKit
import SwiftUI
import Intents

@main
struct HomescreenWidgetExtension: WidgetBundle {
  @WidgetBundleBuilder
  var body: some Widget {
//    DeviceWidgetBuilderUIView()// TODO: Enable device widget
    SensorWidgetBuilderUIView()
  }
}

