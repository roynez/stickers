
package com.wxsticker.models;

import com.google.gson.annotations.SerializedName;

public class Slider {

    @SerializedName("category_id")
    private String mCategoryId;
    @SerializedName("slider_id")
    private String mSliderId;
    @SerializedName("slider_image")
    private String mSliderImage;
    @SerializedName("slider_name")
    private String mSliderName;

    public String getCategoryId() {
        return mCategoryId;
    }

    public void setCategoryId(String categoryId) {
        mCategoryId = categoryId;
    }

    public String getSliderId() {
        return mSliderId;
    }

    public void setSliderId(String sliderId) {
        mSliderId = sliderId;
    }

    public String getSliderImage() {
        return mSliderImage;
    }

    public void setSliderImage(String sliderImage) {
        mSliderImage = sliderImage;
    }

    public String getSliderName() {
        return mSliderName;
    }

    public void setSliderName(String sliderName) {
        mSliderName = sliderName;
    }

}
