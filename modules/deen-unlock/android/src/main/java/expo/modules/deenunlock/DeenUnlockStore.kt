package expo.modules.deenunlock

import android.content.Context

object DeenUnlockStore {
  private const val PREFS = "deen_unlock"

  fun prefs(context: Context) =
    context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

  fun isEnabled(context: Context) = prefs(context).getBoolean("enabled", false)

  fun mode(context: Context) = prefs(context).getString("mode", "random") ?: "random"

  fun pronunciation(context: Context) =
    prefs(context).getString("pronunciation", "english") ?: "english"

  fun meaningLanguage(context: Context) =
    prefs(context).getString("meaningLanguage", "english") ?: "english"

  fun lastShownVerseId(context: Context) = prefs(context).getInt("lastShownVerseId", 0)

  fun sequentialVerseId(context: Context) = prefs(context).getInt("sequentialVerseId", 1)

  fun sequentialCompleted(context: Context) = prefs(context).getBoolean("sequentialCompleted", false)

  fun lastShownAt(context: Context) = prefs(context).getLong("lastShownAt", 0L)

  fun dbPath(context: Context) = prefs(context).getString("dbPath", "") ?: ""

  fun save(
    context: Context,
    enabled: Boolean,
    mode: String,
    pronunciation: String,
    meaningLanguage: String,
    lastShownVerseId: Int,
    sequentialVerseId: Int,
    sequentialCompleted: Boolean,
    dbPath: String
  ) {
    prefs(context).edit()
      .putBoolean("enabled", enabled)
      .putString("mode", mode)
      .putString("pronunciation", pronunciation)
      .putString("meaningLanguage", meaningLanguage)
      .putInt("lastShownVerseId", lastShownVerseId)
      .putInt("sequentialVerseId", sequentialVerseId)
      .putBoolean("sequentialCompleted", sequentialCompleted)
      .putString("dbPath", dbPath)
      .apply()
  }

  fun saveProgress(
    context: Context,
    lastShownVerseId: Int,
    sequentialVerseId: Int,
    sequentialCompleted: Boolean,
    lastShownAt: Long
  ) {
    prefs(context).edit()
      .putInt("lastShownVerseId", lastShownVerseId)
      .putInt("sequentialVerseId", sequentialVerseId)
      .putBoolean("sequentialCompleted", sequentialCompleted)
      .putLong("lastShownAt", lastShownAt)
      .apply()
  }
}
