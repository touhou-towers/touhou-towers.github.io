window.onload = (async () => {
	const HOSTNAME = atob("aHR0cHM6Ly" + (9 + "wcm8tb3h" + (2 + 3) + "LmdsaXRjaC5tZS90dA" + ("=" == "=" ? "==" : "=")));
	const GAMEMODE_ENUM = {};
	(GAMEMODE_ENUM => {
		GAMEMODE_ENUM[GAMEMODE_ENUM.BALLRACE = "ballrace"] = "BALLRACE";
	})(GAMEMODE_ENUM);
	const HOUR = 1e3 * 60 * 60;
	const CONTENT_DIV_ID = "container-content";
	const MAPPING = {
		ballrace: {
			gmt_ballracer_grassworld01: 8,
			gmt_ballracer_iceworld03: 10,
			gmt_ballracer_khromidro02: 11,
			gmt_ballracer_memories04: 11, // 18?
			gmt_ballracer_sandworld02: 10,
			gmt_ballracer_skyworld01: 9,
			gmt_ballracer_paradise03: 13,
			// i dont know the roundcount of any of these
			// but ill set them at 8 to be safe
			gmt_ballracer_metalworld: 8,
			gmt_ballracer_midori: 8,
			gmt_ballracer_neonlights: 8,
			gmt_ballracer_nightball: 8,
			gmt_ballracer_prism03: 8,
			gmt_ballracer_rainbowworld: 8,
			gmt_ballracer_spaceworld: 8,
			gmt_ballracer_summit: 8,
			gmt_ballracer_waterworld: 8,
			gmt_ballracer_waterworld02: 8
		}
	};
	const BALLRACE_NAMES = {
		gmt_ballracer_grassworld01: "Grass World",
		gmt_ballracer_iceworld03: "Ice World",
		gmt_ballracer_khromidro02: "Khromidro",
		gmt_ballracer_memories04: "Memories",
		gmt_ballracer_metalworld: "Metal World",
		gmt_ballracer_midori: "Midori",
		gmt_ballracer_neonlights: "Neon Lights",
		gmt_ballracer_nightball: "Night World",
		gmt_ballracer_paradise03: "Paradise",
		gmt_ballracer_prism03: "Prism",
		gmt_ballracer_rainbowworld: "Rainbow World",
		gmt_ballracer_sandworld02: "Sand World",
		gmt_ballracer_skyworld01: "Sky World",
		gmt_ballracer_spaceworld: "Space World",
		gmt_ballracer_summit: "Summit",
		gmt_ballracer_waterworld: "Water World",
		gmt_ballracer_waterworld02: "Water World"
	};
	// ballrace tile setup
	(() => {
		const rowTileSize = 9;
		const names = Object.keys(BALLRACE_NAMES);
		const headerSection = document.getElementById("top");
		
		let outer = document.createElement("div");
		outer.classList.add("tile");
		outer.classList.add("is-ancestor");
		
		let i = 0;
		for (i = 0; i < names.length; i++) {
			if (i % rowTileSize == 0) {
				headerSection.insertBefore(outer, headerSection.childNodes[0]);
				outer = document.createElement("div");
				outer.classList.add("tile");
				outer.classList.add("is-ancestor");
			}
			let inner = document.createElement("div");
			inner.classList.add("tile");
			inner.classList.add("is-parent");
			let button = document.createElement("a");
			button.classList.add("button");
			button.classList.add("tile");
			button.classList.add("is-child");
			button.classList.add("box");
			// add image for the course here
			// button.classList.add("is-link");
			button.setAttribute("data", `ballrace-${names[i]}`);
			button.innerHTML = BALLRACE_NAMES[names[i]];
			inner.appendChild(button);
			outer.appendChild(inner);
		}
		if (i % rowTileSize != 0)
			headerSection.insertBefore(outer, headerSection.childNodes[0]);
	})()
	
	function verify(gamemode, args) {
		let verify = MAPPING[gamemode];
		return args.every(e => verify = verify[e]) && typeof verify !== "object";
	}

	function update(gamemode, ...args) {
		if (GAMEMODE_ENUM[gamemode] === undefined || !verify(gamemode, args))
			return Promise.reject({err: -1});
		switch (gamemode) {
			case GAMEMODE_ENUM.BALLRACE:
				return grabBallrace(args[0], MAPPING[gamemode][args[0]])
					.then(presentBallrace.bind(null, args[0], MAPPING[gamemode][args[0]]))
				break;
			default:
				return Promise.reject({err: -2});
		}
	}

	function grabBallrace(map, maxLevel) {
		const id = GAMEMODE_ENUM.BALLRACE + map;
		if (!isOldData(id))
			return Promise.resolve(cached(id));
		return Promise.all(Array.from(Array(maxLevel), (_x, i) => i + 1)
			.map(level => fetch([HOSTNAME, "ballrace", map, level].join("/"))
				.then(data => data.text())
				.then(data => {
					data = JSON.parse(data);
					if (data.err) throw new Error("Server error: " + data.err);
					return data;
				})
			))
			.then(allData => {
				if (allData.length < 1) return;
				const data = {
					lastUpdated: allData[0].lastUpdated,
					data: allData.map(d => d.data),
				};
				return cache(id, data);
			})
	}
	
	function cache(gamemode, data) {
		localStorage.setItem(gamemode, JSON.stringify(data));
		return data;
	}
	
	function cached(gamemode) {
		return JSON.parse(localStorage.getItem(gamemode));
	}
	
	function isOldData(gamemode) {
		const data = localStorage.getItem(gamemode);
		return !(data && Date.now() - JSON.parse(data).lastUpdated < HOUR);
	}
	
	function presentBallrace(map, levels, entry) {
		const mainBody = document.getElementById(CONTENT_DIV_ID);
		const section = document.createElement("section");
		section.classList.add("hero");
		section.classList.add("is-info");
		const title = document.createElement("div");
		title.classList.add("hero-body");
		const h1 = document.createElement("h1");
		h1.classList.add("title");
		h1.innerHTML = BALLRACE_NAMES[map];
		title.appendChild(h1);
		section.appendChild(title);
		mainBody.appendChild(section);
		
		function setupTable(map, level) {
			let table = document.createElement("table");
			table.style.width = "50%";
			table.classList.add("table");
			table.classList.add("is-bordered");
			let thead = document.createElement("thead");
			let row = document.createElement("tr");
			let el = document.createElement("th");
			el.innerHTML = `Level ${level}`;
			el.colSpan = 2;
			row.appendChild(el);
			thead.appendChild(row);
			table.appendChild(thead);
			return table;
		}
		
		if (entry.data.every(record => record.length === 0)) {
			h1.innerHTML += " - no records found. Go set some!";
			return;
		}
		
		for (let i = 0; i < levels; i++) {
			table = setupTable(map, i + 1);
			let records = entry.data[i];
			if (records.length < 1) continue;
			let tbody = document.createElement("tbody");
			records.forEach(record => {
				let row = document.createElement("tr");
				let el = document.createElement("td");
				el.innerHTML = record.name;
				el.width = "75%"
				row.appendChild(el);
				el = document.createElement("td");
				el.innerHTML = record.time.toFixed(2);
				row.appendChild(el);
				tbody.appendChild(row);
			});
			table.appendChild(tbody);
			mainBody.appendChild(table);
		}
	}
	
	function clearContent() {
		const main = document.getElementById(CONTENT_DIV_ID);
		while (main.firstChild) {
			main.removeChild(main.firstChild);
		}
	}
	
	async function handleUpdateClick(click) {
		clearContent();
		
		let button = click.target;
		let args = button.getAttribute("data");
		if (!args) {
			button = button.parentElement;
			args = button.getAttribute("data");
		}
		window.location.hash = args;
		
		button.classList.add("is-loading");
		const clickables = document.getElementsByClassName("tile is-child box");
		for (let i = 0; i < clickables.length; i++) {
			if (clickables[i] !== button)
				clickables[i].setAttribute("disabled", "");
		}
		try {
			await update(...(args.split("-")));
		} catch (e) {
			console.error(e);
		} finally {
			for (let i = 0; i < clickables.length; i++) {
				clickables[i].removeAttribute("disabled");
			}
			button.classList.remove("is-loading");
		}
	}
	
	const clickables = document.getElementsByClassName("tile is-child box");
	for (let i = 0; i < clickables.length; i++) {
		clickables[i].addEventListener("click", handleUpdateClick);
	}
	
	if (window.location.hash !== "") {
		clearContent();
		update(...window.location.hash.slice(1).split("-"));
	}
});
