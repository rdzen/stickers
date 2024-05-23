class Sticker {
	constructor(parent, key, id, zIndexer) {
		this._elem = document.createElement('textarea');
		this._elem.className = 'sticker';
		
		this._parent = parent;
		this._parent.appendChild(this._elem);
		
		this._zIndexer = zIndexer;
		
		this._initRelocation();
		this._initRemove();
		this._initAtopState();
		
		this._watchSize();
		this._watchText();
		
		this._stock = new Stock(key, id);
	}
	
	create(w, h, x, y, fcolor, bgcolor) {
		this._setW(w);
		this._setH(h);
		this._setX(x);
		this._setY(y);
		this._setText('');
		this._setColor(fcolor);
		this._setBgColor(bgcolor);

		this._setMaxZ();
	}
	
	restore(data) {
		this._setW(data.w);
		this._setH(data.h);
		this._setX(data.x);
		this._setY(data.y);
		this._setZ(data.z);
		
		this._setText(data.text);
	}
	
	_save() {
		let data = {
			x: this._getX(),
			y: this._getY(),
			z: this.getZ(),
			w: this._getW(),
			h: this._getH(),
			text: this._getText(),
		};
		
		this._stock.save(data);
	}
	
	_setW(value) {
		this._w = value;
		this._elem.style.width = value + 'px';
		
		this._save();
	}
	_getW() {
		return this._w;
	}
	
	_setH(value) {
		this._h = value;
		this._elem.style.height = value + 'px';
		
		this._save();
	}
	_getH() {
		return this._h;
	}
	
	_setX(value) {
		this._x = value;
		this._elem.style.left = value + 'px';
		
		this._save();
	}
	_getX() {
		return this._x;
	}
	
	_setY(value) {
		this._y = value;
		this._elem.style.top = value + 'px';
		
		this._save();
	}
	_getY() {
		return this._y;
	}
	
	_setColor(fcolor) {
		this._elem.style.color = fcolor;
	}

	_setBgColor(bgcolor) {
		this._elem.style.backgroundColor = bgcolor;
	}


	_setZ(value) {
		this._z = value;
		this._elem.style.zIndex = value;
		
		this._save();
	}
	getZ() {
		return this._z;
		//return parseInt(this._elem.style.zIndex);
	}
	
	_setText(text) {
		this._text = text;
		this._elem.value = text;
		
		this._save();
	}
	_getText() {
		return this._text;
	}
	
	_setMaxZ() {
		let maxZ = this._zIndexer.getMaxZ();
		
		if (maxZ !== this.getZ() || maxZ === 0) {
			this._setZ(maxZ + 1);
		}
	}
	
	_watchSize() {
		// resize event does not work
		this._elem.addEventListener('mouseup', () => {
			let newWidth = parseInt(this._elem.clientWidth);
			let newHeight = parseInt(this._elem.clientHeight);
			
			if (newWidth !== this._getW()) {
				this._setW(newWidth);
			}
			if (newHeight !== this._getH()) {
				this._setH(newHeight);
			}
		});
	}
	_watchText() {
		this._elem.addEventListener('blur', () => {
			let newText = this._elem.value;
			
			if (newText !== this._getText()) {
				this._setText(newText);
			}
		});
	}
	
	_initAtopState() {
		this._elem.addEventListener('click', () => {
			this._setMaxZ();
		});
		this._elem.addEventListener('dragstart', () => {
			this._setMaxZ();
		});
	}
	
	_initRemove() {
		this._elem.addEventListener('mousedown', event => {
			if (event.which == 2) {
				this._parent.removeChild(this._elem);
				event.preventDefault();
				
				this._stock.remove();
			}
		});
	}
	
	_initRelocation() {
		this._elem.draggable = true;
		
		let correctionX = 0;
		let correctionY = 0;
		
		this._elem.addEventListener('dragstart', event => {
			correctionX = this._getX() - event.pageX;
			correctionY = this._getY() - event.pageY;
		});
		this._elem.addEventListener('dragend', event => {
			this._setX(event.pageX + correctionX);
			this._setY(event.pageY + correctionY);
			
			this._elem.blur();
		});
	}
}

class ZIndexer {
	constructor() {
		this._stickers = [];
	}
	
	add(sticker) {
		this._stickers.push(sticker);
	}
	
	getMaxZ() {
		if (this._stickers.length !== 0) {
			let zindexes = [];
			
			this._stickers.forEach(sticker => {
				zindexes.push(sticker.getZ());
			});
			
			return Math.max.apply(null, zindexes);
		} else {
			return 0;
		}
	}
}

class Stock {
	constructor(key, id = null) {
		this._storage = new Storage(key);
		this._id = id;
	}
	
	save(value) {
		let data = this._extract();
		data[this._id] = value;
		this._compact(data);
	}
	
	remove() {
		let data = this._extract();
		delete data[this._id];
		this._compact(data);
	}
	
	get() {
		let data = this._extract();
		if (data[this._id] !== undefined) {
			return data[this._id];
		} else {
			return undefined;
		}
	}
	
	getAll() {
		return this._extract();
	}
	
	_compact(data) {
		this._storage.save(JSON.stringify(data));
	}
	
	_extract() {
		let data = this._storage.get();
		
		if (data === null) {
			return {};
		} else {
			return JSON.parse(data);
		}
	}
}

class Storage {
	constructor(key) {
		this._key = key;
	}
	
	save(data) {
		localStorage.setItem(this._key, data);
	}
	
	get() {
		return localStorage.getItem(this._key);
	}
}

let key = 'stickers';
let zIndexer = new ZIndexer;

let stock = new Stock(key);
let globalData = stock.getAll();

var id = 0;
for (id in globalData) {
	let sticker = new Sticker(document.body, 
		key, id, zIndexer); 
	sticker.restore(globalData[id]);
	
	zIndexer.add(sticker);
};


let select = document.querySelector('#select');
let select1 = document.querySelector('#select1');

select.addEventListener('change', function(){
	console.log(null);
	fcolor = this.value;
  	console.log('Цвет шрифта:' + fcolor);
 	
	//нашли максимальный Z-индекс, чтобы красить активный стикер
	let MaxInd = zIndexer.getMaxZ();
	console.log(MaxInd);
	
	let textAreas = document.querySelectorAll('textarea');
	
	for (let stick of textAreas) {
		
		console.log(stick.style.zIndex);
		if (+stick.style.zIndex === MaxInd) {
			console.log(stick.style.zIndex);
			stick.style.color = fcolor;
		}
	}
	
});

select1.addEventListener('change', function(){
	bgcolor = this.value;
  	console.log('Цвет шрифта:' + bgcolor);
 	
	//нашли максимальный Z-индекс, чтобы красить активный стикер
	let MaxInd = zIndexer.getMaxZ();
	console.log(MaxInd);
	
	let textAreas = document.querySelectorAll('textarea');
	
	for (let stick of textAreas) {
		
		console.log(stick.style.zIndex);
		if (+stick.style.zIndex === MaxInd) {
			console.log(stick.style.zIndex);
			stick.style.backgroundColor = bgcolor;
		}
	}
	
});


window.addEventListener('dblclick', (event) => {
	id++;
	
	let sticker = new Sticker(document.body, 
		key, id, zIndexer); 
	sticker.create(150, 200, event.pageX, event.pageY);
	
	zIndexer.add(sticker);
});