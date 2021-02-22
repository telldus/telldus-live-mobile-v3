//
//  NotSameAccountUIView.swift
//  HomescreenWidgetExtension
//
//  Created by Rimnesh Fernandez on 22/02/21.
//  Copyright © 2021 Telldus Technologies AB. All rights reserved.
//

import SwiftUI

struct NotSameAccountUIView: View {
  let owningAccount: String
  @available(iOS 13.0.0, *)
  var body: some View {
    let text = String(format: NSLocalizedString("widget_ios_not_same_account_info", comment: ""), owningAccount)
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
  }
}

