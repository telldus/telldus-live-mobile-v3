//
//  IntentHandler.swift
//  HomescreenWidgetIntentExtension
//
//  Created by Rimnesh Fernandez on 14/10/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import Intents

class IntentHandler: INExtension {
    
    override func handler(for intent: INIntent) -> Any {
        // This is the default implementation.  If you want different objects to handle different intents,
        // you can override this and return the handler you want for that particular intent.
        
        return self
    }
    
}

struct WidgetItem {
  var id: String;
  var name: String;
}

extension IntentHandler: HomescreenWidgetIntentHandling {
  
  func provideItemOptionsCollection(for intent: HomescreenWidgetIntent, with completion: @escaping (INObjectCollection<WidgetItemsList>?, Error?) -> Void) {
      let itemOne = WidgetItem(id: "1", name: "Device one name")
      let itemTwo = WidgetItem(id: "2", name: "Device two name")
      let itemsList: [WidgetItem] = [itemOne, itemTwo];
      var items = [WidgetItemsList]()
      for item in itemsList {
          let emojiIntentObject =
          WidgetItemsList(identifier: item.id, display: item.name)
          items.append(emojiIntentObject)
      }
      completion(INObjectCollection(items: items), nil)
  }
}
