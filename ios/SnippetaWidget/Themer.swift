import Foundation
import SwiftUI

class Themer {
  
  private let defaultColor = "#000000"
  private let defaultColor0 = [Color.white]
  private let defaultColor1 = [Color.orange, Color.darkOrange]
  private let defaultColor2 = [Color.darkBlue, Color.blue]
  private let defaultColor3 = [Color.red, Color.lightRed]
  private let defaultColor4 = [Color.green, Color.lightGreen]
  private let defaultColor5 = [Color.darkYellow, Color.yellow]
  private let defaultColor6 = [Color.purple, Color.lightPurple]
  private let defaultColor100 = [Color.orange]
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
  
  public func getColor(id: Int) -> Color {
    let mirror = Mirror(reflecting: currentColors)
    if let value = mirror.children.first(where: { $0.label == "color\(id)" })?.value as? [String] {
      return Color(hex: value.first ?? defaultColor100.first ?? defaultColor) ?? Color.primary
    }
    return Color(hex: defaultColor100.first ?? defaultColor) ?? Color.primary
  }
  
  public func getColors(id: Int) -> [Color] {
    let mirror = Mirror(reflecting: currentColors)
    if let value = mirror.children.first(where: { $0.label == "color\(id)" })?.value as? [String] {
      return value.map { Color(hex: $0) ?? Color.primary }
    }
    return defaultColor100.map { Color(hex: $0) ?? Color.primary }
  }
}

struct Colors: Codable {
  let color0: [String]
  let color1: [String]
  let color2: [String]
  let color3: [String]
  let color4: [String]
  let color5: [String]
  let color6: [String]
  let color100: [String]
  
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
    self.color0 = [color0]
    self.color1 = [color1]
    self.color2 = [color2]
    self.color3 = [color3]
    self.color4 = [color4]
    self.color5 = [color5]
    self.color6 = [color6]
    self.color100 = [color100]
  }
  
  init(color0: [String], color1: [String], color2: [String], color3: [String], color4: [String], color5: [String], color6: [String], color100: [String]) {
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
    self.color0 = try Colors.decode(key: .color0, decoder: decoder)
    self.color1 = try Colors.decode(key: .color1, decoder: decoder)
    self.color2 = try Colors.decode(key: .color2, decoder: decoder)
    self.color3 = try Colors.decode(key: .color3, decoder: decoder)
    self.color4 = try Colors.decode(key: .color4, decoder: decoder)
    self.color5 = try Colors.decode(key: .color5, decoder: decoder)
    self.color6 = try Colors.decode(key: .color6, decoder: decoder)
    self.color100 = try Colors.decode(key: .color100, decoder: decoder)
  }
  
  private static func decode(key: Colors.CodingKeys, decoder: Decoder) throws -> [String] {
    let container = try decoder.container(keyedBy: CodingKeys.self)
    // Attempt to decode the value at the key as a String first, then as a String array if that fails
    if let colorString = try? container.decode(String.self, forKey: key) {
      return [colorString]
    } else if let colorStringArray = try? container.decode([String].self, forKey: key) {
      return colorStringArray
    } else {
      throw DecodingError.typeMismatch(String.self, DecodingError.Context(codingPath: decoder.codingPath, debugDescription: "Expected key to be a String or [String]"))
    }
  }
}
