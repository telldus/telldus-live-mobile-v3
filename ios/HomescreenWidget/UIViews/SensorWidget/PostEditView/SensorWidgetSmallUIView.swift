//
//  SensorWidgetSmallUIView.swift
//  HomescreenWidgetExtension
//
//  Created by Rimnesh Fernandez on 22/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import SwiftUI

struct SensorWidgetSmallUIView: View {
  let sensorWidgetStructure: SensorWidgetStructure
  var body: some View {
    let name = sensorWidgetStructure.name
    let icon = sensorWidgetStructure.icon
    let value = sensorWidgetStructure.value
    let unit = sensorWidgetStructure.unit
    let luTime = SensorUtilities().getLastUpdatedString(lastUpdated: sensorWidgetStructure.luTime)
    
    let colors = WidgetUtils.getColorsSensorPostEdit(theme: sensorWidgetStructure.theme)
    let widgetBackgroundColor = colors["widgetBackgroundColor"]
    let innerContainerBackgroundColor: Color = colors["innerContainerBackgroundColor"]!
    let iconColor = colors["iconColor"]
    let valueTextColor = colors["valueTextColor"]
    let unitTextColor = colors["unitTextColor"]
    let timeTextColor = colors["timeTextColor"]
    let timeTextColorExpired = colors["timeTextColorExpired"]
    let nameTextColor = colors["nameTextColor"]
    
    ZStack(alignment: .center) {
      widgetBackgroundColor
      VStack (alignment: .center) {
        ZStack(alignment: .center) {
          ContainerRelativeShape()
            .fill(innerContainerBackgroundColor)
          HStack (alignment: .center) {
            Text(icon)
              .foregroundColor(iconColor)
              .font(.custom("telldusicons", size: 28))
            VStack (alignment: .leading) {
              HStack {
                Text(value)
                  .foregroundColor(valueTextColor)
                  .font(.system(size: 18))
                  .lineLimit(1)
                Text(unit)
                  .foregroundColor(unitTextColor)
                  .font(.system(size: 16))
              }
              Text(luTime)
                .foregroundColor(SensorUtilities().isTooOld(lastUpdated: sensorWidgetStructure.luTime) ? timeTextColorExpired : timeTextColor)
                .font(.system(size: 12))
            }
          }
        }
        HStack (alignment: .bottom) {
          Text(name)
            .multilineTextAlignment(.center)
            .padding(.top, 5)
            .padding([.leading, .trailing])
            .foregroundColor(nameTextColor)
            .lineLimit(1)
            .font(.system(size: 15))
        }
      }
      .padding(5)
    }
  }
}

