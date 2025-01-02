import SwiftUI

extension Color {
  init?(hex: String) {
    var hexSanitized = hex.trimmingCharacters(in: .whitespacesAndNewlines)
    hexSanitized = hexSanitized.replacingOccurrences(of: "#", with: "")
    
    var rgb: UInt64 = 0
    
    var r: CGFloat = 0.0
    var g: CGFloat = 0.0
    var b: CGFloat = 0.0
    var a: CGFloat = 1.0
    
    let length = hexSanitized.count
    
    guard Scanner(string: hexSanitized).scanHexInt64(&rgb) else { return nil }
    
    if length == 6 {
      r = CGFloat((rgb & 0xFF0000) >> 16) / 255.0
      g = CGFloat((rgb & 0x00FF00) >> 8) / 255.0
      b = CGFloat(rgb & 0x0000FF) / 255.0
      
    } else if length == 8 {
      r = CGFloat((rgb & 0xFF000000) >> 24) / 255.0
      g = CGFloat((rgb & 0x00FF0000) >> 16) / 255.0
      b = CGFloat((rgb & 0x0000FF00) >> 8) / 255.0
      a = CGFloat(rgb & 0x000000FF) / 255.0
      
    } else {
      return nil
    }
    
    self.init(red: r, green: g, blue: b, opacity: a)
  }
  
  static let white = "#fff"
  static let black = "#000"
  static let gray = "#dfdfdf"
  static let darkGray = "#1d2027"
  static let mediumGray = "#2e323e"
  static let whiteGray = "#f5f5f5"
  static let lightGray = "#f7f7f7"
  static let orange = "#ff9966"
  static let darkOrange = "#ff5e62"
  static let blue = "#0082c8"
  static let darkBlue = "#667db6"
  static let red = "#D66D75"
  static let lightRed = "#E29587"
  static let green = "#76b852"
  static let lightGreen = "#8DC26F"
  static let yellow = "#F9DF7B"
  static let darkYellow = "#FBD07C"
  static let purple = "#696EFF"
  static let lightPurple = "#9581FF"
  static let nebulaBlue = "#5c63ff"
}
