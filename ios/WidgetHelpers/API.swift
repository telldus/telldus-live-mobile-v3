//
//  API.swift
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 19/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import Foundation

enum AppError: Error {
    case networkError(Error)
    case dataNotFound
    case jsonParsingError(Error)
    case invalidStatusCode(Int)
    case invalidToken
    case unknownError(String)
    case noAuthToken
}

//Result enum to show success or failure
enum Result<T> {
    case success(T)
    case failure(AppError)
}

class API {
  func callEndPoint(_ params: String, completion: @escaping (Result<Any>) -> Void) {
    
    let data = WidgetModule().getSecureData()
    guard data != nil else {
      completion(Result.failure(AppError.noAuthToken))
        return
    }
    let dataDict = Utilities().stringToDictionary(string: data!)
    print("TEST dataDict \(dataDict)")
    guard dataDict != nil else {
      completion(Result.failure(AppError.noAuthToken))
        return
    }
    
    let accessToken = dataDict!["accessToken"] as! String?
    print("TEST accessToken \(accessToken)")
    guard accessToken != nil else {
      completion(Result.failure(AppError.noAuthToken))
        return
    }
  
    let url = URL(string: "\(Constants.telldusAPIServer)/oauth2\(params)")!
    var request = URLRequest(url: url, timeoutInterval: 30);
    request.addValue("application/json", forHTTPHeaderField: "Content-Type")
    request.addValue("application/json", forHTTPHeaderField: "Accept")
    request.addValue("Bearer \(accessToken!)", forHTTPHeaderField: "Authorization")
    print("TEST url \(url)")
    let task = URLSession.shared.dataTask(with: request) {(data, response, error) in
        guard error == nil else {
            completion(Result.failure(AppError.networkError(error!)))
            return
        }

        guard let data = data else {
            completion(Result.failure(AppError.dataNotFound))
            return
        }

        do {
           //create json object from data
           if let json = try JSONSerialization.jsonObject(with: data, options: .mutableContainers) as? [String: Any] {
            let error = json["error"] ?? nil
            print("TEST 1 json error : ",error)
            guard error == nil else {
              let _error = error as! String
              print("TEST json error : ",error)
              if (_error == "invalid_token" || _error == "expired_token") {
                  completion(Result.failure(AppError.invalidToken))
                  return
              }
              completion(Result.failure(AppError.unknownError(_error )))
              return
            }
            print("TEST json : ",json)
            completion(Result.success(json))
            return
           }
        } catch let error {
            print("TEST error : ",error.localizedDescription)
            completion(Result.failure(AppError.jsonParsingError(error)))
            return
        }
        return
    }
    task.resume()
  }
  
  func refreshAccessToken(data: Dictionary<String?, Any>?, completion: @escaping (Any?) -> Void) {
    
    let clientId = data!["clientId"] as! String?
    let clientSecret = data!["clientSecret"] as! String?
    let refreshToken = data!["refreshToken"] as! String?
    guard clientId != nil, clientSecret != nil, refreshToken != nil else {
        completion(nil)
        return
    }
    
    let url = URL(string: "\(Constants.telldusAPIServer)/oauth2/accessToken")!
    var request = URLRequest(url: url, timeoutInterval: 30);
    request.httpMethod = "POST"
    request.addValue("application/json", forHTTPHeaderField: "Content-Type")
    request.addValue("application/json", forHTTPHeaderField: "Accept")
    
    let parameters = [
      "client_id": clientId,
      "client_secret": clientSecret,
      "grant_type": "refresh_token",
      "refresh_token": refreshToken,
    ]
    do {
        request.httpBody = try JSONSerialization.data(withJSONObject: parameters, options: .prettyPrinted)
    } catch _ {
      completion(nil)
      return
    }
    
    print("TEST url \(url)")
    let task = URLSession.shared.dataTask(with: request) {(data, response, error) in
        guard error == nil else {
            completion(nil)
            return
        }

        guard let data = data else {
            completion(nil)
            return
        }

        do {
           //create json object from data
           if let json = try JSONSerialization.jsonObject(with: data, options: .mutableContainers) as? [String: Any] {
              guard (json["error"] as? [String]) != nil else {
                  completion(nil)
                  return
              }
              print("TEST json : ",json)
              completion(json)
              return
           }
        } catch let error {
            print("TEST error : ",error.localizedDescription)
            completion(nil)
            return
        }
        return
    }
    task.resume()
  }
}
