/**
 * Copyright 2016-present Telldus Technologies AB.
 *
 * This file is part of the Telldus Live! app.
 *
 * Telldus Live! app is free : you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Telldus Live! app is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Telldus Live! app.  If not, see <http://www.gnu.org/licenses/>.
 */

import WatchKit
import WatchConnectivity
import Foundation

class InterfaceController: WKInterfaceController, WCSessionDelegate {
	@available(watchOS 2.2, *)
	open func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {

	}

	@IBOutlet weak var label: WKInterfaceLabel!
	var session: WCSession?

	override func awake(withContext context: Any?) {
		super.awake(withContext: context)
		if WCSession.isSupported() {
			print("Activating watch session")
			self.session = WCSession.default()
			self.session?.delegate = self
			self.session?.activate()
		}
	}

	override func willActivate() {
		super.willActivate()
	}

	override func didDeactivate() {
		super.didDeactivate()
	}

	func session(_ session: WCSession, didReceiveMessage message: [String : Any], replyHandler: @escaping ([String : Any]) -> Void) {
		print("watch received message", message);
		let text = message["text"] as! String
		let timestamp : Double = (message["timestamp"] as! NSNumber).doubleValue
		self.label.setText(text)
		let currentTimestamp: Double = Date().timeIntervalSince1970 * 1000
		let elapsed : Double = currentTimestamp - timestamp
		replyHandler(["elapsed":Int(elapsed), "timestamp": round(currentTimestamp)])
	}

	func session(_ session: WCSession, didReceiveMessageData messageData: Data, replyHandler: @escaping (Data) -> Void) {
		let currentTimestamp: Double = Date().timeIntervalSince1970 * 1000
		let decodedData = Data(base64Encoded: messageData, options: NSData.Base64DecodingOptions(rawValue: 0))
		let data = try? JSONSerialization.data(withJSONObject: ["currentTimestamp": currentTimestamp], options: []);
		replyHandler(data!)
	}

	func session(_ session: WCSession, didReceive file: WCSessionFile) {
		let data: Data? = try? Data(contentsOf: file.fileURL)
	}

	func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String : Any]) {
		print("did receive application context", applicationContext)
	}

	func session(_ session: WCSession, didReceiveUserInfo userInfo: [String : Any]) {
		print("did receive user info", userInfo)
		session.transferUserInfo(userInfo)
	}

	func JSONStringify(_ value: AnyObject,prettyPrinted:Bool = false) -> String{
		let options = prettyPrinted ? JSONSerialization.WritingOptions.prettyPrinted : JSONSerialization.WritingOptions(rawValue: 0)

		if JSONSerialization.isValidJSONObject(value) {

			do{
				let data = try JSONSerialization.data(withJSONObject: value, options: options)
				if let string = NSString(data: data, encoding: String.Encoding.utf8.rawValue) {
					return string as String
				}
			}
			catch {
				print("error")
			}

		}
		return ""
	}

}
