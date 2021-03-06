//
//  DWPreviewSmallUIView.swift
//  HomescreenWidgetExtension
//
//  Created by Rimnesh Fernandez on 22/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import SwiftUI

struct DWPreviewSmallUIView: View {
    var body: some View {
      ZStack {
        Color(UIColor.systemIndigo)
        VStack {
          Text("Small Widget Preview")
            .font(.headline)
            .foregroundColor(.white)
          Text("This is device widget preview")
            .font(.caption)
            .multilineTextAlignment(.center)
            .padding(.top, 5)
            .padding([.leading, .trailing])
            .foregroundColor(.white)
        }
      }
    }
}

struct DWPreviewSmallUIView_Previews: PreviewProvider {
    static var previews: some View {
        DWPreviewSmallUIView()
    }
}
