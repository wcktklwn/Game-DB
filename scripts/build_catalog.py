#!/usr/bin/env python3
"""Build a local cartridge catalog from public PriceCharting console pages.

Stores titles, page links, and photo URLs. Does not store prices.
Nintendo 64 board codes come from the public Game Verifying board list.
"""

import html
import json
import re
import subprocess
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "js" / "catalog.js"

CONSOLES = [
    "nes",
    "super-nintendo",
    "nintendo-64",
    "gameboy",
    "gameboy-color",
    "gameboy-advance",
    "nintendo-ds",
    "nintendo-3ds",
    "nintendo-switch",
    "sega-genesis",
    "sega-game-gear",
    "atari-2600",
]

SKIP = re.compile(
    r"\b("
    r"console|controller|system|adapter|cable|zapper|light gun|"
    r"expansion pak|rumble pak|jumper pak|memory pak|transfer pak|"
    r"power supply|ac adapter|rf switch|av cable|"
    r"carry case|carrying case|travel case|storage case|dust cover|"
    r"strategy guide|player'?s guide|players guide|official guide|guidebook|"
    r"poster|manual only|box only|hardware|cleaning kit|"
    r"joy-?con|pro controller|nunchuk|sensor bar|"
    r"game boy camera|game boy printer|game boy player|"
    r"link cable|e-reader|amiibo|charging dock|dock set"
    r")\b",
    re.I,
)

# PriceCharting's notable page mixes carts with systems, accessories, and cheat devices.
# These are the product names that do not contain the generic words above.
HARDWARE = re.compile(
    r"("
    r"\bgame ?genie\b|"
    r"\bgameshark\b|"
    r"\bgame shark\b|"
    r"\baction replay\b|"
    r"\bpower glove\b|"
    r"\brob the robot\b|"
    r"\bgame ?boy camera\b|"
    r"\bgame ?boy printer\b|"
    r"\bgame ?boy pocket\b|"
    r"\boriginal game ?boy\b|"
    r"\bgame ?boy light\b|"
    r"\blight boy\b|"
    r"\bplay it loud\b|"
    r"\bgame ?boy color\b|"
    r"\bgame ?boy advance\b|"
    r"\bgba micro\b|"
    r"\bnintendo ds lite\b|"
    r"\bnintendo dsi\b|"
    r"\bnes classic edition\b|"
    r"\bsuper nintendo classic edition\b|"
    r"\banalogue\b|"
    r"\bsega genesis mini\b|"
    r"\bsega nomad\b|"
    r"x'eye|"
    r"\batari flashback\b|"
    r"\bsnes super set\b|"
    r"\bdonkey kong set\b|"
    r"atomic purple bundle|"
    r"\bsega game gear\b|"
    r"\btv tuner\b|"
    r"\bsuper wide gear\b|"
    r"\bpower ?back\b|"
    r"game gear bag|"
    r"\barcade power stick\b|"
    r"\bpower base converter\b|"
    r"\bpoke ball plus\b|"
    r"\bpokemon go plus\b|"
    r"\bcosmic commander control\b|"
    r"\bcompumate\b|"
    r"\bexertainment\b|"
    r"\bsuper game ?boy\b|"
    r"\[gun bundle\]|"
    r"\[mouse bundle\]|"
    r"touch pad bundle|"
    r"nintendo 64 .+ bundle|"
    r"^(?:new )?nintendo [23]ds\b|"
    r"^nintendo switch (?:oled|lite|animal crossing|pokemon|fortnite)\b"
    r")",
    re.I,
)

