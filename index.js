window.onload = (async () => {
	const HOSTNAME = atob("aHR0cHM6Ly" + (9 + "wcm8tb3h" + (2 + 3) + "LmdsaXRjaC5tZS90dA" + ("=" == "=" ? "==" : "=")));
	const GAMEMODE_ENUM = {};
	(GAMEMODE_ENUM => {
		GAMEMODE_ENUM[GAMEMODE_ENUM.BALLRACE = "ballrace"] = "BALLRACE";
	})(GAMEMODE_ENUM);
	const HOUR = 1e3 * 60 * 60;
		
	const MAPPING = {
		ballrace: {
			gmt_ballracer_grassworld01: 1,
			gmt_ballracer_iceworld03: 10,
			gmt_ballracer_khromidro02: 11,
			gmt_ballracer_memories04: 11, // 18?
			gmt_ballracer_sandworld02: 10,
			gmt_ballracer_skyworld01: 9,
			gmt_ballracer_paradise03: 13,
			// gmt_ballracer_metalworld: 3,
			// gmt_ballracer_midori: 3,
			// gmt_ballracer_neonlights: 3,
			// gmt_ballracer_nightball: 3,
			// gmt_ballracer_prism03: 3,
			// gmt_ballracer_rainbowworld: 3,
			// gmt_ballracer_spaceworld: 3,
			// gmt_ballracer_summit: 3,
			// gmt_ballracer_waterworld: 3,
			// gmt_ballracer_waterworld02: 3
		}
	}

	function verify(gamemode, args) {
		let verify = MAPPING[gamemode];
		return args.every(e => verify = verify[e]) && typeof verify !== "object";
	}

	function grab(gamemode, ...args) {
		let extrArg;
		if (GAMEMODE_ENUM[gamemode] === undefined || !verify(gamemode, args))
			return Promise.reject({err: -1});
		switch (gamemode) {
			case GAMEMODE_ENUM.BALLRACE:
				return grabBallrace(args[0], MAPPING[gamemode][args[0]]);
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
			});
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
	
	function present(gamemode, entry) {
		const div = document.createElement("div");
		const table = document.createElement("table");
		const header = document.createElement("tr");
		// ballrace specific logic
		// and another weird hack because of a weird return
		let headerData = entry.data.find(e => e.length > 0);
		if (headerData) {
			for (const key in headerData[0]) {
				const headerChild = document.createElement("th");
				headerChild.innerHTML = key;
				header.appendChild(headerChild);
			}
			table.appendChild(header);
		}
		for (const data of entry.data) {
			for (const datum of data) {
				const row = document.createElement("tr");
				for (const key in datum) {
					const child = document.createElement("td");
					child.innerHTML = datum[key];
					row.appendChild(child);
				}
				table.appendChild(row);
			}
		}
		div.appendChild(table);
		document.body.appendChild(div);
	}
	
	for (const key in MAPPING[GAMEMODE_ENUM.BALLRACE]) {
		await grab(GAMEMODE_ENUM.BALLRACE, key)
			.then(present.bind(null, GAMEMODE_ENUM.BALLRACE))
			.catch(console.error);
	}
});
