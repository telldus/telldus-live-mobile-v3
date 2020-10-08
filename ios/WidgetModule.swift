//
//  WidgetModule.swift
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 08/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import Foundation
@objc(WidgetModule)
class WidgetModule: NSObject {

  @objc(configureWidgetAuthData:refreshToken:expiresIn:clientId:clientSecret:userId:pro:)
  func configureWidgetAuthData(
    accessToken: String,
    refreshToken: String,
    expiresIn: String,
    clientId: String,
    clientSecret: String,
    userId: String,
    pro: NSNumber
    ) -> Void {
      print("TEST \(accessToken)")
  }
}
