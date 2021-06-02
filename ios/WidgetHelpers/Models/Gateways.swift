//
//  Gateways.swift
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 02/06/21.
//  Copyright © 2021 Telldus Technologies AB. All rights reserved.
//

import Foundation

class Gateways: Codable {
  var client: [Gateway]?
  
  private enum CodingKeys: String, CodingKey {
      case client = "client"
  }
}
