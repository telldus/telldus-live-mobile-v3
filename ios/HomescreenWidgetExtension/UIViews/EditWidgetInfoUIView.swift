//
//  EditWidgetInfoUIView.swift
//  HomescreenWidgetExtension
//
//  Created by Rimnesh Fernandez on 22/02/21.
//  Copyright © 2021 Telldus Technologies AB. All rights reserved.
//

import SwiftUI

struct EditWidgetInfoUIView: View {
  var body: some View {
    let text = String(format: "widget_ios_pre_edit_info")
    VStack (alignment: .center, spacing: 0) {
      Text("\u{e92e}")
        .foregroundColor(Color("widgetTextColorOne"))
        .font(.custom("telldusicons", size: 32))
      Text(LocalizedStringKey(text))
        .foregroundColor(Color("widgetTextColorOne"))
        .font(.system(size: 16))
        .padding(.top, 5)
        .multilineTextAlignment(.center)
    }
    .padding(.all, 8)
    .frame(minWidth: 0, maxWidth: .infinity, minHeight: 0, maxHeight: .infinity)
    .background(Color("widgetTopBGC"))
  }
}

struct EditWidgetInfoUIView_Previews: PreviewProvider {
  static var previews: some View {
    EditWidgetInfoUIView()
  }
}
