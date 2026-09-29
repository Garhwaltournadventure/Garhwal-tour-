package com.garhwaltournadventure.booking;

import android.Manifest;
import android.app.Activity;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Notification;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import androidx.core.app.NotificationCompat;

public class MainActivity extends Activity {
    private static final String APP_URL = "https://garhwal-booking.pages.dev/staff.html";
    private static final String CHANNEL_ID = "garhwal_bookings";
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        createNotificationChannel();
        if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, 1001);
        }
        webView = new WebView(this);
        setContentView(webView);

        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setDatabaseEnabled(true);
        webView.getSettings().setSupportZoom(false);
        webView.getSettings().setBuiltInZoomControls(false);
        webView.getSettings().setDisplayZoomControls(false);
        webView.addJavascriptInterface(new AndroidNotifications(), "AndroidNotifications");
        webView.setWebChromeClient(new WebChromeClient());

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return handleUrl(request.getUrl().toString());
            }
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return handleUrl(url);
            }
        });

        if (savedInstanceState == null) webView.loadUrl(APP_URL);
        else webView.restoreState(savedInstanceState);
    }

    private boolean handleUrl(String url) {
        if (url.startsWith("tel:") || url.startsWith("sms:") ||
            url.startsWith("mailto:") || url.startsWith("whatsapp:") ||
            url.startsWith("https://wa.me/") || url.startsWith("https://api.whatsapp.com/")) {
            try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url))); }
            catch (Exception e) { Toast.makeText(this, "No suitable app found.", Toast.LENGTH_SHORT).show(); }
            return true;
        }
        return false;
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel c = new NotificationChannel(CHANNEL_ID, "Booking Notifications", NotificationManager.IMPORTANCE_HIGH);
            c.setDescription("New Garhwal Tour N Adventure bookings");
            getSystemService(NotificationManager.class).createNotificationChannel(c);
        }
    }

    public class AndroidNotifications {
        @JavascriptInterface
        public void notifyBooking(String title, String body) {
            runOnUiThread(() -> {
                Notification n = new NotificationCompat.Builder(MainActivity.this, CHANNEL_ID)
                    .setSmallIcon(com.garhwaltournadventure.booking.R.drawable.ic_launcher)
                    .setContentTitle(title)
                    .setContentText(body)
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
                    .setAutoCancel(true)
                    .build();
                if (Build.VERSION.SDK_INT < 33 || checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED) {
                    getSystemService(NotificationManager.class).notify((int)System.currentTimeMillis(), n);
                }
            });
        }
    }

    @Override public void onBackPressed() {
        if (webView.canGoBack()) webView.goBack(); else super.onBackPressed();
    }
    @Override protected void onSaveInstanceState(Bundle outState) {
        webView.saveState(outState); super.onSaveInstanceState(outState);
    }
}
