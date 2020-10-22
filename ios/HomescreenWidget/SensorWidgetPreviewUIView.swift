//
//  SensorWidgetPreviewUIView.swift
//  HomescreenWidgetExtension
//
//  Created by Rimnesh Fernandez on 22/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import SwiftUI

struct SensorWidgetPreviewUIView: View {
  var body: some View {
    ZStack {
      Color(UIColor.systemIndigo)
      VStack {
        Text("This is sensor widget preview")
          .font(.headline)
          .multilineTextAlignment(.center)
          .padding(.top, 5)
          .padding([.leading, .trailing])
          .foregroundColor(.white)
      }
    }
  }
}

struct SensorWidgetPreviewUIView_Previews: PreviewProvider {
  static var previews: some View {
    SensorWidgetPreviewUIView()
  }
}
