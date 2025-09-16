import Foundation
import SwiftUI
import Kingfisher

// MARK: - API Models for iOS Integration

struct StickerPackage: Codable, Identifiable {
    let id: String
    let name: String
    let description: String?
    let categoryId: String
    let categoryName: String?
    let totalStickers: Int
    let stickers: [StickerFile]
    let platforms: [String]
    let isPremium: Bool
    let isFeatured: Bool
    let likesCount: Int
    let totalDownloads: Int
    let popularityRank: String
    let createdDate: String
    
    enum CodingKeys: String, CodingKey {
        case id, name, description, platforms, stickers
        case categoryId = "category_id"
        case categoryName = "category_name"
        case totalStickers = "total_stickers"
        case isPremium = "is_premium"
        case isFeatured = "is_featured"
        case likesCount = "likes_count"
        case totalDownloads = "total_downloads"
        case popularityRank = "popularity_rank"
        case createdDate = "created_date"
    }
}

struct StickerFile: Codable, Identifiable {
    let id: String
    let filename: String
    let url: String
    let fileSizeKb: Double?
    let dimensions: String?
    let orderIndex: Int
    
    enum CodingKeys: String, CodingKey {
        case id, filename, url, dimensions
        case fileSizeKb = "file_size_kb"
        case orderIndex = "order_index"
    }
}

struct HorizontalBanner: Codable, Identifiable {
    let id: String
    let title: String
    let description: String
    let imageUrl: String?
    let action: BannerAction
    let isActive: Bool
    let priority: Int
    let platforms: [String]
    let viewsCount: Int
    let clicksCount: Int
    
    enum CodingKeys: String, CodingKey {
        case id, title, description, action, platforms, priority
        case imageUrl = "image_url"
        case isActive = "is_active"
        case viewsCount = "views_count" 
        case clicksCount = "clicks_count"
    }
}

struct BannerAction: Codable {
    let type: String
    let value: String?
}

struct BannerSliderResponse: Codable {
    let banners: [HorizontalBanner]
    let config: SliderConfig
    let totalCount: Int
    
    enum CodingKeys: String, CodingKey {
        case banners, config
        case totalCount = "total_count"
    }
}

struct SliderConfig: Codable {
    let autoScroll: Bool
    let scrollIntervalSeconds: Int
    let showIndicators: Bool
    let infiniteLoop: Bool
    let swipeEnabled: Bool
    
    enum CodingKeys: String, CodingKey {
        case autoScroll = "auto_scroll"
        case scrollIntervalSeconds = "scroll_interval_seconds"
        case showIndicators = "show_indicators"
        case infiniteLoop = "infinite_loop"
        case swipeEnabled = "swipe_enabled"
    }
}

struct SocialMediaLinks: Codable {
    let links: [String: String]
    let showInApp: Bool
    let showInFooter: Bool
    
    enum CodingKeys: String, CodingKey {
        case links
        case showInApp = "show_in_app"
        case showInFooter = "show_in_footer"
    }
}

// MARK: - API Client for Backend Communication

class StickerAPIClient: ObservableObject {
    private let baseURL: String
    private let session = URLSession.shared
    
    init(baseURL: String) {
        self.baseURL = baseURL
    }
    
    // MARK: - Package Methods
    
    func getPackages(categoryId: String? = nil, 
                    platform: String = "ios",
                    sortBy: String = "popularity") async throws -> [StickerPackage] {
        var components = URLComponents(string: "\(baseURL)/api/packages")!
        components.queryItems = [
            URLQueryItem(name: "platform", value: platform),
            URLQueryItem(name: "sort_by", value: sortBy)
        ]
        
        if let categoryId = categoryId {
            components.queryItems?.append(URLQueryItem(name: "category_id", value: categoryId))
        }
        
        let (data, _) = try await session.data(from: components.url!)
        return try JSONDecoder().decode([StickerPackage].self, from: data)
    }
    
    func likePackage(packageId: String) async throws {
        let url = URL(string: "\(baseURL)/api/packages/\(packageId)/like")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        
        let (_, response) = try await session.data(for: request)
        
        if let httpResponse = response as? HTTPURLResponse,
           !(200...299).contains(httpResponse.statusCode) {
            throw APIError.invalidResponse
        }
    }
    
    func recordDownload(packageId: String, platform: String = "ios") async throws {
        let url = URL(string: "\(baseURL)/api/packages/\(packageId)/download")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = ["platform": platform]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        
        let (_, response) = try await session.data(for: request)
        
        if let httpResponse = response as? HTTPURLResponse,
           !(200...299).contains(httpResponse.statusCode) {
            throw APIError.invalidResponse
        }
    }
    
