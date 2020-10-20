//
//  SQLiteDatabase.swift
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 19/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import Foundation
import SQLite3

let pathDir = NSSearchPathForDirectoriesInDomains(
  .documentDirectory, .userDomainMask, true
).first!

class SQLiteDatabase {
  private let dbPointer: OpaquePointer?
  private init(dbPointer: OpaquePointer?) {
    self.dbPointer = dbPointer
  }
  deinit {
    sqlite3_close(dbPointer)
  }
  
  static func open(path: String?) throws -> SQLiteDatabase {
    var db: OpaquePointer?
    let _path = path ?? "\(pathDir)/widgetdb.sqlite3";
    if sqlite3_open(_path, &db) == SQLITE_OK {
      return SQLiteDatabase(dbPointer: db)
    } else {
      defer {
        if db != nil {
          sqlite3_close(db)
        }
      }
      if let errorPointer = sqlite3_errmsg(db) {
        let message = String(cString: errorPointer)
        throw SQLiteError.OpenDatabase(message: message)
      } else {
        throw SQLiteError
        .OpenDatabase(message: "No error message provided from sqlite.")
      }
    }
  }
  
}
