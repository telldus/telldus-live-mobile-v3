//
//  WidgetUtils.swift
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 28/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import Foundation
import WidgetKit
import SwiftUI

struct WidgetUtils {
  static func refreshAllWidgets() {
    if #available(iOS 14.0, *) {
      WidgetCenter.shared.reloadAllTimelines()
    } else {
      // Fallback on earlier versions
    }
  }
  
  @available(iOS 14.0, *)
  static func getColorsSensorPostEdit(theme: ThemesList) -> Dictionary<String, Color> {
    var colors: Dictionary<String, Color> = [:]
    colors["widgetBackgroundColor"] = Color("widgetBackgroundColor")
    colors["innerContainerBackgroundColor"] = Color("brandPrimary")
    colors["iconColor"] = Color.white
    colors["valueTextColor"] = Color.white
    colors["unitTextColor"] = Color.white
    colors["timeTextColor"] = Color.white
    colors["timeTextColorExpired"] = Color.red
    colors["nameTextColor"] = Color.white
    
    switch (theme) {
    case .dark :
      colors["widgetBackgroundColor"] = Color.black
      colors["innerContainerBackgroundColor"] = Color.black
      colors["iconColor"] = Color.white
      colors["valueTextColor"] = Color.white
      colors["unitTextColor"] = Color.white
      colors["timeTextColor"] = Color.white
      colors["timeTextColorExpired"] = Color.red
      colors["nameTextColor"] = Color.white
      return colors
    case .light :
      colors["widgetBackgroundColor"] = Color.white
      colors["innerContainerBackgroundColor"] = Color.white
      colors["iconColor"] = Color.black
      colors["valueTextColor"] = Color.black
      colors["unitTextColor"] = Color.black
      colors["timeTextColor"] = Color.black
      colors["timeTextColorExpired"] = Color.red
      colors["nameTextColor"] = Color.black
      return colors
    default :
      return colors
    }
  }
}