    // MARK: - Banner Methods
    
    func getBanners() async throws -> BannerSliderResponse {
        let url = URL(string: "\(baseURL)/api/public/banners")!
        let (data, _) = try await session.data(from: url)
        return try JSONDecoder().decode(BannerSliderResponse.self, from: data)
    }
    
    func recordBannerView(bannerId: String) async throws {
        let url = URL(string: "\(baseURL)/api/banners/\(bannerId)/view")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        
        let (_, _) = try await session.data(for: request)
    }
    
    func recordBannerClick(bannerId: String) async throws {
        let url = URL(string: "\(baseURL)/api/banners/\(bannerId)/click")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        
        let (_, _) = try await session.data(for: request)
    }
    
    // MARK: - Social Media Methods
    
    func getSocialMediaLinks() async throws -> SocialMediaLinks {
        let url = URL(string: "\(baseURL)/api/public/social-media")!
        let (data, _) = try await session.data(from: url)
        return try JSONDecoder().decode(SocialMediaLinks.self, from: data)
    }
}

enum APIError: Error {
    case invalidURL
    case invalidResponse
    case noData
}

// MARK: - SwiftUI Views for Integration

struct BannerSliderView: View {
    @StateObject private var apiClient = StickerAPIClient(baseURL: "YOUR_BACKEND_URL_HERE")
    @State private var banners: [HorizontalBanner] = []
    @State private var currentIndex = 0
    @State private var timer: Timer?
    @State private var config: SliderConfig?
    
    var body: some View {
        VStack {
            if !banners.isEmpty {
                TabView(selection: $currentIndex) {
                    ForEach(Array(banners.enumerated()), id: \.element.id) { index, banner in
                        BannerCardView(banner: banner, apiClient: apiClient)
                            .tag(index)
                            .onAppear {
                                recordBannerView(banner: banner)
                            }
                    }
                }
                .tabViewStyle(PageTabViewStyle(indexDisplayMode: .automatic))
                .frame(height: 200) // 2:1 ratio for 400px height banners
                .cornerRadius(12)
                .onAppear {
                    startAutoScroll()
                }
                .onDisappear {
                    stopAutoScroll()
                }
            } else {
                // Loading or empty state
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.gray.opacity(0.3))
                    .frame(height: 200)
                    .overlay(
                        ProgressView()
                    )
            }
        }
        .task {
            await loadBanners()
        }
    }
    
    private func loadBanners() async {
        do {
            let response = try await apiClient.getBanners()
            await MainActor.run {
                self.banners = response.banners.filter { $0.platforms.contains("ios") }
                self.config = response.config
            }
        } catch {
            print("Error loading banners: \(error)")
        }
    }
    
    private func startAutoScroll() {
        guard let config = config, config.autoScroll else { return }
        
        timer = Timer.scheduledTimer(withTimeInterval: TimeInterval(config.scrollIntervalSeconds), repeats: true) { _ in
            withAnimation(.easeInOut(duration: 0.5)) {
                currentIndex = (currentIndex + 1) % banners.count
            }
        }
    }
    
    private func stopAutoScroll() {
        timer?.invalidate()
        timer = nil
    }
    
    private func recordBannerView(banner: HorizontalBanner) {
        Task {
            try? await apiClient.recordBannerView(bannerId: banner.id)
        }
    }
}

struct BannerCardView: View {
    let banner: HorizontalBanner
    let apiClient: StickerAPIClient
    
    var body: some View {
        Button(action: {
            handleBannerTap()
        }) {
            ZStack(alignment: .bottomLeading) {
                // Background Image
                if let imageUrl = banner.imageUrl {
                    KFImage(URL(string: imageUrl))
                        .placeholder {
                            RoundedRectangle(cornerRadius: 12)
                                .fill(Color.gray.opacity(0.3))
                        }
                        .resizable()
                        .aspectRatio(2.0, contentMode: .fill) // 800x400 ratio
                        .clipped()
                } else {
                    RoundedRectangle(cornerRadius: 12)
                        .fill(LinearGradient(
                            colors: [Color.blue.opacity(0.6), Color.purple.opacity(0.6)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ))
                }
                
                // Overlay Content
                VStack(alignment: .leading, spacing: 4) {
                    Text(banner.title)
                        .font(.headline)
                        .foregroundColor(.white)
                        .shadow(radius: 2)
                    
                    Text(banner.description)
                        .font(.subheadline)
                        .foregroundColor(.white.opacity(0.9))
                        .shadow(radius: 1)
                        .lineLimit(2)
                }
                .padding()
            }
        }
        .buttonStyle(PlainButtonStyle())
    }
    
    private func handleBannerTap() {
        // Record click analytics
        Task {
            try? await apiClient.recordBannerClick(bannerId: banner.id)
        }
        
        // Handle banner action
        switch banner.action.type {
        case "external_link":
            if let urlString = banner.action.value,
               let url = URL(string: urlString) {
                UIApplication.shared.open(url)
            }
        case "package_detail":
            // Navigate to package detail
            if let packageId = banner.action.value {
                // Implement navigation to package detail
                print("Navigate to package: \(packageId)")
            }
        case "category":
            // Navigate to category
            if let categoryId = banner.action.value {
                // Implement navigation to category
                print("Navigate to category: \(categoryId)")
            }
        default:
            break
        }
    }
}

struct PackageGridView: View {
    @StateObject private var apiClient = StickerAPIClient(baseURL: "YOUR_BACKEND_URL_HERE")
    @State private var packages: [StickerPackage] = []
    @State private var likedPackages: Set<String> = []
    
