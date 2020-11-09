//
//  SensorWidgetMediumUIView.swift
//  HomescreenWidgetExtension
//
//  Created by Rimnesh Fernandez on 22/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import SwiftUI

struct SensorWidgetMediumUIView: View {
  let sensorWidgetStructure: SensorWidgetStructure
  var body: some View {
    let name = sensorWidgetStructure.name
    ZStack {
      Color(UIColor.systemIndigo)
      VStack {
        Text("Medium Widget")
          .font(.headline)
          .foregroundColor(.white)
        Text(name)
          .font(.caption)
          .multilineTextAlignment(.center)
          .padding(.top, 5)
          .padding([.leading, .trailing])
          .foregroundColor(.white)
      }
    }
  }
}
