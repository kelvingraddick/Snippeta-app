import Foundation

class Themer {
  
  private let defaultColor0 = "#fff" // white
  private let defaultColor1 = "#fad275" // lightYellow
  private let defaultColor2 = "#3098c5" // lightBlue
  private let defaultColor3 = "#fb7477" // lightRed
  private let defaultColor4 = "#a9cc8e" // lightGreen
  private let defaultColor5 = "#986b9b" // lightPurple
  private let defaultColor6 = "#f7f7f7" // lightGray
  private let defaultColor100 = "#5c63ff" // nebulaBlue
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
  
  public func getColor(id: Int) -> String {
    let mirror = Mirror(reflecting: currentColors)
    if let value = mirror.children.first(where: { $0.label == "color\(id)" })?.value as? String {
      return value
    }
    return defaultColor100
  }
}

struct Colors: Codable {
  let color0: String
  let color1: String
  let color2: String
  let color3: String
  let color4: String
  let color5: String
  let color6: String
  let color100: String
  
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
  
  init(color0: String, color1: String, color2: String, color3: String, color4: String, color5: String, color6: String, color100: String) {
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
    self.color0 = try container.decode(String.self, forKey: .color0)
    self.color1 = try container.decode(String.self, forKey: .color1)
    self.color2 = try container.decode(String.self, forKey: .color2)
    self.color3 = try container.decode(String.self, forKey: .color3)
    self.color4 = try container.decode(String.self, forKey: .color4)
    self.color5 = try container.decode(String.self, forKey: .color5)
    self.color6 = try container.decode(String.self, forKey: .color6)
    self.color100 = try container.decode(String.self, forKey: .color100)
  }
}
