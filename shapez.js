// idk this does something i think
const none  = { found: false };
const red   = { found: true, color: "RED",   red: true,  green: false, blue: false };
const green = { found: true, color: "GREEN", red: false, green: true,  blue: false };
const blue  = { found: true, color: "BLUE",  red: true,  green: false, blue: true  };
const shape = (str) => {
	if (str.length == 8) str = str.match(/../g).map(e => e[0]);
	if (str.length != 4) throw "str.length != 4";
	var shape = str.match(/^([CRWS])([CRWS])([CRWS])([CRWS])$/);
	return {
		code: str,
		found: true,
		shape: [shape[1],shape[2],shape[3],shape[4]].map(e=>({
			shape: ["CIRCLE","RECTANGLE","WINDMILL","STAR"]["CRWS".indexOf(e)],
			circle: e=="C", rectangle: e=="R", windmill: e=="W", star: e=="S"
		}))
	};
}
const clamp = (v, min = 0, max = 1) => {
	return Math.max(min, Math.min(max, v));
}
const randomSubShape = (rng, weights) => {
	const sum = Object.values(weights).reduce((a,b) => a+b, 0);
	const chosenNumber = rng.nextIntRange(0, sum - 1);
	let accumulated = 0;
	for (const key in weights) {
		const weight = weights[key];
		if (accumulated + weight > chosenNumber)
			return key;
		accumulated += weight;
	}
	return "circle";
}
var getPatchAt = (x, y, mapSeed) => {
	if (x == +0 && y == +0) return red;
	if (x == -1 && y == -1) return green;
	if (x == -1 && y == +0) return shape("CCCC");
	if (x == +0 && y == -1) return shape("RRRR");
	if (x == +5 && y == -2) return shape("SSSS");
	// maybe ripped from original game
	var res = [];
	const rng = new rng_(x + "|" + y + "|" + mapSeed);
	const chunkCenter = { x: x + 0.5, y: y + 0.5 };
	const distance = Math.round(Math.hypot(chunkCenter.x,chunkCenter.y));
	const colorPatchChance = 0.9 - clamp(distance / 25, 0, 1) * 0.5;
	if (rng.next() < colorPatchChance / 4) {
		let availableColors = [ red, green ];
		if (distance > 2)
			availableColors.push(blue);
		res.push(rng.choice(availableColors));
	}
	const shapePatchChance = 0.9 - clamp(distance / 25, 0, 1) * 0.5;
	if (rng.next() < shapePatchChance / 4) {
		let subShapes = null;
		let weights = {
			"rect"    : 100,
			"circle"  : Math.round(50 + clamp(distance * 2, 0, 50)),
			"star"    : Math.round(20 + clamp(distance, 0, 30)),
			"windmill": Math.round(6  + clamp(distance, 0, 20)),
		}
		if (distance < 7) {
			weights["star"] = 0;
			weights["windmill"] = 0;
		}
		if (distance < 10) {
			const s  = randomSubShape(rng, weights);
			subShapes = [s,s,s,s];
		} else if (distance < 15) {
			const s1 = randomSubShape(rng, weights);
			const s2 = randomSubShape(rng, weights);
			subShapes = [s1,s1,s2,s2];
		} else {
			subShapes = [
				randomSubShape(rng, weights),
				randomSubShape(rng, weights),
				randomSubShape(rng, weights),
				randomSubShape(rng, weights),
			];
		}
		let windmillCount = 0;
		for (let i = 0; i < subShapes.length; ++i) {
			if (subShapes[i] === "windmill") ++windmillCount;
		}
		if (windmillCount > 1) {
			subShapes[0] = subShapes[1] = "rectangle";
		}
		var r = subShapes.map(e => e[0].toUpperCase()).join("");
		res.push(shape(r));
	}
	return res.reduce((a,b)=>({...a,...b}),{});
}
const findPatches = (arg, seed, findMax) => {
	try {
		if (typeof arg != "string" || !arg) return { error: true };
		// i don't really see any need to use position as you can just launch the game and see what patch is there
		var posMatch = arg.match(/^(-[1-9]|-?[1-9][0-9]{1,9}|[0-9]),(-[1-9]|-?[1-9][0-9]{1,9}|[0-9])$/);
		var colorMatch = arg.match(/^(green|red|blue)$/i);
		var shapeMatch = arg.match(/^(([CRWS]){4}|([CRWS]u){4})$/i);
		if (posMatch || colorMatch || shapeMatch) {
			if (typeof seed != "string" || !seed) return { error: true };
			if (typeof findMax != "number" || !findMax || findMax <= 0 || findMax >= 100000 || findMax != Math.round(findMax)) return { error: true };
		} else {
			return { error: true };
		}
		delete _;
		const search = (c, pLength) => {
			if (!c) return [];
			var x = 0;
			var y = 0;
			var dx = 0;
			var dy = -1;
			var patches = [];
			const doSearch = () => {
				if (pLength <= 0) {
					return true;
				}
				var patch = getPatchAt(x, y, seed);
				if (patch.color == c || patch.code == c) {
					--pLength;
					patches.push({ ax: x*16+8, ay: y*16+8, x, y, ...patch });
				}
			}
			for (var i = 0; i < 200000000; ++i) {
				x += dx;
				y += dy;
				if (x == y || (-1-y == x)) {
					     if (dx == -1 && dy ==  0) { dx =  0; dy =  1; }
					else if (dx ==  0 && dy == -1) { dx = -1; dy =  0; }
					else if (dx ==  0 && dy ==  1) { dx =  1; dy =  0; }
					else if (dx ==  1 && dy ==  0) { dx =  0; dy = -1; }
				}
				if (doSearch() == true) {
					return patches;
				}
				if (x >= 0 && x == y) { ++x; doSearch(); }
			}
			return [];
		};
		if (posMatch) {
			var x = parseInt(posMatch[1]);
			var y = parseInt(posMatch[2]);
			var patch = getPatchAt(x, y, seed);
			return { ax: x*16+8, ay: y*16+8, x, y, ...patch };
		} else if (colorMatch) {
			var c = colorMatch[1].toUpperCase();
		} else if (shapeMatch) {
			var c = shapeMatch[1].toUpperCase();
			if (c.length == 8) c = c.match(/../g).map(e => e[0]);
			if (c.split("").filter(e => e == "W").length / c.length >= 0.25 && c != "RRWW") {
				return { found: false };
			}
			var s = search(c, findMax);
			if (s.length == 0) return { found: false, results: [] };
			return { found: true, results: s };
		}
	} catch (err) {
		console.error(err);
		return { error: true };
	}
	return { error: true };
};
