//
//  SWPreviewSmallUIView.swift
//  HomescreenWidgetExtension
//
//  Created by Rimnesh Fernandez on 22/02/21.
//  Copyright © 2021 Telldus Technologies AB. All rights reserved.
//

import SwiftUI

struct SWPreviewSmallUIView: View {
  let sensorWidgetStructure: SensorWidgetStructure
  var body: some View {
    let name = sensorWidgetStructure.name
    let label = sensorWidgetStructure.label
    let icon = sensorWidgetStructure.icon
    let value = sensorWidgetStructure.value
    let unit = sensorWidgetStructure.unit
    let luTime = SensorUtilities().getLastUpdatedDate(lastUpdated: sensorWidgetStructure.luTime)
    let luTimeString = SensorUtilities().getLastUpdatedString(lastUpdated: sensorWidgetStructure.luTime, timezone: sensorWidgetStructure.timezone)
    let isLarge = SensorUtilities().isValueLarge(value: value)
    let isUpdateTimeOld = SensorUtilities().isTooOld(lastUpdated: sensorWidgetStructure.luTime)
    
    let sensorLastUpdatedMode = SharedModule().getUserDefault(key: "sensorLastUpdatedModeKey")
    
    return VStack(spacing: 0) {
      VStack(alignment: .center, spacing: 0) {
        Text("\u{e911}")
          .foregroundColor(Color("widgetTextColorOne"))
          .font(.custom("telldusicons", size: 30))
          .padding(.bottom, 2)
        Text(name)
          .foregroundColor(Color("widgetTextColorOne"))
          .font(.system(size: 14))
          .lineLimit(1)
          .padding(.bottom, 2)
        if luTime != nil, sensorLastUpdatedMode == "0" {
          Text(luTime!, style:  .relative)
            .foregroundColor(isUpdateTimeOld ? Color.red : Color("widgetTextColorTwo"))
            .font(.system(size: 12))
            .multilineTextAlignment(.center)
        }
        if luTime != nil, sensorLastUpdatedMode == "1" {
          Text(luTimeString)
            .foregroundColor(isUpdateTimeOld ? Color.red : Color("widgetTextColorTwo"))
            .font(.system(size: 12))
        }
      }
      .padding(.horizontal, 8)
      .frame(minWidth: 0, maxWidth: .infinity, minHeight: 0, maxHeight: .infinity)
      .background(Color("widgetTopBGC"))
      HStack (spacing: 0) {
        if !isLarge {
          Text(icon)
            .foregroundColor(Color("widgetTextColorThree"))
            .font(.custom("telldusicons", size: 40))
        }
        VStack (alignment: .leading) {
          HStack (alignment: .lastTextBaseline) {
            Text(value)
              .foregroundColor(Color("widgetTextColorThree"))
              .font(.system(size: 26))
              .lineLimit(1)
            Text(unit)
              .foregroundColor(Color("widgetTextColorThree"))
              .font(.system(size: 16))
              .padding(.leading, -5)
          }
          Text(label)
            .foregroundColor(Color("widgetTextColorThree"))
            .font(.system(size: 12))
        }
        .padding(.leading, 10)
      }
      .padding(.horizontal, 10)
      .padding(.vertical, 8)
      .clipShape(ContainerRelativeShapeSpecificCorner(corner: .bottomLeft, .bottomRight))
      .frame(minWidth: 0, maxWidth: .infinity, minHeight: 0, alignment: .leading)
      .background(Color("widgetBottomBGC"))
    }
    .frame(minWidth: 0, maxWidth: .infinity, minHeight: 0, maxHeight: .infinity)
  }
}


