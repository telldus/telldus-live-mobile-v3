//
//  SensorWidgetStructure.swift
//  HomescreenWidgetExtension
//
//  Created by Rimnesh Fernandez on 22/02/21.
//  Copyright © 2021 Telldus Technologies AB. All rights reserved.
//

import Foundation

@available(iOS 12.0, *)
public struct SensorWidgetStructure {
  let id: String
  let name: String
  let label: String
  let icon: String
  let value: String
  let unit: String
  let luTime: Int
  let displayType: WidgetViewType
  let owningAccount: String
  let timezone: String?
}
