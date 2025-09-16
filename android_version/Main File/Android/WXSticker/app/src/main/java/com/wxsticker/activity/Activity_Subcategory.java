package com.wxsticker.activity;

import android.app.ProgressDialog;
import android.os.Bundle;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.wxsticker.R;
import com.wxsticker.adapters.SubCategoryList_Adapter;
import com.wxsticker.apiClient.ApiClient;
import com.wxsticker.apiClient.ApiInterface;
import com.wxsticker.helper.Constant;
import com.wxsticker.models.SubCategoryModel.SubCategoryResponse;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class Activity_Subcategory extends AppCompatActivity {

    String CategoryId ;
    Toolbar toolbar;
    RecyclerView recy_subcatelist;
    ProgressDialog prDialog;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity__subcategory);
        toolbar = findViewById(R.id.toolbar);
        toolbar.setTitle(getIntent().getStringExtra("CategoryName"));
        setSupportActionBar(toolbar);
        getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        CategoryId = getIntent().getStringExtra("CategoryId");

        recy_subcatelist = findViewById(R.id.recy_subcatelist);
        GridLayoutManager gridLayoutManager = new GridLayoutManager(this,3);
        recy_subcatelist.setLayoutManager(gridLayoutManager);

        CALL_API(CategoryId);
    }

    //It's a method of calling api for category and sticker
    public void CALL_API(String categoryId){
        prDialog = ProgressDialog.show(Activity_Subcategory.this, null, "loading, please wait...");
        ApiInterface apiInterface = ApiClient.getClient().create(ApiInterface.class);
        Call<SubCategoryResponse> categoryResponseCall = apiInterface.call_subcategory_list(categoryId);
        categoryResponseCall.enqueue(new Callback<SubCategoryResponse>() {
            @Override
            public void onResponse(Call<SubCategoryResponse> call, Response<SubCategoryResponse> response) {
                try {
                    Constant.manageAdmobAd(Activity_Subcategory.this);
                    SubCategoryList_Adapter subCategoryList_adapter = new SubCategoryList_Adapter(response.body().getData().getSubCateList(), R.layout.single_subcategorylist, Activity_Subcategory.this);
                    recy_subcatelist.setAdapter(subCategoryList_adapter);
                    prDialog.dismiss();
                }catch (Exception e){
                    prDialog.dismiss();
                    Toast.makeText(Activity_Subcategory.this, "No Stickers found...", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<SubCategoryResponse> call, Throwable t) {
                prDialog.dismiss();
                Toast.makeText(Activity_Subcategory.this, "Something wants wrong try again later...", Toast.LENGTH_SHORT).show();
            }
        });
    }

    public void onBackPressed() {
        super.onBackPressed();
        try {
            overridePendingTransition(R.anim.right_in_anim, R.anim.right_out_anim);
        } catch (Exception ignored) {
        }
    }

}
