import AppIntents

struct SnippetList: AppEntity, Decodable, Hashable {
  let id: String
  let type: Int
  let source: String
  let title: String
  let content: String
  let color_id: Int
  var colorHexCode: String {
    switch color_id {
      case 0: return "#fff"; // white
      case 6: return "#f7f7f7"; // lightGray
      case 1: return "#fad275"; // lightYellow
      case 4: return "#a9cc8e"; // lightGreen
      case 2: return "#3098c5"; // lightBlue
      case 5: return "#986b9b"; // lightPurple
      case 3: return "#fb7477"; // lightRed
      default: return "#5c63ff"; // nebulaBlue
    }
  }
  let order_index: Int
  let snippets: [SnippetList]?
  
  static var typeDisplayRepresentation: TypeDisplayRepresentation = "Snippet List"
  static var defaultQuery = SnippetListQuery()
  
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
  
  init(id: String, type: Int, source: String, title: String, content: String, color_id: Int, order_index: Int, snippets: [SnippetList]?) {
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
    self.snippets = try container.decodeIfPresent([SnippetList].self, forKey: .snippets) ?? []
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

struct SnippetListQuery: EntityQuery {
  private func fetchSnippetLists() -> [SnippetList] {
    let sharedDefaults = UserDefaults(suiteName: "group.com.wavelinkllc.snippeta.shared")
    guard let dataString = sharedDefaults?.string(forKey: "snippetLists"),
          let data = dataString.data(using: .utf8) else { return [] }
    do {
      let results = try JSONDecoder().decode([SnippetList].self, from: data)
      print("Success decoding snippet lists: \(results.count)")
      return results
    } catch {
      print("Error decoding snippet lists: \(error)")
      return []
    }
  }
  
  func entities(for identifiers: [SnippetList.ID]) async throws -> [SnippetList] {
    let allSnippetLists = fetchSnippetLists()
    print("Fetched snippet lists entitles: \(allSnippetLists.count)")
    return allSnippetLists
  }
  
  func suggestedEntities() async throws -> [SnippetList] {
    let allSnippetLists = fetchSnippetLists()
    print("Fetched snippet lists suggested entitles: \(allSnippetLists.count)")
    return allSnippetLists.filter { $0.id != "null" }
  }
  
  func defaultResult() async -> SnippetList? {
    try? await suggestedEntities().first
  }
}
