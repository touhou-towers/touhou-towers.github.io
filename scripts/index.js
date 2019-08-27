window.onload = (async () => {
	// these are variables defined in script tags
	// of the html files that use this
	if (!GAMEMODE || !COLUMN_TITLE || !PROPERTY)
		return;

	const HOSTNAME = atob("aHR0cHM6Ly" + (9 + "wcm8tb3h" + (2 + 3) + "LmdsaXRjaC5tZS90dA" + ("=" == "=" ? "==" : "=")));
	const CONTENT_DIV_ID = "container-content";
	const HOUR = 1e3 * 60 * 60;
	
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

	if (isOldData(GAMEMODE)) {
		cache(GAMEMODE, await fetch([HOSTNAME, "players", GAMEMODE].join("/"))
			.then(res => res.json()));
	}
	let data = cached(GAMEMODE).data;
	
	const mainBody = document.getElementById(CONTENT_DIV_ID);
	const section = document.createElement("section");
	section.classList.add("hero");
	section.classList.add("is-info");
	const title = document.createElement("div");
	title.classList.add("hero-body");
	const h1 = document.createElement("h1");
	h1.classList.add("title");
	h1.innerHTML = COLUMN_TITLE;
	title.appendChild(h1);
	section.appendChild(title);
	mainBody.appendChild(section);

	let table = document.createElement("table");
	table.style.width = "50%";
	table.style.margin = "1em auto";
	table.classList.add("table");
	table.classList.add("is-bordered");
	
	let thead = document.createElement("thead");
	let row = document.createElement("tr");
	let el = document.createElement("th");
	el.innerHTML = "User";
	row.appendChild(el);
	el = document.createElement("th");
	el.innerHTML = "Score";
	row.appendChild(el);
	thead.appendChild(row);
	table.appendChild(thead);
			
	let tbody = document.createElement("tbody");
	let i = 0;
	
	while (i < data.length && data[i][PROPERTY] > 0) {
		let row = document.createElement("tr");
		let el = document.createElement("td");
		el.innerHTML = data[i].name;
		el.width = "75%"
		row.appendChild(el);
		el = document.createElement("td");
		el.innerHTML = data[i][PROPERTY];
		row.appendChild(el);
		tbody.appendChild(row);
		i++;
	}
	table.appendChild(tbody);
	mainBody.appendChild(table);
});
