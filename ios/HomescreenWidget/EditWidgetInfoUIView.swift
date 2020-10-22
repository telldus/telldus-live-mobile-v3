//
//  EditWidgetInfoUIView.swift
//  HomescreenWidgetExtension
//
//  Created by Rimnesh Fernandez on 22/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import SwiftUI

struct EditWidgetInfoUIView: View {
  var body: some View {
    ZStack {
      Color(UIColor.systemIndigo)
      VStack {
        Text("Please use the edit option to add any item")
          .font(.headline)
          .multilineTextAlignment(.center)
          .padding(.top, 5)
          .padding([.leading, .trailing])
          .foregroundColor(.white)
      }
    }
  }
}

struct EditWidgetInfoUIView_Previews: PreviewProvider {
  static var previews: some View {
    EditWidgetInfoUIView()
  }
}
