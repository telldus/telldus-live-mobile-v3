//
//  DeviceWidgetView.swift
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 14/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import SwiftUI

struct DeviceWidgetView: View {

  let deviceDetails: DeviceDetails

  @available(iOS 13.0.0, *)
  var body: some View {
    let name = deviceDetails.name
    return ZStack {
      Color(UIColor.systemIndigo)
      VStack {
        Text(name)
          .font(.headline)
          .multilineTextAlignment(.center)
          .padding(.top, 5)
          .padding([.leading, .trailing])
          .foregroundColor(.white)
      }
    }
  }
}
