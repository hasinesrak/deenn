package expo.modules.deenunlock

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat

object UnlockNotifier {
  private const val CHANNEL_ID = "deen-unlock"
  private const val NOTIFICATION_ID = 94

  fun show(context: Context, verse: VerseRecord) {
    ensureChannel(context)

    val deepLink = Uri.parse("deenn://verse/${verse.id}")
    val openIntent = Intent(Intent.ACTION_VIEW, deepLink).apply {
      flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
      `package` = context.packageName
    }
    val contentIntent = PendingIntent.getActivity(
      context,
      verse.id,
      openIntent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )

    val pronunciation = DeenUnlockStore.pronunciation(context)
    val meaningLanguage = DeenUnlockStore.meaningLanguage(context)
    val body = buildString {
      append(verse.arabic)
      append('\n')
      if (pronunciation == "english" || pronunciation == "both") {
        append(verse.transliterationEn)
        append('\n')
      }
      if (pronunciation == "bengali" || pronunciation == "both") {
        append(verse.transliterationBn)
        append('\n')
      }
      if ((meaningLanguage == "english" || meaningLanguage == "both") && verse.meaningEn.isNotBlank()) {
        append(verse.meaningEn)
        append('\n')
      }
      if ((meaningLanguage == "bengali" || meaningLanguage == "both") && !verse.meaningBn.isNullOrBlank()) {
        append(verse.meaningBn)
      }
    }

    val notification = NotificationCompat.Builder(context, CHANNEL_ID)
      .setSmallIcon(android.R.drawable.ic_menu_info_details)
      .setContentTitle("Deen  ·  ${verse.surahId} : ${verse.ayahNumber}")
      .setContentText("A verse for your day")
      .setStyle(NotificationCompat.BigTextStyle().bigText(body).setSummaryText(verse.surahName))
      .setContentIntent(contentIntent)
      .setAutoCancel(true)
      .setPriority(NotificationCompat.PRIORITY_HIGH)
      .setCategory(NotificationCompat.CATEGORY_REMINDER)
      .setColor(0xFF17231D.toInt())
      .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
      .addAction(0, "Read in Deen", contentIntent)
      .build()

    NotificationManagerCompat.from(context).notify(NOTIFICATION_ID, notification)
  }

  private fun ensureChannel(context: Context) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return
    }
    val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    val channel = NotificationChannel(
      CHANNEL_ID,
      "Unlock verses",
      NotificationManager.IMPORTANCE_HIGH
    ).apply {
      description = "A Quran verse after you unlock your phone"
      enableVibration(true)
      vibrationPattern = longArrayOf(0, 40)
    }
    manager.createNotificationChannel(channel)
  }
}
