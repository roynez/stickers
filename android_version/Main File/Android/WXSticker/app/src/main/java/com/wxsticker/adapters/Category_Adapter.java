package com.wxsticker.adapters;

import android.content.Context;
import android.content.Intent;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.gms.ads.AdListener;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.InterstitialAd;
import com.wxsticker.R;
import com.wxsticker.activity.Activity_Subcategory;
import com.wxsticker.helper.Constant;
import com.wxsticker.models.CategoryList;

import java.util.List;

public class Category_Adapter extends RecyclerView.Adapter<Category_Adapter.CategoryHolder> {

    private List<CategoryList> categoryLists;
    private int rowlayout;
    private Context context;

    private InterstitialAd mInterstitialAd;
    private int itemClick;


    public static class CategoryHolder extends RecyclerView.ViewHolder {

        TextView tv_categoryName;
        TextView tv_seeall;
        RecyclerView recy_subcate;

        public CategoryHolder(View itemView) {
            super(itemView);
            tv_categoryName = itemView.findViewById(R.id.tv_categoryName);
            tv_seeall = itemView.findViewById(R.id.tv_seeall);
            recy_subcate = itemView.findViewById(R.id.recy_subcate);
        }
    }


    public Category_Adapter(List<CategoryList> categoryLists, int rowlayout, Context context) {
        this.categoryLists = categoryLists;
        this.rowlayout = rowlayout;
        this.context = context;
    }


    @NonNull
    @Override
    public CategoryHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(rowlayout, parent, false);
        return new CategoryHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull CategoryHolder holder, final int position) {

        holder.tv_categoryName.setText(categoryLists.get(position).getCategoryName());
        if (categoryLists.get(position).getViewAll().equals("NO")) {
            holder.tv_seeall.setVisibility(View.GONE);
        } else if (categoryLists.get(position).getViewAll().equals("YES")) {
            holder.tv_seeall.setVisibility(View.VISIBLE);
        }
        holder.recy_subcate.setLayoutManager(new LinearLayoutManager(context, LinearLayoutManager.HORIZONTAL, false));
        SubCategory_Adapter subCategoryAdapter = new SubCategory_Adapter(categoryLists.get(position).getSubCategory(), R.layout.single_subcategory, context);
        holder.recy_subcate.setAdapter(subCategoryAdapter);

        mInterstitialAd = new InterstitialAd(context);
        mInterstitialAd.setAdUnitId(context.getString(R.string.ADMOB_INTERSTITIAL));
        if (Constant.varAdmobCounter == 0) {
            mInterstitialAd.loadAd(new AdRequest.Builder().build());
        }
        mInterstitialAd.setAdListener(new AdListener() {
            @Override
            public void onAdClosed() {
                //start subcategory activity
                Intent intent = new Intent(context, Activity_Subcategory.class);
                intent.putExtra("CategoryId", categoryLists.get(itemClick).getCategoryId());
                intent.putExtra("CategoryName", categoryLists.get(itemClick).getCategoryName());
                context.startActivity(intent);
            }
        });

        holder.tv_seeall.setOnClickListener(v -> {

            if (Constant.varAdmobCounter == 0) {
                itemClick = position;
                if (mInterstitialAd.isLoaded()) {
                    mInterstitialAd.show();
                    return;
                }
            }
            //start subcategory activity
            Intent intent = new Intent(context, Activity_Subcategory.class);
            intent.putExtra("CategoryId", categoryLists.get(position).getCategoryId());
            intent.putExtra("CategoryName", categoryLists.get(position).getCategoryName());
            context.startActivity(intent);

        });


    }

    @Override
    public int getItemCount() {
        return categoryLists.size();
    }


}
