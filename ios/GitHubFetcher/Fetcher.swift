//
//  Fetcher.swift
//  GitHubFetcher
//
//  Created by Rimnesh Fernandez on 10/02/21.
//  Copyright © 2021 Telldus Technologies AB. All rights reserved.
//

import Foundation

public final class Fetcher: NSObject {
    public static func fetch(name: String, completion: @escaping ((user: GitHubUser?, followers: [GitHubFollower])) -> Void) {
        guard let url = URL(string: "https://api.github.com/users/\(name)") else {
            return
        }

        let request = URLRequest(url: url, cachePolicy: .reloadIgnoringLocalAndRemoteCacheData, timeoutInterval: 10.0)

        let task = URLSession.shared.dataTask(with: request) { data, response, error in
            guard
                let data = data,
                let user = try? JSONDecoder().decode(GitHubUser.self, from: data)
            else {
                completion((nil, []))
                return
            }

            self.fetchFollowers(for: name, completion: { followers in
                completion((user, followers))
            })
        }

        task.resume()
    }

    private static func fetchFollowers(for name: String, completion: @escaping (_ followers: [GitHubFollower]) -> Void) {
        guard let url = URL(string: "https://api.github.com/users/\(name)/followers") else {
            return
        }

        let request = URLRequest(url: url, cachePolicy: .reloadIgnoringLocalAndRemoteCacheData, timeoutInterval: 10.0)

        let task = URLSession.shared.dataTask(with: request) { data, response, error in
            guard
                let data = data,
                let followers = try? JSONDecoder().decode([GitHubFollower].self, from: data)
            else {
                completion([])
                return
            }

            completion(followers)
        }

        task.resume()
    }
}
