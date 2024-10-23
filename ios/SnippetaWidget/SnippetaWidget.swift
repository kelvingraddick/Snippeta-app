//
//  SnippetaWidget.swift
//  SnippetaWidget
//
//  Created by Kelvin Graddick on 10/16/24.
//

import WidgetKit
import SwiftUI

struct Provider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), configuration: ConfigurationAppIntent())
    }

    func snapshot(for configuration: ConfigurationAppIntent, in context: Context) async -> SimpleEntry {
      SimpleEntry(date: Date(), configuration: configuration)
    }
    
    func timeline(for configuration: ConfigurationAppIntent, in context: Context) async -> Timeline<SimpleEntry> {
        var entries: [SimpleEntry] = []

        // Generate a timeline consisting of five entries an hour apart, starting from the current date.
        let currentDate = Date()
        for hourOffset in 0 ..< 5 {
            let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate)!
          let entry = SimpleEntry(date: entryDate, configuration: configuration)
            entries.append(entry)
        }

        return Timeline(entries: entries, policy: .atEnd)
    }

//    func relevances() async -> WidgetRelevances<ConfigurationAppIntent> {
//        // Generate a list containing the contexts this widget is relevant in.
//    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let configuration: ConfigurationAppIntent
}

struct SnippetaWidgetEntryView : View {
    var entry: Provider.Entry

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
          
            HStack(alignment: .center, spacing: 5) {
              Image(systemName: "rectangle.stack.fill")
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(height: 20)
                //.padding([.top], 3)
                .opacity(0.25)
              
              Text(entry.configuration.snippetList?.title ?? "No snippet list selected")
                .font(.footnote)
                .bold()
            }
            
            Spacer()
            
            HStack(alignment: .center) {
              Link(destination: URL(string: "snippeta://search")!) {
                Button(action: {
                  
                }) {
                  Image(systemName: "magnifyingglass")
                    .foregroundColor(.primary)
                    .frame(maxWidth: .infinity, maxHeight: 30)
                    .opacity(0.5)
                }
                .buttonStyle(.plain)
                .background(Color.white.opacity(0.10))
                .cornerRadius(8)
              }
              
              Link(destination: URL(string: "snippeta://add")!) {
                Button(action: {
                  // Action for plus button
                  print("Plus button tapped")
                }) {
                  Image(systemName: "plus")
                    .foregroundColor(.primary)
                    .frame(maxWidth: .infinity, maxHeight: 30)
                    .opacity(0.5)
                }
                .buttonStyle(.plain)
                .background(Color.white.opacity(0.10))
                .cornerRadius(8)
              }
            }
            .frame(maxWidth: .infinity)
        }
        .containerBackground(for: .widget) {
          backgroundGradient
        }
        .widgetURL(URL(string: "snippeta://snippets/\(entry.configuration.snippetList?.id ?? "")")!)
    }
}

let backgroundGradient = LinearGradient(
    colors: [Color(hexStringToUIColor(hex: "fe9567")), Color(hexStringToUIColor(hex: "ff6264"))],
    startPoint: .topLeading, endPoint: .bottomTrailing)

func hexStringToUIColor (hex:String) -> UIColor {
    var cString:String = hex.trimmingCharacters(in: .whitespacesAndNewlines).uppercased()

    if (cString.hasPrefix("#")) {
        cString.remove(at: cString.startIndex)
    }

    if ((cString.count) != 6) {
        return UIColor.gray
    }

    var rgbValue:UInt64 = 0
    Scanner(string: cString).scanHexInt64(&rgbValue)

    return UIColor(
        red: CGFloat((rgbValue & 0xFF0000) >> 16) / 255.0,
        green: CGFloat((rgbValue & 0x00FF00) >> 8) / 255.0,
        blue: CGFloat(rgbValue & 0x0000FF) / 255.0,
        alpha: CGFloat(1.0)
    )
}

struct SnippetaWidget: Widget {
    let kind: String = "SnippetaWidget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: ConfigurationAppIntent.self, provider: Provider()) { entry in
            SnippetaWidgetEntryView(entry: entry)
        }
    }
}

extension ConfigurationAppIntent {
    fileprivate static var defaultSnippetList: ConfigurationAppIntent {
        let intent = ConfigurationAppIntent()
        intent.snippetList = SnippetList(id: "", title: "Snippets")
        return intent
    }
}

#Preview(as: .systemSmall) {
    SnippetaWidget()
} timeline: {
  SimpleEntry(date: .now, configuration: .defaultSnippetList)
}
