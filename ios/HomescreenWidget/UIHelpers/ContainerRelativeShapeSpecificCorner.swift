//
//  ContainerRelativeShapeSpecificCorner.swift
//  TelldusLiveApp
//
//  Created by Rimnesh Fernandez on 10/11/20.
//  Copyright © 2020 Telldus Technologies AB. All rights reserved.
//

import Foundation
import SwiftUI

struct ContainerRelativeShapeSpecificCorner: Shape {

    private let corners: [UIRectCorner]

    init(corner: UIRectCorner...) {
        self.corners = corner
    }

    func path(in rect: CGRect) -> Path {
        var p = ContainerRelativeShape().path(in: rect)

        if corners.contains(.allCorners) {
            return p
        }

        if !corners.contains(.topLeft) {
            p.addPath(Rectangle().path(in: CGRect(x: rect.origin.x, y: rect.origin.y, width: rect.width / 2, height: rect.height / 2)))
        }
        if !corners.contains(.topRight) {
            p.addPath(Rectangle().path(in: CGRect(x: rect.origin.x + rect.width / 2, y: rect.origin.y, width: rect.width / 2, height: rect.height / 2)))
        }
        if !corners.contains(.bottomLeft) {
            p.addPath(Rectangle().path(in: CGRect(x: rect.origin.x, y: rect.origin.y + rect.height / 2, width: rect.width / 2, height: rect.height / 2)))
        }
        if !corners.contains(.bottomRight) {
            p.addPath(Rectangle().path(in: CGRect(x: rect.origin.x + rect.width / 2, y: rect.origin.y + rect.height / 2, width: rect.width / 2, height: rect.height / 2)))
        }
        return p
    }
}
