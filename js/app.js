const games = (window.CATALOG && window.CATALOG.games) || [];
const boards = window.PCBS || [];
const answers = new Map();
const view = document.querySelector("#view");
const search = document.querySelector("#q");
const light = document.querySelector("#light");
const lightBody = document.querySelector("#light-body");

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function guide(consoleId) {
  return window.GUIDES[consoleId];
}

function photo(image, size) {
  return `https://storage.googleapis.com/images.pricecharting.com/${encodeURIComponent(image)}/${size}.jpg`;
}

function route() {
  const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  if (parts[0] === "c" && guide(parts[1])) return { name: "console", console: parts[1] };
  if (parts[0] === "g") {
    const id = decodeURIComponent(parts.slice(1).join("/"));
    const game = games.find((item) => item.id === id);
    if (game) return { name: "game", game };
  }
  return { name: "home" };
}

function oftenFaked(game) {
  return /pokemon|earthbound|earth bound|chrono trigger|mother|shantae/i.test(game.title);
}

function regionLabel(region) {
  return {
    US: "United States",
    EU: "Europe",
    JP: "Japan",
    AU: "Australia",
    FR: "France",
    DE: "Germany",
    UK: "United Kingdom",
    ES: "Spain",
    board: "Board code",
    CA: "Canada"
  }[region] || region;
}

function preferredCode(game) {
  return game.codes.find((code) => code.region === "US") || game.codes[0] || null;
}

