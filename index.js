var form = document.getElementById("form");
var find = document.getElementById("find");
var seed = document.getElementById("seed");
var fileForm = document.getElementById("file");
var fileLabel = document.getElementById("fileLabel");
var submit = document.getElementById("submit");
var errorText = document.getElementById("errortext");
var shapeO = document.getElementById("shape");
var resultTable = document.getElementById("table");
var s1 = document.getElementById("s1");
var s2 = document.getElementById("s2");
var s3 = document.getElementById("s3");
var s4 = document.getElementById("s4");
var s5 = document.getElementById("s5");
var fakeFile = document.getElementById("fakeFile");
var helpText = document.getElementById("help");
var searching = false;
document.getElementById("main").classList.remove("h");
document.getElementById("help").classList.remove("h");
function isValidSeed(s) {
	return !!s.match(/^([0-9]|[1-9][0-9]{1,4}|100000)$/);
}
function checkInput(enabling) {
	var a;
	var K = !!seed.value && typeof seed.value == "string";
	if (K) K = isValidSeed(seed.value);
	if (find.value && typeof find.value == "string") {
		a = find.value.match(/^((red|green|blue)|((([RCWS]){4})|(([RCWS]u){4})))$/i);
	}
	var TF = find.value;
	var TS = seed.value;
	find.disabled = searching;
	seed.disabled = searching;
	fileForm.disabled = searching;
	if (searching) {
		fileLabel.classList.remove("x");
		fileLabel.classList.add("xx");
	} else {
		fileLabel.classList.add("x");
		fileLabel.classList.remove("xx");
		if (fileForm.value && fileForm.files.length >= 1) {
			if (!find.disabled) {
				seed.disabled = true;
				const fileReader = new FileReader();
				fileReader.onload = function(e) {
					const c = e.target.result;
					try {
						if (find.disabled) return;
						if (c.length < 1024) throw "length is less than 1024 ("+c.length+")";
						if (c[0] != "\u0001") throw "first char is not \\1";
						const c_ = c.substring(1);
						const s_ = LZString.decompressFromEncodedURIComponent(c_);
						const s = JSON.parse(s_.substring(s_.indexOf("{")));
						const f = decompressObject(s);
						const seed_ = f.dump.map.seed;
						if (!seed_) throw "seed doesn't exist";
						if (find.disabled) return;
						seed.value = seed_;
						seed.disabled = false;
						checkInput();
					} catch (e) {
						console.error("error getting seed from shapez file -",e);
						errorText.innerText = "Error reading file, file is not valid shapez.io save file, or seed not found in file";
						resultTable.classList.add("h");
						if (find.disabled) return;
						seed.disabled = false;
						checkInput();
					}
				};
				fileReader.readAsBinaryString(fileForm.files[0]);
			}
			fileForm.value = "";
		}
	}
	if (a && a[0]) {
		var b = a[0];
		if (a[3] && b.length == 8) b = b.charAt(0) + b.charAt(2) + b.charAt(4) + b.charAt(6);
		if (a[2]) b = b.toLowerCase();
		if (a[3]) b = b.toUpperCase();
		shapeO.classList.remove("h");
		var I = false;
		if (+(b.charAt(0)=="W")+(b.charAt(1)=="W")+(b.charAt(2)=="W")+(b.charAt(3)=="W")>1&&b!="RRWW") {
			errorText.innerText = b + " cannot appear in game, however RRWW can";
			resultTable.classList.add("h");
			submit.disabled = true;
			I = true;
		} else {
			submit.disabled = !K||searching;
			errorText.innerText = "";
		}
		var ss1 = a[3] ? "image/" + b.charAt(0) + ".png" : "";
		var ss2 = a[3] ? "image/" + b.charAt(1) + ".png" : "";
		var ss3 = a[3] ? "image/" + b.charAt(2) + ".png" : "";
		var ss4 = a[3] ? "image/" + b.charAt(3) + ".png" : "";
		var ss5 = a[2] ? "image/" + b + ".png" : I ? "image/x.png" : "";
		if (ss1) { s1.classList.remove("h"); } else { s1.classList.add("h"); }
		if (ss2) { s2.classList.remove("h"); } else { s2.classList.add("h"); }
		if (ss3) { s3.classList.remove("h"); } else { s3.classList.add("h"); }
		if (ss4) { s4.classList.remove("h"); } else { s4.classList.add("h"); }
		if (ss5) { s5.classList.remove("h"); } else { s5.classList.add("h"); }
		s1.src = ss1;
		s2.src = ss2;
		s3.src = ss3;
		s4.src = ss4;
		s5.src = ss5;
		helpText.classList.add("h");
		return (K&&!I&&!searching)?{find:TF,seed:TS}:false;
	} else {
		submit.disabled = true;
		shapeO.classList.add("h");
		s1.src = "";
		s2.src = "";
		s3.src = "";
		s4.src = "";
		s5.src = "";
		s1.classList.add("h");
		s2.classList.add("h");
		s3.classList.add("h");
		s4.classList.add("h");
		s5.classList.add("h");
		helpText.classList.remove("h");
		errorText.innerText = "";
		resultTable.classList.add("h");
		return false;
	}
}
fakeFile.addEventListener("click",function(){
	fileForm.click();
});
["load","blur","change","focus","keyup","keypress","keydown","mousedown","click","mouseup","contextmenu"].forEach(function(e){
	find    .addEventListener(e,function(){checkInput();});
	seed    .addEventListener(e,function(){checkInput();});
	submit  .addEventListener(e,function(){checkInput();});
	fileForm.addEventListener(e,function(){checkInput();});
});
checkInput();
form.addEventListener("submit", function(ev) {
	ev.preventDefault();
	var a = checkInput(true);
	if (a) {
		searching = true;
		const result = returnRes(a.find, a.seed);
		console.log(result);
		resultTable.innerHTML = "";
		if (result.found) {
			resultTable.classList.remove("h");
			let h = document.createElement("tr");
			let h1 = document.createElement("th");
			let h2 = document.createElement("th");
			h1.classList.add("yyr");
			h2.classList.add("yyr");
			h.classList.add("yyb");
			let hh1 = document.createTextNode("X");
			let hh2 = document.createTextNode("Y");
			h1.appendChild(hh1);
			h2.appendChild(hh2);
			h.appendChild(h1);
			h.appendChild(h2);
			resultTable.appendChild(h);
			for (var i = 0; i < result.results.length; ++i) {
				let h = document.createElement("tr");
				let h1 = document.createElement("td");
				let h2 = document.createElement("td");
				h1.classList.add("yyr");
				h2.classList.add("yyr");
				h.classList.add("yyb");
				let hh1 = document.createTextNode(result.results[i].ax);
				let hh2 = document.createTextNode(result.results[i].ay);
				h1.appendChild(hh1);
				h2.appendChild(hh2);
				h.appendChild(h1);
				h.appendChild(h2);
				resultTable.appendChild(h);
			}
		} else {
			resultTable.classList.add("h");
			errorText.innerText = "No results found";
		}
		searching = false;
		checkInput();
	}
});