# Cartridge Pokemon label codes published by Game Verifying.
# Photos are the label examples linked from that list.
POKEMON = [
    ("nintendo-64", "Hey You, Pikachu!", [("JP", "NUS-NPGJ-JPN", None), ("US", "NUS-NPGE-USA", None)]),
    ("nintendo-64", "Pokemon Puzzle League", [("EU", "NUS-NPNP-EUR", None), ("US", "NUS-NPNE-USA", None)]),
    ("nintendo-64", "Pokemon Snap", [("AU", "NUS-NPFU-AUS", None), ("EU", "NUS-NPFP-EUR", None), ("JP", "NUS-NPFJ-JPN", None), ("US", "NUS-NPFE-USA", None)]),
    ("nintendo-64", "Pokemon Stadium", [("EU", "NUS-NPOP-EUR", None), ("US", "NUS-NPOE-USA", None)]),
    ("nintendo-64", "Pokemon Stadium 2", [("EU", "NUS-NP3P-EUR", None), ("JP", "NUS-NP3J-JPN", None), ("US", "NUS-NP3E-USA", None)]),
    ("nintendo-ds", "Pokemon Black", [("AU", "TWL-IRBO-AUS", None), ("EU", "TWL-IRBO-EUR", "https://i.imgur.com/1mdipIb.png"), ("FR", "TWL-IRBF-FRA", None), ("DE", "TWL-IRBD-NOE", None), ("JP", "TWL-IRBJ-JPN", None), ("US", "TWL-IRBO-USA", "https://i.imgur.com/EPwycdgl.jpg")]),
    ("nintendo-ds", "Pokemon Black 2", [("AU", "TWL-IREO-AUS", None), ("EU", "TWL-IREO-EUR", "https://i.imgur.com/Vin0jAP.jpg"), ("JP", "TWL-IREJ-JPN", None), ("US", "TWL-IREO-USA", "https://i.imgur.com/cBseuDu.jpg")]),
    ("nintendo-ds", "Pokemon Conquest", [("JP", "TWL-VPYJ-JPN", None), ("US", "TWL-VPYT-USA", None)]),
    ("nintendo-ds", "Pokemon Diamond", [("AU", "NTR-ADAE-AUS", None), ("EU", "NTR-ADAP-EUR", "https://i.imgur.com/bpQzwej.jpg"), ("DE", "NTR-ADAD-NOE", None), ("JP", "NTR-ADAJ-JPN", None), ("US", "NTR-ADAE-USA", "https://i.imgur.com/xJ0LZDs.png")]),
    ("nintendo-ds", "Pokemon HeartGold", [("AU", "NTR-IPKE-AUS", None), ("EU", "NTR-IPKP-EUR", None), ("DE", "NTR-IPKD-NOE", None), ("JP", "NTR-IPKJ-JPN", None), ("US", "NTR-IPKE-USA", "https://i.imgur.com/kKpP0EE.jpg")]),
    ("nintendo-ds", "Pokemon Mystery Dungeon: Blue Rescue Team", [("US", "NTR-APHE-USA", None)]),
    ("nintendo-ds", "Pokemon Mystery Dungeon: Explorers of Darkness", [("EU", "NTR-YFYP-EUR", None)]),
    ("nintendo-ds", "Pokemon Mystery Dungeon: Explorers of Time", [("AU", "NTR-YFTP-AUS", None), ("EU", "NTR-YFTP-EUR", None)]),
    ("nintendo-ds", "Pokemon Pearl", [("AU", "NTR-APAE-AUS", None), ("EU", "NTR-APAP-EUR", "https://i.imgur.com/Q4nI3EC.jpg"), ("DE", "NTR-APAD-NOE", None), ("JP", "NTR-APAJ-JPN", None), ("UK", "NTR-APAP-UKV", None), ("US", "NTR-APAE-USA", "https://i.imgur.com/15kiKNG.png")]),
    ("nintendo-ds", "Pokemon Platinum", [("AU", "NTR-CPUE-AUS", "https://i.imgur.com/kymEjar.jpg"), ("EU", "NTR-CPUP-EUR", "https://i.redd.it/bn6l1uxu94w41.jpg"), ("DE", "NTR-CPUD-NOE", None), ("JP", "NTR-CPUJ-JPN", None), ("UK", "NTR-CPUP-UKV", None), ("US", "NTR-CPUE-USA", "https://i.imgur.com/atM0vPs.png")]),
    ("nintendo-ds", "Pokemon Ranger", [("JP", "NTR-ARGJ-JPN", None), ("US", "NTR-ARGE-USA", None)]),
    ("nintendo-ds", "Pokemon Ranger: Guardian Signs", [("EU", "NTR-B3RP-EUR", None), ("UK", "NTR-B3RP-UKV", None), ("US", "NTR-B3RP-USA", "https://i.imgur.com/BsvBDxJ.png")]),
    ("nintendo-ds", "Pokemon Ranger: Shadows of Almia", [("EU", "NTR-YP2P-EUR", None), ("US", "NTR-YP2E-USA", None)]),
    ("nintendo-ds", "Pokemon SoulSilver", [("AU", "NTR-IPGE-AUS", None), ("EU", "NTR-IPGP-EUR", "https://i.imgur.com/lr3ZzrH.jpg"), ("DE", "NTR-IPGD-NOE", None), ("JP", "NTR-IPGJ-JPN", None), ("US", "NTR-IPGE-USA", "https://i.imgur.com/1FVy2ng.png")]),
    ("nintendo-ds", "Pokemon Trozei!", [("EU", "NTR-APTP-EUR", None), ("JP", "NTR-APTJ-JPN", None), ("US", "NTR-APTE-USA", None)]),
    ("nintendo-ds", "Pokemon White", [("AU", "TWL-IRAO-AUS", None), ("EU", "TWL-IRAO-EUR", "https://i.imgur.com/tSWzI7P.jpg"), ("JP", "TWL-IRAJ-JPN", None), ("US", "TWL-IRAO-USA", "https://i.imgur.com/AfgkeyY.png")]),
    ("nintendo-ds", "Pokemon White 2", [("AU", "TWL-IRDO-AUS", None), ("EU", "TWL-IRDO-EUR", "https://i.imgur.com/IK1Pqjd.jpg"), ("JP", "TWL-IRDJ-JPN", None), ("US", "TWL-IRDO-USA", "https://i.imgur.com/auhihxl.png")]),
    ("nintendo-3ds", "Pokemon Alpha Sapphire", [("EU", "LNA-CTR-ECLP-EUR", None), ("US", "LNA-CTR-ECLE-USA", "https://i.imgur.com/RwHPYwg.png")]),
    ("nintendo-3ds", "Pokemon Moon", [("US", "LNA-CTR-BNEE-USA", None)]),
    ("nintendo-3ds", "Pokemon Mystery Dungeon: Gates to Infinity", [("AU", "LNA-CTR-APDP-AUS", None), ("JP", "LNA-CTR-APDJ-JPN", None)]),
    ("nintendo-3ds", "Pokemon Omega Ruby", [("US", "LNA-CTR-ECRE-USA", "https://i.imgur.com/YiEP1qu.png")]),
    ("nintendo-3ds", "Pokemon Rumble Blast", [("EU", "LNA-CTR-ACCP-EUR", None), ("JP", "LNA-CTR-ACCJ-JPN", None), ("US", "LNA-CTR-ACCE-USA", None)]),
    ("nintendo-3ds", "Pokemon Rumble World", [("JP", "LNA-CTR-ECFJ-JPN", None)]),
    ("nintendo-3ds", "Pokemon Sun", [("US", "LNA-CTR-BNDE-USA", "https://i.imgur.com/zVQZQHQ.png")]),
    ("nintendo-3ds", "Pokemon Super Mystery Dungeon", [("US", "LNA-CTR-BPXE-USA", None)]),
    ("nintendo-3ds", "Pokemon Ultra Moon", [("US", "LNA-CTR-A2BE-USA", "https://i.imgur.com/sY5omgP.png")]),
    ("nintendo-3ds", "Pokemon Ultra Sun", [("US", "LNA-CTR-A2AE-USA", "https://i.imgur.com/aDQ9Kix.png")]),
    ("nintendo-3ds", "Pokemon X", [("EU", "LNA-CTR-EKJP-EUR", None), ("US", "LNA-CTR-EKJE-USA", "https://i.imgur.com/4dFwiCq.png")]),
    ("nintendo-3ds", "Pokemon Y", [("EU", "LNA-CTR-EK2P-EUR", None), ("US", "LNA-CTR-EK2E-USA", "https://i.imgur.com/t3WLSuJ.png")]),
    ("gameboy", "Pokemon Blue", [("AU", "DMG-APEU-AUS", None), ("EU", "DMG-APEU-EUR", "https://i.imgur.com/L0q8Sz8.jpg"), ("FR", "DMG-APED-FRA", None), ("US", "DMG-APEE-USA", None)]),
    ("gameboy", "Pokemon Pinball", [("AU", "DMG-VPHU-AUS", None), ("EU", "DMG-VPHP-EUR", None), ("JP", "DMG-VPHJ-JPN", None), ("US", "DMG-VPHE-USA", None)]),
    ("gameboy", "Pokemon Red", [("AU", "DMG-APAU-AUS", None), ("EU", "DMG-APAU-EUR", "https://i.imgur.com/j9LERYj.jpg"), ("FR", "DMG-APAS-FRA", None), ("JP", "DMG-APAJ-JPN", None), ("ES", "DMG-APAS-ESP", None), ("US", "DMG-APAE-USA", None)]),
    ("gameboy", "Pokemon Trading Card Game", [("EU", "DMG-AXQP-EUR", None), ("JP", "DMG-ACXJ-JPN", None), ("US", "DMG-AXQE-USA", None)]),
    ("gameboy", "Pokemon Yellow", [("AU", "DMG-APSU-AUS", None), ("EU", "DMG-APSU-EUR", "https://i.imgur.com/1I02ReK.jpg"), ("FR", "DMG-APSF-FRA", None), ("DE", "DMG-APSD-NOE", None), ("JP", "DMG-APSJ-JPN", None), ("ES", "DMG-APSS-ESP", None), ("US", "DMG-APSE-USA", "https://i.imgur.com/fgFBHOs.jpg")]),
    ("gameboy-color", "Pokemon Crystal", [("EU", "CGB-BYTP-EUR", None), ("US", "CGB-BYTE-USA", None)]),
    ("gameboy-color", "Pokemon Gold", [("EU", "DMG-AAUP-EUR", None), ("JP", "DMG-AAUJ-JPN", None), ("US", "DMG-AAUE-USA", None)]),
    ("gameboy-color", "Pokemon Puzzle Challenge", [("EU", "CGB-BPNP-EUR", None), ("JP", "CGB-BPNJ-JPN", None), ("US", "CGB-BPNE-USA", None)]),
    ("gameboy-color", "Pokemon Silver", [("EU", "DMG-AAXP-EUR", None), ("JP", "DMG-AAXJ-JPN", None), ("US", "DMG-AAXE-USA", None)]),
    ("gameboy-advance", "Pokemon Emerald", [("AU", "AGB-BPEP-AUS", None), ("EU", "AGB-BPEP-EUR", None), ("JP", "AGB-BPEJ-JPN", "https://i.imgur.com/YIRiwct.jpg"), ("US", "AGB-BPEE-USA", "https://i.redd.it/vdfkh82uv3551.jpg")]),
    ("gameboy-advance", "Pokemon FireRed", [("EU", "AGB-BPRP-EUR", None), ("JP", "AGB-BPRJ-JPN", "https://i.imgur.com/7p9QKOh.jpg"), ("US", "AGB-BPRE-USA", "https://i.imgur.com/SfwgfJU.jpg")]),
    ("gameboy-advance", "Pokemon LeafGreen", [("EU", "AGB-BPGP-EUR", "https://i.imgur.com/6Yp5QOG.jpg"), ("US", "AGB-BPGE-USA", "https://i.redd.it/qyf0xauhcq451.jpg")]),
    ("gameboy-advance", "Pokemon Pinball: Ruby & Sapphire", [("EU", "AGB-BPPP-EUR", None), ("JP", "AGB-BPPJ-JPN", None), ("US", "AGB-BPPE-USA", None)]),
    ("gameboy-advance", "Pokemon Ruby", [("AU", "AGB-AXVP-AUS", "https://i.imgur.com/So0DG7a.jpg"), ("EU", "AGB-AXVP-EUR", None), ("JP", "AGB-AXVJ-JPN", "https://i.imgur.com/rs0XnRE.jpg"), ("US", "AGB-AXVE-USA", None)]),
    ("gameboy-advance", "Pokemon Sapphire", [("AU", "AGB-AXPP-AUS", "https://i.imgur.com/0tK5zVa.jpg"), ("EU", "AGB-AXPP-EUR", None), ("JP", "AGB-AXPJ-JPN", "https://i.imgur.com/nzpOOFb.jpg"), ("US", "AGB-AXPE-USA", None)]),
]


