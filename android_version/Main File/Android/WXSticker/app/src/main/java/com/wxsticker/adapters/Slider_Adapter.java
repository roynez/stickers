package com.wxsticker.adapters;

import android.content.Context;
import android.content.Intent;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.gms.ads.AdListener;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.InterstitialAd;
import com.squareup.picasso.Picasso;
import com.wxsticker.R;
import com.wxsticker.activity.Activity_Subcategory;
import com.wxsticker.helper.Constant;
import com.wxsticker.models.Slider;

import java.util.List;

public class Slider_Adapter extends RecyclerView.Adapter<Slider_Adapter.SliderViewHolder> {

    private List<Slider> sliderList;
    private int rowlayout;
    private Context context;
    private InterstitialAd mInterstitialAd;
    private int itemClick;

    public static class SliderViewHolder extends RecyclerView.ViewHolder{
        ImageView img_slider;
        public SliderViewHolder(View itemView) {
            super(itemView);
            img_slider = itemView.findViewById(R.id.img_slider);
        }
    }

    public Slider_Adapter(List<Slider> sliderList, int rowlayout, Context context) {
        this.sliderList = sliderList;
        this.rowlayout = rowlayout;
        this.context = context;
    }

    @NonNull
    @Override
    public SliderViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(rowlayout, parent, false);
        return new SliderViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull SliderViewHolder holder,final int position) {
        Picasso.get().load(sliderList.get(position).getSliderImage()).placeholder(R.drawable.progress_animation).into(holder.img_slider);

        mInterstitialAd = new InterstitialAd(context);
        mInterstitialAd.setAdUnitId(context.getString(R.string.ADMOB_INTERSTITIAL));
        if (Constant.varAdmobCounter == 0) {
            mInterstitialAd.loadAd(new AdRequest.Builder().build());
        }
        mInterstitialAd.setAdListener(new AdListener() {
            @Override
            public void onAdClosed() {
                //start subcategory activity
                Intent intent = new Intent(context,Activity_Subcategory.class);
                intent.putExtra("CategoryId",sliderList.get(itemClick).getCategoryId());
                intent.putExtra("CategoryName",sliderList.get(itemClick).getSliderName());
                context.startActivity(intent);
            }
        });

        holder.img_slider.setOnClickListener(v -> {
            if (Constant.varAdmobCounter == 0) {
                itemClick = position;
                if (mInterstitialAd.isLoaded()) {
                    mInterstitialAd.show();
                    return;
                }
            }
            //start subcategory activity
            Intent intent = new Intent(context,Activity_Subcategory.class);
            intent.putExtra("CategoryId",sliderList.get(position).getCategoryId());
            intent.putExtra("CategoryName",sliderList.get(position).getSliderName());
            context.startActivity(intent);
        });
    }
    @Override
    public int getItemCount() {
        return sliderList.size();
    }
}
