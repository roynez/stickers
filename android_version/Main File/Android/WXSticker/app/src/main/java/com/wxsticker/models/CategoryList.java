
package com.wxsticker.models;

import com.google.gson.annotations.SerializedName;

import java.util.List;

public class CategoryList {

    @SerializedName("category_id")
    private String mCategoryId;
    @SerializedName("category_image")
    private String mCategoryImage;
    @SerializedName("category_name")
    private String mCategoryName;
    @SerializedName("sub_category")
    private List<SubCategory> mSubCategory;
    @SerializedName("view_all")
    private String mViewAll;

    public String getCategoryId() {
        return mCategoryId;
    }

    public void setCategoryId(String categoryId) {
        mCategoryId = categoryId;
    }

    public String getCategoryImage() {
        return mCategoryImage;
    }

    public void setCategoryImage(String categoryImage) {
        mCategoryImage = categoryImage;
    }

    public String getCategoryName() {
        return mCategoryName;
    }

    public void setCategoryName(String categoryName) {
        mCategoryName = categoryName;
    }

    public List<SubCategory> getSubCategory() {
        return mSubCategory;
    }

    public void setSubCategory(List<SubCategory> subCategory) {
        mSubCategory = subCategory;
    }

    public String getViewAll() {
        return mViewAll;
    }

    public void setViewAll(String viewAll) {
        mViewAll = viewAll;
    }

}
