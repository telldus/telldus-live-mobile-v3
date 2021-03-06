//
//  IntentViewController.swift
//  DeviceActionShortcutExtensionUI
//
//  Created by Rimnesh Fernandez on 15/02/21.
//  Copyright © 2021 Telldus Technologies AB. All rights reserved.
//

import IntentsUI
import DeviceActionShortcut

// As an example, this extension's Info.plist has been configured to handle interactions for INSendMessageIntent.
// You will want to replace this or add other intents as appropriate.
// The intents whose interactions you wish to handle must be declared in the extension's Info.plist.

class IntentViewController: UIViewController, INUIHostedViewControlling {
  
  @IBOutlet weak var statusLabel: UILabel!
  @IBOutlet weak var activityIndicator: UIActivityIndicatorView!
  
  override func viewDidLoad() {
    super.viewDidLoad()
    // Do any additional setup after loading the view.
  }
  
  // MARK: - INUIHostedViewControlling
  
  // Prepare your view controller for the interaction to handle.
  func configureView(for parameters: Set<INParameter>, of interaction: INInteraction, interactiveBehavior: INUIInteractiveBehavior, context: INUIHostedViewContext, completion: @escaping (Bool, Set<INParameter>, CGSize) -> Void) {
    
    guard
      let intent = interaction.intent as? DeviceActionShortcutIntent,
      let deviceId = intent.deviceId
    else {
      return
    }
    activityIndicator.isHidden = false
    activityIndicator.startAnimating()
    
    let method = intent.method!
    
    let fetcher = Fetcher();
    if method == "2048" {
      let thermostatValue = intent.thermostatValue
      fetcher.deviceSetStateThermostat(deviceId: deviceId, stateValue: thermostatValue!) { [weak self] status in
        
        DispatchQueue.main.async {
          self?.statusLabel.text = status
          self?.hideActivityIndicator()
        }
      }
    } else if method == "1024" {
      let rgbValue = intent.rgbValue
      fetcher.deviceSetStateRGB(deviceId: deviceId, stateValue: rgbValue!) { [weak self] status in
        
        DispatchQueue.main.async {
          self?.statusLabel.text = status
          self?.hideActivityIndicator()
        }
      }
    } else {
      let dimValue = intent.dimValue
      fetcher.deviceSetState(deviceId: deviceId, method: method, stateValue: dimValue) { [weak self] status in
        
        DispatchQueue.main.async {
          self?.statusLabel.text = status
          self?.hideActivityIndicator()
        }
      }
    }
    
    completion(true, parameters, self.desiredSize)
  }
  
  var desiredSize: CGSize {
    var size = self.extensionContext!.hostedViewMaximumAllowedSize
    size.height = UIFont.systemFont(ofSize: 15).lineHeight * 3
    
    return size
  }
  
  private func hideActivityIndicator() {
    DispatchQueue.main.async {
      self.activityIndicator.isHidden = true
      self.activityIndicator.stopAnimating()
    }
  }
  
}
