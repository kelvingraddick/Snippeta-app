//
//  AppIntent.swift
//  SnippetaWidget
//
//  Created by Kelvin Graddick on 10/16/24.
//

import WidgetKit
import AppIntents

struct ConfigurationAppIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource { "Configuration" }
    static var description: IntentDescription { "This is an example widget." }
  
    @Parameter(title: "Snippet List 1")
    var snippetList1: SnippetList?
  
    @Parameter(title: "Snippet List 2")
    var snippetList2: SnippetList?
    
    @Parameter(title: "Snippet List 3")
    var snippetList3: SnippetList?
    
    @Parameter(title: "Snippet List 4")
    var snippetList4: SnippetList?

    init(snippetList1: SnippetList, snippetList2: SnippetList, snippetList3: SnippetList, snippetList4: SnippetList) {
      self.snippetList1 = snippetList1;
      self.snippetList2 = snippetList2;
      self.snippetList3 = snippetList3;
      self.snippetList4 = snippetList4;
    }

    init() {}
}

struct SnippetList: AppEntity, Decodable {
    let id: String
    let title: String
    let colorHexCode: String
    
    static var typeDisplayRepresentation: TypeDisplayRepresentation = "Snippet List"
    static var defaultQuery = SnippetListQuery()
            
    var displayRepresentation: DisplayRepresentation {
        DisplayRepresentation(title: "\(title)")
    }
}

struct SnippetListQuery: EntityQuery {
  private func fetchSnippetLists() -> [SnippetList] {
    let sharedDefaults = UserDefaults(suiteName: "group.com.wavelinkllc.snippeta.shared")
    guard let dataString = sharedDefaults?.string(forKey: "snippetLists"),
          let data = dataString.data(using: .utf8) else { return [] }
    do {
        return try JSONDecoder().decode([SnippetList].self, from: data)
    } catch {
        print("Error decoding snippet lists: \(error)")
        return []
    }
  }
  
  func entities(for identifiers: [SnippetList.ID]) async throws -> [SnippetList] {
      let allSnippetLists = fetchSnippetLists()
      return allSnippetLists
  }
  
  func suggestedEntities() async throws -> [SnippetList] {
      let allSnippetLists = fetchSnippetLists()
      return allSnippetLists.filter { $0.id != "0" }
  }
  
  func defaultResult() async -> SnippetList? {
      try? await suggestedEntities().first
  }
}
