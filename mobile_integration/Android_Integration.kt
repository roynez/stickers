// Android Integration for WhatsApp Sticker App
// Add these dependencies to your app/build.gradle:
/*
dependencies {
    implementation 'com.squareup.retrofit2:retrofit:2.9.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
    implementation 'com.squareup.okhttp3:logging-interceptor:4.11.0'
    implementation 'com.github.bumptech.glide:glide:4.15.1'
    implementation 'androidx.lifecycle:lifecycle-viewmodel-ktx:2.7.0'
    implementation 'androidx.lifecycle:lifecycle-livedata-ktx:2.7.0'
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3'
    implementation 'androidx.fragment:fragment-ktx:1.6.1'
    implementation 'androidx.viewpager2:viewpager2:1.0.0'
}
*/

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.*
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import com.google.gson.annotations.SerializedName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import androidx.viewpager2.widget.ViewPager2
import com.bumptech.glide.Glide
import com.bumptech.glide.load.resource.bitmap.RoundedCorners
import com.bumptech.glide.request.RequestOptions
import kotlinx.coroutines.launch
import java.util.concurrent.TimeUnit

// MARK: - Data Models

data class StickerPackage(
    val id: String,
    val name: String,
    val description: String?,
    @SerializedName("category_id") val categoryId: String,
    @SerializedName("category_name") val categoryName: String?,
    @SerializedName("total_stickers") val totalStickers: Int,
    val stickers: List<StickerFile>,
    val platforms: List<String>,
    @SerializedName("is_premium") val isPremium: Boolean,
    @SerializedName("is_featured") val isFeatured: Boolean,
    @SerializedName("likes_count") val likesCount: Int,
    @SerializedName("total_downloads") val totalDownloads: Int,
    @SerializedName("popularity_rank") val popularityRank: String,
    @SerializedName("created_date") val createdDate: String
)

data class StickerFile(
    val id: String,
    val filename: String,
    val url: String,
    @SerializedName("file_size_kb") val fileSizeKb: Double?,
    val dimensions: String?,
    @SerializedName("order_index") val orderIndex: Int
)

data class HorizontalBanner(
    val id: String,
    val title: String,
    val description: String,
    @SerializedName("image_url") val imageUrl: String?,
    val action: BannerAction,
    @SerializedName("is_active") val isActive: Boolean,
    val priority: Int,
    val platforms: List<String>,
    @SerializedName("views_count") val viewsCount: Int,
    @SerializedName("clicks_count") val clicksCount: Int
)

data class BannerAction(
    val type: String,
    val value: String?
)

data class BannerSliderResponse(
    val banners: List<HorizontalBanner>,
    val config: SliderConfig,
    @SerializedName("total_count") val totalCount: Int
)

data class SliderConfig(
    @SerializedName("auto_scroll") val autoScroll: Boolean,
    @SerializedName("scroll_interval_seconds") val scrollIntervalSeconds: Int,
    @SerializedName("show_indicators") val showIndicators: Boolean,
    @SerializedName("infinite_loop") val infiniteLoop: Boolean,
    @SerializedName("swipe_enabled") val swipeEnabled: Boolean
)

data class SocialMediaLinks(
    val links: Map<String, String>,
    @SerializedName("show_in_app") val showInApp: Boolean,
    @SerializedName("show_in_footer") val showInFooter: Boolean
)

data class DownloadRequest(
    val platform: String = "android"
)

// MARK: - API Interface

interface StickerApiService {
    
    @GET("packages")
    suspend fun getPackages(
        @Query("category_id") categoryId: String? = null,
        @Query("platform") platform: String = "android",
        @Query("sort_by") sortBy: String = "popularity"
    ): List<StickerPackage>
    
    @POST("packages/{packageId}/like")
    suspend fun likePackage(@Path("packageId") packageId: String)
    
    @POST("packages/{packageId}/download")
    suspend fun recordDownload(
        @Path("packageId") packageId: String,
        @Body request: DownloadRequest = DownloadRequest()
    )
    
    @GET("public/banners")
    suspend fun getBanners(): BannerSliderResponse
    
    @POST("banners/{bannerId}/view")
    suspend fun recordBannerView(@Path("bannerId") bannerId: String)
    
    @POST("banners/{bannerId}/click")
    suspend fun recordBannerClick(@Path("bannerId") bannerId: String)
    
    @GET("public/social-media")
    suspend fun getSocialMediaLinks(): SocialMediaLinks
}

// MARK: - API Client

class StickerApiClient private constructor() {
    
    companion object {
        @Volatile
        private var INSTANCE: StickerApiClient? = null
        
        fun getInstance(baseUrl: String = "https://your-backend-url.com/api/"): StickerApiClient {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: buildApiClient(baseUrl).also { INSTANCE = it }
            }
        }
        