def fetch(url: str) -> str:
    result = subprocess.run(
        ["curl", "-sL", "-A", "Mozilla/5.0", "--max-time", "40", url],
        check=True,
        capture_output=True,
    )
    return result.stdout.decode("utf-8", "replace")


def norm(value: str) -> str:
    value = html.unescape(value).lower().replace("&", " and ")
    value = value.replace("é", "e").replace("ü", "u").replace("°", "")
    value = re.sub(r"\([^)]*\)", " ", value)
    value = re.sub(r"\b(version|edition|the|usa|ntsc|a|an)\b", " ", value)
    value = re.sub(r"[^a-z0-9]+", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def tokens(value: str) -> frozenset:
    return frozenset(norm(value).split())


def parse_pricecharting(page: str, console: str) -> list[dict]:
    games = []
    for match in re.finditer(r'<tr id="product-(\d+)"[\s\S]*?</tr>', page):
        product_id = match.group(1)
        row = match.group(0)
        title_match = re.search(r'<td class="title"[^>]*>\s*<a href="([^"]+)">([^<]+)</a>', row)
        image_match = re.search(
            r"https://storage\.googleapis\.com/images\.pricecharting\.com/([^\"/\s]+)/60\.jpg",
            row,
        )
        if not title_match:
            continue
        slug_url, title = title_match.group(1), html.unescape(title_match.group(2)).strip()
        if SKIP.search(title) or HARDWARE.search(title):
            continue
        slug = slug_url.rstrip("/").split("/")[-1]
        games.append(
            {
                "id": f"{console}/{slug}",
                "console": console,
                "title": title,
                "slug": slug,
                "productId": product_id,
                "image": image_match.group(1) if image_match else None,
                "url": f"https://www.pricecharting.com/game/{console}/{slug}",
                "codes": [],
            }
        )
    return games


def parse_n64_codes(page: str) -> list[dict]:
    found = []
    for row in re.findall(r"<tr[\s\S]*?</tr>", page):
        cells = re.findall(r"<t[dh][^>]*>([\s\S]*?)</t[dh]>", row)
        if len(cells) < 2:
            continue
        title = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", cells[0])).strip()
        code = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", cells[1])).strip()
        title = html.unescape(title)
        code = html.unescape(code)
        if re.fullmatch(r"NUS-[A-Z0-9]+-(?:USA|EUR|JPN|AUS|CAN)", code):
            suffix = code.rsplit("-", 1)[-1]
            region = {"USA": "US", "EUR": "EU", "JPN": "JP", "AUS": "AU", "CAN": "CA"}.get(suffix, "board")
            found.append({"title": title, "code": code, "region": region})
    return found


def attach(games: list[dict], console: str, title: str, region: str, code: str, photo: str | None, source: str) -> None:
    pool = [game for game in games if game["console"] == console]
    by_norm = {}
    by_tokens = {}
    for game in pool:
        by_norm.setdefault(norm(game["title"]), game)
        by_tokens.setdefault(tokens(game["title"]), game)
    target = by_norm.get(norm(title)) or by_tokens.get(tokens(title))
    entry = {"region": region, "code": code, "photo": photo, "source": source, "title": title}
    if target:
        if not any(existing["code"] == code for existing in target["codes"]):
            target["codes"].append({"region": region, "code": code, "photo": photo, "source": source})
        return
    games.append(
        {
            "id": f"{console}/code-{code.lower()}",
            "console": console,
            "title": title,
            "slug": None,
            "productId": None,
            "image": None,
            "url": None,
            "codes": [{"region": region, "code": code, "photo": photo, "source": source}],
            "codeOnly": True,
        }
    )


def main() -> None:
    games = []
    for console in CONSOLES:
        page = fetch(f"https://www.pricecharting.com/console/{console}")
        parsed = parse_pricecharting(page, console)
        print(f"{console}: {len(parsed)} games")
        games.extend(parsed)
        time.sleep(0.4)

    n64 = fetch("https://gameverifying.com/wiki/cart-based-systems/n64")
    n64_codes = parse_n64_codes(n64)
    print(f"n64 codes: {len(n64_codes)}")
    for item in n64_codes:
        attach(games, "nintendo-64", item["title"], item["region"], item["code"], None, "gameverifying-n64")

    for console, title, codes in POKEMON:
        for region, code, photo in codes:
            attach(games, console, title, region, code, photo, "gameverifying-pokemon")

    # Prefer a US label photo when several regions have one.
    for game in games:
        photos = [code for code in game["codes"] if code.get("photo")]
        us = [code for code in photos if code["region"] == "US"]
        game["labelPhoto"] = (us or photos or [{}])[0].get("photo")

    payload = {
        "source": "https://www.pricecharting.com",
        "codes": "https://gameverifying.com",
        "note": "Titles and catalog photos are the notable US game listings on each PriceCharting console page. Consoles, accessories, and cheat devices are left out. Prices are not stored. Label codes are the public Game Verifying lists.",
        "games": games,
    }
    OUT.write_text(
        "window.CATALOG = "
        + json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
        + ";\n",
        encoding="utf-8",
    )
    print(f"wrote {OUT} ({OUT.stat().st_size} bytes, {len(games)} rows)")


if __name__ == "__main__":
    main()
