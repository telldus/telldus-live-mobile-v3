//
//  NotLoggedInView.swift
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 14/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import SwiftUI

struct NotLoggedInView: View {
  
  @available(iOS 13.0.0, *)
  var body: some View {
    ZStack {
      Color(UIColor.systemIndigo)
      VStack {
        Text("Please log into the app to add widgets")
          .font(.headline)
          .multilineTextAlignment(.center)
          .padding(.top, 5)
          .padding([.leading, .trailing])
          .foregroundColor(.white)
      }
    }
  }
}
