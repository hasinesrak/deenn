package expo.modules.deenunlock

data class VerseRecord(
  val id: Int,
  val surahId: Int,
  val ayahNumber: Int,
  val surahName: String,
  val arabic: String,
  val transliterationEn: String,
  val transliterationBn: String,
  val meaningEn: String,
  val meaningBn: String?
)
