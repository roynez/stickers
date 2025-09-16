
package com.wxsticker.models.SubCategoryModel;

import com.google.gson.annotations.SerializedName;

public class SubCateList {

    @SerializedName("sub_cate_id")
    private String mSubCateId;
    @SerializedName("sub_cate_image")
    private String mSubCateImage;
    @SerializedName("sub_cate_name")
    private String mSubCateName;
    @SerializedName("sticker_count")
    private int mStickerCount;

    public String getSubCateId() {
        return mSubCateId;
    }

    public void setSubCateId(String subCateId) {
        mSubCateId = subCateId;
    }

    public String getSubCateImage() {
        return mSubCateImage;
    }

    public void setSubCateImage(String subCateImage) {
        mSubCateImage = subCateImage;
    }

    public String getSubCateName() {
        return mSubCateName;
    }

    public void setSubCateName(String subCateName) {
        mSubCateName = subCateName;
    }

    public int getStickerCount() {return mStickerCount; }

    public void setStickerCount(int StickerCount) {
        mStickerCount = StickerCount;
    }
}
