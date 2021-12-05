// totally not ripped from the original game
function Mash() {
	var n = 0xefc8249d;
	return function (data) {
		data = data.toString();
		for (var i = 0; i < data.length; i++) {
			n += data.charCodeAt(i);
			var h = 0.02519603282416938 * n;
			n = h >>> 0;
			h -= n;
			h *= n;
			n = h >>> 0;
			h -= n;
			n += h * 0x100000000; // 2^32
		}
		return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
	};
}
function makeNewRng(seed) {
	// Johannes Baagøe <baagoe@baagoe.com>, 2010
	var c = 1;
	var mash = Mash();
	let s0 = mash(" ");
	let s1 = mash(" ");
	let s2 = mash(" ");
	s0 -= mash(seed);
	if (s0 < 0) {
		s0 += 1;
	}
	s1 -= mash(seed);
	if (s1 < 0) {
		s1 += 1;
	}
	s2 -= mash(seed);
	if (s2 < 0) {
		s2 += 1;
	}
	mash = null;
	var random = function () {
		var t = 2091639 * s0 + c * 2.3283064365386963e-10; // 2^-32
		s0 = s1;
		s1 = s2;
		return (s2 = t - (c = t | 0));
	};
	random.exportState = function () {
		return [s0, s1, s2, c];
	};
	random.importState = function (i) {
		s0 = +i[0] || 0;
		s1 = +i[1] || 0;
		s2 = +i[2] || 0;
		c = +i[3] || 0;
	};
	return random;
}
class rng_ {
	constructor(seed) {
		this.reseed(seed);
	}
	reseed(seed) {
		this.internalRng = makeNewRng(seed || Math.random());
	}
	next() {
		return this.internalRng();
	}
	choice(array) {
		const index = this.nextIntRange(0, array.length);
		return array[index];
	}
	nextIntRange(min, max) {
		if (!Number.isFinite(min)) throw "Minimum is not an integer";
		if (!Number.isFinite(max)) throw "Maximum is not an integer";
		if (max < min) throw "Maximum cannot be below minimum";
		if (max == min) return Math.floor(min);
		return Math.floor(this.next() * (max - min) + min);
	}
	nextRange(min, max) {
		if (max < min) throw "Maximum cannot be below minimum";
		if (max == min) return min;
		return this.next() * (max - min) + min;
	}
}
