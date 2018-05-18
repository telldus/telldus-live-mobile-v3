//
//  TodayViewController.swift
//  TelldusDeviceLive
//

import Alamofire
import UIKit
import NotificationCenter
import RealmSwift
import SwiftyJSON

class TodayViewController: UIViewController, NCWidgetProviding, UICollectionViewDataSource, UICollectionViewDelegate, UICollectionViewDelegateFlowLayout {
    
    var realm = try! Realm()
    
    var allSelectedDevice: Results<Widget> {
        get {
            return realm.objects(Widget.self)
        }
    }
    @IBOutlet weak var widgetCollectionView: UICollectionView!
   
    var DataToDisplay: [String] = []
    var dimmerValue = 0
    
    var displayRemoveBtn: Bool = true
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        super.viewDidLoad()
        widgetCollectionView.delegate = self
        widgetCollectionView.dataSource = self
        
        let directory: URL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: K_GROUP_ID)!
        
        let fileURL = directory.appendingPathComponent(K_DB_NAME)
        print(fileURL)
        realm = try! Realm(fileURL: fileURL)
        
        for device in allSelectedDevice {
            print(device)
            DataToDisplay.append(device.name)
        }
        
//        DataToDisplay.append("add")
        
        if UserDefaults.standard.contains(key: "dimmerValue")  {
            dimmerValue = UserDefaults.standard.integer(forKey: "dimmerValue")
        } else {
            dimmerValue = 0
        }
        
        self.extensionContext?.widgetLargestAvailableDisplayMode = .expanded
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    func numberOfSections(in collectionView: UICollectionView) -> Int {
        return 2
    }
    
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        return (section == 0) ? DataToDisplay.count : 1
    }
    
    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let cell = widgetCollectionView.dequeueReusableCell(withReuseIdentifier: "collectionViewCell", for: indexPath) as! WidgetCollectionViewCell
        
        let btnCell = widgetCollectionView.dequeueReusableCell(withReuseIdentifier: "AddWidgetCollectionViewCell", for: indexPath) as! AddWidgetCollectionViewCell
        
        if(indexPath.section == 0) {
            cell.onBtn.isHidden = true
            cell.offBtn.isHidden = true
            cell.downBtn.isHidden = true
            cell.upBtn.isHidden = true
            cell.stopBtn.isHidden = true
            cell.minusBtn.isHidden = true
            cell.plusBtn.isHidden = true
            cell.dimmerSlider.isHidden = true
            cell.dimmerSlider.isUserInteractionEnabled = false
            cell.removeMinusBtn.isHidden = displayRemoveBtn
            cell.removeMinusBtn.layer.cornerRadius = 12.5
            cell.removeMinusBtn.layer.zPosition = 1.0
            cell.removeMinusBtn.tag = indexPath.row
            cell.removeMinusBtn.addTarget(self, action: #selector(removeDeviceFromWidgets(_:)), for: .touchUpInside)
            
            let deviceName = DataToDisplay[indexPath.row]
            
            for device in allSelectedDevice  {
                if(device.name == deviceName && device.devType == "DEVICE") {
                    cell.onBtn.isHidden = false
                    cell.onBtn.setImage(#imageLiteral(resourceName: "on_dark"), for: .normal)
                    cell.onBtn.contentEdgeInsets = UIEdgeInsetsMake(10,10,10,10)
                    cell.onBtn.addTarget(self, action: #selector(deviceControl(_:)), for: .touchUpInside)
                    cell.offBtn.isHidden = false
                    cell.offBtn.setImage(#imageLiteral(resourceName: "off_dark"), for: .normal)
                    cell.offBtn.contentEdgeInsets = UIEdgeInsetsMake(10,25,10,25)
                    cell.offBtn.addTarget(self, action: #selector(deviceControl(_:)), for: .touchUpInside)
                    cell.displayContent(label: deviceName)
                    if (device.state == 1)  {
                        cell.onBtn.tintColor = UIColor.white
                        cell.onBtn.backgroundColor = UIColor(displayP3Red: 0.885, green: 0.415, blue: 0.147, alpha: 1)
                        cell.offBtn.tintColor = UIColor(displayP3Red: 0.105, green: 0.212, blue: 0.363, alpha: 1)
                        cell.offBtn.backgroundColor = UIColor(displayP3Red: 0.959, green: 0.967, blue: 0.967, alpha: 1)
                        
                    } else if (device.state == 2)  {
                        cell.onBtn.tintColor = UIColor(displayP3Red: 0.885, green: 0.415, blue: 0.147, alpha: 1)
                        cell.onBtn.backgroundColor = UIColor(displayP3Red: 0.959, green: 0.967, blue: 0.967, alpha: 1)
                        cell.offBtn.tintColor = UIColor.white
                        cell.offBtn.backgroundColor = UIColor(displayP3Red: 0.105, green: 0.212, blue: 0.363, alpha: 1)
                    }
                    
                } else if(device.name == deviceName && device.devType == "DIM") {
                    cell.minusBtn.isHidden = false
                    cell.minusBtn.addTarget(self, action: #selector(dimmerControl(_:)), for: .touchUpInside)
                    cell.plusBtn.isHidden = false
                    cell.plusBtn.addTarget(self, action: #selector(dimmerControl(_:)), for: .touchUpInside)
                    cell.dimmerSlider.isHidden = false
                    cell.dimmerSlider.value = Float(dimmerValue)
                    cell.displayContent(label: deviceName)
                    
                    if(device.statevalue != "null"){
                        print("null value")
                    } else {
                        print(device.statevalue)
                        print(Int(device.statevalue)!)
                    }
                    
                } else if(device.name == deviceName && device.devType == "CONTROLDEV"){
                    
                    cell.downBtn.isHidden = false
                    cell.downBtn.setImage(#imageLiteral(resourceName: "downarrow"), for: .normal)
                    cell.downBtn.addTarget(self, action: #selector(deviceUDSControl(_:)), for: .touchUpInside)
                    cell.upBtn.isHidden = false
                    cell.upBtn.setImage(#imageLiteral(resourceName: "uparrow"), for: .normal)
                    cell.upBtn.addTarget(self, action: #selector(deviceUDSControl(_:)), for: .touchUpInside)
                    cell.stopBtn.isHidden = false
                    cell.stopBtn.setImage(#imageLiteral(resourceName: "stop"), for: .normal)
                    cell.stopBtn.addTarget(self, action: #selector(deviceUDSControl(_:)), for: .touchUpInside)
                    cell.displayContent(label: deviceName)
                    if (device.state == 128)  {
                        print("1111111111")
    //                    cell.downBtn.ena
                        cell.downBtn.tintColor = UIColor.white
                        cell.downBtn.backgroundColor = UIColor(displayP3Red: 0.105, green: 0.212, blue: 0.363, alpha: 1)
                        cell.upBtn.tintColor = UIColor(displayP3Red: 0.885, green: 0.415, blue: 0.147, alpha: 1)
                        cell.upBtn.backgroundColor = UIColor(displayP3Red: 0.959, green: 0.967, blue: 0.967, alpha: 1)
                        cell.stopBtn.tintColor = UIColor(displayP3Red: 0.885, green: 0.415, blue: 0.147, alpha: 1)
                        cell.stopBtn.backgroundColor = UIColor(displayP3Red: 0.959, green: 0.967, blue: 0.967, alpha: 1)
                        
                    } else if (device.state == 256)  {
                        print("22222222222")
                        cell.downBtn.tintColor = UIColor(displayP3Red: 0.885, green: 0.415, blue: 0.147, alpha: 1)
                        cell.downBtn.backgroundColor = UIColor(displayP3Red: 0.959, green: 0.967, blue: 0.967, alpha: 1)
                        cell.upBtn.tintColor = UIColor.white
                        cell.upBtn.backgroundColor = UIColor(displayP3Red: 0.105, green: 0.212, blue: 0.363, alpha: 1)
                        cell.stopBtn.tintColor = UIColor(displayP3Red: 0.885, green: 0.415, blue: 0.147, alpha: 1)
                        cell.stopBtn.backgroundColor = UIColor(displayP3Red: 0.959, green: 0.967, blue: 0.967, alpha: 1)
                        
                    } else if (device.state == 512)  {
                        print("3333333333")
                        cell.downBtn.tintColor = UIColor(displayP3Red: 0.885, green: 0.415, blue: 0.147, alpha: 1)
                        cell.downBtn.backgroundColor = UIColor(displayP3Red: 0.959, green: 0.967, blue: 0.967, alpha: 1)
                        cell.upBtn.tintColor = UIColor(displayP3Red: 0.885, green: 0.415, blue: 0.147, alpha: 1)
                        cell.upBtn.backgroundColor = UIColor(displayP3Red: 0.959, green: 0.967, blue: 0.967, alpha: 1)
                        cell.stopBtn.tintColor = UIColor.white
                        cell.stopBtn.backgroundColor = UIColor(displayP3Red: 0.105, green: 0.212, blue: 0.363, alpha: 1)
                    }
                    
                } else {
                     cell.displayContent(label: deviceName)
                }
            }
            self.preferredContentSize = CGSize(width: (widgetCollectionView.collectionViewLayout.collectionView?.contentSize)!.width + 20.0, height: (widgetCollectionView.collectionViewLayout.collectionView?.contentSize)!.height+20.0)
            return cell
            
        } else {
            btnCell.addWidgetBtn.layer.cornerRadius = 15.0
            btnCell.addWidgetBtn.backgroundColor = UIColor(displayP3Red: 0.943, green: 0.354, blue: 0.155, alpha: 1)
            btnCell.removeBtn.layer.cornerRadius = 15.0
            if(displayRemoveBtn == true) {
                btnCell.removeWidgetLbl.text = "REMOVE"
            } else {
                btnCell.removeWidgetLbl.text = "DONE"
            }
//            btnCell.backgroundColor = UIColor.gray
            return btnCell
            
        }
    }
    
    @objc func removeDeviceFromWidgets(_ sender: UIButton) {
        let tag = sender.tag
        let val = DataToDisplay[tag]
        
        for device in allSelectedDevice {
            if(device.name == val) {
                try! realm.write {
                    realm.delete(device)
                }
                DataToDisplay.remove(at: tag)
                
//                Context context = getApplica
//                self.extensionContext?.widgetLargestAvailableDisplayMode = .compact
                
//                self.widgetActiveDisplayModeDidChange(.expanded, withMaximumSize: CGSize.init())
//                TodayViewController.viewDidLoad(self)
                self.widgetCollectionView.reloadData()
//                self.extensionContext?.widgetLargestAvailableDisplayMode = .compact
//                self.widgetActiveDisplayModeDidChange(.expanded, withMaximumSize: (widgetCollectionView.collectionViewLayout.collectionView?.contentSize)!)
                break
            }
        }
    }
    
    @objc func deviceControl(_ sender: UIButton) {
        let buttonPosition:CGPoint = sender.convert(.zero, to: self.widgetCollectionView)
        let indexPath:IndexPath = self.widgetCollectionView.indexPathForItem(at: buttonPosition)!
        let val = DataToDisplay[indexPath.row]
        let tag = sender.tag
        
        if(tag == 0) {
            checkForDevice(val: val, method: 1)
        } else if(tag == 1) {
            checkForDevice(val: val, method: 2)
        }
    }
    
    @objc func dimmerControl(_ sender: UIButton) {
        let buttonPosition:CGPoint = sender.convert(.zero, to: self.widgetCollectionView)
        let indexPath:IndexPath = self.widgetCollectionView.indexPathForItem(at: buttonPosition)!
        let val = DataToDisplay[indexPath.row]
        let tag = sender.tag
        
        if(tag == 5) {
            checkForDevice(val: val, method: 16)
        } else if(tag == 6) {
            checkForDevice(val: val, method: 16)
        }
    }
    
    @objc func deviceUDSControl(_ sender: UIButton) {
        let buttonPosition:CGPoint = sender.convert(.zero, to: self.widgetCollectionView)
        let indexPath:IndexPath = self.widgetCollectionView.indexPathForItem(at: buttonPosition)!
        let val = DataToDisplay[indexPath.row]
        let tag = sender.tag
        
        if(tag == 2) {
            checkForDevice(val: val, method: 128)
        } else if(tag == 3) {
            checkForDevice(val: val, method: 256)
        } else if(tag == 4) {
            checkForDevice(val: val, method: 512)
        }
    }
    
    func checkForDevice(val: String, method: Int) {
        print("--->>", val)
        
        for device in allSelectedDevice {
            if(device.name == val) {
                controlDevices(widget: device, method: method)
            }
        }
    }
    
    func controlDevices(widget: Widget, method: Int) {
        let headers: HTTPHeaders = [
            "Authorization": "Bearer 7ab5de2d912cc354d0888b17bd79a78ef4c784a0",
            "Accept": "application/json",
            "Content-Type": "application/json"
        ]
        
        print("---controolvlv-->>", widget)
        var url = ""
        
        print(dimmerValue)
        
        if(widget.devType == "DEVICE") {
            url = "https://api3.telldus.com/oauth2/device/command?id=\(widget.id)&method=\(method)&value=null"
        } else if(widget.devType == "BELL") {
            url = "https://api3.telldus.com/oauth2/device/command?id=\(widget.id)&method=4&value=null"
        } else if(widget.devType == "LEARN") {
            url = ""
        } else if(widget.devType == "CONTROLDEV") {
            url = "https://api3.telldus.com/oauth2/device/command?id=\(widget.id)&method=\(method)&value=null"
        }  else if(widget.devType == "DIM") {
            if(dimmerValue == 0) {
                dimmerValue = 20
                UserDefaults.standard.set(20, forKey: "dimmerValue")
            } else if(dimmerValue == 20) {
                dimmerValue = 40
                UserDefaults.standard.set(20, forKey: "dimmerValue")
            } else if(dimmerValue == 40) {
                dimmerValue = 60
                UserDefaults.standard.set(20, forKey: "dimmerValue")
            } else if(dimmerValue == 60) {
                dimmerValue = 80
                UserDefaults.standard.set(20, forKey: "dimmerValue")
            } else if(dimmerValue == 80) {
                dimmerValue = 100
                UserDefaults.standard.set(20, forKey: "dimmerValue")
            } else {
                dimmerValue = 0
                UserDefaults.standard.set(20, forKey: "dimmerValue")
            }
            url = "https://api3.telldus.com/oauth2/device/command?id=\(widget.id)&method=\(method)&value=\(dimmerValue)"
        }
        
        print(url)
        
        Alamofire.request(url, method: .get, headers: headers).responseJSON { response in
            switch response.result {
            case .success:
                let json =  try? JSON(data: response.data!)
                
                if let allDevices = json!["error"].string {
                    print ("errror0-------> >  ",allDevices)
                } else {
                    print ("successs-------> >  ")
                    try! self.realm.write {
                        widget.state = method
                    }
                    self.widgetCollectionView.reloadData()
                }
                
            case .failure(let error):
                print(error)
            }
        }
    }
    
    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        if(DataToDisplay.count > 0) {
            let deviceName = DataToDisplay[indexPath.row]
            print(deviceName)
        }
    }
    
    @IBAction func removeWidgetControl(_ sender: UIButton) {
        displayRemoveBtn = !displayRemoveBtn
        widgetCollectionView.reloadData()
    }
    
    @IBAction func addNewWidget(_ sender: UIButton) {
        let url = NSURL(string: "Widget://")!
        extensionContext?.open(url as URL, completionHandler: nil)
    }
    
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAt indexPath: IndexPath) -> CGSize {
        
        var tWidth = (widgetCollectionView.bounds.width/2.0) - 5.0
        var tHeight: CGFloat = 80.0
        
        if(indexPath.section == 1) {
            tWidth = widgetCollectionView.bounds.width
            tHeight = 30.0
        }
        
        return CGSize(width: tWidth, height: tHeight)
    }
    
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, insetForSectionAt section: Int) -> UIEdgeInsets {
        return (section == 0) ? UIEdgeInsets(top: 0.0, left: 5.0, bottom: 0.0, right: 0.0) : UIEdgeInsets(top: 10.0, left: 0.0, bottom: 0.0, right: 0.0)
    }
    
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, minimumLineSpacingForSectionAt section: Int) -> CGFloat {
        return 10.0
    }
    
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, minimumInteritemSpacingForSectionAt section: Int) -> CGFloat {
        return 0
    }
    
    func widgetPerformUpdate(completionHandler: (@escaping (NCUpdateResult) -> Void)) {
        
        print("view perform update() ")
//        self.extensionContext?.widgetLargestAvailableDisplayMode = .expanded
        completionHandler(NCUpdateResult.noData)
    }
    
    func widgetActiveDisplayModeDidChange(_ activeDisplayMode: NCWidgetDisplayMode, withMaximumSize maxSize: CGSize) {
        var height = widgetCollectionView.collectionViewLayout.collectionView?.contentSize.height
        
        if activeDisplayMode == NCWidgetDisplayMode.compact {
            self.preferredContentSize = maxSize
        } else if activeDisplayMode == NCWidgetDisplayMode.expanded {
            height = height! + 25.0
            self.preferredContentSize = CGSize(width: maxSize.width, height: height!)
        }
    }

}

extension UserDefaults {
    func contains(key: String) -> Bool {
        return UserDefaults.standard.object(forKey: key) != nil
    }
}
