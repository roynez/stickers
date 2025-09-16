package com.wxsticker.adapters;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.squareup.picasso.Picasso;
import com.wxsticker.R;
import com.wxsticker.models.StickersModel.StickerList;

import java.util.List;

public class Stickers_Adapter extends RecyclerView.Adapter<Stickers_Adapter.StickersViewHolder> {

    private List<StickerList> stickerLists;
    private int rowlayout;
    private Context context;

    public static class StickersViewHolder extends RecyclerView.ViewHolder {

        ImageView img_sticker;

        public StickersViewHolder(View itemView) {
            super(itemView);
            img_sticker = itemView.findViewById(R.id.img_sticker);
        }
    }


    public Stickers_Adapter(List<StickerList> stickerLists, int rowlayout, Context context) {
        this.stickerLists = stickerLists;
        this.rowlayout = rowlayout;
        this.context = context;
    }

    @NonNull
    @Override
    public StickersViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(rowlayout, parent, false);
        return new StickersViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull StickersViewHolder holder, int position) {
        Picasso.get().load(stickerLists.get(position).getStickerImage()).placeholder(R.drawable.progress_animation).into(holder.img_sticker);
    }

    @Override
    public int getItemCount() {
        return stickerLists.size();
    }


}
