//
//  SWPreviewLargeUIView.swift
//  HomescreenWidgetExtension
//
//  Created by Rimnesh Fernandez on 22/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import SwiftUI

struct SWPreviewLargeUIView: View {
    var body: some View {
      ZStack {
        Color(UIColor.systemIndigo)
        VStack {
          Text("Large Widget Preview")
            .font(.headline)
            .foregroundColor(.white)
          Text("This is sensor widget preview")
            .font(.caption)
            .multilineTextAlignment(.center)
            .padding(.top, 5)
            .padding([.leading, .trailing])
            .foregroundColor(.white)
        }
      }
    }
}

struct SWPreviewLargeUIView_Previews: PreviewProvider {
    static var previews: some View {
        SWPreviewLargeUIView()
    }
}
