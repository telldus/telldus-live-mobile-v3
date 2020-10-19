//
//  SQLiteError.swift
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 19/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import Foundation

enum SQLiteError: Error {
  case OpenDatabase(message: String)
  case Prepare(message: String)
  case Step(message: String)
  case Bind(message: String)
}
