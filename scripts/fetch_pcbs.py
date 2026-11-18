#!/usr/bin/env python3
"""Download PCB reference photos linked from Game Verifying and store them locally.

The site then uses the local files, so the pictures still load if the original
host is offline. Re-running skips files that are already valid images.
"""

import html
import json
import re
import subprocess
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PCB = ROOT / "pcb"
OUT = ROOT / "js" / "pcbs.js"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

PAGES = {
    "gb": "https://gameverifying.com/wiki/cart-based-systems/gameboy/pcb",
    "ds": "https://gameverifying.com/wiki/cart-based-systems/nds/pcb",
    "dslist": "https://gameverifying.com/wiki/cart-based-systems/nds/pcblis",
    "n64": "https://gameverifying.com/wiki/cart-based-systems/n64",
    "snes": "https://gameverifying.com/wiki/cart-based-systems/snes",
}

SECTION_CONSOLE = {
    "DMG Board Types": "gameboy",
    "Color Board Types": "gameboy-color",
    "Advance Board Types": "gameboy-advance",
    "Game Boy Camera Board Types": "gameboy",
}


def fetch(url: str) -> str:
    result = subprocess.run(
        ["curl", "-sL", "-A", UA, "-e", "https://gameverifying.com/", "--max-time", "45", url],
        check=True,
        capture_output=True,
    )
    return result.stdout.decode("utf-8", "replace")


