package com.wxsticker.adapters;

import android.content.Context;
import android.content.Intent;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.gms.ads.AdListener;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.InterstitialAd;
import com.squareup.picasso.Picasso;
import com.wxsticker.R;
import com.wxsticker.activity.Activity_StickerList;
import com.wxsticker.helper.Constant;
import com.wxsticker.models.SubCategory;

import java.util.List;

public class SubCategory_Adapter extends RecyclerView.Adapter<SubCategory_Adapter.SubCategoryViewHolder> {

    private List<SubCategory> subCategoryList;
    private int rowlayout;
    private Context context;
    private InterstitialAd mInterstitialAd;
    private int itemClick;

    public static class SubCategoryViewHolder extends RecyclerView.ViewHolder {

        ImageView img_subcategoryImage;
        TextView tv_subcategoryName;

        public SubCategoryViewHolder(View itemView) {
            super(itemView);
            img_subcategoryImage = itemView.findViewById(R.id.img_subcategoryImage);
            tv_subcategoryName = itemView.findViewById(R.id.tv_subcategoryName);
        }
    }

    public SubCategory_Adapter(List<SubCategory> subCategoryList, int rowlayout, Context context) {
        this.subCategoryList = subCategoryList;
        this.rowlayout = rowlayout;
        this.context = context;
    }

    @NonNull
    @Override
    public SubCategoryViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(rowlayout, parent, false);
        return new SubCategoryViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull SubCategoryViewHolder holder, final int position) {
        Picasso.get().load(subCategoryList.get(position).getSubCateImage()).placeholder(R.drawable.progress_animation).into(holder.img_subcategoryImage);
        holder.tv_subcategoryName.setText(subCategoryList.get(position).getSubCateName());

        mInterstitialAd = new InterstitialAd(context);
        mInterstitialAd.setAdUnitId(context.getString(R.string.ADMOB_INTERSTITIAL));

        if (Constant.varAdmobCounter == 0) {
            mInterstitialAd.loadAd(new AdRequest.Builder().build());
        }

        mInterstitialAd.setAdListener(new AdListener() {
            @Override
            public void onAdClosed() {
                //start sticker list activity
                Intent intent = new Intent(context, Activity_StickerList.class);
                intent.putExtra("sub_cate_id", subCategoryList.get(itemClick).getSubCateId());
                intent.putExtra("sub_cate_name", subCategoryList.get(itemClick).getSubCateName());
                intent.putExtra("sub_cate_image", subCategoryList.get(itemClick).getSubCateImage());
                context.startActivity(intent);
            }
        });

        holder.img_subcategoryImage.setOnClickListener(v -> {
            if (Constant.varAdmobCounter == 0) {
                itemClick = position;
                if (mInterstitialAd.isLoaded()) {
                    mInterstitialAd.show();
                    return;
                }
            }
            //start sticker list activity
            Intent intent = new Intent(context, Activity_StickerList.class);
            intent.putExtra("sub_cate_id", subCategoryList.get(position).getSubCateId());
            intent.putExtra("sub_cate_name", subCategoryList.get(position).getSubCateName());
            intent.putExtra("sub_cate_image", subCategoryList.get(position).getSubCateImage());
            context.startActivity(intent);
        });
    }

    @Override
    public int getItemCount() {
        return subCategoryList.size();
    }


}
