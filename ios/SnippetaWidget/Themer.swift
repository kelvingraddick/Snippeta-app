import Foundation

class Themer {
  
  private let defaultColor0 = SnippetaColor(hexCode: "#fff") // white
  private let defaultColor1 = SnippetaColor(hexCode: "#fad275") // lightYellow
  private let defaultColor2 = SnippetaColor(hexCode: "#3098c5") // lightBlue
  private let defaultColor3 = SnippetaColor(hexCode: "#fb7477") // lightRed
  private let defaultColor4 = SnippetaColor(hexCode: "#a9cc8e") // lightGreen
  private let defaultColor5 = SnippetaColor(hexCode: "#986b9b") // lightPurple
  private let defaultColor6 = SnippetaColor(hexCode: "#f7f7f7") // lightGray
  private let defaultColor100 = SnippetaColor(hexCode: "#5c63ff") // nebulaBlue
  private let defaultColors: Colors
  private let currentColors: Colors
  
  init() {
    defaultColors = Colors(color0: defaultColor0, color1: defaultColor1, color2: defaultColor2, color3: defaultColor3, color4: defaultColor4, color5: defaultColor5, color6: defaultColor6, color100: defaultColor100)
    
    // get theme "colors" from shared user defaults
    let sharedDefaults = UserDefaults(suiteName: "group.com.wavelinkllc.snippeta.shared")
    guard let dataString = sharedDefaults?.string(forKey: "colors"),
          let data = dataString.data(using: .utf8) else { currentColors = defaultColors; return }
    do {
      let results = try JSONDecoder().decode(Colors.self, from: data)
      print("Success decoding colors. Color 0 is: \(results.color0)")
      currentColors = results
    } catch {
      print("Error decoding colors: \(error)")
      currentColors = defaultColors
    }
  }
  
  public func getColor(id: Int) -> SnippetaColor {
    let mirror = Mirror(reflecting: currentColors)
    if let value = mirror.children.first(where: { $0.label == "color\(id)" })?.value as? SnippetaColor {
      return value
    }
    return defaultColor100
  }
}

struct Colors: Codable {
  let color0: SnippetaColor
  let color1: SnippetaColor
  let color2: SnippetaColor
  let color3: SnippetaColor
  let color4: SnippetaColor
  let color5: SnippetaColor
  let color6: SnippetaColor
  let color100: SnippetaColor
  
  enum CodingKeys: String, CodingKey {
    case color0 = "0"
    case color1 = "1"
    case color2 = "2"
    case color3 = "3"
    case color4 = "4"
    case color5 = "5"
    case color6 = "6"
    case color100 = "100"
  }
  
  init(color0: SnippetaColor, color1: SnippetaColor, color2: SnippetaColor, color3: SnippetaColor, color4: SnippetaColor, color5: SnippetaColor, color6: SnippetaColor, color100: SnippetaColor) {
    self.color0 = color0
    self.color1 = color1
    self.color2 = color2
    self.color3 = color3
    self.color4 = color4
    self.color5 = color5
    self.color6 = color6
    self.color100 = color100
  }
  
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: CodingKeys.self)
    self.color0 = try container.decode(SnippetaColor.self, forKey: .color0)
    self.color1 = try container.decode(SnippetaColor.self, forKey: .color1)
    self.color2 = try container.decode(SnippetaColor.self, forKey: .color2)
    self.color3 = try container.decode(SnippetaColor.self, forKey: .color3)
    self.color4 = try container.decode(SnippetaColor.self, forKey: .color4)
    self.color5 = try container.decode(SnippetaColor.self, forKey: .color5)
    self.color6 = try container.decode(SnippetaColor.self, forKey: .color6)
    self.color100 = try container.decode(SnippetaColor.self, forKey: .color100)
  }
}

struct SnippetaColor: Codable {
  let hexCode: String
  
  enum CodingKeys: String, CodingKey {
    case hexCode
  }
  
  init(hexCode: String) {
    self.hexCode = hexCode
  }
  
  init(from decoder: Decoder) throws {
    let container = try decoder.container(keyedBy: CodingKeys.self)
    self.hexCode = try container.decode(String.self, forKey: .hexCode)
  }
}
