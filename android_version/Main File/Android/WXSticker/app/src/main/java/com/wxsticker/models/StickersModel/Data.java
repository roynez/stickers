
package com.wxsticker.models.StickersModel;

import com.google.gson.annotations.SerializedName;

import java.util.List;

public class Data {

    @SerializedName("sticker_list")
    private List<StickerList> mStickerList;

    public List<StickerList> getStickerList() {
        return mStickerList;
    }

    public void setStickerList(List<StickerList> stickerList) {
        mStickerList = stickerList;
    }

}
