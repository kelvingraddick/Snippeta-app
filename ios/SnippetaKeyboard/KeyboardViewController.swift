//
//  KeyboardViewController.swift
//  SnippetaKeyboard
//

import UIKit
import SwiftUICore

class KeyboardViewController: UIInputViewController {
  
  var allSnippets: [Snippet] = []
  var currentSnippets: [Snippet] = []
  var snippetStack: [[Snippet]] = []
  var snippetTitleStack: [String] = []
  var deleteTimer: Timer?
  var themer = Themer()
  
  var tableView: UITableView!
  var navBar: UIView!
  var backButton: UIButton!
  var titleLabel: UILabel!
  var spaceButton: UIButton!
  var deleteButton: UIButton!
  var settingsButton: UIButton!
  
  override func viewDidLoad() {
    super.viewDidLoad()
    
    loadAllSnippets()
    setupUI()
  }
  
  func loadAllSnippets() {
    if let sharedDefaults = UserDefaults(suiteName: "group.com.wavelinkllc.snippeta.shared"),
       let dataString = sharedDefaults.string(forKey: "snippets"),
       let data = dataString.data(using: .utf8) {
      do {
        let results = try JSONDecoder().decode([Snippet].self, from: data)
        self.allSnippets = results
        self.currentSnippets = results
        print("Loaded \(results.count) snippets.")
      } catch {
        print("Error decoding snippets: \(error)")
      }
    }
  }
  
