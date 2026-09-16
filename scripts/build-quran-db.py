#!/usr/bin/env python3
"""Build Deen's compact offline Quran database from nafiskabbo/quran-dataset.

Source: https://github.com/nafiskabbo/quran-dataset
Arabic (Uthmani), English translation (Saheeh International), and English
transliteration come from that dataset. Bengali pronunciation is derived
phonetically from the English transliteration for offline V1.
"""

from __future__ import annotations

import json
import sqlite3
import sys
import tempfile
import urllib.request
from pathlib import Path

SOURCE_DB_URL = (
    "https://github.com/nafiskabbo/quran-dataset/raw/main/data/quran.db"
)
EXPECTED_VERSES = 6236
EXPECTED_SURAHS = 114

# Longer digraphs first so they are not split by single-letter rules.
LATIN_TO_BN: list[tuple[str, str]] = [
    ("aa", "আ"),
    ("ee", "ঈ"),
    ("ii", "ঈ"),
    ("oo", "উ"),
    ("uu", "উ"),
    ("kh", "খ"),
    ("gh", "ঘ"),
    ("th", "স"),
    ("dh", "দ"),
    ("sh", "শ"),
    ("ch", "চ"),
    ("zh", "য"),
    ("ph", "ফ"),
    ("ng", "ং"),
    ("ā", "আ"),
    ("ī", "ঈ"),
    ("ū", "উ"),
    ("á", "আ"),
    ("í", "ই"),
    ("ú", "উ"),
    ("a", "া"),
    ("b", "ব"),
    ("c", "ক"),
    ("d", "দ"),
    ("e", "ে"),
    ("f", "ফ"),
    ("g", "গ"),
    ("h", "হ"),
    ("i", "ি"),
    ("j", "জ"),
    ("k", "ক"),
    ("l", "ল"),
    ("m", "ম"),
    ("n", "ন"),
    ("o", "ো"),
    ("p", "প"),
    ("q", "ক"),
    ("r", "র"),
    ("s", "স"),
    ("t", "ত"),
    ("u", "ু"),
    ("v", "ভ"),
    ("w", "ও"),
    ("x", "ক্স"),
    ("y", "য়"),
    ("z", "জ"),
    ("'", "‘"),
    ("`", "‘"),
    ("-", " "),
]


def latin_to_bengali(text: str) -> str:
    """Approximate Bengali pronunciation from Latin Quran transliteration."""
    if not text:
        return ""

    out: list[str] = []
    i = 0
    lower = text.lower()
    vowel_markers = set("ািীুূেোআইঈউঊএও‘' ")

    while i < len(lower):
        ch = lower[i]
        if ch in " \n\t,.;:!?()[]{}":
            out.append(" ")
            i += 1
            continue

        matched = False
        for latin, bn in LATIN_TO_BN:
            if lower.startswith(latin, i):
                if latin in ("a", "i", "u", "e", "o") and (
                    not out or out[-1] in vowel_markers or out[-1] == " "
                ):
                    independent = {
                        "a": "আ",
                        "i": "ই",
                        "u": "উ",
                        "e": "এ",
                        "o": "ও",
                    }[latin]
                    out.append(independent)
                else:
                    out.append(bn)
                i += len(latin)
                matched = True
                break
        if not matched:
            i += 1

    rendered = "".join(out)
    while "  " in rendered:
        rendered = rendered.replace("  ", " ")
    return rendered.strip()


def download_source(dest: Path) -> None:
    print(f"Downloading source dataset to {dest} ...")
    with urllib.request.urlopen(SOURCE_DB_URL, timeout=120) as response:
        dest.write_bytes(response.read())
    print(f"Downloaded {dest.stat().st_size / 1_048_576:.1f} MB")


def table_columns(conn: sqlite3.Connection, table: str) -> set[str]:
    rows = conn.execute(f"PRAGMA table_info({table})").fetchall()
    return {row[1] for row in rows}


