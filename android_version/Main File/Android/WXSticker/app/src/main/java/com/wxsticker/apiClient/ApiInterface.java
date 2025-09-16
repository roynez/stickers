package com.wxsticker.apiClient;

import com.wxsticker.models.HomeResponse;
import com.wxsticker.models.StickersModel.StickersResponse;
import com.wxsticker.models.SubCategoryModel.SubCategoryResponse;

import retrofit2.Call;
import retrofit2.http.Field;
import retrofit2.http.FormUrlEncoded;
import retrofit2.http.POST;

public interface ApiInterface {
    @POST("homeListService.php")
    Call<HomeResponse> call_home_list();

    @FormUrlEncoded
    @POST("subCategoryListService.php")
    Call<SubCategoryResponse> call_subcategory_list(@Field("category_id") String category_id);

    @FormUrlEncoded
    @POST("stickerListService.php")
    Call<StickersResponse> call_stickers_list(@Field("sub_cate_id") String sub_cate_id);

}