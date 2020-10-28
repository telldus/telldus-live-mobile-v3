//
//  NotSameAccountUIView.swift
//  HomescreenWidgetExtension
//
//  Created by Rimnesh Fernandez on 28/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import SwiftUI

struct NotSameAccountUIView: View {
  let owningAccount: String
  @available(iOS 13.0.0, *)
  var body: some View {
    ZStack {
      Color(UIColor.systemIndigo)
      VStack {
        Text("This widget was added for \(owningAccount). Please log in to that account to view this widget.")
          .font(.headline)
          .multilineTextAlignment(.center)
          .padding(.top, 5)
          .padding([.leading, .trailing])
          .foregroundColor(.white)
      }
    }
  }
}