def build(output: Path, source: Path) -> None:
    src = sqlite3.connect(f"file:{source.as_posix()}?mode=ro", uri=True)
    src.row_factory = sqlite3.Row

    verse_cols = table_columns(src, "verses")
    surah_cols = table_columns(src, "surahs")
    print("verses columns:", sorted(verse_cols))
    print("surahs columns:", sorted(surah_cols))
    print("translations sample:")
    print(src.execute("SELECT * FROM translations LIMIT 1").fetchone())
    print("transliterations sample:")
    print(src.execute("SELECT * FROM transliterations LIMIT 1").fetchone())

    arabic_col = "text_uthmani" if "text_uthmani" in verse_cols else "text"

    if output.exists():
        output.unlink()

    dst = sqlite3.connect(output)
    dst.row_factory = sqlite3.Row
    dst.execute("PRAGMA journal_mode = OFF")
    dst.execute("PRAGMA synchronous = OFF")
    dst.executescript(
        """
        CREATE TABLE surahs (
          id INTEGER PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          arabic_name TEXT NOT NULL,
          translated_name TEXT,
          revelation_type TEXT,
          verse_count INTEGER NOT NULL
        );

        CREATE TABLE verses (
          id INTEGER PRIMARY KEY NOT NULL,
          surah_id INTEGER NOT NULL,
          ayah_number INTEGER NOT NULL,
          arabic TEXT NOT NULL,
          transliteration_en TEXT NOT NULL,
          transliteration_bn TEXT NOT NULL,
          meaning_en TEXT NOT NULL,
          meaning_bn TEXT,
          FOREIGN KEY (surah_id) REFERENCES surahs(id)
        );

        CREATE INDEX idx_verses_surah ON verses(surah_id, ayah_number);

        CREATE TABLE meta (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL
        );
        """
    )

    surahs = src.execute(
        """
        SELECT id, name_en, name_ar, translated_name, revelation_place, verse_count
        FROM surahs
        ORDER BY id
        """
    ).fetchall()

    dst.executemany(
        """
        INSERT INTO surahs (id, name, arabic_name, translated_name, revelation_type, verse_count)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        [
            (
                row["id"],
                row["name_en"],
                row["name_ar"],
                row["translated_name"],
                row["revelation_place"],
                row["verse_count"],
            )
            for row in surahs
        ],
    )

    verses = src.execute(
        f"""
        SELECT
          v.surah_id,
          v.ayah_number,
          v.verse_key,
          v.{arabic_col} AS arabic,
          COALESCE((
            SELECT t.text FROM translations t
            WHERE t.verse_key = v.verse_key AND t.lang_code = 'en'
            ORDER BY CASE WHEN t.translator LIKE '%Saheeh%' THEN 0 ELSE 1 END
            LIMIT 1
          ), '') AS meaning_en,
          COALESCE((
            SELECT t.text FROM translations t
            WHERE t.verse_key = v.verse_key AND t.lang_code = 'bn'
            LIMIT 1
          ), '') AS meaning_bn,
          COALESCE((
            SELECT tl.text FROM transliterations tl
            WHERE tl.verse_key = v.verse_key AND tl.lang_code = 'en'
            LIMIT 1
          ), '') AS transliteration_en
        FROM verses v
        ORDER BY v.surah_id, v.ayah_number
        """
    ).fetchall()

    rows = []
    for index, verse in enumerate(verses, start=1):
        transliteration_en = (verse["transliteration_en"] or "").strip()
        rows.append(
            (
                index,
                verse["surah_id"],
                verse["ayah_number"],
                verse["arabic"],
                transliteration_en,
                latin_to_bengali(transliteration_en),
                (verse["meaning_en"] or "").strip(),
                (verse["meaning_bn"] or "").strip() or None,
            )
        )

    dst.executemany(
        """
        INSERT INTO verses (
          id, surah_id, ayah_number, arabic,
          transliteration_en, transliteration_bn, meaning_en, meaning_bn
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        rows,
    )

    dst.executemany(
        "INSERT INTO meta (key, value) VALUES (?, ?)",
        [
            ("source", "https://github.com/nafiskabbo/quran-dataset"),
            ("translation", "Saheeh International"),
            ("transliteration", "en.transliteration"),
            ("verse_count", str(len(rows))),
            ("surah_count", str(len(surahs))),
        ],
    )

    dst.commit()

    verse_count = dst.execute("SELECT COUNT(*) FROM verses").fetchone()[0]
    surah_count = dst.execute("SELECT COUNT(*) FROM surahs").fetchone()[0]
    empty_meaning = dst.execute(
        "SELECT COUNT(*) FROM verses WHERE meaning_en = ''"
    ).fetchone()[0]
    empty_bn_meaning = dst.execute(
        "SELECT COUNT(*) FROM verses WHERE meaning_bn IS NULL OR meaning_bn = ''"
    ).fetchone()[0]
    empty_tl = dst.execute(
        "SELECT COUNT(*) FROM verses WHERE transliteration_en = ''"
    ).fetchone()[0]
    sample = dst.execute(
        "SELECT id, surah_id, ayah_number, arabic, transliteration_en, transliteration_bn, meaning_en, meaning_bn "
        "FROM verses WHERE surah_id = 94 AND ayah_number = 6"
    ).fetchone()

    json_path = output.with_name("quran-data.json")
    surah_rows = dst.execute(
        """
        SELECT id, name, arabic_name AS arabicName, translated_name AS translatedName,
               revelation_type AS revelationType, verse_count AS verseCount
        FROM surahs ORDER BY id
        """
    ).fetchall()
    verse_rows = dst.execute(
        """
        SELECT id, surah_id AS surahId, ayah_number AS ayahNumber, arabic,
               transliteration_en AS transliterationEn, transliteration_bn AS transliterationBn,
               meaning_en AS meaningEn, meaning_bn AS meaningBn
        FROM verses ORDER BY id
        """
    ).fetchall()
    json_path.write_text(
        json.dumps(
            {
                "surahs": [dict(row) for row in surah_rows],
                "verses": [dict(row) for row in verse_rows],
            },
            ensure_ascii=False,
            separators=(",", ":"),
        ),
        encoding="utf-8",
    )

    src.close()
    dst.execute("VACUUM")
    dst.close()

    print(f"Wrote {json_path} ({json_path.stat().st_size / 1_048_576:.2f} MB)")
    print(f"Wrote {output} ({output.stat().st_size / 1_048_576:.2f} MB)")
    print(f"Surahs: {surah_count}  Verses: {verse_count}")
    print(f"Empty meanings: {empty_meaning}  Empty BN meanings: {empty_bn_meaning}  Empty EN transliterations: {empty_tl}")
    print("Sample 94:6:", sample)

    if verse_count != EXPECTED_VERSES or surah_count != EXPECTED_SURAHS:
        raise SystemExit(
            f"Unexpected counts: verses={verse_count} surahs={surah_count}"
        )
    if empty_meaning:
        raise SystemExit("Some verses are missing English meaning")
    if empty_tl:
        raise SystemExit("Some verses are missing English transliteration")


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    output = root / "assets" / "quran.db"
    output.parent.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory() as tmp:
        source = Path(tmp) / "quran-source.db"
        download_source(source)
        build(output, source)


if __name__ == "__main__":
    sys.exit(main())
