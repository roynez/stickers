package com.wxsticker.adapters;

import android.annotation.SuppressLint;
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
import com.wxsticker.models.SubCategoryModel.SubCateList;

import java.util.List;

public class SubCategoryList_Adapter extends RecyclerView.Adapter<SubCategoryList_Adapter.SubcategoryListViewHolder> {


    private List<SubCateList> subCateLists;
    private int rowlayout;
    private Context context;
    private InterstitialAd mInterstitialAd;
    private int itemClick;


    public static class SubcategoryListViewHolder extends RecyclerView.ViewHolder {

        ImageView img_subcategoryListImage;
        TextView tv_subcategoryListName;
        TextView tv_stickercount;

        public SubcategoryListViewHolder(View itemView) {
            super(itemView);
            img_subcategoryListImage = itemView.findViewById(R.id.img_subcate);
            tv_subcategoryListName = itemView.findViewById(R.id.tv_NameSubcategory);
            tv_stickercount = itemView.findViewById(R.id.tv_stickercount);

        }
    }

    public SubCategoryList_Adapter(List<SubCateList> subCateLists, int rowlayout, Context context) {
        this.subCateLists = subCateLists;
        this.rowlayout = rowlayout;
        this.context = context;
    }

    @NonNull
    @Override
    public SubcategoryListViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(rowlayout, parent, false);
        return new SubcategoryListViewHolder(view);
    }

    @SuppressLint("SetTextI18n")
    @Override
    public void onBindViewHolder(@NonNull SubcategoryListViewHolder holder, final int position) {
        Picasso.get().load(subCateLists.get(position).getSubCateImage()).placeholder(R.drawable.progress_animation).into(holder.img_subcategoryListImage);
        holder.tv_subcategoryListName.setText(subCateLists.get(position).getSubCateName());
        holder.tv_stickercount.setText(subCateLists.get(position).getStickerCount() + " Stickers");


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
                intent.putExtra("sub_cate_id", subCateLists.get(itemClick).getSubCateId());
                intent.putExtra("sub_cate_name", subCateLists.get(itemClick).getSubCateName());
                intent.putExtra("sub_cate_image", subCateLists.get(itemClick).getSubCateImage());
                context.startActivity(intent);
            }
        });


        holder.img_subcategoryListImage.setOnClickListener(v -> {

            if (Constant.varAdmobCounter == 0) {
                itemClick = position;
                if (mInterstitialAd.isLoaded()) {
                    mInterstitialAd.show();
                    return;
                }
            }
            //start sticker list activity
            Intent intent = new Intent(context, Activity_StickerList.class);
            intent.putExtra("sub_cate_id", subCateLists.get(position).getSubCateId());
            intent.putExtra("sub_cate_name", subCateLists.get(position).getSubCateName());
            intent.putExtra("sub_cate_image", subCateLists.get(position).getSubCateImage());
            context.startActivity(intent);

        });
    }

    @Override
    public int getItemCount() {
        return subCateLists.size();
    }


}
