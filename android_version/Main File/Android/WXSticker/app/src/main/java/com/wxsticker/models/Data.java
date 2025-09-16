
package com.wxsticker.models;

import com.google.gson.annotations.SerializedName;

import java.util.List;

public class Data {

    @SerializedName("category_list")
    private List<CategoryList> mCategoryList;
    @SerializedName("slider")
    private List<Slider> mSlider;

    public List<CategoryList> getCategoryList() {
        return mCategoryList;
    }

    public void setCategoryList(List<CategoryList> categoryList) {
        mCategoryList = categoryList;
    }

    public List<Slider> getSlider() {
        return mSlider;
    }

    public void setSlider(List<Slider> slider) {
        mSlider = slider;
    }

}
