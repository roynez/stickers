package com.wxsticker.helper;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import static android.content.Context.MODE_PRIVATE;

public class Constant {

    //Set your server link here
    public static final String BASE_URL = "http://www.yourdomain.com/services/";

    //Set Your IPhone application link here (If Your don't have ios app then set it blank)
    public static final String IOS_APP_STORE_LINK = "https://itunes.apple.com/us/app/whats-sticker/id1469529792";

    //Set this counter value to set a gap between two google ad show (Minimum 2 required)
    private static final int maxAdCount = 3;

    public static int varAdmobCounter;

    public static void manageAdmobAd(Context context){
        SharedPreferences sp = context.getSharedPreferences("StickerAdmob", MODE_PRIVATE);
        SharedPreferences.Editor editor = sp.edit();
        Constant.varAdmobCounter = sp.getInt("counter", 0);
        if (Constant.varAdmobCounter >= Constant.maxAdCount){
            editor.putInt("counter", 0);
        }else {
            editor.putInt("counter", Constant.varAdmobCounter + 1);
        }
        Log.d("HARDIK", "ADMOBCOUNT: " + Constant.varAdmobCounter);
        editor.apply();
    }

}
