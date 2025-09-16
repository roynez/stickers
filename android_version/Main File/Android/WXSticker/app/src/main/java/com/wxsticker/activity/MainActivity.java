package com.wxsticker.activity;

import android.Manifest;
import android.app.ProgressDialog;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.onesignal.OneSignal;
import com.wxsticker.BuildConfig;
import com.wxsticker.R;
import com.wxsticker.adapters.Category_Adapter;
import com.wxsticker.adapters.Slider_Adapter;
import com.wxsticker.addToWts.DataArchiver;
import com.wxsticker.addToWts.StickerBook;
import com.wxsticker.apiClient.ApiClient;
import com.wxsticker.apiClient.ApiInterface;
import com.wxsticker.helper.Constant;
import com.wxsticker.models.HomeResponse;

import java.io.File;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MainActivity extends AppCompatActivity {

    boolean doubleBackToExitPressedOnce = false;
    RecyclerView slider_recyclerview,category_recyclerview;
    public static int TYPE_WIFI = 1;
    public static int TYPE_MOBILE = 2;
    public static int TYPE_NOT_CONNECTED = 0;
    public static final int RequestPermissionCode = 1;
    ProgressDialog prDialog;


    //start methods for internet checking
    public static int getConnectivityStatus(Context context) {
        ConnectivityManager cm = (ConnectivityManager) context
                .getSystemService(Context.CONNECTIVITY_SERVICE);

        NetworkInfo activeNetwork = cm.getActiveNetworkInfo();
        if (null != activeNetwork) {
            if (activeNetwork.getType() == ConnectivityManager.TYPE_WIFI)
                return TYPE_WIFI;

            if (activeNetwork.getType() == ConnectivityManager.TYPE_MOBILE)
                return TYPE_MOBILE;
        }
        return TYPE_NOT_CONNECTED;
    }

    public static String getConnectivityStatusString(Context context) {
        int conn = MainActivity.getConnectivityStatus(context);
        String status = null;
        if (conn == MainActivity.TYPE_WIFI) {
            status = "Wifi enabled";
        } else if (conn == MainActivity.TYPE_MOBILE) {
            status = "Mobile data enabled";
        } else if (conn == MainActivity.TYPE_NOT_CONNECTED) {
            status = "Not connected to Internet";
        }
        return status;
    }
    //end methods for internet checking

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        OneSignal.startInit(this)
                .inFocusDisplaying(OneSignal.OSInFocusDisplayOption.Notification)
                .unsubscribeWhenNotificationsAreDisabled(true)
                .init();
        setContentView(R.layout.activity_main);

        //calling method for internet status
        String netstatus = MainActivity.getConnectivityStatusString(this);
        if (netstatus.equals("Not connected to Internet")) {
            showDialog(this);
        }

        File file = new File(Environment.getExternalStorageDirectory().toString() + File.separator + ".WhatsappStickers");
        if (!file.exists()) {
            file.mkdir();
        }else{

        }

        slider_recyclerview = findViewById(R.id.recy_slider);
        category_recyclerview = findViewById(R.id.recy_category);
        category_recyclerview.setLayoutManager(new LinearLayoutManager(this));
        slider_recyclerview.setLayoutManager(new LinearLayoutManager(this,LinearLayoutManager.HORIZONTAL,false));

        StickerBook.init(this);
        Call_Api();
        EnableRuntimePermission();
    }

    @Override
    protected void onPause() {
        super.onPause();
        DataArchiver.writeStickerBookJSON(StickerBook.getAllStickerPacks(), this);
    }

    @Override
    protected void onDestroy() {
        DataArchiver.writeStickerBookJSON(StickerBook.getAllStickerPacks(), this);
        super.onDestroy();
    }

    public void Call_Api(){
        prDialog = ProgressDialog.show(MainActivity.this, null, "loading, please wait...");
        ApiInterface apiInterface = ApiClient.getClient().create(ApiInterface.class);
        Call<HomeResponse> homeResponseCall = apiInterface.call_home_list();
        homeResponseCall.enqueue(new Callback<HomeResponse>() {
            @Override
            public void onResponse(Call<HomeResponse> call, Response<HomeResponse> response) {
                try {
                    Constant.manageAdmobAd(MainActivity.this);

                    Slider_Adapter sliderAdapter = new Slider_Adapter(response.body().getData().getSlider(), R.layout.single_slider, MainActivity.this);
                    slider_recyclerview.setAdapter(sliderAdapter);

                    Category_Adapter categoryAdapter = new Category_Adapter(response.body().getData().getCategoryList(), R.layout.single_category, MainActivity.this);
                    category_recyclerview.setAdapter(categoryAdapter);
                    prDialog.dismiss();
                }catch (Exception e){
                    prDialog.dismiss();
                    Toast.makeText(MainActivity.this, "Something wants wrong...", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<HomeResponse> call, Throwable t) {
                prDialog.dismiss();
                Toast.makeText(MainActivity.this, "Something Wants Wrong try angain later..", Toast.LENGTH_SHORT).show();
                Log.d("HARDIK", "ERROR: " + t.getMessage());
            }
        });
    }
    //method to show error of internet
    public void showDialog(Context context) {
        AlertDialog.Builder builder = new AlertDialog.Builder(context);
        builder.setMessage("There is something wrong with network\nconnection. please fix and try again later");
        builder.setCancelable(false);
        builder.setPositiveButton("ok", (dialog, which) -> finish());
        builder.show();
    }

    //It's a method of share app
    public void shareApp(){
        try {
            Intent shareIntent = new Intent(Intent.ACTION_SEND);
            shareIntent.setType("text/plain");
            shareIntent.putExtra(Intent.EXTRA_SUBJECT, "Whatsapp Sticker");
            String shareMessage= "\nLet me recommend you this application\n\n\n\n Best Sticker App Ever..\n\n";
            shareMessage = shareMessage + "https://play.google.com/store/apps/details?id=" + BuildConfig.APPLICATION_ID +"\n\n";
            shareIntent.putExtra(Intent.EXTRA_TEXT, shareMessage);
            startActivity(Intent.createChooser(shareIntent, "choose one"));
        } catch(Exception e) {
            //e.toString();
        }
    }

    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.main_menu, menu);
        return super.onCreateOptionsMenu(menu);
    }

    public boolean onPrepareOptionsMenu(Menu menu) {
        return super.onPrepareOptionsMenu(menu);
    }

    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()) {
            case R.id.action_share:
                shareApp();
                return true;
            case R.id.action_likes:
                MainActivity.this.openAppinPlayStore(MainActivity.this.getPackageName());
                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
    }

    //It's a method of Rate app
    private void openAppinPlayStore(String package_name) {
        Intent goToMarket = new Intent("android.intent.action.VIEW", Uri.parse("market://details?id=" + package_name));
        goToMarket.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            startActivity(goToMarket);
        } catch (ActivityNotFoundException e) {
            startActivity(new Intent("android.intent.action.VIEW", Uri.parse("http://play.google.com/store/apps/details?id=" + package_name)));
        }
    }


    //Getting user permision of storage
    public void EnableRuntimePermission() {
        if (ActivityCompat.shouldShowRequestPermissionRationale(MainActivity.this,
                Manifest.permission.READ_EXTERNAL_STORAGE) && ActivityCompat.shouldShowRequestPermissionRationale(
                MainActivity.this,
                Manifest.permission.WRITE_EXTERNAL_STORAGE)) {

            Toast.makeText(MainActivity.this, "permission allows us to Access app", Toast.LENGTH_LONG).show();

        } else {

            ActivityCompat.requestPermissions(MainActivity.this, new String[]{
                    Manifest.permission.WRITE_EXTERNAL_STORAGE, Manifest.permission.READ_EXTERNAL_STORAGE}, RequestPermissionCode);
        }
    }
    @Override
    public void onRequestPermissionsResult(int RC, @NonNull String per[], @NonNull int[] PResult) {

        if (RC == RequestPermissionCode) {
            SharedPreferences sp = getSharedPreferences("isStoragePermision", MODE_PRIVATE);
            SharedPreferences.Editor editor = sp.edit();
            if (PResult.length > 0 && PResult[0] == PackageManager.PERMISSION_GRANTED) {
                //Toast.makeText(MainActivity.this, "Permissions Granted, Now your application can access", Toast.LENGTH_LONG).show();
                editor.putInt("isGivePermision", 1);
            } else {
                //Toast.makeText(MainActivity.this, "Permission Canceled, Now your application cannot access some features.", Toast.LENGTH_LONG).show();
                editor.putInt("isGivePermision", 0);
            }
            editor.apply();
        }
    }

    public void onBackPressed() {
        if (doubleBackToExitPressedOnce) {
            super.onBackPressed();
            finish();
            return;
        }
        this.doubleBackToExitPressedOnce = true;
        Toast.makeText(this, "Please click BACK again to exit", Toast.LENGTH_SHORT).show();
        new Handler().postDelayed(() -> doubleBackToExitPressedOnce=false, 2000);
    }

}
