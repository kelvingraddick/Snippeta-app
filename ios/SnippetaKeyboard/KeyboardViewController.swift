//
//  KeyboardViewController.swift
//  SnippetaKeyboard
//

import UIKit

class KeyboardViewController: UIInputViewController {

  var snippetGroups: [SnippetGroup] = []
  var tableView: UITableView!
  var currentSnippets: [SnippetGroup] = []
  
  override func viewDidLoad() {
    print("viewDidload")
    super.viewDidLoad()
    loadSnippetGroups()
    setupUI()
  }
  
  // MARK: - Load Snippets
    func loadSnippetGroups() {
      print("loadSnippetGroups")
      if let sharedDefaults = UserDefaults(suiteName: "group.com.wavelinkllc.snippeta.shared"),
         let dataString = sharedDefaults.string(forKey: "snippetGroups"),
         let data = dataString.data(using: .utf8) {
        do {
          let results = try JSONDecoder().decode([SnippetGroup].self, from: data)
          self.snippetGroups = results
          self.currentSnippets = results
          print("Loaded \(results.count) snippet groups.")
        } catch {
          print("Error decoding snippet groups: \(error)")
        }
      }
    }
  
  // MARK: - Setup UI
  func setupUI() {
    tableView = UITableView()
    tableView.translatesAutoresizingMaskIntoConstraints = false
    tableView.delegate = self
    tableView.dataSource = self
    tableView.register(UITableViewCell.self, forCellReuseIdentifier: "Cell")
    view.addSubview(tableView)
    
    NSLayoutConstraint.activate([
      tableView.topAnchor.constraint(equalTo: view.topAnchor),
      tableView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
      tableView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
      tableView.trailingAnchor.constraint(equalTo: view.trailingAnchor)
    ])
  }
  
  // MARK: - Handle Snippet Tap
  func handleSnippetTap(_ snippet: SnippetGroup) {
    if snippet.type == SnippetType.SINGLE.rawValue {
      insertText(snippet.content)
    } else if snippet.type == SnippetType.MULTIPLE.rawValue {
      // Show nested snippets
      if let childSnippets = snippet.snippets {
        self.currentSnippets = childSnippets
        tableView.reloadData()
      }
    }
  }
  
  func insertText(_ text: String) {
    let proxy = textDocumentProxy as UITextDocumentProxy
    proxy.insertText(text)
  }

}

extension KeyboardViewController: UITableViewDelegate, UITableViewDataSource {
  
  func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
    let count = currentSnippets.count
    print("Number of rows: \(count)")
    return count
  }
  
  func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
    let snippetGroup = currentSnippets[indexPath.row]
    
    let cell = tableView.dequeueReusableCell(withIdentifier: "Cell", for: indexPath)
    cell.textLabel?.text = snippetGroup.title
    cell.accessoryType = snippetGroup.type == SnippetType.MULTIPLE.rawValue ? .disclosureIndicator : .none
    return cell
  }
  
  func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
    let snippet = currentSnippets[indexPath.row]
    handleSnippetTap(snippet)
  }
}
