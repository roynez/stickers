
package com.wxsticker.models;

import com.google.gson.annotations.SerializedName;

public class SubCategory {

    @SerializedName("category_id")
    private String mCategoryId;
    @SerializedName("sub_cate_id")
    private String mSubCateId;
    @SerializedName("sub_cate_image")
    private String mSubCateImage;
    @SerializedName("sub_cate_name")
    private String mSubCateName;

    public String getCategoryId() {
        return mCategoryId;
    }

    public void setCategoryId(String categoryId) {
        mCategoryId = categoryId;
    }

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

}
