//
//  SensorWidgetMediumUIView.swift
//  HomescreenWidgetExtension
//
//  Created by Rimnesh Fernandez on 22/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import SwiftUI

struct SensorWidgetMediumUIView: View {
  let sensorWidgetStructure: SensorWidgetStructure
  var body: some View {
    let name = sensorWidgetStructure.name
    let icon = sensorWidgetStructure.icon
    let value = sensorWidgetStructure.value
    let unit = sensorWidgetStructure.unit
    let luTime = SensorUtilities().getLastUpdatedString(lastUpdated: sensorWidgetStructure.luTime)
    ZStack(alignment: .center) {
      Color("widgetBackgroundColor")
      VStack (alignment: .center) {
        ZStack(alignment: .center) {
          ContainerRelativeShape()
            .fill(Color("brandPrimary"))
          HStack (alignment: .center) {
            Text(icon)
              .foregroundColor(.white)
              .font(.custom("telldusicons", size: 42))
            VStack (alignment: .leading) {
              HStack {
                Text(value)
                  .foregroundColor(.white)
                  .font(.system(size: 22))
                  .lineLimit(1)
                Text(unit)
                  .foregroundColor(.white)
                  .font(.system(size: 20))
              }
              Text(luTime)
                .foregroundColor(SensorUtilities().isTooOld(lastUpdated: sensorWidgetStructure.luTime) ? .red : .white)
                .font(.system(size: 16))
            }
          }
        }
        HStack (alignment: .bottom) {
          Text(name)
            .multilineTextAlignment(.center)
            .padding(.top, 5)
            .padding([.leading, .trailing])
            .foregroundColor(.white)
            .lineLimit(1)
            .font(.system(size: 15))
        }
      }
      .padding(5)
    }
  }
}