  // MARK: - Setup UI
  func setupUI() {
    // Create the navBar
    navBar = UIView()
    navBar.translatesAutoresizingMaskIntoConstraints = false
    navBar.backgroundColor = .systemGray5
    view.addSubview(navBar)
    
    // Create settings button
    settingsButton = UIButton(type: .system)
    settingsButton.setImage(UIImage(systemName: "gearshape"), for: .normal)
    settingsButton.tintColor = .darkGray
    settingsButton.addTarget(self, action: #selector(didTapSettings), for: .touchUpInside)
    settingsButton.translatesAutoresizingMaskIntoConstraints = false
    settingsButton.contentEdgeInsets = UIEdgeInsets(top: 10, left: 5, bottom: 10, right: 10)
    //navBar.addSubview(settingsButton)
    
    // Create Back button
    backButton = UIButton(type: .system)
    backButton.setImage(UIImage(systemName: "chevron.left"), for: .normal)
    backButton.tintColor = .darkGray
    backButton.addTarget(self, action: #selector(didTapBack), for: .touchUpInside)
    backButton.isHidden = true
    backButton.translatesAutoresizingMaskIntoConstraints = false
    backButton.contentEdgeInsets = UIEdgeInsets(top: 10, left: 10, bottom: 10, right: 10)
    navBar.addSubview(backButton)
    
    // Create Title label
    titleLabel = UILabel()
    titleLabel.text = "Snippets"
    titleLabel.font = UIFont.boldSystemFont(ofSize: 17.0)
    titleLabel.textColor = .darkGray
    titleLabel.textAlignment = .center
    titleLabel.numberOfLines = 1
    titleLabel.lineBreakMode = .byTruncatingTail
    titleLabel.translatesAutoresizingMaskIntoConstraints = false
    navBar.addSubview(titleLabel)
    
    // Create space button
    spaceButton = UIButton(type: .system)
    spaceButton.setImage(UIImage(systemName: "space"), for: .normal)
    spaceButton.tintColor = .darkGray
    spaceButton.addTarget(self, action: #selector(didTapSpace), for: .touchUpInside)
    spaceButton.translatesAutoresizingMaskIntoConstraints = false
    spaceButton.contentEdgeInsets = UIEdgeInsets(top: 10, left: 2, bottom: 10, right: 2)
    navBar.addSubview(spaceButton)
    
    // Create delete button
    deleteButton = UIButton(type: .system)
    deleteButton.setImage(UIImage(systemName: "delete.backward"), for: .normal)
    deleteButton.tintColor = .darkGray
    deleteButton.addTarget(self, action: #selector(didTouchDownDelete), for: .touchDown)
    deleteButton.addTarget(self, action: #selector(didTouchUpDelete), for: [.touchUpInside, .touchUpOutside, .touchCancel])
    deleteButton.translatesAutoresizingMaskIntoConstraints = false
    deleteButton.contentEdgeInsets = UIEdgeInsets(top: 10, left: 2, bottom: 10, right: 5)
    navBar.addSubview(deleteButton)
    
    // Create and constrain the table view below the nav bar
    tableView = UITableView()
    tableView.translatesAutoresizingMaskIntoConstraints = false
    tableView.delegate = self
    tableView.dataSource = self
    tableView.separatorStyle = .none
    tableView.backgroundColor = .systemGray5
    tableView.contentInset = UIEdgeInsets(top: 0, left: 0, bottom: 150, right: 0)
    tableView.register(SnippetCell.self, forCellReuseIdentifier: "Cell")
    view.addSubview(tableView)
    
    // Constrain the nav bar and subviews
    NSLayoutConstraint.activate([
      // Nav bar at the top
      navBar.topAnchor.constraint(equalTo: view.topAnchor),
      navBar.leadingAnchor.constraint(equalTo: view.leadingAnchor),
      navBar.trailingAnchor.constraint(equalTo: view.trailingAnchor),
      navBar.heightAnchor.constraint(equalToConstant: 50),
      
      // Settings button on the left
      //settingsButton.leadingAnchor.constraint(equalTo: navBar.leadingAnchor, constant: 5),
      //settingsButton.centerYAnchor.constraint(equalTo: navBar.centerYAnchor),
      
      // Back button on the left
      backButton.leadingAnchor.constraint(equalTo: navBar.leadingAnchor, constant: 5),
      backButton.centerYAnchor.constraint(equalTo: navBar.centerYAnchor),
      
      // Delete button on the right
      deleteButton.trailingAnchor.constraint(equalTo: navBar.trailingAnchor, constant: 0),
      deleteButton.centerYAnchor.constraint(equalTo: navBar.centerYAnchor),
      
      // Space button on the right
      spaceButton.trailingAnchor.constraint(equalTo: deleteButton.leadingAnchor, constant: 0),
      spaceButton.centerYAnchor.constraint(equalTo: navBar.centerYAnchor),
      
      // Title label in the center
      titleLabel.centerXAnchor.constraint(equalTo: navBar.centerXAnchor),
      titleLabel.centerYAnchor.constraint(equalTo: navBar.centerYAnchor),
      
      // Table view
      tableView.topAnchor.constraint(equalTo: navBar.bottomAnchor),
      tableView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
      tableView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
      tableView.heightAnchor.constraint(equalToConstant: 300)
    ])
  }
  
  func handleSnippetTap(_ snippet: Snippet) {
    if snippet.type == SnippetType.SINGLE.rawValue {
      insertText(snippet.content)
    } else if snippet.type == SnippetType.MULTIPLE.rawValue {
      // Push current state to stack
      snippetStack.append(currentSnippets)
      snippetTitleStack.append(titleLabel.text ?? "Snippets")
      
      // Show nested snippets
      if let childSnippets = snippet.child_snippets {
        self.currentSnippets = childSnippets
        tableView.reloadData()
        tableView.scrollToRow(at: IndexPath(row: 0, section: 0), at: .top, animated: false)
        
        // Update nav UI
        backButton.isHidden = false
        settingsButton.isHidden = true
        titleLabel.text = snippet.title
      }
    }
  }
  
  // MARK: - Back button
  @objc func didTapBack() {
    // Pop from snippet stack
    guard let previousSnippets = snippetStack.popLast(),
          let previousTitle = snippetTitleStack.popLast() else {
      return
    }
    
    currentSnippets = previousSnippets
    tableView.reloadData()
    
    // Update title
    titleLabel.text = previousTitle
    
    // If stack is empty, hide back button again
    if snippetStack.isEmpty {
      backButton.isHidden = true
      settingsButton.isHidden = false
    }
  }
  
  @objc func didTapSpace() {
    insertText(" ")
  }
  
  @objc func didTouchDownDelete() {
    deleteCharacter() // Immediate first delete
    deleteTimer = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { [weak self] _ in
      self?.deleteCharacter()
    }
  }
  
  @objc func didTouchUpDelete() {
    deleteTimer?.invalidate()
    deleteTimer = nil
  }
  
  private func deleteCharacter() {
    let proxy = textDocumentProxy as UITextDocumentProxy
    proxy.deleteBackward()
  }

  @objc func didTapSettings() {
    guard let url = URL(string: "snippeta://search") else { return }
    extensionContext?.open(url, completionHandler: nil)
  }
  
  func insertText(_ text: String) {
    let proxy = textDocumentProxy as UITextDocumentProxy
    proxy.insertText(text)
  }
}

// MARK: - UITableViewDelegate, UITableViewDataSource
extension KeyboardViewController: UITableViewDelegate, UITableViewDataSource {
  func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
    return currentSnippets.count
  }
  
  func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
    let snippet = currentSnippets[indexPath.row]
    let cell = tableView.dequeueReusableCell(withIdentifier: "Cell", for: indexPath)
    
    // Clean slate
    cell.backgroundColor = .clear
    cell.selectionStyle = .none
    cell.backgroundView = nil
    
    // Set rounded background view with color
    let backgroundView = UIView()
    backgroundView.layer.cornerRadius = 12
    backgroundView.layer.masksToBounds = true
    let backgroundGradientLayer = CAGradientLayer()
    let backgroundColors = themer.getColors(id: snippet.color_id)
    let isGradientColorBackground = backgroundColors.count > 1
    let firstBackgroundColor = backgroundColors[0]
    let backgroundGradientColors = isGradientColorBackground ? backgroundColors : [firstBackgroundColor, firstBackgroundColor]
    backgroundGradientLayer.colors = backgroundGradientColors.map { $0.cgColor }
    backgroundGradientLayer.startPoint = CGPoint(x: 0, y: 0.5)  // leading
    backgroundGradientLayer.endPoint = CGPoint(x: 1, y: 0.5)    // trailing
    backgroundView.layer.insertSublayer(backgroundGradientLayer, at: 0)
    cell.backgroundView = backgroundView
    
    // Configure label
    cell.textLabel?.text = snippet.title
    cell.textLabel?.textColor = UIColor(themer.getColor(key: (isGradientColorBackground ? "colorContent1ForegroundLight" : (firstBackgroundColor.isLightColor() ? "colorContent1ForegroundDark" : "colorContent1ForegroundLight"))))
    cell.textLabel?.font = UIFont.systemFont(ofSize: 16, weight: .medium)
    
    cell.accessoryType = snippet.type == SnippetType.MULTIPLE.rawValue ? .disclosureIndicator : .none
    
    return cell
  }
  
  func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
    let snippet = currentSnippets[indexPath.row]
    handleSnippetTap(snippet)
  }
  
  func tableView(_ tableView: UITableView, heightForRowAt indexPath: IndexPath) -> CGFloat {
    return 50
  }
  
  func tableView(_ tableView: UITableView, heightForFooterInSection section: Int) -> CGFloat {
    return 0.1
  }

}

class SnippetCell: UITableViewCell {
  override func layoutSubviews() {
    super.layoutSubviews()
    
    // Add padding around the background view
    let inset: CGFloat = 6
    backgroundView?.frame = bounds.insetBy(dx: inset, dy: 3)
    
    // Resize gradient to match new frame
    if let gradient = backgroundView?.layer.sublayers?.first as? CAGradientLayer {
      gradient.frame = backgroundView?.bounds ?? .zero
    }
  }
}
