//
//  Utilities.swift
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 19/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import Foundation

struct Utilities {
  func stringToDictionary(string: String) -> Dictionary<String?, Any>? {
    let data = string.data(using: .utf8)!
      do {
        if let jsonArray = try JSONSerialization.jsonObject(with: data, options : .allowFragments) as? Dictionary<String,Any>
        {
          return jsonArray
        } else {
          return nil
        }
      } catch _ as NSError {
        return nil
      }
  }
}
