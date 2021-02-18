//
//  SharedUtils.swift
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 18/02/21.
//  Copyright © 2021 Telldus Technologies AB. All rights reserved.
//

import Foundation
import WidgetKit
import SwiftUI

@available(iOS 12.0, *)
struct SharedUtils {
  static func refreshAllWidgets() {
    if #available(iOS 14.0, *) {
      #if arch(arm64) || arch(i386) || arch(x86_64)
      WidgetCenter.shared.reloadAllTimelines()
      #endif
    } else {
      // Fallback on earlier versions
    }
  }
  
  func isBasicUser (pro: Int?) -> Bool {
    return pro == nil || (Double(pro!) < Date().timeIntervalSince1970)
  }
}