    let columns = [
        GridItem(.flexible()),
        GridItem(.flexible())
    ]
    
    var body: some View {
        ScrollView {
            LazyVGrid(columns: columns, spacing: 16) {
                ForEach(packages) { package in
                    PackageCardView(
                        package: package,
                        isLiked: likedPackages.contains(package.id),
                        onLike: { packageId in
                            toggleLike(packageId: packageId)
                        },
                        onDownload: { packageId in
                            downloadPackage(packageId: packageId)
                        }
                    )
                }
            }
            .padding()
        }
        .task {
            await loadPackages()
        }
    }
    
    private func loadPackages() async {
        do {
            let loadedPackages = try await apiClient.getPackages()
            await MainActor.run {
                self.packages = loadedPackages
            }
        } catch {
            print("Error loading packages: \(error)")
        }
    }
    
    private func toggleLike(packageId: String) {
        if likedPackages.contains(packageId) {
            likedPackages.remove(packageId)
        } else {
            likedPackages.insert(packageId)
            
            // Record like on backend
            Task {
                try? await apiClient.likePackage(packageId: packageId)
            }
        }
    }
    
    private func downloadPackage(packageId: String) {
        Task {
            try? await apiClient.recordDownload(packageId: packageId)
            
            // Implement actual WhatsApp sticker download/sharing here
            print("Downloading package: \(packageId)")
        }
    }
}

struct PackageCardView: View {
    let package: StickerPackage
    let isLiked: Bool
    let onLike: (String) -> Void
    let onDownload: (String) -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Package Preview
            if let firstSticker = package.stickers.first {
                KFImage(URL(string: firstSticker.url))
                    .placeholder {
                        RoundedRectangle(cornerRadius: 8)
                            .fill(Color.gray.opacity(0.3))
                            .frame(height: 120)
                    }
                    .resizable()
                    .aspectRatio(1.0, contentMode: .fit)
                    .frame(height: 120)
                    .cornerRadius(8)
            }
            
            // Package Info
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(package.name)
                        .font(.headline)
                        .lineLimit(1)
                    
                    Spacer()
                    
                    Text(getPopularityEmoji(rank: package.popularityRank))
                        .font(.caption)
                }
                
                Text("\(package.totalStickers) stickers")
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                HStack {
                    // Like Button
                    Button(action: { onLike(package.id) }) {
                        HStack(spacing: 4) {
                            Image(systemName: isLiked ? "heart.fill" : "heart")
                                .foregroundColor(isLiked ? .red : .gray)
                            Text("\(package.likesCount)")
                                .font(.caption)
                        }
                    }
                    
                    Spacer()
                    
                    // Download Button
                    Button(action: { onDownload(package.id) }) {
                        HStack(spacing: 4) {
                            Image(systemName: "arrow.down.circle")
                            Text("\(package.totalDownloads)")
                                .font(.caption)
                        }
                    }
                    .foregroundColor(.blue)
                }
            }
            .padding(.horizontal, 8)
        }
        .background(Color.white)
        .cornerRadius(12)
        .shadow(radius: 2)
    }
    
    private func getPopularityEmoji(rank: String) -> String {
        if rank.contains("🔥") { return "🔥" }
        if rank.contains("⭐") { return "⭐" }
        if rank.contains("📈") { return "📈" }
        if rank.contains("👍") { return "👍" }
        return "📦"
    }
}

// MARK: - Usage Example

struct ContentView: View {
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                // Banner Slider
                BannerSliderView()
                
                // Package Grid
                PackageGridView()
            }
            .navigationTitle("Stickers")
        }
    }
}

// MARK: - Configuration

extension StickerAPIClient {
    static let shared = StickerAPIClient(baseURL: "https://your-backend-url.com")
}