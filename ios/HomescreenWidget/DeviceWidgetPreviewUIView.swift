//
//  DeviceWidgetPreviewUIView.swift
//  HomescreenWidgetExtension
//
//  Created by Rimnesh Fernandez on 22/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import SwiftUI

struct DeviceWidgetPreviewUIView: View {
  var body: some View {
    ZStack {
      Color(UIColor.systemIndigo)
      VStack {
        Text("This is device widget preview")
          .font(.headline)
          .multilineTextAlignment(.center)
          .padding(.top, 5)
          .padding([.leading, .trailing])
          .foregroundColor(.white)
      }
    }
  }
}

struct DeviceWidgetPreviewUIView_Previews: PreviewProvider {
  static var previews: some View {
    DeviceWidgetPreviewUIView()
  }
}