function plain(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\b(version|edition|the|usa|ntsc|a|an)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const BOARD_FAMILY = {
  gameboy: ["gameboy", "gameboy-color"],
  "gameboy-color": ["gameboy", "gameboy-color"],
  "gameboy-advance": ["gameboy-advance"],
  "nintendo-ds": ["nintendo-ds"],
  "nintendo-64": ["nintendo-64"],
  "super-nintendo": ["super-nintendo"]
};

function boardNames(board) {
  return [board.title, board.board, ...(board.titles || [])].filter(Boolean).map(plain);
}

function boardsForGame(game) {
  const family = BOARD_FAMILY[game.console] || [game.console];
  const name = plain(game.title);
  if (!name) return [];
  return boards.filter((board) => {
    if (!family.includes(board.console)) return false;
    return boardNames(board).some((candidate) => candidate === name);
  });
}

function boardsMatching(query) {
  const text = plain(query);
  const code = normalizeCode(query);
  if (!text && code.length < 3) return [];
  return boards.filter((board) => {
    if (code.length >= 3 && normalizeCode(board.board).includes(code)) return true;
    return text.length >= 3 && boardNames(board).some((name) => name.includes(text));
  });
}

function openPhotos(items) {
  lightBody.innerHTML = items.map((item) => `
    <figure>
      <img src="${esc(item.src)}" alt="${esc(item.alt)}">
      <figcaption>${esc(item.alt)}</figcaption>
    </figure>`).join("");
  light.showModal();
}

function pcbCard(board) {
  const shots = [
    board.front ? { src: board.front, alt: `Front of ${board.board}` } : null,
    board.back ? { src: board.back, alt: `Back of ${board.board}` } : null
  ].filter(Boolean);
  const pair = shots.map((shot) => `<img loading="lazy" src="${esc(shot.src)}" alt="${esc(shot.alt)}">`).join("");
  const label = board.title && plain(board.title) !== plain(board.board)
    ? `${board.board} · ${board.title}`
    : board.board;
  const count = (board.titles || []).length;
  return `<button type="button" class="pcb-card" data-pcb="${esc(board.id)}">
    <span class="pcb-pair ${shots.length === 1 ? "single" : ""}">${pair || `<span class="code-mat">No photo saved</span>`}</span>
    <strong>${esc(label)}</strong>
    <span class="meta">${count ? `${count} documented title${count === 1 ? "" : "s"}` : "Local copy"}</span>
  </button>`;
}

function pcbGrid(list) {
  if (!list.length) return "";
  return `<div class="pcb-grid">${list.map(pcbCard).join("")}</div>`;
}

function bindPcbCards() {
  view.querySelectorAll("[data-pcb]").forEach((button) => {
    button.addEventListener("click", () => {
      const board = boards.find((item) => item.id === button.dataset.pcb);
      if (!board) return;
      const shots = [
        board.front ? { src: board.front, alt: `${board.board} front. ${board.credit}` } : null,
        board.back ? { src: board.back, alt: `${board.board} back. ${board.credit}` } : null
      ].filter(Boolean);
      if (shots.length) openPhotos(shots);
    });
  });
}

function normalizeCode(value) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function findByCode(value) {
  const wanted = normalizeCode(value);
  if (wanted.length < 4) return null;
  for (const game of games) {
    const hit = game.codes.find((code) => normalizeCode(code.code) === wanted);
    if (hit) return { game, code: hit };
  }
  return null;
}

function matches(game, query) {
  const text = query.trim().toLowerCase();
  if (!text) return 1;
  const title = game.title.toLowerCase();
  const wanted = normalizeCode(query);
  if (game.codes.some((code) => normalizeCode(code.code) === wanted)) return 100;
  if (title === text) return 90;
  if (title.startsWith(text)) return 70;
  if (title.includes(text)) return 50;
  if (wanted.length >= 4 && game.codes.some((code) => normalizeCode(code.code).includes(wanted))) return 40;
  const name = guide(game.console).name.toLowerCase();
  if (name.includes(text) || guide(game.console).full.toLowerCase().includes(text)) return 15;
  return 0;
}

function filterGames(list, query) {
  return list
    .map((game) => ({ game, score: matches(game, query) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.game.title.localeCompare(b.game.title))
    .map((item) => item.game);
}

function priceSearch(query) {
  return `https://www.pricecharting.com/search-products?q=${encodeURIComponent(query)}&type=prices`;
}

function render() {
  const current = route();
  const query = search.value.trim();
  if (!window.CATALOG) {
    view.innerHTML = `<p class="empty">The catalog file did not load.</p>`;
    return;
  }
  if (current.name === "game") {
    renderGame(current.game);
    return;
  }
  if (current.name === "console" && !query) {
    renderConsole(current.console);
    return;
  }
  renderHome(query);
}

function renderHome(query) {
  if (query) {
    const hits = filterGames(games, query).slice(0, 80);
    const boardHits = boardsMatching(query).filter((board) => board.front || board.back).slice(0, 12);
    view.innerHTML = `
      <div class="section-head">
        <h2>Results</h2>
        <p>${hits.length ? `${hits.length} match${hits.length === 1 ? "" : "es"}` : "No local matches"}</p>
      </div>
      ${boardHits.length ? `<h2>Board photos</h2>${pcbGrid(boardHits)}` : ""}
      ${hits.length ? gameGrid(hits) : ""}
      <p class="empty">This list is the notable US PriceCharting page for each cartridge format, plus Nintendo 64 board codes from Game Verifying. A missing title is not a fake title.</p>
      <p class="links"><a href="${esc(priceSearch(query))}">Search PriceCharting for “${esc(query)}”</a>
      <a href="https://gameverifying.com/wiki/cart-based-systems">Game Verifying cart guides</a></p>`;
    bindCards();
    bindPcbCards();
    return;
  }

  const counts = Object.fromEntries(window.CONSOLE_ORDER.map((id) => [id, games.filter((game) => game.console === id).length]));
  view.innerHTML = `
    <section class="hero">
      <p class="kicker">Cartridge lookup</p>
      <h1>Check the cart in your hand against a known release.</h1>
      <p class="lede">Search a title or the code printed on the label. Each result shows a catalog photo, any published label code, and the checks Game Verifying still considers valid for that format. The local list is the first page of each PriceCharting console, the carts collectors watch most closely.</p>
      <ul class="facts">
        <li>${games.length.toLocaleString()} local entries</li>
        <li>${boards.filter((board) => board.front || board.back).length} PCB photos saved locally</li>
        <li>12 cartridge formats</li>
        <li>Codes from Game Verifying</li>
      </ul>
    </section>
    <h2>Formats</h2>
    <div class="console-grid">
      ${window.CONSOLE_ORDER.map((id) => {
        const item = guide(id);
        return `<a class="console-card" href="#/c/${id}">
          <p class="kicker">${esc(item.years)}</p>
          <h3>${esc(item.name)}</h3>
          <p>${counts[id]} entries. ${esc(item.brief)}.</p>
        </a>`;
      }).join("")}
    </div>
    <section>
      <h2 style="margin-top:36px">What this can and cannot tell you</h2>
      <div class="note"><p>A matching title means the game was released. A matching code supports the label. Neither one proves the chip inside is genuine. When a guide says to open the shell, the board photo is the real comparison. Nintendo DS, 3DS, and Switch cards stay closed.</p></div>
      <p class="links"><a href="https://www.gameverifying.com/wiki/debunked">Methods Game Verifying has retired</a>
      <a href="https://gameverifying.com/wiki/lists/pokemon">Pokemon code list</a></p>
    </section>`;
}

function gameGrid(list) {
  return `<div class="game-grid">${list.map(gameCard).join("")}</div>`;
}

function gameCard(game) {
  const item = guide(game.console);
  const code = preferredCode(game);
  const flag = oftenFaked(game) ? `<span class="flag">Often faked</span>` : "";
  const visual = game.image
    ? `<div class="mat"><img src="${photo(game.image, 240)}" alt="Catalog photo of ${esc(game.title)}" data-full="${photo(game.image, 60)}"></div>`
    : `<div class="mat code-mat">${esc(code ? code.code : item.name)}</div>`;
  return `<a class="game-card" href="#/g/${encodeURIComponent(game.id)}">
    ${visual}
    <h3>${esc(game.title)}</h3>
    <p class="meta">${esc(item.name)}${code ? ` · ${esc(code.code)}` : ""}${flag}</p>
  </a>`;
}

function renderConsole(consoleId) {
  const item = guide(consoleId);
  const owned = games.filter((game) => game.console === consoleId && !game.codeOnly);
  const extras = games
    .filter((game) => game.console === consoleId && game.codeOnly)
    .sort((a, b) => a.title.localeCompare(b.title));
  view.innerHTML = `
    <p><a class="back" href="#/">All formats</a></p>
    <p class="kicker">${esc(item.years)}</p>
    <h2>${esc(item.full)}</h2>
    <p class="lede">${esc(item.open)}</p>
    <div class="links">${item.links.map((link) => `<a href="${esc(link.href)}">${esc(link.label)}</a>`).join("")}</div>
    <div class="section-head" style="margin-top:28px"><h2>Notable listings</h2><p>${owned.length} with catalog photos</p></div>
    ${gameGrid(owned)}
    ${extras.length ? `<div class="section-head" style="margin-top:28px"><h2>More known codes</h2><p>${extras.length} from the Game Verifying board list, without a PriceCharting photo in this set</p></div>${gameGrid(extras)}` : ""}
    ${pcbSection(consoleId)}`;
  bindCards();
  bindPcbCards();
}

function pcbSection(consoleId) {
  const family = BOARD_FAMILY[consoleId] || [consoleId];
  const list = boards.filter((board) => family.includes(board.console) && (board.front || board.back));
  if (!list.length) return "";
  return `<div class="section-head" style="margin-top:28px"><h2>PCB photos</h2><p>${list.length} saved locally from the verification guides</p></div>${pcbGrid(list)}`;
}

function renderGame(game) {
  const item = guide(game.console);
  const state = answers.get(game.id) || {};
  const shellNote = shellNoteFor(game);
  view.innerHTML = `
    <p><a class="back" href="#/c/${game.console}">${esc(item.name)}</a></p>
    <article class="detail">
      <div>
        ${game.image ? `<figure class="shot">
          <button type="button" data-zoom="${photo(game.image, 1600)}" data-fallback="${photo(game.image, 240)}">
            <img src="${photo(game.image, 240)}" alt="Catalog photo of ${esc(game.title)}" data-thumb="${photo(game.image, 60)}">
          </button>
          <figcaption>Catalog photo via <a href="${esc(game.url)}">PriceCharting</a>. This is the listed product, usually the cart or the box, not a board scan.</figcaption>
        </figure>` : `<div class="note"><p>PriceCharting’s notable-listing page did not include a photo for this title. Search it there, and compare the board with the Game Verifying list.</p></div>`}
        ${pcbBlock(game)}
        ${game.labelPhoto ? `<figure class="label-shot">
          <img src="${esc(game.labelPhoto)}" alt="Label example of ${esc(game.title)} published by Game Verifying">
          <figcaption>Label example from <a href="https://gameverifying.com/wiki/lists/pokemon">Game Verifying</a>. Compare the whole label, not just the code.</figcaption>
        </figure>` : ""}
      </div>
      <div>
        <p class="kicker">${esc(item.full)}</p>
        <h1>${esc(game.title)}</h1>
        ${oftenFaked(game) ? `<div class="callout bad"><p>This title is counterfeited often. Use the label photo and the board comparison. Skip the retired tricks listed below.</p></div>` : ""}
        ${shellNote ? `<div class="note"><p>${esc(shellNote)}</p></div>` : ""}
        <h2>Label and board codes</h2>
        ${game.codes.length ? `<table class="codes"><thead><tr><th>Region</th><th>Code</th></tr></thead><tbody>
          ${game.codes.map((code) => `<tr><td>${esc(regionLabel(code.region))}</td><td><code>${esc(code.code)}</code></td></tr>`).join("")}
        </tbody></table>` : `<p class="empty">No label code is on file for this title. The PriceCharting page and the console guide are the references.</p>`}
        <label class="code-entry" for="code">Code printed on your cart
          <input id="code" value="${esc(state.typed || "")}" placeholder="Type the code" autocapitalize="characters" spellcheck="false">
        </label>
        <div id="code-result">${codeResult(game, state.typed || "")}</div>
        <h2>Checks</h2>
        <p class="lede">${esc(item.open)}</p>
        <ul class="check">
          ${item.checks.map((text, index) => `<li>
            <p>${esc(text)}</p>
            <div class="choice">
              <button type="button" data-check="${index}" data-value="yes" aria-pressed="${state[index] === "yes"}">Matches</button>
              <button type="button" data-check="${index}" data-value="no" aria-pressed="${state[index] === "no"}">Does not match</button>
            </div>
          </li>`).join("")}
        </ul>
        <div id="verdict" class="callout ${verdict(item, state).tone}" style="margin-top:14px"><p>${esc(verdict(item, state).text)}</p></div>
        <h2>Do not use these</h2>
        <ul class="avoid">${item.avoid.map((line) => `<li>${esc(line)}</li>`).join("")}</ul>
        <p class="links">${item.links.map((link) => `<a href="${esc(link.href)}">${esc(link.label)}</a>`).join("")}
          ${game.url ? `<a href="${esc(game.url)}">This listing on PriceCharting</a>` : `<a href="${esc(priceSearch(`${game.title} ${item.name}`))}">Search PriceCharting</a>`}
          <a href="https://www.gameverifying.com/wiki/debunked">Retired methods</a></p>
      </div>
    </article>`;
  bindGame(game);
  bindPcbCards();
}

function pcbBlock(game) {
  const matches = boardsForGame(game);
  if (!matches.length) return "";
  const photos = matches.filter((board) => board.front || board.back);
  const missing = matches.filter((board) => !board.front && !board.back);
  const warning = matches.find((board) => board.warning);
  return `<section>
    <h2>PCB photos</h2>
    ${warning ? `<div class="callout bad"><p>${esc(warning.warning)}</p></div>` : ""}
    ${photos.length ? pcbGrid(photos) : ""}
    ${missing.length ? `<p class="empty">Documented on ${missing.map((board) => board.board).join(", ")}, and the guide has not published a photo of that board.</p>` : ""}
    <p class="meta">Saved in this project from ${esc(matches[0].credit)}.</p>
  </section>`;
}

function shellNoteFor(game) {
  const codes = game.codes.map((code) => code.code);
  if (codes.some((code) => code.startsWith("NTR-IPK") || code.startsWith("NTR-IPG"))) {
    return "HeartGold and SoulSilver are black NTR-031 cards, not the common grey NTR-005 cards. Use the NTR-031 guide and depository.";
  }
  if (codes.some((code) => code.startsWith("TWL-"))) {
    return "This is a DSi-era card with a TWL code. The grey NTR-005 checks do not all apply. Compare it with the DS guide photos for this title.";
  }
  if (/limited run/i.test(game.title)) {
    return "Limited Run Games reissues of N64 carts use reproduction shells. A non-Nintendo shell is expected on those copies.";
  }
  return "";
}

function codeResult(game, typed) {
  if (!typed || !typed.trim()) return "";
  if (normalizeCode(typed).length < 6) {
    return `<div class="callout mid"><p>Keep typing the full code.</p></div>`;
  }
  if (!game.codes.length) {
    return `<div class="callout mid"><p>There is no code on file to compare. Use the photos and the guide.</p></div>`;
  }
  const wanted = normalizeCode(typed);
  const hit = game.codes.find((code) => normalizeCode(code.code) === wanted);
  if (hit) {
    const kind = hit.region === "board" ? "Game Verifying lists this board code for a legitimate copy of this title." : `This is a published ${regionLabel(hit.region)} code for this title.`;
    return `<div class="callout good"><p>${esc(hit.code)} matches. ${esc(kind)} A matching code supports the label and does not prove the chip.</p></div>`;
  }
  const other = findByCode(typed);
  if (other && other.game.id !== game.id) {
    return `<div class="callout bad"><p>${esc(typed.toUpperCase())} is on file for ${esc(other.game.title)} (${esc(guide(other.game.console).name)}), not for this cart.</p></div>`;
  }
  return `<div class="callout bad"><p>${esc(typed.toUpperCase())} is not one of the codes on file for this title. That happens with relabels, with regions this list does not cover, and with reprints. Compare the whole label with the reference photo.</p></div>`;
}

function verdict(item, state) {
  const marks = item.checks.map((_, index) => state[index]).filter(Boolean);
  const bad = marks.filter((mark) => mark === "no").length;
  if (bad) {
    return {
      tone: "bad",
      text: "At least one check disagrees with a genuine cart. Treat it as suspect and compare it with the guide photos before you buy or sell it."
    };
  }
  if (!marks.length) {
    return { tone: "idle", text: "Leave a row blank until you have looked. A blank row is not a pass." };
  }
  if (marks.length < item.checks.length) {
    return { tone: "mid", text: "Nothing you have checked disagrees yet. The remaining rows are still open." };
  }
  if (item.sealed) {
    return {
      tone: "good",
      text: "The outside checks agree with a genuine card. This page still cannot certify it. Leave the card closed and compare your photos with the depository."
    };
  }
  return {
    tone: "good",
    text: "The checks you can do here agree with a genuine cart. This page still cannot certify it. Open the shell the way the guide describes and compare the board with a reference photo."
  };
}

function bindCards() {
  view.querySelectorAll(".mat img").forEach((img) => {
    img.addEventListener("error", () => {
      if (img.dataset.tried) {
        img.closest(".mat").innerHTML = `<div class="code-mat">Photo unavailable</div>`;
        return;
      }
      img.dataset.tried = "1";
      img.src = img.dataset.full;
    });
  });
}

function bindGame(game) {
  const item = guide(game.console);
  const state = answers.get(game.id) || {};
  view.querySelectorAll("[data-check]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = button.dataset.check;
      state[index] = state[index] === button.dataset.value ? undefined : button.dataset.value;
      answers.set(game.id, state);
      view.querySelectorAll(`[data-check="${index}"]`).forEach((peer) => {
        peer.setAttribute("aria-pressed", String(peer.dataset.value === state[index]));
      });
      const box = document.querySelector("#verdict");
      const result = verdict(item, state);
      box.className = `callout ${result.tone}`;
      box.querySelector("p").textContent = result.text;
    });
  });

  const field = document.querySelector("#code");
  field.addEventListener("input", () => {
    state.typed = field.value;
    answers.set(game.id, state);
    document.querySelector("#code-result").innerHTML = codeResult(game, field.value);
  });

  const shot = view.querySelector(".shot img");
  if (shot) {
    shot.addEventListener("error", () => {
      if (shot.dataset.tried) return;
      shot.dataset.tried = "1";
      shot.src = shot.dataset.thumb;
    });
  }
  const zoom = view.querySelector("[data-zoom]");
  if (zoom) {
    zoom.addEventListener("click", () => {
      const primary = zoom.dataset.zoom;
      const fallback = zoom.dataset.fallback;
      openPhotos([{ src: primary, alt: `Larger catalog photo of ${game.title}` }]);
      const image = lightBody.querySelector("img");
      if (image) {
        image.addEventListener("error", () => {
          image.src = fallback;
        }, { once: true });
      }
    });
  }
  const label = view.querySelector(".label-shot img");
  if (label) {
    label.addEventListener("error", () => {
      label.replaceWith(Object.assign(document.createElement("p"), {
        textContent: "The label example did not load from its host. Open the Pokemon list link under the photo area."
      }));
    });
  }
}

document.querySelector("#search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const hits = filterGames(games, search.value);
  if (hits.length === 1) location.hash = `#/g/${encodeURIComponent(hits[0].id)}`;
});

search.addEventListener("input", () => {
  const current = route();
  if (current.name === "game" && search.value.trim()) {
    location.hash = "#/";
    return;
  }
  render();
});

document.querySelector(".brand").addEventListener("click", () => {
  search.value = "";
  setTimeout(() => {
    if (location.hash === "#/" || location.hash === "" || location.hash === "#") render();
  }, 0);
});

window.addEventListener("hashchange", () => {
  if (route().name === "game") search.value = "";
  render();
});
render();