def clean(fragment: str) -> str:
    text = re.sub(r"<br\s*/?>", "\n", fragment, flags=re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    text = html.unescape(text)
    text = text.replace("\xa0", " ")
    return re.sub(r"[ \t]+", " ", text).strip()


def lines_of(fragment: str) -> list[str]:
    text = re.sub(r"<br\s*/?>", "\n", fragment, flags=re.I)
    text = re.sub(r"<[^>]+>", "\n", text)
    text = html.unescape(text).replace("\xa0", " ")
    lines = []
    for line in text.splitlines():
        line = re.sub(r"\s+", " ", line).strip()
        if line and line.lower() not in {"n/a", "na", "-", "—"}:
            lines.append(line)
    return lines


def cells(row: str) -> list[str]:
    return re.findall(r"<t[dh][^>]*>([\s\S]*?)</t[dh]>", row)


def normalize_url(url: str) -> str:
    match = re.search(r"archive\.org/(?:\d+/)?items/([^/]+)/([^?#]+)", url)
    if match:
        return f"https://archive.org/download/{match.group(1)}/{match.group(2)}"
    return url


def image_urls(fragment: str) -> list[str]:
    found = re.findall(r'(?:src|href)="(https?://[^"]+)"', fragment, flags=re.I)
    urls = [normalize_url(url) for url in found if re.search(r"\.(?:jpe?g|png|webp|gif)(?:$|\?)", url, re.I)]
    return urls


def slugify(value: str) -> str:
    value = value.lower()
    value = re.sub(r"[^a-z0-9]+", "-", value).strip("-")
    return value[:90] or "board"


def parse_gameboy(page: str) -> list[dict]:
    records = []
    parts = re.split(r"<h3[^>]*>", page)
    for part in parts[1:]:
        heading = clean(part.split("</h3>", 1)[0])
        console = SECTION_CONSOLE.get(heading)
        if not console:
            continue
        body = part.split("</h3>", 1)[-1]
        for row in re.findall(r"<tr[\s\S]*?</tr>", body):
            cols = cells(row)
            if len(cols) < 3 or "<th" in row:
                continue
            names = lines_of(cols[0])
            if not names:
                continue
            fronts = image_urls(cols[1])
            backs = image_urls(cols[2])
            if not fronts and not backs:
                continue
            board = names[0]
            titles = [line for line in names[1:] if "licensed" not in line.lower()]
            if board == "AGB-E05-01":
                titles.extend(
                    f"Pokemon {line}" for line in titles if line.lower() in {"ruby", "sapphire", "emerald"}
                )
            records.append({
                "console": console,
                "board": board,
                "title": board,
                "titles": titles,
                "front_url": fronts[0] if fronts else None,
                "back_url": backs[0] if backs else None,
                "credit": "Game Verifying Game Boy PCB guide",
                "page": PAGES["gb"],
                "warning": None,
            })
    return records


def parse_ds(page: str, title_page: str) -> list[dict]:
    photos = {}
    for row in re.findall(r"<tr[\s\S]*?</tr>", page):
        cols = cells(row)
        if len(cols) < 3 or "<th" in row:
            continue
        board = clean(cols[0])
        if not re.match(r"^[A-Z0-9]{2,}-?[A-Z0-9]+$", board):
            continue
        fronts = image_urls(cols[1])
        backs = image_urls(cols[2])
        photos[board] = (fronts[0] if fronts else None, backs[0] if backs else None)

    titles = {}
    for row in re.findall(r"<tr[\s\S]*?</tr>", title_page):
        cols = cells(row)
        if len(cols) < 3 or "<th" in row:
            continue
        game = clean(cols[0])
        boards = [part.strip() for part in clean(cols[2]).split(",") if part.strip()]
        for board in boards:
            titles.setdefault(board, [])
            if game and game not in titles[board]:
                titles[board].append(game)

    records = []
    for board in sorted(set(photos) | set(titles)):
        front, back = photos.get(board, (None, None))
        warning = None
        if board.startswith("Y08"):
            warning = "Game Verifying has documented this board code on counterfeit DS cards. A similar photo is not proof."
        records.append({
            "console": "nintendo-ds",
            "board": board,
            "title": board,
            "titles": titles.get(board, []),
            "front_url": front,
            "back_url": back,
            "credit": "Game Verifying Nintendo DS PCB guide",
            "page": PAGES["ds"],
            "warning": warning,
        })
    return records


def parse_n64(page: str) -> list[dict]:
    records = []
    for row in re.findall(r"<tr[\s\S]*?</tr>", page):
        cols = cells(row)
        if len(cols) < 2 or "<th" in row:
            continue
        title = clean(cols[0])
        code = clean(cols[1])
        urls = image_urls(cols[1]) or image_urls(row)
        if not re.match(r"NUS-[A-Z0-9]+-(?:USA|EUR|JPN|AUS|CAN)", code) or not urls:
            continue
        base = re.sub(r"\s*\([^)]*\)", "", title).strip()
        names = [title]
        if base and base.lower() != title.lower():
            names.append(base)
        records.append({
            "console": "nintendo-64",
            "board": code,
            "title": title,
            "titles": names,
            "front_url": urls[0],
            "back_url": None,
            "credit": "Game Verifying Nintendo 64 board list",
            "page": PAGES["n64"],
            "warning": None,
        })
    return records


def parse_snes(page: str) -> list[dict]:
    records = []
    for row in re.findall(r"<tr[\s\S]*?</tr>", page):
        cols = cells(row)
        if len(cols) < 2 or "<th" in row:
            continue
        urls = image_urls(cols[-1])
        if not urls:
            continue
        title = clean(cols[0])
        board = clean(cols[-1]) or title
        base = re.sub(r"\s*\([^)]*\)", "", title).strip()
        names = [title]
        if base and base.lower() != title.lower():
            names.append(base)
        records.append({
            "console": "super-nintendo",
            "board": board,
            "title": title,
            "titles": names,
            "front_url": urls[0],
            "back_url": None,
            "credit": "SNES Central scan linked from the Game Verifying SNES guide",
            "page": PAGES["snes"],
            "warning": None,
        })
    return records


def extension(url: str, data: bytes) -> str:
    if data.startswith(b"\x89PNG"):
        return "png"
    if data.startswith(b"GIF8"):
        return "gif"
    if data.startswith(b"RIFF") and data[8:12] == b"WEBP":
        return "webp"
    if data.startswith(b"\xff\xd8"):
        return "jpg"
    match = re.search(r"\.(png|jpe?g|webp|gif)", url, re.I)
    return match.group(1).lower().replace("jpeg", "jpg") if match else "jpg"


def is_image(data: bytes) -> bool:
    return (
        data.startswith(b"\xff\xd8")
        or data.startswith(b"\x89PNG")
        or data.startswith(b"GIF8")
        or (data.startswith(b"RIFF") and data[8:12] == b"WEBP")
    )


def download_one(url: str, dest_stem: Path) -> str | None:
    existing = list(dest_stem.parent.glob(dest_stem.name + ".*"))
    for path in existing:
        if path.stat().st_size > 800 and is_image(path.read_bytes()[:16]):
            return str(path.relative_to(ROOT))
    dest_stem.parent.mkdir(parents=True, exist_ok=True)
    tmp = dest_stem.with_suffix(".part")
    for _ in range(3):
        result = subprocess.run(
            ["curl", "-sL", "-A", UA, "-e", "https://gameverifying.com/", "--max-time", "25", "-o", str(tmp), url],
            capture_output=True,
        )
        data = tmp.read_bytes() if tmp.exists() else b""
        if result.returncode == 0 and is_image(data) and len(data) > 800:
            final = dest_stem.with_suffix("." + extension(url, data))
            tmp.replace(final)
            return str(final.relative_to(ROOT))
        time.sleep(0.4)
    if tmp.exists():
        tmp.unlink()
    return None


def main() -> None:
    print("fetching guides")
    pages = {key: fetch(url) for key, url in PAGES.items()}
    time.sleep(0.2)
    records = []
    records.extend(parse_gameboy(pages["gb"]))
    records.extend(parse_ds(pages["ds"], pages["dslist"]))
    records.extend(parse_n64(pages["n64"]))
    records.extend(parse_snes(pages["snes"]))
    print(f"records {len(records)}")

    jobs = {}
    for index, record in enumerate(records):
        slug = slugify(f"{record['board']}-{record['title']}")
        record["id"] = f"{record['console']}-{slug}"
        for side in ("front", "back"):
            url = record.get(f"{side}_url")
            if not url:
                record[side] = None
                continue
            if url not in jobs:
                jobs[url] = PCB / record["console"] / f"{slug}-{side}"
            record[f"_{side}_job"] = url

    print(f"downloading {len(jobs)} images")
    saved = {}
    failed = []
    with ThreadPoolExecutor(max_workers=6) as pool:
        futures = {pool.submit(download_one, url, dest): url for url, dest in jobs.items()}
        done = 0
        for future in as_completed(futures):
            url = futures[future]
            done += 1
            try:
                path = future.result()
            except Exception as exc:
                path = None
                print("error", url, exc)
            saved[url] = path
            if not path:
                failed.append(url)
            if done % 40 == 0 or done == len(futures):
                print(f"  {done}/{len(futures)}")

    public = []
    seen = set()
    for record in records:
        for side in ("front", "back"):
            url = record.pop(f"_{side}_job", None)
            record[side] = saved.get(url) if url else None
            record.pop(f"{side}_url", None)
        if not record["front"] and not record["back"] and not record["titles"]:
            continue
        if record["id"] in seen:
            record["id"] += f"-{len(seen)}"
        seen.add(record["id"])
        public.append(record)

    with_photo = sum(1 for record in public if record["front"] or record["back"])
    OUT.write_text(
        "window.PCBS = " + json.dumps(public, ensure_ascii=False, separators=(",", ":")) + ";\n",
        encoding="utf-8",
    )
    print(f"wrote {OUT} ({len(public)} boards, {with_photo} with a local photo)")
    print(f"failed downloads: {len(failed)}")
    for url in failed[:20]:
        print(" ", url)


if __name__ == "__main__":
    main()
