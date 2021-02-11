//
//  IntentViewController.swift
//  GitHubUserIntentUI
//
//  Created by Rimnesh Fernandez on 10/02/21.
//  Copyright © 2021 Telldus Technologies AB. All rights reserved.
//

import IntentsUI
import GitHubFetcher

// As an example, this extension's Info.plist has been configured to handle interactions for INSendMessageIntent.
// You will want to replace this or add other intents as appropriate.
// The intents whose interactions you wish to handle must be declared in the extension's Info.plist.

// You can test this example integration by saying things to Siri like:
// "Send a message using <myApp>"

class IntentViewController: UIViewController, INUIHostedViewControlling {
    
    @IBOutlet weak var reposLabel: UILabel!
    @IBOutlet weak var followersLabel: UILabel!
    @IBOutlet weak var activityIndicator: UIActivityIndicatorView!

    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view.
    }
        
    // MARK: - INUIHostedViewControlling
    
    // Prepare your view controller for the interaction to handle.
    func configureView(for parameters: Set<INParameter>, of interaction: INInteraction, interactiveBehavior: INUIInteractiveBehavior, context: INUIHostedViewContext, completion: @escaping (Bool, Set<INParameter>, CGSize) -> Void) {

        print("TEST status: ")
        print(interaction.intentHandlingStatus)

        guard
            let intent = interaction.intent as? CheckMyGitHubIntent,
            let deviceId = intent.deviceId
        else {
            return
        }
        print ("TEST status: 2")
        activityIndicator.isHidden = false
        activityIndicator.startAnimating()
      
        let method = intent.method

        Fetcher.fetch(deviceId: deviceId, method: method!) { [weak self] status in
            self?.hideActivityIndicator()
            return

            DispatchQueue.main.async {
                self?.reposLabel.text = status
//                self?.followersLabel.text = "Followers: \(followers.count)"

                self?.hideActivityIndicator()
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
