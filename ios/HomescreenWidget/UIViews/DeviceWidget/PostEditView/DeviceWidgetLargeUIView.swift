//
//  DeviceWidgetLargeUIView.swift
//  HomescreenWidgetExtension
//
//  Created by Rimnesh Fernandez on 22/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import SwiftUI

struct DeviceWidgetLargeUIView: View {
  let deviceWidgetStructure: DeviceWidgetStructure
  var body: some View {
    let name = deviceWidgetStructure.name
    ZStack {
      Color(UIColor.systemIndigo)
      VStack {
        Text("Large Widget")
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
