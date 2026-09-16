package expo.modules.deenunlock

import android.database.sqlite.SQLiteDatabase
import kotlin.random.Random

object UnlockVerseSelector {
  private const val TOTAL_VERSES = 6236

  fun select(context: android.content.Context): VerseRecord? {
    val path = DeenUnlockStore.dbPath(context)
    if (path.isBlank()) {
      return null
    }

    val db = SQLiteDatabase.openDatabase(path, null, SQLiteDatabase.OPEN_READONLY)
    try {
      val mode = DeenUnlockStore.mode(context)
      val verse = if (mode == "sequential") {
        val currentId = DeenUnlockStore.sequentialVerseId(context).coerceIn(1, TOTAL_VERSES)
        loadVerse(db, currentId)
      } else {
        val exclude = DeenUnlockStore.lastShownVerseId(context)
        var next = Random.nextInt(1, TOTAL_VERSES + 1)
        if (exclude != 0 && next == exclude) {
          next = if (next == TOTAL_VERSES) 1 else next + 1
        }
        loadVerse(db, next)
      } ?: return null

      val now = System.currentTimeMillis()
      if (mode == "sequential") {
        val completed = verse.id >= TOTAL_VERSES
        val nextSequential = if (completed) verse.id else verse.id + 1
        DeenUnlockStore.saveProgress(context, verse.id, nextSequential, completed, now)
      } else {
        DeenUnlockStore.saveProgress(
          context,
          verse.id,
          DeenUnlockStore.sequentialVerseId(context),
          DeenUnlockStore.sequentialCompleted(context),
          now
        )
      }
      return verse
    } finally {
      db.close()
    }
  }

  private fun loadVerse(db: SQLiteDatabase, id: Int): VerseRecord? {
    val hasMeaningBn = try {
      db.rawQuery("PRAGMA table_info(verses)", null).use { cursor ->
        var found = false
        while (cursor.moveToNext()) {
          if (cursor.getString(1) == "meaning_bn") {
            found = true
            break
          }
        }
        found
      }
    } catch (_: Exception) {
      false
    }
    val meaningBnSelect = if (hasMeaningBn) "COALESCE(v.meaning_bn, '')" else "''"
    val cursor = db.rawQuery(
      """
      SELECT v.id, v.surah_id, v.ayah_number, v.arabic,
             v.transliteration_en, v.transliteration_bn, v.meaning_en, $meaningBnSelect, s.name
      FROM verses v
      JOIN surahs s ON s.id = v.surah_id
      WHERE v.id = ?
      """.trimIndent(),
      arrayOf(id.toString())
    )
    cursor.use {
      if (!it.moveToFirst()) {
        return null
      }
      val meaningBn = it.getString(7)?.takeIf { value -> value.isNotBlank() }
      return VerseRecord(
        id = it.getInt(0),
        surahId = it.getInt(1),
        ayahNumber = it.getInt(2),
        arabic = it.getString(3),
        transliterationEn = it.getString(4),
        transliterationBn = it.getString(5),
        meaningEn = it.getString(6),
        meaningBn = meaningBn,
        surahName = it.getString(8)
      )
    }
  }
}
