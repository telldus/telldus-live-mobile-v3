//
//  WidgetViewController.swift
//  Devices
//

import UIKit
import Alamofire
import RealmSwift
import SwiftyJSON

class WidgetViewController: UIViewController, UIPickerViewDelegate, UIPickerViewDataSource {
    
    var realm = try? Realm()
    
    let widgetPicker = UIPickerView()
    var devices: [JSON] = []
    
    
    
    
    @IBOutlet weak var addDevLblView: UIView!
    @IBOutlet weak var selectDevices: UITextField!
    @IBOutlet weak var cnfrmBtmLbl: UIButton!
    @IBOutlet weak var cnclBtnLbl: UIButton!
    @IBOutlet weak var navBar: UINavigationBar!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        print("---loading")
        
        addDevLblView.backgroundColor = UIColor(patternImage: #imageLiteral(resourceName: "telldus_geometric_header_bg"))
        
        cnfrmBtmLbl.layer.cornerRadius = 20
        cnclBtnLbl.layer.cornerRadius = 20
        
        widgetPicker.showsSelectionIndicator = true
        widgetPicker.delegate = self
        widgetPicker.dataSource = self
        
        let toolBar = UIToolbar()
        toolBar.barStyle = UIBarStyle.default
        toolBar.isTranslucent = true
        toolBar.tintColor = UIColor(red: 76/255, green: 217/255, blue: 100/255, alpha: 1)
        toolBar.sizeToFit()
        
        let doneButton = UIBarButtonItem(title: "Done", style: UIBarButtonItemStyle.plain, target: self, action: #selector(WidgetViewController.saveAction))
        let spaceButton = UIBarButtonItem(barButtonSystemItem: UIBarButtonSystemItem.flexibleSpace, target: nil, action: nil)
        let cancelButton = UIBarButtonItem(title: "Cancel", style: UIBarButtonItemStyle.plain, target: self, action: #selector(WidgetViewController.cancelAction))
        
        toolBar.setItems([cancelButton, spaceButton, doneButton], animated: false)
        toolBar.isUserInteractionEnabled = true
        
        selectDevices.inputView = widgetPicker
        selectDevices.inputAccessoryView = toolBar
        
        let directory: URL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: K_GROUP_ID)!
        
        let fileURL = directory.appendingPathComponent(K_DB_NAME)
        realm = try! Realm(fileURL: fileURL)
        
        getAllDevices()
    }
    
    override func viewDidAppear(_ animated: Bool) {
        self.navBar.barTintColor = UIColor(red: 0, green: 0, blue: 128, alpha: 0)
        
        let imageView = UIImageView(frame: CGRect(x: 0, y: 0, width: 40, height: 40))
        imageView.contentMode = .scaleAspectFit
        
        let image = UIImage(named: "telldus_1.png")
        imageView.image = image
        
        navigationItem.titleView = imageView
    }
    
    func getAllDevices() {
        
        let headers: HTTPHeaders = [
            "Authorization": "Bearer 7ab5de2d912cc354d0888b17bd79a78ef4c784a0",
            "Accept": "application/json",
            "Content-Type": "application/json"
        ]
        
        Alamofire.request("https://api3.telldus.com/oauth2/devices/list?supportedMethods=951&includeIgnored=1", method: .get, headers: headers).responseJSON { response in
            switch response.result {
            case .success:
                if response.data != nil {
                    let json =  try? JSON(data: response.data!)
                    
                    if let allDevices = json!["device"].array {
                        print (allDevices)
                        print (allDevices.count)
                        for device in allDevices {
                            self.devices.append(device)
                        }
                    }
                }
                
            case .failure(let error):
                print(error)
            }
        }
    }
    
    @objc func saveAction() {
        
        let widget = Widget()
        
        for device in devices {
            
            
            if let title = device["name"].string {
                if(title == selectDevices.text) {
                    if let selDev = device.dictionary {
                        widget.state = selDev["state"]!.int!
                        widget.name = title
                        widget.ignored = selDev["ignored"]!.int!
                        widget.clientDeviceId = selDev["clientDeviceId"]!.string!
                        widget.type = selDev["type"]!.string!
                        widget.client = selDev["client"]!.string!
                        widget.methods = selDev["methods"]!.int!
                        widget.id = selDev["id"]!.string!
                        widget.editable = selDev["editable"]!.int!
                        widget.clientName = selDev["clientName"]!.string ?? ""
                        widget.metadataHash = selDev["metadataHash"]!.string ?? ""
                        widget.statevalue = selDev["statevalue"]!.string ?? ""
                        if let online = device["online"].string {
                            widget.online = Int(online)!
                        } else {
                            widget.online = selDev["online"]!.int!
                        }
                        if (selDev["state"]!.int! == 1 || selDev["state"]!.int! == 2) {
                            widget.devType = "DEVICE"
                        } else if (selDev["state"]!.int! == 4) {
                            widget.devType = "BELL"
                        } else if (selDev["state"]!.int! == 16) {
                            widget.devType = "DIM"
                        } else if (selDev["state"]!.int! == 32) {
                            widget.devType = "LEARN"
                        } else if (selDev["state"]!.int! == 128 || selDev["state"]!.int! == 256 || selDev["state"]!.int! == 512) {
                            widget.devType = "CONTROLDEV"
                        }
                    }
                }
            }
        }
        
        try! realm?.write {
            realm?.add(widget)
        }
        
        self.view.endEditing(true)
    }
    
    @objc func cancelAction() {
        self.view.endEditing(true)
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    func numberOfComponents(in pickerView: UIPickerView) -> Int {
        return 1
    }
    
    func pickerView(_ pickerView: UIPickerView, numberOfRowsInComponent component: Int) -> Int {
        return devices.count
    }
    
    func pickerView(_ pickerView: UIPickerView, titleForRow row: Int, forComponent component: Int) -> String? {
        
        if let title = devices[row]["name"].string {
            return title
        } else {
            return ""
        }
        
    }
    
    func pickerView(_ pickerView: UIPickerView, didSelectRow row: Int, inComponent component: Int) {
        if(devices.count > 0) {
            if let title = devices[row]["name"].string {
                selectDevices.text = title
            } else {
                selectDevices.text = ""
            }
        }
    }
}

extension String {
    func toJSON() -> Any? {
        guard let data = self.data(using: .utf8, allowLossyConversion: false) else { return nil }
        return try? JSONSerialization.jsonObject(with: data, options: .mutableContainers)
    }
}
