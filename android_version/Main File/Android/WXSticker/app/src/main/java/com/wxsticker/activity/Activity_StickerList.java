package com.wxsticker.activity;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.ProgressDialog;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.squareup.picasso.Picasso;
import com.wxsticker.BuildConfig;
import com.wxsticker.R;
import com.wxsticker.adapters.Stickers_Adapter;
import com.wxsticker.addToWts.DataArchiver;
import com.wxsticker.addToWts.StickerBook;
import com.wxsticker.addToWts.WhatsAppBasedCode.StickerPack;
import com.wxsticker.apiClient.ApiClient;
import com.wxsticker.apiClient.ApiInterface;
import com.wxsticker.helper.Constant;
import com.wxsticker.models.StickersModel.StickersResponse;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.UUID;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;


public class Activity_StickerList extends AppCompatActivity {
    public static final String EXTRA_STICKER_PACK_ID = "sticker_pack_id";
    public static final String EXTRA_STICKER_PACK_AUTHORITY = "sticker_pack_authority";
    public static final String EXTRA_STICKER_PACK_NAME = "sticker_pack_name";
    public static final int ADD_PACK = 200;
    ProgressDialog progressDialog;
    ImageView img_icon;
    TextView tv_packName;
    TextView tv_StickerCount;
    Button btn_Download;
    RecyclerView recy_stickers;
    ProgressDialog prDialog;
    String[] urls;
    String[] urisS;
    String trayimageURI, trayimage;
    String folderName, Fol;
    String SelectedName, SelectedIdentifier;
    StickerPack stickerPack;