        private fun buildApiClient(baseUrl: String): StickerApiClient {
            val logging = HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            }
            
            val client = OkHttpClient.Builder()
                .addInterceptor(logging)
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .build()
            
            val retrofit = Retrofit.Builder()
                .baseUrl(baseUrl)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build()
            
            return StickerApiClient().apply {
                apiService = retrofit.create(StickerApiService::class.java)
            }
        }
    }
    
    private lateinit var apiService: StickerApiService
    
    suspend fun getPackages(
        categoryId: String? = null,
        sortBy: String = "popularity"
    ): Result<List<StickerPackage>> {
        return try {
            val packages = apiService.getPackages(categoryId, "android", sortBy)
            Result.success(packages)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun likePackage(packageId: String): Result<Unit> {
        return try {
            apiService.likePackage(packageId)
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun recordDownload(packageId: String): Result<Unit> {
        return try {
            apiService.recordDownload(packageId)
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getBanners(): Result<BannerSliderResponse> {
        return try {
            val response = apiService.getBanners()
            // Filter banners for Android platform
            val androidBanners = response.banners.filter { it.platforms.contains("android") }
            Result.success(response.copy(banners = androidBanners))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun recordBannerView(bannerId: String): Result<Unit> {
        return try {
            apiService.recordBannerView(bannerId)
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun recordBannerClick(bannerId: String): Result<Unit> {
        return try {
            apiService.recordBannerClick(bannerId)
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getSocialMediaLinks(): Result<SocialMediaLinks> {
        return try {
            val links = apiService.getSocialMediaLinks()
            Result.success(links)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

// MARK: - ViewModels

class StickerViewModel : ViewModel() {
    private val apiClient = StickerApiClient.getInstance()
    
    suspend fun getPackages(categoryId: String? = null): List<StickerPackage> {
        return apiClient.getPackages(categoryId).getOrElse { emptyList() }
    }
    
    suspend fun likePackage(packageId: String): Boolean {
        return apiClient.likePackage(packageId).isSuccess
    }
    
    suspend fun downloadPackage(packageId: String): Boolean {
        return apiClient.recordDownload(packageId).isSuccess
    }
}

class BannerViewModel : ViewModel() {
    private val apiClient = StickerApiClient.getInstance()
    
    suspend fun getBanners(): BannerSliderResponse? {
        return apiClient.getBanners().getOrNull()
    }
    
    suspend fun recordBannerView(bannerId: String) {
        apiClient.recordBannerView(bannerId)
    }
    
    suspend fun recordBannerClick(bannerId: String) {
        apiClient.recordBannerClick(bannerId)
    }
}

// MARK: - Banner Slider Implementation

class BannerSliderFragment : Fragment() {
    
    private lateinit var viewPager: ViewPager2
    private lateinit var bannerAdapter: BannerSliderAdapter
    private lateinit var viewModel: BannerViewModel
    private var autoScrollHandler: Handler? = null
    private var autoScrollRunnable: Runnable? = null
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_banner_slider, container, false)
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        viewModel = ViewModelProvider(this)[BannerViewModel::class.java]
        setupViews(view)
        loadBanners()
    }
    
    private fun setupViews(view: View) {
        viewPager = view.findViewById(R.id.banner_viewpager)
        bannerAdapter = BannerSliderAdapter { banner ->
            handleBannerClick(banner)
        }
        viewPager.adapter = bannerAdapter
        
        // Setup page change callback for view tracking
        viewPager.registerOnPageChangeCallback(object : ViewPager2.OnPageChangeCallback() {
            override fun onPageSelected(position: Int) {
                super.onPageSelected(position)
                val banner = bannerAdapter.getBannerAt(position)
                banner?.let { recordBannerView(it) }
            }
        })
    }
    
    private fun loadBanners() {
        lifecycleScope.launch {
            viewModel.getBanners()?.let { response ->
                bannerAdapter.setBanners(response.banners)
                if (response.config.autoScroll) {
                    startAutoScroll(response.config.scrollIntervalSeconds)
                }
            }
        }
    }
    
    private fun startAutoScroll(intervalSeconds: Int) {
        autoScrollHandler = Handler(Looper.getMainLooper())
        autoScrollRunnable = object : Runnable {
            override fun run() {
                val currentItem = viewPager.currentItem
                val nextItem = if (currentItem < bannerAdapter.itemCount - 1) {
                    currentItem + 1
                } else {
                    0
                }
                viewPager.setCurrentItem(nextItem, true)
                autoScrollHandler?.postDelayed(this, intervalSeconds * 1000L)
            }
        }
        autoScrollHandler?.postDelayed(autoScrollRunnable!!, intervalSeconds * 1000L)
    }
    
    private fun stopAutoScroll() {
        autoScrollRunnable?.let { autoScrollHandler?.removeCallbacks(it) }
        autoScrollHandler = null
        autoScrollRunnable = null
    }
    
    private fun handleBannerClick(banner: HorizontalBanner) {
        lifecycleScope.launch {
            viewModel.recordBannerClick(banner.id)
        }
        
        when (banner.action.type) {
            "external_link" -> {
                banner.action.value?.let { url ->
                    try {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                        startActivity(intent)
                    } catch (e: Exception) {
                        // Handle error - invalid URL or no app to handle
                    }
                }
            }
            "package_detail" -> {
                banner.action.value?.let { packageId ->
                    // Navigate to package detail
                    // Implement your navigation logic here
                }
            }
            "category" -> {
                banner.action.value?.let { categoryId ->
                    // Navigate to category
                    // Implement your navigation logic here
                }
            }
        }
    }
    
    private fun recordBannerView(banner: HorizontalBanner) {
        lifecycleScope.launch {
            viewModel.recordBannerView(banner.id)
        }
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        stopAutoScroll()
    }
}

// MARK: - Banner Adapter

class BannerSliderAdapter(
    private val onBannerClick: (HorizontalBanner) -> Unit
) : RecyclerView.Adapter<BannerSliderAdapter.BannerViewHolder>() {
    
    private val banners = mutableListOf<HorizontalBanner>()
    
    fun setBanners(newBanners: List<HorizontalBanner>) {
        banners.clear()
        banners.addAll(newBanners)
        notifyDataSetChanged()
    }
    
    fun getBannerAt(position: Int): HorizontalBanner? {
        return if (position < banners.size) banners[position] else null
    }
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): BannerViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_banner, parent, false)
        return BannerViewHolder(view)
    }
    
    override fun onBindViewHolder(holder: BannerViewHolder, position: Int) {
        holder.bind(banners[position], onBannerClick)
    }
    
    override fun getItemCount(): Int = banners.size
    
    class BannerViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val bannerImage: ImageView = itemView.findViewById(R.id.banner_image)
        private val bannerTitle: TextView = itemView.findViewById(R.id.banner_title)
        private val bannerDescription: TextView = itemView.findViewById(R.id.banner_description)
        
        fun bind(banner: HorizontalBanner, onBannerClick: (HorizontalBanner) -> Unit) {
            bannerTitle.text = banner.title
            bannerDescription.text = banner.description
            
            // Load banner image with Glide
            banner.imageUrl?.let { imageUrl ->
                Glide.with(itemView.context)
                    .load(imageUrl)
                    .apply(RequestOptions().transform(RoundedCorners(16)))
                    .placeholder(R.drawable.banner_placeholder)
                    .error(R.drawable.banner_error)
                    .into(bannerImage)
            }
            
            itemView.setOnClickListener {
                onBannerClick(banner)
            }
        }
    }
}

// MARK: - Package Grid Implementation

class PackageGridFragment : Fragment() {
    
    private lateinit var recyclerView: RecyclerView
    private lateinit var packageAdapter: PackageGridAdapter
    private lateinit var viewModel: StickerViewModel
    private val likedPackages = mutableSetOf<String>()
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_package_grid, container, false)
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        viewModel = ViewModelProvider(this)[StickerViewModel::class.java]
        setupRecyclerView(view)
        loadPackages()
    }
    
    private fun setupRecyclerView(view: View) {
        recyclerView = view.findViewById(R.id.packages_recycler_view)
        recyclerView.layoutManager = GridLayoutManager(context, 2)
        
        packageAdapter = PackageGridAdapter(
            onLikeClick = { packageId -> toggleLike(packageId) },
            onDownloadClick = { packageId -> downloadPackage(packageId) },
            likedPackages = likedPackages
        )
        
        recyclerView.adapter = packageAdapter
    }
    
    private fun loadPackages() {
        lifecycleScope.launch {
            val packages = viewModel.getPackages()
            packageAdapter.setPackages(packages)
        }
    }
    
    private fun toggleLike(packageId: String) {
        if (likedPackages.contains(packageId)) {
            likedPackages.remove(packageId)
        } else {
            likedPackages.add(packageId)
            lifecycleScope.launch {
                viewModel.likePackage(packageId)
            }
        }
        packageAdapter.notifyDataSetChanged()
    }
    
    private fun downloadPackage(packageId: String) {
        lifecycleScope.launch {
            if (viewModel.downloadPackage(packageId)) {
                // Implement WhatsApp sticker sharing here
                // This would involve creating and sharing the sticker pack
            }
        }
    }
}

// MARK: - Package Adapter

class PackageGridAdapter(
    private val onLikeClick: (String) -> Unit,
    private val onDownloadClick: (String) -> Unit,
    private val likedPackages: Set<String>
) : RecyclerView.Adapter<PackageGridAdapter.PackageViewHolder>() {
    
    private val packages = mutableListOf<StickerPackage>()
    
    fun setPackages(newPackages: List<StickerPackage>) {
        packages.clear()
        packages.addAll(newPackages)
        notifyDataSetChanged()
    }
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): PackageViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_package, parent, false)
        return PackageViewHolder(view)
    }
    
    override fun onBindViewHolder(holder: PackageViewHolder, position: Int) {
        holder.bind(packages[position], likedPackages, onLikeClick, onDownloadClick)
    }
    
    override fun getItemCount(): Int = packages.size
    
    class PackageViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val packageImage: ImageView = itemView.findViewById(R.id.package_image)
        private val packageName: TextView = itemView.findViewById(R.id.package_name)
        private val stickerCount: TextView = itemView.findViewById(R.id.sticker_count)
        private val popularityRank: TextView = itemView.findViewById(R.id.popularity_rank)
        private val likeButton: View = itemView.findViewById(R.id.like_button)
        private val likeCount: TextView = itemView.findViewById(R.id.like_count)
        private val downloadButton: View = itemView.findViewById(R.id.download_button)
        private val downloadCount: TextView = itemView.findViewById(R.id.download_count)
        
        fun bind(
            package: StickerPackage,
            likedPackages: Set<String>,
            onLikeClick: (String) -> Unit,
            onDownloadClick: (String) -> Unit
        ) {
            packageName.text = package.name
            stickerCount.text = "${package.totalStickers} stickers"
            popularityRank.text = getPopularityEmoji(package.popularityRank)
            likeCount.text = package.likesCount.toString()
            downloadCount.text = package.totalDownloads.toString()
            
            // Load package preview (first sticker)
            package.stickers.firstOrNull()?.let { firstSticker ->
                Glide.with(itemView.context)
                    .load(firstSticker.url)
                    .apply(RequestOptions().transform(RoundedCorners(12)))
                    .placeholder(R.drawable.sticker_placeholder)
                    .into(packageImage)
            }
            
            // Update like button state
            val isLiked = likedPackages.contains(package.id)
            likeButton.isSelected = isLiked
            
            // Set click listeners
            likeButton.setOnClickListener { onLikeClick(package.id) }
            downloadButton.setOnClickListener { onDownloadClick(package.id) }
        }
        
        private fun getPopularityEmoji(rank: String): String {
            return when {
                rank.contains("🔥") -> "🔥"
                rank.contains("⭐") -> "⭐"
                rank.contains("📈") -> "📈"
                rank.contains("👍") -> "👍"
                else -> "📦"
            }
        }
    }
}

// MARK: - Layout Files (XML)

/*
// res/layout/fragment_banner_slider.xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout 
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:padding="16dp">

    <androidx.viewpager2.widget.ViewPager2
        android:id="@+id/banner_viewpager"
        android:layout_width="0dp"
        android:layout_height="200dp"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>

// res/layout/item_banner.xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.cardview.widget.CardView 
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="200dp"
    app:cardCornerRadius="12dp"
    app:cardElevation="4dp">

    <androidx.constraintlayout.widget.ConstraintLayout
        android:layout_width="match_parent"
        android:layout_height="match_parent">

        <ImageView
            android:id="@+id/banner_image"
            android:layout_width="0dp"
            android:layout_height="0dp"
            android:scaleType="centerCrop"
            app:layout_constraintTop_toTopOf="parent"
            app:layout_constraintBottom_toBottomOf="parent"
            app:layout_constraintStart_toStartOf="parent"
            app:layout_constraintEnd_toEndOf="parent" />

        <View
            android:layout_width="0dp"
            android:layout_height="0dp"
            android:background="@drawable/banner_gradient_overlay"
            app:layout_constraintTop_toTopOf="parent"
            app:layout_constraintBottom_toBottomOf="parent"
            app:layout_constraintStart_toStartOf="parent"
            app:layout_constraintEnd_toEndOf="parent" />

        <LinearLayout
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:orientation="vertical"
            android:padding="16dp"
            app:layout_constraintBottom_toBottomOf="parent"
            app:layout_constraintStart_toStartOf="parent"
            app:layout_constraintEnd_toEndOf="parent">

            <TextView
                android:id="@+id/banner_title"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:textColor="@android:color/white"
                android:textSize="18sp"
                android:textStyle="bold"
                android:shadowColor="@android:color/black"
                android:shadowDx="1"
                android:shadowDy="1"
                android:shadowRadius="2" />

            <TextView
                android:id="@+id/banner_description"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:textColor="@android:color/white"
                android:textSize="14sp"
                android:maxLines="2"
                android:ellipsize="end"
                android:shadowColor="@android:color/black"
                android:shadowDx="1"
                android:shadowDy="1"
                android:shadowRadius="1" />

        </LinearLayout>

    </androidx.constraintlayout.widget.ConstraintLayout>

</androidx.cardview.widget.CardView>
*/