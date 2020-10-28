//
//  Utilities.swift
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 19/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import Foundation

struct Utilities {
  func convertDictionaryToString (dict: Dictionary<String?, Any>) -> String {
    var data: Data?;
    do {
      data = try JSONSerialization.data(withJSONObject: dict)
    } catch {
      
    }
    if let data = data {
      return (NSString(data: data, encoding: String.Encoding.utf8.rawValue) ?? "") as String
    }
    return "";
  }
  
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
  
  func getAuthData() -> Dictionary<String?, Any>? {
    let data: String? = WidgetModule().getSecureData()
    guard data != nil else {
      return nil
    }
    
    let dataDict: Dictionary<String?, Any>? = Utilities().stringToDictionary(string: data!)
    guard dataDict != nil else {
      return nil
    }
    return dataDict
  }
}
