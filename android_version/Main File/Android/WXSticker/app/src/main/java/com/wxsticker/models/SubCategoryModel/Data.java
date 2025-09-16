
package com.wxsticker.models.SubCategoryModel;

import com.google.gson.annotations.SerializedName;

import java.util.List;

public class Data {

    @SerializedName("sub_cate_list")
    private List<SubCateList> mSubCateList;

    public List<SubCateList> getSubCateList() {
        return mSubCateList;
    }

    public void setSubCateList(List<SubCateList> subCateList) {
        mSubCateList = subCateList;
    }

}
