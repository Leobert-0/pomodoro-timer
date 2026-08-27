package com.leobert.pomodoro;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

@CapacitorPlugin(
    name = "TimerNotification",
    permissions = @Permission(alias = "notifications", strings = { Manifest.permission.POST_NOTIFICATIONS })
)
public class TimerNotificationPlugin extends Plugin {
    private static final String CHANNEL_ID = "pomodoro_timer";
    private static final int TIMER_NOTIFICATION_ID = 4101;

    @Override
    public void load() {
        createNotificationChannel();
    }

    @PluginMethod
    public void requestNotificationPermission(PluginCall call) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU || hasNotificationPermission()) {
            resolvePermission(call);
            return;
        }

        requestPermissionForAlias("notifications", call, "notificationPermissionCallback");
    }

    @PermissionCallback
    private void notificationPermissionCallback(PluginCall call) {
        resolvePermission(call);
    }

    @PluginMethod
    public void showTimerNotification(PluginCall call) {
        Long endTimeEpochMs = call.getLong("endTimeEpochMs");
        String title = call.getString("title");
        String phrase = call.getString("phrase");

        if (endTimeEpochMs == null || title == null || phrase == null) {
            call.reject("endTimeEpochMs, title, and phrase are required");
            return;
        }

        long remainingMs = endTimeEpochMs - System.currentTimeMillis();
        if (remainingMs <= 0) {
            cancelTimer();
            JSObject result = new JSObject();
            result.put("shown", false);
            call.resolve(result);
            return;
        }

        if (!hasNotificationPermission()) {
            JSObject result = new JSObject();
            result.put("shown", false);
            call.resolve(result);
            return;
        }

        createNotificationChannel();
        NotificationCompat.Builder notification = baseNotificationBuilder()
            .setContentTitle(title)
            .setContentText(phrase)
            .setWhen(endTimeEpochMs)
            .setShowWhen(true)
            .setUsesChronometer(true)
            .setChronometerCountDown(true)
            .setOngoing(true)
            .setAutoCancel(false)
            .setOnlyAlertOnce(true)
            .setSilent(true)
            .setTimeoutAfter(remainingMs);

        try {
            NotificationManagerCompat.from(getContext()).notify(TIMER_NOTIFICATION_ID, notification.build());
            JSObject result = new JSObject();
            result.put("shown", true);
            call.resolve(result);
        } catch (SecurityException error) {
            JSObject result = new JSObject();
            result.put("shown", false);
            call.resolve(result);
        }
    }

    @PluginMethod
    public void cancelTimerNotification(PluginCall call) {
        cancelTimer();
        call.resolve();
    }

    @PluginMethod
    public void showCompletionNotification(PluginCall call) {
        String title = call.getString("title");
        String body = call.getString("body");

        if (title == null || body == null) {
            call.reject("title and body are required");
            return;
        }

        cancelTimer();
        if (!hasNotificationPermission()) {
            JSObject result = new JSObject();
            result.put("shown", false);
            call.resolve(result);
            return;
        }

        createNotificationChannel();
        NotificationCompat.Builder notification = baseNotificationBuilder()
            .setContentTitle(title)
            .setContentText(body)
            .setAutoCancel(true)
            .setOngoing(false)
            .setOnlyAlertOnce(false)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT);

        try {
            NotificationManagerCompat.from(getContext()).notify(TIMER_NOTIFICATION_ID, notification.build());
            JSObject result = new JSObject();
            result.put("shown", true);
            call.resolve(result);
        } catch (SecurityException error) {
            JSObject result = new JSObject();
            result.put("shown", false);
            call.resolve(result);
        }
    }

    private NotificationCompat.Builder baseNotificationBuilder() {
        Intent launchIntent = new Intent(getContext(), MainActivity.class)
            .addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent contentIntent = PendingIntent.getActivity(
            getContext(),
            0,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        return new NotificationCompat.Builder(getContext(), CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification_timer)
            .setColor(Color.rgb(239, 68, 68))
            .setContentIntent(contentIntent)
            .setCategory(NotificationCompat.CATEGORY_PROGRESS)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setPriority(NotificationCompat.PRIORITY_LOW);
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;

        NotificationManager manager = (NotificationManager) getContext().getSystemService(Context.NOTIFICATION_SERVICE);
        if (manager == null || manager.getNotificationChannel(CHANNEL_ID) != null) return;

        NotificationChannel channel = new NotificationChannel(
            CHANNEL_ID,
            "Pomodoro timer",
            NotificationManager.IMPORTANCE_LOW
        );
        channel.setDescription("Running timer and session completion updates");
        channel.enableVibration(false);
        channel.setSound(null, null);
        manager.createNotificationChannel(channel);
    }

    private boolean hasNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            ContextCompat.checkSelfPermission(getContext(), Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            return false;
        }
        return NotificationManagerCompat.from(getContext()).areNotificationsEnabled();
    }

    private void resolvePermission(PluginCall call) {
        JSObject result = new JSObject();
        result.put("granted", hasNotificationPermission());
        call.resolve(result);
    }

    private void cancelTimer() {
        NotificationManagerCompat.from(getContext()).cancel(TIMER_NOTIFICATION_ID);
    }
}
