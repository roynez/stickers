
package com.wxsticker.models.StickersModel;

import com.google.gson.annotations.SerializedName;

public class StickerList {

    @SerializedName("sticker_id")
    private String mStickerId;
    @SerializedName("sticker_image")
    private String mStickerImage;
    @SerializedName("sub_cate_id")
    private String mSubCateId;

    public String getStickerId() {
        return mStickerId;
    }

    public void setStickerId(String stickerId) {
        mStickerId = stickerId;
    }

    public String getStickerImage() {
        return mStickerImage;
    }

    public void setStickerImage(String stickerImage) {
        mStickerImage = stickerImage;
    }

    public String getSubCateId() {
        return mSubCateId;
    }

    public void setSubCateId(String subCateId) {
        mSubCateId = subCateId;
    }

}
