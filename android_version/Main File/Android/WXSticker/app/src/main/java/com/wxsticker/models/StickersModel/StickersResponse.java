
package com.wxsticker.models.StickersModel;

import com.google.gson.annotations.SerializedName;


public class StickersResponse {

    @SerializedName("data")
    private Data mData;
    @SerializedName("ResponseCode")
    private String mResponseCode;
    @SerializedName("ResponseMsg")
    private String mResponseMsg;
    @SerializedName("Result")
    private String mResult;
    @SerializedName("ServerTimeZone")
    private String mServerTimeZone;

    public Data getData() {
        return mData;
    }

    public void setData(Data data) {
        mData = data;
    }

    public String getResponseCode() {
        return mResponseCode;
    }

    public void setResponseCode(String responseCode) {
        mResponseCode = responseCode;
    }

    public String getResponseMsg() {
        return mResponseMsg;
    }

    public void setResponseMsg(String responseMsg) {
        mResponseMsg = responseMsg;
    }

    public String getResult() {
        return mResult;
    }

    public void setResult(String result) {
        mResult = result;
    }

    public String getServerTimeZone() {
        return mServerTimeZone;
    }

    public void setServerTimeZone(String serverTimeZone) {
        mServerTimeZone = serverTimeZone;
    }

}
