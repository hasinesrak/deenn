# Quran data sources

Deen bundles an offline SQLite database built from [quran-dataset](https://github.com/nafiskabbo/quran-dataset).

| Field | Source |
| --- | --- |
| Arabic Uthmani text | quran-dataset (`verses.text_uthmani`) |
| English meaning | Saheeh International (`translations.lang_code = en`) |
| English pronunciation | quran-dataset English transliteration (`en.transliteration`) |
| Bengali pronunciation | Derived phonetically from the English transliteration for offline V1 |
| Surah metadata | quran-dataset `surahs` table |

Rebuild the bundled database:

```bash
python scripts/build-quran-db.py
```

The Quran text and translations have their own licenses and attribution requirements. See the dataset’s [DATA_SOURCES.md](https://github.com/nafiskabbo/quran-dataset/blob/main/docs/DATA_SOURCES.md).