    private static final int PERMISSION_REQUEST_CODE = 112;
    String[] PERMISSIONS = {android.Manifest.permission.WRITE_EXTERNAL_STORAGE, android.Manifest.permission.READ_EXTERNAL_STORAGE};

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity__sticker_list);
        Toolbar toolbar = findViewById(R.id.toolbar);
        toolbar.setTitle(getIntent().getStringExtra("sub_cate_name"));
        setSupportActionBar(toolbar);
        getSupportActionBar().setDisplayHomeAsUpEnabled(true);

        folderName = getIntent().getStringExtra("sub_cate_name");
        img_icon = findViewById(R.id.img_sticker_icon);
        tv_packName = findViewById(R.id.tv_packName);
        tv_StickerCount = findViewById(R.id.tv_StickerCountlist);
        recy_stickers = findViewById(R.id.recy_stickers);
        btn_Download = findViewById(R.id.btn_download);

        GridLayoutManager gridLayoutManager = new GridLayoutManager(this, 4);
        recy_stickers.setLayoutManager(gridLayoutManager);

        Picasso.get().load(getIntent().getStringExtra("sub_cate_image")).placeholder(R.drawable.progress_animation).into(img_icon);
        trayimageURI = getIntent().getStringExtra("sub_cate_image");

        tv_packName.setText(getIntent().getStringExtra("sub_cate_name"));

        progressDialog = new ProgressDialog(this);
        progressDialog.setTitle("In progress...");
        progressDialog.setMessage("Loading...");
        progressDialog.setProgressStyle(ProgressDialog.STYLE_HORIZONTAL);
        progressDialog.setIndeterminate(false);
        progressDialog.setMax(100);
        progressDialog.setCancelable(false);
        CALL_API(getIntent().getStringExtra("sub_cate_id"));

        Fol = Environment.getExternalStorageDirectory().toString() + File.separator + ".WhatsappStickers" + File.separator + folderName + File.separator;
        File dir = new File(Fol);

        if (dir.exists()) {
            btn_Download.setText(getString(R.string.btnAddToWhatsapp));
            btn_Download.setBackgroundColor(R.drawable.btnshape);
            btn_Download.setBackgroundColor(ContextCompat.getColor(getApplicationContext(), R.color.colorPrimary));
        }

        //Button download Click event
        btn_Download.setOnClickListener(v -> {

            if (Build.VERSION.SDK_INT >= 23) {
                if (checkPermission()) {
                    if (btn_Download.getText().equals("Download")) {
                        new DownloadFile().execute(urls);
                    }
                    if (btn_Download.getText().equals("Add to Whatsapp")) {
                        getStickerPackToAdd();
                    }
                } else {
                    ActivityCompat.requestPermissions(Activity_StickerList.this, PERMISSIONS, PERMISSION_REQUEST_CODE); // Code for permission
                }
            } else {
                if (btn_Download.getText().equals("Download")) {
                    new DownloadFile().execute(urls);
                }
                if (btn_Download.getText().equals("Add to Whatsapp")) {
                    getStickerPackToAdd();
                }
            }
        });

    }

    //For Storage Permision
    private boolean checkPermission() {
        int result = ContextCompat.checkSelfPermission(Activity_StickerList.this, android.Manifest.permission.WRITE_EXTERNAL_STORAGE);
        return result == PackageManager.PERMISSION_GRANTED;
    }
    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        if (requestCode == PERMISSION_REQUEST_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                Log.e("value", "Permission Granted, Now you can use local drive .");
                new DownloadFile().execute(urls);
            } else {
                Log.e("value", "Permission Denied, You cannot use local drive .");

            }
        }
    }

    //Call Api for sticker list
    public void CALL_API(String sub_cate_id) {
        prDialog = ProgressDialog.show(Activity_StickerList.this, null, "loading, please wait...");
        ApiInterface apiInterface = ApiClient.getClient().create(ApiInterface.class);
        Call<StickersResponse> stickersResponseCall = apiInterface.call_stickers_list(sub_cate_id);
        stickersResponseCall.enqueue(new Callback<StickersResponse>() {
            @SuppressLint("SetTextI18n")
            @Override
            public void onResponse(Call<StickersResponse> call, Response<StickersResponse> response) {
                try {
                    urisS = new String[response.body().getData().getStickerList().size()];
                    urls = new String[response.body().getData().getStickerList().size()];
                    for (int i = 0; i < response.body().getData().getStickerList().size(); i++) {
                        urls[i] = response.body().getData().getStickerList().get(i).getStickerImage();
                    }

                    tv_StickerCount.setText(response.body().getData().getStickerList().size() + " Stickers");


                    Constant.manageAdmobAd(Activity_StickerList.this);

                    Stickers_Adapter stickers_adapter = new Stickers_Adapter(response.body().getData().getStickerList(), R.layout.single_sticker, Activity_StickerList.this);
                    recy_stickers.setAdapter(stickers_adapter);
                    prDialog.dismiss();
                } catch (Exception e) {
                    prDialog.dismiss();
                    tv_StickerCount.setText("No Stickers Found..");
                    Toast.makeText(Activity_StickerList.this, "No Stickers Found..", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<StickersResponse> call, Throwable t) {
                prDialog.dismiss();
                Toast.makeText(Activity_StickerList.this, "something wants wrong try again later...", Toast.LENGTH_SHORT).show();
            }
        });
    }



    //It's a method of Getting sticker pack for add to whatsapp
    public void getStickerPackToAdd() {
        stickerPack = StickerBook.getStickerPackByName(folderName);

        if (stickerPack == null) {
            MakePack();
        } else if (stickerPack.getName().equals(folderName)) {
            //Add to Whatsapp
            SelectedName = stickerPack.getName();
            SelectedIdentifier = stickerPack.getIdentifier();
            addStickerPackToWhatsApp(stickerPack);

        } else {
            //Create Sticker pack
        }
    }

    //It's a method of Making pack Sticker
    public void MakePack() {

        ArrayList<String> filenames = new ArrayList<>();
        String path = Environment.getExternalStorageDirectory()
                + File.separator + ".WhatsappStickers" + File.separator + folderName;

        File directory = new File(path);
        File[] files = directory.listFiles();
        for (int j = 0; j < files.length; j++) {
            String file_name = files[j].getName();
            // you can store name to arraylist and use it later
            if (file_name.endsWith(".png")) {
                trayimage = path + File.separator + file_name;
            } else {
                filenames.add(file_name);
            }
        }
        Uri uri = Uri.fromFile(new File(trayimage));
        createNewStickerPackAndOpenIt(folderName, String.valueOf(R.string.app_name), uri);

        stickerPack = StickerBook.getStickerPackByName(folderName);
        stickerPack.setName(folderName);

        for (int k = 0; k < urisS.length; k++) {
            stickerPack.addSticker(Uri.fromFile(new File(path + File.separator + filenames.get(k))), Activity_StickerList.this);
        }

        SelectedName = stickerPack.getName();
        SelectedIdentifier = stickerPack.getIdentifier();
        DataArchiver.stickerPackToJSONFile(stickerPack, path, this);
        addStickerPackToWhatsApp(stickerPack);
    }


    //It's a method of Adding sticker into whatsapp
    private void addStickerPackToWhatsApp(StickerPack pack) {
        Intent intent = new Intent();
        intent.setAction("com.whatsapp.intent.action.ENABLE_STICKER_PACK");
        Log.w("IS IT A NEW IDENTIFIER?", pack.getIdentifier());
        intent.putExtra(EXTRA_STICKER_PACK_ID, pack.getIdentifier());
        intent.putExtra(EXTRA_STICKER_PACK_AUTHORITY, BuildConfig.APPLICATION_ID +".addToWts.WhatsAppBasedCode.StickerContentProvider");
        Log.w("IS IT PACK NAME ?", pack.getName());
        intent.putExtra(EXTRA_STICKER_PACK_NAME, pack.getName());
        try {
            startActivityForResult(intent, 200);
        } catch (ActivityNotFoundException e) {
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == ADD_PACK) {
            if (resultCode == Activity.RESULT_CANCELED && data != null) {
                final String validationError = data.getStringExtra("validation_error");
                if (validationError != null) {
                    Log.e("Error=>", "Validation failed:" + validationError);
                }
            } else {

            }
        }

    }

    private void createNewStickerPackAndOpenIt(String name, String creator, Uri trayImage) {
        String newId = UUID.randomUUID().toString();
        StickerPack sp = new StickerPack(
                newId,
                name,
                creator,
                trayImage,
                "",
                "",
                "",
                "",
                this,
                "https://play.google.com/store/apps/details?id="+BuildConfig.APPLICATION_ID,
                Constant.IOS_APP_STORE_LINK);
        StickerBook.addStickerPackExisting(sp);
    }

    //class for downloading Sticker
    private class DownloadFile extends AsyncTask<String, String, String> {

        // private ProgressDialog progressDialog;
        private String fileName;
        private String folder;
        int noOfUrls;
        int rowItems = 0;

        @Override
        protected void onPreExecute() {
            super.onPreExecute();
            progressDialog.show();
        }

        @Override
        protected String doInBackground(String... f_url) {
            noOfUrls = f_url.length;


            //download trayimage
            try {
                int count;
                URL url = new URL(trayimageURI);
                URLConnection connection = url.openConnection();
                connection.connect();
                int lengthoffile = connection.getContentLength();
                InputStream inputStream = new BufferedInputStream(url.openStream(), lengthoffile);
                fileName = trayimageURI.substring(trayimageURI.lastIndexOf('/') + 1);

                folder = Environment.getExternalStorageDirectory().toString() + File.separator + ".WhatsappStickers" + File.separator + folderName + File.separator;
                File dir = new File(folder);

                if (!dir.exists()) {
                    dir.mkdir();
                }
                OutputStream outputStream = new FileOutputStream(folder + fileName);
                byte[] data = new byte[1024];
                long total = 0;
                while ((count = inputStream.read(data)) != -1) {
                    total += count;
                    publishProgress("" + (int) ((total * 100) / lengthoffile));
                    outputStream.write(data, 0, count);
                }
                outputStream.flush();
                outputStream.close();
                inputStream.close();

                trayimage = folder + fileName;

                rowItems++;


            } catch (Exception e) {
                Log.e("Error = >", e.getMessage());
            }

            for (int i = 0; i < f_url.length; i++) {
                int count;
                try {

                    URL url = new URL(f_url[i]);
                    URLConnection connection = url.openConnection();
                    connection.connect();
                    int lengthoffile = connection.getContentLength();
                    InputStream inputStream = new BufferedInputStream(url.openStream(), lengthoffile);
                    fileName = f_url[i].substring(f_url[i].lastIndexOf('/') + 1);

                    folder = Environment.getExternalStorageDirectory().toString() + File.separator + ".WhatsappStickers" + File.separator + folderName + File.separator;
                    File dir = new File(folder);

                    if (!dir.exists()) {
                        dir.mkdir();
                    }
                    OutputStream outputStream = new FileOutputStream(folder + fileName);
                    byte[] data = new byte[1024];
                    long total = 0;
                    while ((count = inputStream.read(data)) != -1) {
                        total += count;
                        publishProgress("" + (int) ((total * 100) / lengthoffile));
                        outputStream.write(data, 0, count);

                    }
                    outputStream.flush();
                    outputStream.close();
                    inputStream.close();
                    urisS[i] = folder + fileName;

                    rowItems++;

                } catch (Exception e) {
                    Log.e("Error = >", e.getMessage());
                }
            }
            return "";
        }

        @Override
        protected void onProgressUpdate(String... values) {
            //super.onProgressUpdate(values);
            progressDialog.setMessage("Downloading  " + rowItems + "/" + noOfUrls);
            progressDialog.setProgress(Integer.parseInt(values[0]));

        }

        @Override
        protected void onPostExecute(String s) {
            super.onPostExecute(s);
            progressDialog.dismiss();
            btn_Download.setText(getString(R.string.btnAddToWhatsapp));
            btn_Download.setBackgroundColor(R.drawable.btnshape);
            btn_Download.setBackgroundColor(ContextCompat.getColor(getApplicationContext(), R.color.colorPrimary));
        }
    }


    //It's a method of Sharing application
    public void shareApp() {
        try {
            Intent shareIntent = new Intent(Intent.ACTION_SEND);
            shareIntent.setType("text/plain");
            shareIntent.putExtra(Intent.EXTRA_SUBJECT, "Whatsapp Sticker");
            String shareMessage = "\nLet me recommend you this application\n\n\n\n Best Sticker App Ever..\n\n";
            shareMessage = shareMessage + "https://play.google.com/store/apps/details?id=" + BuildConfig.APPLICATION_ID + "\n\n";
            shareIntent.putExtra(Intent.EXTRA_TEXT, shareMessage);
            startActivity(Intent.createChooser(shareIntent, "choose one"));
        } catch (Exception e) {
            //e.toString();
        }
    }

    //It's a method of navigation menu bar
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
                Activity_StickerList.this.openAppinPlayStore(Activity_StickerList.this.getPackageName());
                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
    }

    private void openAppinPlayStore(String package_name) {
        Intent goToMarket = new Intent("android.intent.action.VIEW", Uri.parse("market://details?id=" + package_name));
        goToMarket.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        try {
            startActivity(goToMarket);
        } catch (ActivityNotFoundException e) {
            startActivity(new Intent("android.intent.action.VIEW", Uri.parse("http://play.google.com/store/apps/details?id=" + package_name)));
        }
    }

    public void onBackPressed() {
        super.onBackPressed();
        try {
            overridePendingTransition(R.anim.right_in_anim, R.anim.right_out_anim);
        } catch (Exception ignored) {
        }
    }

}