window.GUIDES = {
  nes: {
    name: "NES",
    brief: "Gamebit screws on the back",
    full: "Nintendo Entertainment System",
    years: "1985–1994",
    open: "Use a 3.8 mm gamebit. Official carts have three screws on the back, and a few have five. The back shell comes off.",
    sealed: false,
    links: [
      { label: "NES verification guide", href: "https://gameverifying.com/wiki/cart-based-systems/nes" },
      { label: "Which screwdriver", href: "https://gameverifying.com/wiki/tools" },
      { label: "PriceCharting NES list", href: "https://www.pricecharting.com/console/nes" }
    ],
    checks: [
      "The back screws take a gamebit, not a Phillips screwdriver. A hardware-store screw on a Nintendo-published cart is a bad sign. Some third-party carts used other screws, so check who published it.",
      "The label has a Nintendo Seal of Quality. Black and gold was used through 1988. White and gold replaced it in 1989. A seal from the wrong era, or a soft redrawn seal, needs a closer look. The seal alone does not prove the cart.",
      "The catalog number on the label matches the number printed on the board.",
      "The board matches a reference scan for that exact catalog number. The NES guide links the scan sets it uses."
    ],
    avoid: [
      "A Nintendo logo, a seal, or a game that boots. Counterfeits copy all three."
    ]
  },
  "super-nintendo": {
    name: "Super Nintendo",
    brief: "Gamebit screws on the front",
    full: "Super Nintendo Entertainment System",
    years: "1991–1999",
    open: "Use a 3.8 mm gamebit on the two screws along the bottom front. Those screws release the front shell.",
    sealed: false,
    links: [
      { label: "SNES verification guide", href: "https://gameverifying.com/wiki/cart-based-systems/snes" },
      { label: "Which screwdriver", href: "https://gameverifying.com/wiki/tools" },
      { label: "PriceCharting SNES list", href: "https://www.pricecharting.com/console/super-nintendo" }
    ],
    checks: [
      "Both bottom-front screws take a gamebit.",
      "On a Nintendo-made board, SHVC is written in gold along the top. Third-party games can use other boards, so compare that title’s photos rather than assuming every SNES board says SHVC.",
      "The code on the label matches the code on the board. US carts read SNS- and end in -USA.",
      "The board matches a reference photo for that title."
    ],
    avoid: [
      "Trusting the label art alone. Relabeled and reproduction carts copy the art."
    ]
  },
  "nintendo-64": {
    name: "Nintendo 64",
    brief: "One gamebit screw on the back",
    full: "Nintendo 64",
    years: "1996–2002",
    open: "Use a 3.8 mm gamebit on the single screw in the back.",
    sealed: false,
    links: [
      { label: "N64 verification guide and board list", href: "https://gameverifying.com/wiki/cart-based-systems/n64" },
      { label: "Which screwdriver", href: "https://gameverifying.com/wiki/tools" },
      { label: "PriceCharting N64 list", href: "https://www.pricecharting.com/console/nintendo-64" }
    ],
    checks: [
      "The shell edges are smooth and straight, and the plastic color matches the genuine carts in the photo guide. Judge color against the photos, not from memory.",
      "The molded Nintendo logo uses Nintendo’s typeface. A round dot on the i means the shell is fake.",
      "A number stamped on the back is common and still not proof. Some genuine carts have no stamp, and a stamp can be added to a fake.",
      "The inside of the shell matches the molded posts in the photo guide.",
      "The board code is one listed for this title, and the board looks like the reference photo. A code missing from the list does not prove a fake. The list is large and still not every board."
    ],
    avoid: [
      "Using the back stamp as a yes-or-no test.",
      "Assuming a Limited Run Games reissue will have a Nintendo shell. Those runs use reproduction shells on purpose."
    ]
  },
  gameboy: {
    name: "Game Boy",
    brief: "One gamebit screw on the back",
    full: "Original Game Boy",
    years: "1989–2001",
    open: "Use a 3.8 mm gamebit on the single screw in the back.",
    sealed: false,
    links: [
      { label: "Game Boy DMG guide", href: "https://gameverifying.com/wiki/cart-based-systems/gameboy/dmg" },
      { label: "PCB comparison", href: "https://gameverifying.com/wiki/cart-based-systems/gameboy/pcb" },
      { label: "Shell variations", href: "https://gameverifying.com/wiki/cart-based-systems/gameboy/casing" },
      { label: "PriceCharting Game Boy list", href: "https://www.pricecharting.com/console/gameboy" }
    ],
    checks: [
      "The back screw takes a gamebit.",
      "With the cart open, the board matches the PCB guide for that title. That comparison is the reliable check."
    ],
    avoid: [
      "Number stamps. A cheap die set can add one, and some genuine carts never had one.",
      "Gold rectangles on the board. They date production. Fakes copy them, and genuine boards can have four, two, one, or none.",
      "Holes lined up above the pins. Fakes have copied that pattern."
    ]
  },
  "gameboy-color": {
    name: "Game Boy Color",
    brief: "One gamebit screw on the back",
    full: "Game Boy Color",
    years: "1998–2003",
    open: "Use a 3.8 mm gamebit on the single screw in the back.",
    sealed: false,
    links: [
      { label: "Game Boy Color guide", href: "https://gameverifying.com/wiki/cart-based-systems/gameboy/color" },
      { label: "PCB comparison", href: "https://gameverifying.com/wiki/cart-based-systems/gameboy/pcb" },
      { label: "Shell variations", href: "https://gameverifying.com/wiki/cart-based-systems/gameboy/casing" },
      { label: "PriceCharting Game Boy Color list", href: "https://www.pricecharting.com/console/gameboy-color" }
    ],
    checks: [
      "The back screw takes a gamebit.",
      "A black shell is normal for Color games that also play on the original Game Boy. Many Color-only games use a translucent shell. Confirm which shell that title used.",
      "With the cart open, the board matches the PCB guide for that title."
    ],
    avoid: [
      "Number stamps, gold rectangles, and the holes above the pins. Game Verifying has retired all three. Fakes copy them, and genuine boards are not consistent."
    ]
  },
  "gameboy-advance": {
    name: "Game Boy Advance",
    brief: "One tri-wing screw on the back",
    full: "Game Boy Advance",
    years: "2001–2008",
    open: "Use a 1.5 mm tri-wing driver on the single screw in the back. A gamebit does not fit.",
    sealed: false,
    links: [
      { label: "Game Boy Advance guide", href: "https://gameverifying.com/wiki/cart-based-systems/gameboy/advance" },
      { label: "Authentic GBA label depository", href: "https://www.gameverifying.com/wiki/depository/gba" },
      { label: "PCB comparison", href: "https://gameverifying.com/wiki/cart-based-systems/gameboy/pcb" },
      { label: "PriceCharting GBA list", href: "https://www.pricecharting.com/console/gameboy-advance" }
    ],
    checks: [
      "The back screw is a tri-wing.",
      "GAME BOY ADVANCE is etched shallowly under the lip. Bootlegs often mold the lettering and the arrow at the bottom too deep.",
      "The back has the Nintendo typeface and a real shell code. AGB-002 is the standard cart. AGB-003 is the battery-pack shell. AGB-033 is not a real shell code.",
      "Ruby, Sapphire, and Emerald use an AGB-E05-01 board. A different board in those three games is a fake, even when that board is genuine in other GBA games.",
      "On the clear battery carts, the battery contacts are visible through the shell. A battery with no molded contact window is a bootleg tell."
    ],
    avoid: [
      "Number stamps, gold rectangles, the two gold squares, and the holes above the pins. All of these have been copied or were never consistent on genuine boards."
    ]
  },
  "nintendo-ds": {
    name: "Nintendo DS",
    brief: "Leave the card closed",
    full: "Nintendo DS",
    years: "2004–2013",
    open: "Leave the card closed. The shell is welded. Game Verifying’s tool page tells you not to pry DS cards apart.",
    sealed: true,
    links: [
      { label: "NTR-005 guide (grey cards)", href: "https://gameverifying.com/wiki/cart-based-systems/nds" },
      { label: "NTR-031 guide (black IR cards)", href: "https://gameverifying.com/wiki/cart-based-systems/nds031" },
      { label: "NTR-005 photo depository", href: "https://gameverifying.com/wiki/depository/ntr005" },
      { label: "NTR-031 photo depository", href: "https://gameverifying.com/wiki/depository/ntr031" },
      { label: "DS title and PCB list", href: "https://gameverifying.com/wiki/cart-based-systems/nds/pcblis" },
      { label: "PriceCharting DS list", href: "https://www.pricecharting.com/console/nintendo-ds" }
    ],
    checks: [
      "The front and back labels are sharp, and they name the same game. A genuine code from a cheap card under an expensive label is a relabel.",
      "You are using the guide for the shell in your hand. Grey cards are NTR-005. HeartGold, SoulSilver, and the pedometer games are the black NTR-031 shell. DSi-era cards use a TWL code and do not follow every grey-card check.",
      "The label code is one published for this title and region. A match supports the label. It does not prove the chip inside."
    ],
    avoid: [
      "The light test on black NTR-031 cards. Relabels, fake shells, and real cards in the other shell all fool it.",
      "The top seam and its molding lines. Genuine cards sometimes lack them, and fakes sometimes have them.",
      "The two-screen logo. Genuine cards can omit it, and the marker can be square or skewed.",
      "An ink stamp ending in 0J09 or 0J22. Genuine and fake cards both use those endings.",
      "A square dot on the i in the debossed Nintendo logo. Fakes copy it, and a soft photo hides the shape.",
      "Treating a PCB code such as Y08-01 as proof. Game Verifying has documented that code on fakes."
    ]
  },
  "nintendo-3ds": {
    name: "Nintendo 3DS",
    brief: "Leave the card closed",
    full: "Nintendo 3DS",
    years: "2011–2020",
    open: "Leave the card closed. Game Verifying’s tool page tells you not to pry 3DS cards apart.",
    sealed: true,
    links: [
      { label: "3DS verification guide", href: "https://gameverifying.com/wiki/cart-based-systems/3ds" },
      { label: "CTR-005 photo depository", href: "https://gameverifying.com/wiki/depository/ctr005" },
      { label: "PriceCharting 3DS list", href: "https://www.pricecharting.com/console/nintendo-3ds" }
    ],
    checks: [
      "A clear photo of the front and a clear photo of the back match the CTR-005 depository for this title.",
      "The code on the back belongs to the game printed on the front."
    ],
    avoid: [
      "Opening the card to ‘see the board’. The shell is not made to come apart."
    ]
  },
  "nintendo-switch": {
    name: "Nintendo Switch",
    brief: "Leave the card closed",
    full: "Nintendo Switch",
    years: "2017–",
    open: "Leave the card closed. Game Verifying’s tool page tells you not to pry Switch cards apart.",
    sealed: true,
    links: [
      { label: "Switch and Switch 2 guide", href: "https://gameverifying.com/wiki/cart-based-systems/switch" },
      { label: "PriceCharting Switch list", href: "https://www.pricecharting.com/console/nintendo-switch" }
    ],
    checks: [
      "The card tastes intensely bitter. Nintendo coats genuine cards with a non-toxic bittering agent so children spit them out. Keep cards away from children, and do not use this as a party trick.",
      "The label code matches the kind of card you think you have. Codes starting with LB include the game data. Codes starting with LP are license cards: the card can be genuine while the game itself downloads.",
      "The code under the label belongs to this game. A sticker over a cheaper card is a relabel, including on Switch 2 cards."
    ],
    avoid: [
      "The top seam. Reproduction shells and genuine shells look the same there."
    ]
  },
  "sega-genesis": {
    name: "Sega Genesis",
    brief: "Guide still in progress",
    full: "Sega Genesis",
    years: "1989–1997",
    open: "Game Verifying’s Genesis guide is still in progress, and their tool table does not name a driver yet. Do not force a screw.",
    sealed: false,
    links: [
      { label: "Cart guides (Genesis still in progress)", href: "https://gameverifying.com/wiki/cart-based-systems" },
      { label: "PriceCharting Genesis list", href: "https://www.pricecharting.com/console/sega-genesis" }
    ],
    checks: [
      "The label, shell color, and molding match a cart you already trust of the same release. There is no finished Genesis photo checklist to score against yet.",
      "If the shell is already open, the board matches a known genuine board of that game."
    ],
    avoid: [
      "A screwdriver tip you found on a forum. The wrong bit chews up a genuine shell."
    ]
  },
  "sega-game-gear": {
    name: "Game Gear",
    brief: "Gamebit screw, guide in progress",
    full: "Sega Game Gear",
    years: "1991–1997",
    open: "Use a 3.8 mm gamebit on the single screw in the back. The verification guide itself is still in progress.",
    sealed: false,
    links: [
      { label: "Cart guides (Game Gear still in progress)", href: "https://gameverifying.com/wiki/cart-based-systems" },
      { label: "Which screwdriver", href: "https://gameverifying.com/wiki/tools" },
      { label: "PriceCharting Game Gear list", href: "https://www.pricecharting.com/console/sega-game-gear" }
    ],
    checks: [
      "The back screw takes a gamebit.",
      "The label and shell match a cart you already trust. The written Game Gear guide is not finished, so this page cannot score the finer label tells."
    ],
    avoid: [
      "Calling a cart fake from a blurry label photo alone while the guide is unfinished."
    ]
  },
  "atari-2600": {
    name: "Atari 2600",
    brief: "Screw sits under the label",
    full: "Atari 2600",
    years: "1977–1992",
    open: "A 3.8 mm gamebit fits the screw on the front, under the label. Peeling a label can ruin it. Open one only when you accept that risk. The verification guide is still in progress.",
    sealed: false,
    links: [
      { label: "Cart guides (2600 still in progress)", href: "https://gameverifying.com/wiki/cart-based-systems" },
      { label: "Which screwdriver", href: "https://gameverifying.com/wiki/tools" },
      { label: "PriceCharting 2600 list", href: "https://www.pricecharting.com/console/atari-2600" }
    ],
    checks: [
      "The label and shell match a cart you already trust of the same game. There is no finished 2600 photo checklist yet.",
      "If the cart is already open, the board matches a known genuine board."
    ],
    avoid: [
      "Peeling a clean label just to see a screw."
    ]
  }
};

window.CONSOLE_ORDER = [
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
  "atari-2600"
];
