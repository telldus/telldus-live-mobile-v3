//
//  GitHubUser.swift
//  GitHubFetcher
//
//  Created by Rimnesh Fernandez on 10/02/21.
//  Copyright © 2021 Telldus Technologies AB. All rights reserved.
//

import Foundation

public struct GitHubUser: Codable {
    public let name: String
    public let location: String
    public let repos: Int

    private enum CodingKeys: String, CodingKey {
        case name
        case location
        case repos = "public_repos"
    }
}

public struct GitHubFollower: Codable {
    public let login: String

    private enum CodingKeys: String, CodingKey {
        case login
    }
}
