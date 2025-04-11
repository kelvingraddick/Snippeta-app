import AppIntents

struct Snippet: AppEntity, Decodable, Hashable {
  let id: String
  let type: Int
  let source: String
  let title: String
  let content: String
  let color_id: Int
  let order_index: Int
  let child_snippets: [Snippet]?
  
  static var typeDisplayRepresentation: TypeDisplayRepresentation = "Snippet"
  static var defaultQuery = SnippetQuery()
  
  var displayRepresentation: DisplayRepresentation {
    DisplayRepresentation(title: "\(title)")
  }
  
  enum CodingKeys: String, CodingKey {
    case id
    case type
    case source
    case title
    case content
    case color_id
    case order_index
    case child_snippets
  }
  
  init(id: String, type: Int, source: String, title: String, content: String, color_id: Int, order_index: Int, child_snippets: [Snippet]?) {
    self.id = id
    self.type = type
    self.source = source
    self.title = title
    self.content = content
    self.color_id = color_id
    self.order_index = order_index
    self.child_snippets = child_snippets
  }
  
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: CodingKeys.self)
    
    // Attempt to decode `id` as a String first, then as a number if that fails
    if let idString = try? container.decode(String.self, forKey: .id) {
      self.id = idString
    } else if let idInt = try? container.decode(Int.self, forKey: .id) {
      self.id = String(idInt)
    } else {
      throw DecodingError.typeMismatch(String.self, DecodingError.Context(codingPath: decoder.codingPath, debugDescription: "Expected `id` to be a String or Int"))
    }
    
    // Decode other properties normally
    self.type = try container.decode(Int.self, forKey: .type)
    self.source = try container.decode(String.self, forKey: .source)
    self.title = try container.decode(String.self, forKey: .title)
    self.content = try container.decode(String.self, forKey: .content)
    self.color_id = try container.decode(Int.self, forKey: .color_id)
    self.order_index = try container.decode(Int.self, forKey: .order_index)
    self.child_snippets = try container.decodeIfPresent([Snippet].self, forKey: .child_snippets) ?? []
  }
}

struct SnippetQuery: EntityQuery {
  private func fetchSnippets() -> [Snippet] {
    let sharedDefaults = UserDefaults(suiteName: "group.com.wavelinkllc.snippeta.shared")
    guard let dataString = sharedDefaults?.string(forKey: "snippets"),
          let data = dataString.data(using: .utf8) else { return [] }
    do {
      let results = try JSONDecoder().decode([Snippet].self, from: data)
      print("Success decoding snippets: \(results.count)")
      return results
    } catch {
      print("Error decoding snippets: \(error)")
      return []
    }
  }
  
  func entities(for identifiers: [Snippet.ID]) async throws -> [Snippet] {
    let allSnippets = fetchSnippets()
    print("Fetched snippets entitles: \(allSnippets.count)")
    return allSnippets
  }
  
  func suggestedEntities() async throws -> [Snippet] {
    let allSnippets = fetchSnippets()
    print("Fetched snippets suggested entitles: \(allSnippets.count)")
    return allSnippets.filter { $0.id != "null" }
  }
  
  func defaultResult() async -> Snippet? {
    try? await suggestedEntities().first
  }
}
