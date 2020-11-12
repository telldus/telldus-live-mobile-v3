//
//  PurchasePremiumUIView.swift
//  HomescreenWidgetExtension
//
//  Created by Rimnesh Fernandez on 11/11/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import SwiftUI

struct PurchasePremiumUIView: View {
  var body: some View {
    let text = String(format: "widget_ios_basic_user_info")
    VStack (alignment: .center, spacing: 0) {
      Text("\u{e92e}")
        .foregroundColor(Color("widgetTextColorOne"))
        .font(.custom("telldusicons", size: 30))
      Text(LocalizedStringKey(text))
        .foregroundColor(Color("widgetTextColorOne"))
        .font(.system(size: 13))
        .padding(.top, 5)
        .multilineTextAlignment(.center)
    }
    .padding(.all, 8)
    .frame(minWidth: 0, maxWidth: .infinity, minHeight: 0, maxHeight: .infinity)
    .background(Color("widgetTopBGC"))
    .widgetURL(URL(string: Constants.DEEP_LINK_PURCHASE_PREMIUM))
  }
}

struct PurchasePremiumUIView_Previews: PreviewProvider {
  static var previews: some View {
    PurchasePremiumUIView()
  }
}
