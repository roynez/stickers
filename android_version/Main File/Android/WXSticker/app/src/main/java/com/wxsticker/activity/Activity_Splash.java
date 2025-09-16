package com.wxsticker.activity;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;

import androidx.appcompat.app.AppCompatActivity;

import com.google.android.gms.ads.MobileAds;
import com.wxsticker.R;

public class Activity_Splash extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash);
        //Admon Intialization for getting ads from admob
        MobileAds.initialize(this, initializationStatus -> {});

        int secondsDelayed = 1;
        new Handler().postDelayed(() -> {
            startActivity(new Intent(Activity_Splash.this, MainActivity.class));
            finish();
        }, secondsDelayed * 1000);
    }

    public void onBackPressed() {
        super.onBackPressed();

    }
}
