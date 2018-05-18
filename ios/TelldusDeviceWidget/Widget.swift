//
//  Widget.swift
//  Devices
//

import Foundation
import RealmSwift

class Widget: Object {
    
    @objc dynamic var state: NSInteger = 0
    @objc dynamic var name = ""
    @objc dynamic var ignored: NSInteger = 0
    @objc dynamic var clientDeviceId = ""
    @objc dynamic var type = ""
    @objc dynamic var client = ""
    @objc dynamic var methods: NSInteger = 0
    @objc dynamic var id = ""
    @objc dynamic var editable: NSInteger = 0
    @objc dynamic var clientName = ""
    @objc dynamic var metadataHash = ""
    @objc dynamic var statevalue = ""
    @objc dynamic var online: NSInteger = 0
    @objc dynamic var devType = ""
}
