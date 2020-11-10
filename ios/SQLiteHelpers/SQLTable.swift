//
//  SQLTable.swift
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 26/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import Foundation
protocol SQLTable {
  static var createStatement: String { get }
  static var deleteAllRecordsCurrentAccountStatement: String { get }
}
