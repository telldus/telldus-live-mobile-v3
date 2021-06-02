//
//  Utilities.swift
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 19/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import Foundation

struct Utilities {
  /**
   Converts a dictionary to string
   */
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
  
  /**
   Converts a string to dictionary
   */
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
  
  /**
   Returns the access token and other authorization releated data as a dictionary
   */
  func getAuthData() -> Dictionary<String?, Any>? {
    let data: String? = SharedModule().getSecureData()
    guard data != nil else {
      return nil
    }
    
    let dataDict: Dictionary<String?, Any>? = Utilities().stringToDictionary(string: data!)
    guard dataDict != nil else {
      return nil
    }
    return dataDict
  }
  
  /**
   Converts the RGB value in decimal to Hexadecimal format
   */
  func getMainColorRGB (decimalRGB: Int) -> String {
    var mainColor = String(decimalRGB, radix: 16);
    let length = mainColor.count
    let len = 6;
    
    if (length == len) {
      return "#"+mainColor;
    } else if (length < len) {
      // Make sure it is in "#rrggbb" format
      let deficit = len - length;
      let i = 1
      for _ in i...deficit {
        mainColor = "0"+mainColor;
      }
      return "#"+mainColor;
    }
    let index = String.Index(utf16Offset: len, in: mainColor)
    return "#"+mainColor[..<index];
  }
}
