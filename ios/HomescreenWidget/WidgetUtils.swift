//
//  WidgetUtils.swift
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 28/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import Foundation
import WidgetKit

struct WidgetUtils {
  static func refreshAllWidgets() {
    if #available(iOS 14.0, *) {
      WidgetCenter.shared.reloadAllTimelines()
    } else {
      // Fallback on earlier versions
    }
  }
}
