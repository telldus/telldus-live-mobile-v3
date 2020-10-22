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

@main
struct HomescreenWidget: WidgetBundle {
  
  @WidgetBundleBuilder
  var body: some Widget {
    DeviceWidgetBuilderUIView()
    SensorWidgetBuilderUIView()
  }
}

