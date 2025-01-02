import AppIntents

struct SnippetGroup: AppEntity, Decodable, Hashable {
  let id: String
  let type: Int
  let source: String
  let title: String
  let content: String
  let color_id: Int
  let order_index: Int
  let snippets: [SnippetGroup]?
  
  static var typeDisplayRepresentation: TypeDisplayRepresentation = "Snippet Group"
  static var defaultQuery = SnippetGroupQuery()
  
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
    case snippets
  }
  
  init(id: String, type: Int, source: String, title: String, content: String, color_id: Int, order_index: Int, snippets: [SnippetGroup]?) {
    self.id = id
    self.type = type
    self.source = source
    self.title = title
    self.content = content
    self.color_id = color_id
    self.order_index = order_index
    self.snippets = snippets
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
    self.snippets = try container.decodeIfPresent([SnippetGroup].self, forKey: .snippets) ?? []
  }
}

enum SnippetType: Int {
  case SINGLE = 0
  case MULTIPLE = 1
}

enum SnippetSource: String {
  case STORAGE = "On device"
  case API = "Cloud"
}

struct SnippetGroupQuery: EntityQuery {
  private func fetchSnippetGroups() -> [SnippetGroup] {
    let sharedDefaults = UserDefaults(suiteName: "group.com.wavelinkllc.snippeta.shared")
    guard let dataString = sharedDefaults?.string(forKey: "snippetGroups"),
          let data = dataString.data(using: .utf8) else { return [] }
    do {
      let results = try JSONDecoder().decode([SnippetGroup].self, from: data)
      print("Success decoding snippet groups: \(results.count)")
      return results
    } catch {
      print("Error decoding snippet groups: \(error)")
      return []
    }
  }
  
  func entities(for identifiers: [SnippetGroup.ID]) async throws -> [SnippetGroup] {
    let allSnippetGroups = fetchSnippetGroups()
    print("Fetched snippet groups entitles: \(allSnippetGroups.count)")
    return allSnippetGroups
  }
  
  func suggestedEntities() async throws -> [SnippetGroup] {
    let allSnippetGroups = fetchSnippetGroups()
    print("Fetched snippet groups suggested entitles: \(allSnippetGroups.count)")
    return allSnippetGroups.filter { $0.id != "null" }
  }
  
  func defaultResult() async -> SnippetGroup? {
    try? await suggestedEntities().first
  }
}
