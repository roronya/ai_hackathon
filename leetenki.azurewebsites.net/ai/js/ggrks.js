/**
 * @author team no_ggrks
 */

// ---------------------　main rooting　-------------------------
var debug;
var initFlag = false;
var table = new Array();
var camera, scene, renderer;
var controls;
var stats = new Stats();
document.body.appendChild(stats.domElement);


// objectはdom要素をラップしたCSS3DObject型の変数。それを配列にしたものがobjects。
// tableのobjectの配列、sphereのobjectの配列。、helixのobjectの配列。、gridのobjectの配列を合わせて、targetsという3次元配列で扱う。
// objectsは、全てのdom要素の実体を含んだCSS3DObject()クラスだが、各targetsは座標情報のみを記憶したObject3D()クラス
var objects = [];
var targets = { table: [], sphere: [], helix: [], grid: [], random: [] };

init();
animate();
// --------------------------------------------------------

// init yaar table
function initYaarTable(yaarData) {
	while(table.length) {
		table.pop();
	}
	
	for(var i = 0; i < yaarData.length; i++) {
		table.push(yaarData[i]);
	}
}

// init table information
function initTable(jsonObj) {
	while(table.length) {
		table.pop();
	}
	
	for(var i = 0; i < jsonObj.length; i++) {
		var searchKeyword = new Array();
		for(var j = 0; j < jsonObj[i].length; j++) {
			searchKeyword.push(jsonObj[i][j]);
		}
		table.push(searchKeyword);
	}
}

// post to ggrks
function sendKeyword(keyword, asyn) {
	var req = new XMLHttpRequest();
	req.open('GET', './php/ggrks.php?keyword=' + encodeURIComponent(keyword), asyn);
	req.onreadystatechange = function() {
		if(this.readyState == 4 && this.status / 100 == 2) {
			var jsonObj = JSON.parse(this.responseText);
			initTable(jsonObj);
		}
	}
	req.send(null);
}

// カメラが向いている方向のベクトルを計算する関数
function getCameraVector() {
	var pLocal = new THREE.Vector3(0, 0, -1);
	var pWorld = pLocal.applyMatrix4(camera.matrixWorld);
	return pWorld.sub(camera.position).normalize();
}

// CSSカード生成用の情報を受け取り、1つのCSS3DObjectを作成して返す。
function createCSS3DObject(item) {
	var element = document.createElement("div");
	element.className = "element";
	element.style.backgroundColor = "rgba(0,127,127," + (Math.random() * 0.5 + 0.25) + ")";
/*
	element.maxLength = 0;
	element.maxHeight = 0;
	for(var i = 0; i < item.length; i++) {
		var word = document.createElement("div");
		word.className = "word";
		word.textContent = item[i];
		element.appendChild(word);
		if(element.maxLength < item[i].length) {
			element.maxLength = item[i].length;
		}
		element.maxHeight++;
	}
	element.style.width = (element.maxLength * 36 + 5) + "px";
	element.style.height = (element.maxHeight * 60 + 40) + "px";
	element.item = item;

	// init position
	var object = new THREE.CSS3DObject(element);
*/

	// CSSカード上に画像を配置
	var image = document.createElement("img");
	image.src = item.image;
	image.style.opacity = 0.8;
	image.className = "image";
	element.appendChild(image);
	element.appID = item.id;
	element.negative = item.negative;
	element.positive = item.positive;
	
	// elementは、table配列の1要素を基に生成されたDocument object
	// これをTHREEクラスでラッピングしたものがobject。
	var object = new THREE.CSS3DObject(element);
	
	
	object.element = element;
	object.position.x = Math.random() * 6000 - 3000;
	object.position.y = Math.random() * 6000 + 8000;
	object.position.z = Math.random() * 6000 - 3000;
	scene.add(object);

	// add to objects list
	objects.push(object);

	// goal position
	var object = new THREE.Object3D();
	//object.position.x = ( table[ i + 3 ] * 140 ) - 1330;
	//object.position.y = - ( table[ i + 4 ] * 180 ) + 1990;
	targets.table.push(object);
	
	var removeExplainID = null;
	var loadingExplainID = null;
	
	// CSSカード自身がmouseoverされた際に、焦点を当てる関数
	element.onmouseover = function() {
		document.getElementById("neg").innerHTML = this.negative;
		document.getElementById("pos").innerHTML = this.positive;
		var explain = document.getElementById("explain");
		if(loadingExplainID) {
			return;
		}
		if(removeExplainID) {
			window.clearInterval(removeExplainID);
			removeExplainID = null;
		}
		if(!explain.style.opacity) {
			explain.style.opacity = 0;			
		}
		explain.style.opacity = parseFloat(explain.style.opacity);
		loadingExplainID = window.setInterval(loadingExplain, 10);

		function loadingExplain() {
			explain.style.opacity = parseFloat(explain.style.opacity) + 0.03;
			if(explain.style.opacity > 1) {
				explain.style.opacity = 1;
				window.clearInterval(loadingExplainID);	
				loadingExplainID = null;
			}
		}
	}
	
	// CSSカード自身がクリックされた際に、焦点を当てる関数
	element.onmouseout = function() {
		var explain = document.getElementById("explain");
		if(removeExplainID) {
			return;
		}
		var explain = document.getElementById("explain");
		if(loadingExplainID) {
			window.clearInterval(loadingExplainID);
			loadingExplainID = null;
		}
		if(!explain.style.opacity) {
			explain.style.opacity = 1;			
		}
		removeExplainID = window.setInterval(removeExplain, 10);
		explain.style.opacity = parseFloat(explain.style.opacity);
		function removeExplain() {
			explain.style.opacity = parseFloat(explain.style.opacity) - 0.03;
			if(explain.style.opacity < 0.01) {
				window.clearInterval(removeExplainID);
				removeExplainID = null;
			}
		}
	}


	element.onclick = function() {
		TWEEN.remove(object.moving);
		TWEEN.remove(object.rotating);

		/*		
		var keyword = "";
		for(var i = 0; i < element.item.length; i++) {
			keyword += element.item[i];
			keyword += "+";
		}
		window.open("https://www.google.co.jp/#q=" + keyword, "google");
		*/
		console.log(element);
		window.open("https://itunes.apple.com/jp/app/id" + element.appID, "app");
		
		// カメラ手前まで移動させる
		var setPos = getCameraVector().multiplyScalar(200).add(camera.position);
		var moving = new TWEEN.Tween( object.position )
			.to( { x: setPos.x, y: setPos.y, z: setPos.z }, 1000)
			.easing( TWEEN.Easing.Exponential.InOut )
			.start();
		object["moving"] = moving;
			
		// カメラのほうを向くように回転
		var plain = new THREE.Object3D();
		plain.position = setPos;
		plain.lookAt(camera.position);
		var rotating = new TWEEN.Tween( object.rotation )
			.to( { x: plain.rotation.x, y: plain.rotation.y, z: plain.rotation.z }, 1000)
			.easing( TWEEN.Easing.Exponential.InOut )
			.start();
		object["rotating"] = rotating;

		
		// アニメーションスタート
		new TWEEN.Tween( this )
			.to( {}, 1000)
			.onUpdate( render )
			.start();
	}
	
	// そのobjectの初期位置をランダムで決定
	if(!initFlag) {
		object.position.x = Math.random() * 4000 - 2000;
		object.position.y = Math.random() * 4000 - 2000;
		object.position.z = Math.random() * 4000 - 2000;
	} else {
		object.position.y = 5000;
	}
	return object;
}

// objectsを基にランダム配置の再計算を行う関数
function recalcRandomPos() {
	targets.random = new Array();
	for(var i = 0; i < objects.length; i++) {
		var object = new THREE.Object3D();
		var xRange = 1000 + i * 30;
		var yRange = 800 + i * 30;
		object.position.x = Math.random() * xRange - xRange/2;
		object.position.y = Math.random() * yRange - yRange/2;
		object.position.z = 7500 - 150*i//Math.random() * 2000 - 1000;
		targets.random.push(object);
	}
}

// objectsを基にgrid配置の再計算を行う関数
function recalcGridPos() {
	targets.grid = new Array();
	for ( var i = 0; i < objects.length; i ++ ) {
		var object = new THREE.Object3D();	
		object.position.x = ( ( i % 4 ) * 300 ) - 450;
		object.position.y = ( - ( Math.floor( i / 4) % 4 ) * 300 ) + 500;
		object.position.z = 7000 + ( Math.floor( i / 16 ) ) * 1300 - 1300;
		targets.grid.push( object );
	}
}

// objectsを基にsphere配置の再計算を行う関数
function recalcSpherePos() {
	targets.sphere = new Array();
	var vector = new THREE.Vector3();
	for ( var i = 0, l = objects.length; i < l; i ++ ) {
		var phi = Math.acos( -1 + ( 2 * i ) / l );
		var theta = Math.sqrt( l * Math.PI ) * phi;
		var object = new THREE.Object3D();
	
		// 半径r
		var r = 700;
		object.position.x = r * Math.cos( theta ) * Math.sin( phi );
		object.position.y = r * Math.sin( theta ) * Math.sin( phi );
		object.position.z = r * Math.cos( phi );
		
		// 原点を中心にobject.position座標を決め、その座標自体をベクトルと見なし2倍する。
		// 原点、現在位置、2倍したベクトルの先は一直線上にあるので、現在位置から2倍ベクトルの先を見るように傾ければ、ベクトルに垂直となる。
		vector.copy( object.position ).multiplyScalar( 2 );
		object.lookAt( vector );
		targets.sphere.push( object );
	}
}

// objectsを基にhelix配置の再計算を行う関数
function recalcHelixPos() {
	targets.helix = new Array();
	var vector = new THREE.Vector3();
	for ( var i = 0, l = objects.length; i < l; i ++ ) {
		var phi = i * 0.505 + Math.PI;
		var object = new THREE.Object3D();
	
		// 半径r
		var r = 500;
		object.position.x = r * Math.sin( phi ) * 1.2;
		object.position.z = 1000 - i*200//- ( i * 10 ) + 250;
		object.position.y = r * Math.cos( phi ) + 400;
	
		vector.copy( object.position );
		vector.x *= 2;
		vector.z *= 2;
	
//		object.lookAt( vector );
		targets.helix.push( object );
	}	
}

// calculate position based on table
function recalcTablePos() {
	targets.table = new Array();
	for (var i = 0; i < objects.length; i ++) {
		var item = table[i];
		var object = new THREE.Object3D();
		object.position.x = (/*item[ 3 ]*/i * 200 ) - 1540;
		object.position.y = - (/*item[ 4 ]*/i * 200 ) + 1100;
		targets.table.push(object);
	}	
}

// Objects配列の情報を基に変形時のpositionを再定義	
function recalcPosition() {
	recalcTablePos();	// table
	recalcSpherePos();	// sphere
	recalcHelixPos();	// helix
	recalcGridPos();	// grid
	recalcRandomPos();	// random
}

// CSSカードを作るための情報配列tableを基に、objects配列、scene配列を生成する。
function setObjects() {	
	// Objects配列およびsceneを初期化
	for (var i = 0; i < table.length; i++) {
		var object = createCSS3DObject(table[i]);		
		scene.add(object);
		// objectsは、objectを配列として記憶しておくためのもの。
		//objects.push(object);
	}
	initFlag = true;
}

// 全てのイベントハンドルを設定する関数
function setEventHandler() {
	/*
	// アルファ値UP
	var button = document.getElementById( 'alphaPlus' );
	button.addEventListener( 'click', function ( event ) {
		for(var i = 0; i < renderer.domElement.childNodes[0].childNodes.length; i++) {
			var element = renderer.domElement.childNodes[0].childNodes[i];
			element.childNodes[0].style.opacity += 0.1;
		};
	}, false );
	*/

	// TABLEが押された時
/*
	var button = document.getElementById( 'table' );
	button.addEventListener( 'click', function ( event ) {
		// transform 関数で、2000ミリ秒後に目的の配置になるよう　変形する。
		transform( targets.table, 2000 );
	}, false );
	
	// SPHEREが押された時
	var button = document.getElementById( 'sphere' );
	button.addEventListener( 'click', function ( event ) {
		transform( targets.sphere, 2000 );
	}, false );
	
	// HELIXが押された時
	var button = document.getElementById( 'helix' );
	button.addEventListener( 'click', function ( event ) {
		transform( targets.helix, 2000 );
	}, false );
*/

	// GRIDが押された時	
	var button = document.getElementById( 'grid' );
	button.addEventListener( 'click', function ( event ) {
		transform( targets.grid, 2000 );
	}, false );
	
	// SHUFFLEが押された時
	var button = document.getElementById( 'random' );
	button.addEventListener( 'click', function ( event ) {
		recalcRandomPos();
		transform( targets.random, 2000);
	}, false);
	
	// RESETが押された時
	var button = document.getElementById( 'reset' );
	button.addEventListener( 'click', function ( event ) {
		new TWEEN.Tween( camera.position )
			.to( { x: 0, y: 0, z: 1400 }, 1000 )
			.easing( TWEEN.Easing.Exponential.InOut )
			.start();

		new TWEEN.Tween( camera.rotation )
			.to( { x: 0, y: 0, z: -1 }, 1000 )
			.easing( TWEEN.Easing.Exponential.InOut )
			.start();
	}, false);
	
	// called when search button clicked
	var form = document.getElementById("submit");
	form.addEventListener("click", function(event) {
//		var keyword = document.getElementById("textarea").value;		
//		sendKeyword(keyword, true);

		var logo = document.getElementById("logo");
		if(!logo.style.opacity) {
			var loadingAnimationID = window.setInterval(loadingAnimation, 10);
			logo.style.opacity = 1;
			function loadingAnimation() {
				logo.style.opacity = parseFloat(logo.style.opacity) - 0.01;
				if(logo.style.opacity < 0.01) {
					plusOpacity = false;
					window.clearInterval(loadingAnimationID);	
				}
			}
		}

		// init yaar table
		initYaarTable(yaarData);
		
		// clear all animation
		TWEEN.removeAll();

		// remove all css card
		deleteAllCSSObject();

		// 4000ミリ秒間、何も操作しなくても毎フレームレンダラを更新し続ける。
		// 通常、trackball操作しない限りrendererが更新されずアニメーションは表示されないので、これは必須
		new TWEEN.Tween(this)
			.to( {}, 1200)
			.onUpdate(render)
			.onComplete(function() {
				setObjects();
				recalcPosition();
				transform(targets.random, 1000);
				objects[0].moving.start();
			}).start();
			
		// 送信キャンセル
		//event.preventDefault();
	}, false );	
}

// スムーズにアニメーションを表示しながら、CSS3Dオブジェクトを全て消去
function deleteAllCSSObject() {
	for (var i = 0, l = objects.length; i < l; i++) {
		// move to bottom
		(function() {
			var object = objects[i];
			var delay = Math.random() * 500;
			new TWEEN.Tween(object.position)
				.to({ x: object.position.x, y: object.position.y-9000, z: object.position.z }, 600)
				.delay(delay)
				.easing(TWEEN.Easing.Exponential.In)
				.start()
				.onComplete(function() {
					scene.remove(object);
					var index = objects.indexOf(object);
					objects.splice(index, 1);
					console.log(object);
					debug = object;
				});
		})();
	}
}

// 初期化関数
function init() {
	// 最初に一度検索クエリを飛ばす。
//	sendKeyword(document.getElementById("text").value, false);
	
	// カメラ設定
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 2000);
	camera.position.z = 1400;
	scene = new THREE.Scene();
		
	// CSSカードを作るための情報配列tableを基に、objects配列、scene配列を生成する。
	setObjects();
	
	// Objects配列の情報を基に変形時のpositionを再定義	
	recalcPosition();
	
	//　レンダラ―を1枚用意して、ウィンドウの幅と高さで初期化。これをレイヤーcontainerの上に貼る
	renderer = new THREE.CSS3DRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.domElement.style.position = 'absolute';
	document.getElementById( 'container' ).appendChild( renderer.domElement );
	
	// threejsのコントローラを1つ作る。コントローラ = マウスドラッグで回転できる操作インターフェース
	controls = new THREE.TrackballControls( camera, renderer.domElement );
	controls.rotateSpeed = 0.4;
	controls.addEventListener( 'change', render );
	camera.position.z = 8000;
	
	// イベントハンドラを設定
	setEventHandler();
	
	// 初期状態をテーブルにする
	transform( targets.table, 3000 );
	
	// Windowサイズ変更時の自動調整
	window.addEventListener( 'resize', onWindowResize, false );
}

// durationミリ秒後に、targetsの配置になるよう、現在の配置から移動する関数。
function transform( targets, duration ) {
	TWEEN.removeAll();

	for (var i = 0; i < objects.length; i++) {
		var object = objects[i];
		var target = targets[i];

//		debug = objects;
//		console.log(object.position.y);
//		console.log(target.position.y);
		// 現在のポジション(object.position) →　目的のポジション(target.position.x, target.position.y, target.position.z)へ移動
		object.moving = new TWEEN.Tween(object.position)
			.to( { x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration )
			.easing( TWEEN.Easing.Exponential.InOut)
			.start()
			.onComplete(function(){
				console.log(this.y);
			});
	
		// 現在の回転角度から目標の回転角度になるよう変形
		object.rotating = new TWEEN.Tween( object.rotation )
			.to( { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration )
			.easing( TWEEN.Easing.Exponential.InOut )
			.start();
	}

	// duration*2 ミリ秒の間、自動アニメーションを有効
	new TWEEN.Tween(this)
		.to({}, duration * 3)
		.onUpdate(render)
		.start();
}

// ウィンドウサイズ変更時に呼ばれる
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

// アニメーション描画関数。定型文
function animate() {
	requestAnimationFrame( animate );
	TWEEN.update();
	controls.update();
	stats.update();
}

function render() {
	renderer.render( scene, camera );
}

var yaarData = [{"positive": "\u9375\u57a2\u306e\u4eba\u306e\u6295\u7a3f\u304c\u898b\u308c\u306a\u3044\uff01\u30d5\u30a9\u30ed\u30fc\u3057\u3066\u3082\u3059\u3050\u5916\u308c\u308b\u3001\u306a\u306e\u306b\u30bf\u30a4\u30e0\u30e9\u30a4\u30f3\u306b\u306f\u3042\u304c\u3063\u3066\u304f\u308b\u304b\u3089\u30cf\u30fc\u30c8\u62bc\u3059\u3051\u3069\u3059\u3050\u6d88\u3048\u3061\u3083\u3046\n\u3069\u30fc\u306b\u304b\u3057\u3066", "image": "http://a2.mzstatic.com/jp/r30/Purple1/v4/da/96/ab/da96ab96-8699-495d-4af6-d8215662d449/icon350x350.png", "score": 77, "id": "389801252", "negative": "\u958b\u3044\u3066\u3082\u958b\u3044\u3066\u3082\u56fa\u307e\u308b\u3057\u6295\u7a3f\u3082\u51fa\u6765\u306a\u3044\u3057\u898b\u308c\u306a\u3044\u3057\u901a\u77e5\u306e\u3068\u3053\u308d\u3082\u898b\u308c\u306a\u3044\u3002\u65e9\u304f\u76f4\u3057\u3066\u4e0b\u3055\u3044\u3002"}, {"positive": "\u96e3\u3057\u3044\u3051\u3069\u306f\u307e\u308b", "image": "http://a1.mzstatic.com/jp/r30/Purple7/v4/86/3f/67/863f67c3-22d0-6e87-62e3-a96d58ed60c6/icon350x350.png", "score": 62, "id": "984440479", "negative": "\u3082\u3063\u3068\u30b9\u30c6\u30fc\u30b8\u3092\u8ffd\u52a0\u3057\u3066\u307b\u3057\u3043"}, {"positive": "\u4e00\u76ee\u3067\u308f\u304b\u308b\u3057\u4f7f\u3044\u3084\u3059\u3044\u3067\u3059", "image": "http://a3.mzstatic.com/jp/r30/Purple5/v4/a0/55/88/a0558837-c1a1-2da2-a082-a4afb7482f72/icon350x350.png", "score": 37, "id": "876258957", "negative": "\u4fbf\u5229\u3067\u52a9\u304b\u308b"}, {"positive": "\u982d\u306e\u4f53\u64cd\u306b\u3044\u3044\u308f\u3041\u30fc", "image": "http://a1.mzstatic.com/jp/r30/Purple3/v4/9c/d0/ac/9cd0ac97-229d-623e-d8fa-606ef2d3f6ed/icon350x350.png", "score": 17, "id": "955367905", "negative": "\u3082\u3063\u3068\u3082\u3063\u3068\u30b9\u30c6\u30fc\u30b8\u5897\u3084\u3057\u3066\u304f\u308c\u308c\u3070\u5b09\u3057\u3044\u3067\u3059"}, {"positive": "\u304b\u3088\uff01", "image": "http://a3.mzstatic.com/jp/r30/Purple1/v4/b7/a4/de/b7a4deaf-3639-0508-5ff6-afcd898aad77/icon350x350.jpeg", "score": 14, "id": "980865528", "negative": "\u3044\u3044\u306d"}, {"positive": "\u3042\u3044\u3046\u3048\u304a", "image": "http://a2.mzstatic.com/jp/r30/Purple5/v4/91/79/f4/9179f483-7b8d-2a45-8daa-caee9ac5852a/icon350x350.jpeg", "score": 8, "id": "952608759", "negative": "\u697d\u3057\u3044"}, {"positive": "\u826f\u3044\u3067\u3059\u3088", "image": "http://a4.mzstatic.com/jp/r30/Purple7/v4/1b/98/c4/1b98c4d5-96ff-f85c-d2ac-977f275bf09b/icon350x350.jpeg", "score": -1, "id": "983904653", "negative": "\u5927\u5909\u6e80\u8db3\u306a(*^^*)"}, {"positive": "\u4f7f\u3044\u3084\u3059\u3044\u3002", "image": "http://a1.mzstatic.com/jp/r30/Purple3/v4/8b/15/39/8b1539aa-70ce-6499-69a3-0b4b343152be/icon350x350.jpeg", "score": -5, "id": "446278045", "negative": "\u753b\u8cea\u3082\u826f\u304f\u554f\u984c\u306a\u3044"}, {"positive": "\u4ef2\u9593\u30b3\u30fc\u30c9\nLQJ62CER8L", "image": "http://a1.mzstatic.com/jp/r30/Purple7/v4/ff/4b/7e/ff4b7e06-7ad8-fb28-2585-3c26222552e5/icon350x350.png", "score": -6, "id": "958048961", "negative": "\u9762\u767d\u3044\u3002"}, {"positive": "\u4e45\u3057\u3076\u308a\u306b\u97f3\u697d\u30a2\u30d7\u30ea\u3068\u3063\u305f\u3051\u3069\u5927\u6e80\u8db3", "image": "http://a5.mzstatic.com/jp/r30/Purple1/v4/95/5e/95/955e95df-8503-a231-ae2c-c25a1ed6125b/icon350x350.jpeg", "score": -15, "id": "959454698", "negative": "\u7c21\u5358"}, {"positive": "\u30d0\u30fc\u30b8\u30e7\u30f3\u30a2\u30c3\u30d7\u3067\u4f7f\u3048\u306a\u304f\u306a\u3063\u305f\u3002\u5143\u306b\u623b\u3057\u3066\u3002", "image": "http://a4.mzstatic.com/jp/r30/Purple7/v4/a0/48/38/a0483821-3b00-44fe-aba5-720c52d15e9a/icon350x350.png", "score": -17, "id": "284815942", "negative": "\u305f\u306e\u3080\u3088\uff01"}, {"positive": "\u3088\u3044\u30fc\uff01", "image": "http://a5.mzstatic.com/jp/r30/Purple7/v4/47/96/37/479637ce-98e1-b9ea-16ee-874772542b5e/icon350x350.jpeg", "score": -19, "id": "607974779", "negative": "\u3068\u3066\u3082\u4f7f\u3044\u3084\u3059\u3044\u3067\u3059\u3002\u65e9\u304f\u30d7\u30ec\u30a4\u30ea\u30b9\u30c8\u3092\u4f5c\u308c\u308b\u3088\u3046\u306b\u3057\u305f\u3044\u3067\u3059\u3002"}, {"positive": "\u30cf\u30de\u308b", "image": "http://a4.mzstatic.com/jp/r30/Purple3/v4/10/67/8c/10678c8c-21d7-3945-7cae-ed3fe8a1cea6/icon350x350.png", "score": -21, "id": "600843984", "negative": "\u304a\u3082\u3057\u308d\u3044"}, {"positive": "\u304b\u308f\u3086\u3044", "image": "http://a1.mzstatic.com/jp/r30/Purple1/v4/57/92/94/579294e7-f2c7-18ca-f6c1-e13b56ede240/icon350x350.jpeg", "score": -27, "id": "876291194", "negative": "\u3044\u3044\uff01\u304d\u306b\u3044\u3063\u305f\uff01"}, {"positive": "\u6700\u9ad8\uff01", "image": "http://a5.mzstatic.com/jp/r30/Purple3/v4/bc/68/14/bc6814f4-0e24-99d2-7d1d-6f5cc141445e/icon350x350.jpeg", "score": -30, "id": "946755072", "negative": "it's sound good\uff01"}, {"positive": "\u7c21\u5358\u306b\u3064\u304f\u308c\u308b\uff01\uff01\uff01", "image": "http://a5.mzstatic.com/jp/r30/Purple5/v4/35/a8/20/35a820d5-0a79-5ba2-7c08-98b357c687cf/icon350x350.png", "score": -37, "id": "696463126", "negative": "\u3044\u3044\u3068\u601d\u3046"}, {"positive": "\u3044\u3044\u611f\u3058\u3084\u3093\u306d\u2606", "image": "http://a4.mzstatic.com/jp/r30/Purple7/v4/d7/e8/38/d7e838e6-6099-4b16-2b69-3a75f6228bed/icon350x350.png", "score": -37, "id": "985072363", "negative": "\u3044\u308d\u3093\u306a\u6f2b\u753b\u304c\u4e57\u3063\u3066\u3066\u697d\u3057\u3044\u2661"}, {"positive": "\u306a\u304b\u306a\u304b\u826f\u3044\u3067\u3059\u3088\u301c\u266a", "image": "http://a4.mzstatic.com/jp/r30/Purple3/v4/f9/41/66/f94166cc-2d0a-003f-cd06-026f62930abe/icon350x350.png", "score": -46, "id": "472143590", "negative": "\u30b9\u30bf\u30f3\u30d7\u3084\u6587\u5b57\u304c\u304b\u308f\u3044\u3044\u3057\u4f7f\u3044\u3084\u3059\u3044"}, {"positive": "\u3046\u3093\u3061\u30fc", "image": "http://a2.mzstatic.com/jp/r30/Purple7/v4/39/02/88/390288f6-c12c-b89c-841b-38cba82fb6e0/icon350x350.png", "score": -48, "id": "658511662", "negative": "\u30b7\u30f3\u30b0\u30eb\u30ac\u30c1\u30e3\u3067\u661f4\u3057\u304b\u3067\u306a\u3044\u3082\u3046\u5c11\u3057\u51fa\u3084\u3059\u304f\u306a\u3063\u3066\u6b32\u3057\u3044"}, {"positive": "\u7d20\u4eba\u304c\u66f8\u3044\u305f\u6f2b\u753b\u3060\u304b\u3089\u3001\u3064\u307e\u3089\u306a\u3044\u3002\n\u8aad\u3093\u3067\u308b\u3060\u3051\u6642\u9593\u306e\u7121\u99c4\u3002", "image": "http://a5.mzstatic.com/jp/r30/Purple1/v4/03/53/4a/03534a4b-e8bd-a58f-6428-a48f40dae498/icon350x350.png", "score": -69, "id": "721512660", "negative": "\u30d1\u30b9\u30c6\u30eb\u5bb6\u65cf\u306f\u304a\u3059\u3059\u3081\uff01\n\u6c17\u8efd\u306b\u8aad\u3081\u308b\u3068\u3053\u308d\u304c\u3053\u306e\u30a2\u30d7\u30ea\u306e\u3044\u3044\u3068\u3053\u308d\uff01"}, {"positive": "\u767a\u60f3\u306e\u8ee2\u63db", "image": "http://a1.mzstatic.com/jp/r30/Purple5/v4/be/20/49/be204971-f789-8489-9d82-ef54c9c95674/icon350x350.png", "score": -69, "id": "909566506", "negative": "\u6c17\u6301\u3061\u3044\u3044\u306d"}, {"positive": "\u5b9d\u7269\u306f\u5168\u7136\u305f\u307e\u3089\u306a\u3044\u3051\u3069\uff08\u7b11\uff09\n\u6b66\u5c06\u3082\u3089\u3048\u308b\u306e\u3067\u826f\u304b\u3063\u305f\u3089\u4f7f\u3063\u3066\u304f\u3060\u3055\u3044\uff01\nqiJa", "image": "http://a2.mzstatic.com/jp/r30/Purple5/v4/a3/cd/da/a3cdda2e-a4f8-96fd-61bf-b7ecd9d81ece/icon350x350.jpeg", "score": -86, "id": "931854667", "negative": "\u59cb\u3081\u305f\u3070\u304b\u308a\u3067\u3059\u304c\u697d\u3057\u3093\u3067\u307e\u3059\uff01\n\u3088\u304b\u3063\u305f\u3089\u4f7f\u3063\u3066\u4e0b\u3055\u3044\uff01\nqphk"}, {"positive": "\u30a2\u30d7\u30ea\u3067\u5f85\u3063\u3066\u307e\u3057\u305f\uff01", "image": "http://a3.mzstatic.com/jp/r30/Purple1/v4/ca/2d/bc/ca2dbc1d-4af0-b543-06be-3c8dfa5a20c3/icon350x350.jpeg", "score": -87, "id": "551682016", "negative": "\u3044\u3064\u3082\u5f85\u3061\u6642\u9593\u304c\u9577\u3044\u306e\u3067\u52a9\u304b\u308a\u307e\u3059\u3002"}, {"positive": "\u30a8\u30f3\u30c9\u30ec\u30b9\u306b\u898b\u3066\u3057\u307e\u3044\u307e\u3059\u3002", "image": "http://a2.mzstatic.com/jp/r30/Purple5/v4/bf/df/c0/bfdfc02c-6ca4-c4af-51d4-2401657aff8a/icon350x350.jpeg", "score": -90, "id": "933166032", "negative": "\u6642\u9593\u304c\u3042\u308c\u3070\u898b\u3066\u3001\u70ba\u306b\u306a\u308a\u307e\u3059\u3002"}, {"positive": "\u3044\u3044\u3088", "image": "http://a1.mzstatic.com/jp/r30/Purple7/v4/9c/91/26/9c9126a9-49ac-b9da-1da2-e4b465f6a5b7/icon350x350.jpeg", "score": -91, "id": "949244365", "negative": "\u3044\u308d\u3044\u308d\u306a\u30a2\u30d7\u30ea\u306e\u653b\u7565\u304c\u3072\u3068\u3064\u306e\u30a2\u30d7\u30ea\u3067\u898b\u308c\u3066\u3044\u3044\u306d\uff01"}, {"positive": "\u5185\u5bb9\u3082\u307e\u3068\u307e\u3063\u3066\u3044\u3066\u3001\u77e5\u308a\u305f\u3044\u60c5\u5831\u304c\u3059\u3050\u8abf\u3079\u3089\u308c\u308b\u3057\u5929\u6c17\u3084\u4eca\u65e5\u306e\u30a6\u30f3\u30c1\u30af\u304c\u5206\u304b\u308b\u306e\u306f\u4f7f\u3063\u3066\u3044\u3066\u98fd\u304d\u306a\u3044\u3067\u3059\uff01", "image": "http://a2.mzstatic.com/jp/r30/Purple1/v4/78/cf/22/78cf22f7-ef0c-ad01-d4e7-51b76f5c31b9/icon350x350.png", "score": -99, "id": "579581125", "negative": "\u6bce\u65e5\u4f7f\u3063\u3066\u308b\uff01\u3053\u308c\u304c\u306a\u3044\u751f\u6d3b\u306f\u8003\u3048\u3089\u308c\u306a\u3044\u3002"}, {"positive": "\u3059\u3054\u304f\u697d\u3057\u304f\u3066\u98fd\u304d\u306a\u3044", "image": "http://a1.mzstatic.com/jp/r30/Purple7/v4/5e/2d/3a/5e2d3a14-2249-0224-3982-843e778b4b01/icon350x350.jpeg", "score": -99, "id": "850417475", "negative": "\u3084\u3063\u3071\u308a\u306f\u307e\u3063\u3061\u3083\u3046"}, {"positive": "\u4f7f\u3044\u3084\u3059\u3044\uff01\uff01\uff01", "image": "http://a1.mzstatic.com/jp/r30/Purple1/v4/90/88/99/90889974-3543-b2b5-16d4-5269e3c5b0a6/icon350x350.png", "score": -105, "id": "667861049", "negative": "\u3081\u3063\u3061\u3083\u3044\u3044\u3067\u3059\u3088\uff01"}, {"positive": "\u6bce\u65e5\u30c1\u30a7\u30c3\u30af\u3057\u3066\u3044\u307e\u3059\u3002\n\u3068\u3066\u3082\u91cd\u5b9d\u3057\u3066\u3044\u307e\u3059\ud83d\ude0a", "image": "http://a5.mzstatic.com/jp/r30/Purple5/v4/ba/9e/90/ba9e90b1-2243-877b-987b-be767b0718ac/icon350x350.png", "score": -105, "id": "447339142", "negative": "\u6bce\u65e5\u30c1\u30a7\u30c3\u30af\u3057\u3066\u307e\u3059\u3002\u4fbf\u5229\u3067\u3059\u3002\u3053\u308c\u304b\u3089\u3082\u5229\u7528\u3057\u307e\u3059\u301c"}, {"positive": "\u3044\u3044\u3059\u306d", "image": "http://a3.mzstatic.com/jp/r30/Purple7/v4/e3/b2/c3/e3b2c3b7-4d73-0752-6938-462403dad6ea/icon350x350.png", "score": -105, "id": "633246396", "negative": "\u304c\u308f\u304b\u308b\u3088\u3046\u306b\u306a\u3063\u3066\u3001\u3084\u308b\u6c17\u304c\u51fa\u307e\u3057\u305f^ ^"}, {"positive": "\u30a2\u30d7\u30c7\u3057\u3066\u304b\u3089\u97f3\u30ba\u30ec\u6fc0\u3057\u304f\u306a\u3063\u305f\n\u6539\u5584\u3088\u308d\u3057\u304f\u304a\u9858\u3044\u3057\u307e\u3059", "image": "http://a2.mzstatic.com/jp/r30/Purple1/v4/6c/bc/1e/6cbc1e31-a677-c6d7-f998-622281fa0b7b/icon350x350.png", "score": -116, "id": "544007664", "negative": "\u9055\u3046\u753b\u9762\u306b\u3057\u3066\u3044\u3066\u3082\u305a\u3063\u3068\u97f3\u697d\u304c\u306a\u3063\u3066\u3044\u3066\u6b32\u3057\u3044\uff01\n\u30ea\u30d4\u30fc\u30c8\u306e\u6a5f\u80fd\u3092\u3064\u3051\u3066\u6b32\u3057\u3044\uff01"}, {"positive": "\u3061\u3083\u3093\u3068\u4f7f\u3048\u3066\u305f\u306e\u306b\u3001\u753b\u50cf\u306b\u30b9\u30bf\u30f3\u30d7\u3084\u308d\u3046\u3068\u3057\u305f\u3089\u30cd\u30c3\u30c8\u30ef\u30fc\u30af\u30a8\u30e9\u30fc\u3068\u3067\u3066\u4f7f\u3048\u307e\u305b\u3093\u3002\u6a5f\u7a2e\u5909\u66f4\u3057\u3066\u304b\u3089\u3067\u3059\u3002iPhone6", "image": "http://a5.mzstatic.com/jp/r30/Purple1/v4/0a/04/c9/0a04c93d-fd09-bd89-11a1-7fbebc6db1f9/icon350x350.png", "score": -122, "id": "516561342", "negative": "\u3081\u3063\u3061\u3083\u6a5f\u80fd\u3044\u3044\uff01"}, {"positive": "\u5de6\u306b\u30b9\u30ef\u30a4\u30d7\u3059\u308b\u3068\u30c8\u30c3\u30d7\u30da\u30fc\u30b8\u306b\u623b\u308a\u307e\u3059\u3002\u304b\u306a\u308a\u4f7f\u3044\u306b\u304f\u3044", "image": "http://a4.mzstatic.com/jp/r30/Purple1/v4/31/d9/17/31d917c4-7608-67e9-b6e9-951805e76ce5/icon350x350.png", "score": -122, "id": "374254473", "negative": "\u5fc5\u8981\u306a\u3044\u306d\u3002"}, {"positive": "\u7d20\u6575", "image": "http://a3.mzstatic.com/jp/r30/Purple1/v4/c8/1a/fd/c81afd5c-3e97-5fd3-a1f9-c23229a47779/icon350x350.jpeg", "score": -140, "id": "963073142", "negative": "\u697d\u3057\u3044\u3067\u3059\u306d(*\u2267\u8278\u2266)"}, {"positive": "\u843d\u3061\u306a\u304f\u306a\u308a\u307e\u3057\u305f\u306d\u2606\n\u30a2\u30d7\u30c7\u611f\u8b1d\u3067\u3059\u266a", "image": "http://a5.mzstatic.com/jp/r30/Purple/v4/f4/1a/9a/f41a9a61-8940-f8cd-131f-e87e4e8d78c1/icon350x350.png", "score": -148, "id": "491903216", "negative": "0.006"}, {"positive": "\u3051\n\u308b", "image": "http://a2.mzstatic.com/jp/r30/Purple5/v4/9d/14/2c/9d142cea-c05c-5498-2141-58f42d715ef5/icon350x350.jpeg", "score": -157, "id": "291676451", "negative": "\u91cd\u5b9d\u3057\u3066\u307e\u3059\u3002\n\u3082\u3046\u624b\u653e\u305b\u307e\u305b\u3093\u3002"}, {"positive": "\u3060\u3044\u3076\u6e80\u8db3\uff01", "image": "http://a2.mzstatic.com/jp/r30/Purple1/v4/e7/0c/7b/e70c7b16-a413-d93f-ca6a-840d61586958/icon350x350.png", "score": -158, "id": "956081467", "negative": "greato(^_-)O"}, {"positive": "\u3082\u3046\u5c11\u3057\u30b9\u30e0\u30fc\u30ba\u306b\u79fb\u52d5\u3067\u304d\u305f\u3089\u306a\u3068\u601d\u3044\u307e\u3059\n\n\u306a\u306e\u3067\u661f4\u3064", "image": "http://a4.mzstatic.com/jp/r30/Purple7/v4/c1/89/0a/c1890af3-4b1f-136a-adac-49651b52fad9/icon350x350.jpeg", "score": -165, "id": "970817084", "negative": "\u304a\u3082\u308d\u3044"}, {"positive": "iPhone6\u3067\u3059\n\u30d0\u30c3\u30af\u30b0\u30e9\u30a6\u30f3\u30c9\u518d\u751f\u51fa\u6765\u306a\u304f\u306a\u3063\u3066\u308b\u3057\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u3082\u6025\u306b\u51fa\u6765\u306a\u304f\u306a\u3063\u3066\u307e\u3059\u3002\n\n\u52d5\u304d\u3082\u3060\u3044\u3076\u9045\u304f\u306a\u3063\u3066\u307e\u3059\n\n\u305a\u3063\u3068\u4f7f\u3063\u3066\u304d\u3066\u308b\u306e\u3067\u56f0\u3063\u3066\u3044\u307e\u3059\u3002\u65e9\u3081\u306e\u5bfe\u5fdc\u304a\u9858\u3044\u3057\u307e\u3059\u3002", "image": "http://a5.mzstatic.com/jp/r30/Purple5/v4/38/5b/1e/385b1ee4-93db-2217-2fba-0cacfcf48d2c/icon350x350.png", "score": -166, "id": "437758919", "negative": "\u6700\u9ad8\uff01\n\u8a00\u3046\u3053\u3068\u306a\u3057\uff01"}, {"positive": "C868B4092C\n\u8ab0\u3082\u3044\u306a\u304b\u3063\u305f\u3089\u304a\u9858\u3044\u3057\u307e\u3059", "image": "http://a4.mzstatic.com/jp/r30/Purple7/v4/32/71/24/32712483-3257-990b-946d-5b692c7fe690/icon350x350.png", "score": -171, "id": "919478091", "negative": "28B0D0C162"}, {"positive": "\u4ed6\u306e\u65b9\u3082\u304a\u66f8\u304d\u306b\u306a\u3089\u308c\u3066\u305f\u304c\u3001Message\u304c\u9045\u308c\u308b\u306e\u3092\u3053\u306e\u30a2\u30d7\u30ea\u306b\u7e1b\u308a\u4ed8\u3051\u305f\u3060\u3051\u3067\u3001\u6b63\u76f4\u306a\u3068\u3053\u308d\u4e0d\u5fc5\u8981\u3067\u3042\u308b\u3002Facebook\u306e\u30a2\u30d7\u30ea\u6539\u5909\u3092\u3057\u3066\u307b\u3057\u3044\u3002", "image": "http://a5.mzstatic.com/jp/r30/Purple5/v4/1c/8c/ea/1c8ceaed-06c7-6b45-d3ea-588ead11da29/icon350x350.png", "score": -172, "id": "454638411", "negative": "\u96fb\u8a71\u306fLINE\u3088\u308a\u97f3\u8cea\u3088\u304f\u9014\u5207\u308c\u306a\u3044\u306e\u3067\u3044\u3044\u3068\u601d\u3044\u307e\u3059\u3002"}, {"positive": "\u305f\u306e\u3057\u3044\uff01", "image": "http://a5.mzstatic.com/jp/r30/Purple3/v4/56/db/c4/56dbc421-bd76-2ba7-6825-34d32ec2226a/icon350x350.png", "score": -172, "id": "952578897", "negative": "\u305f\u307e\u3089\u308f\u3093\uff08\u2267\u2207\u2266\uff09\n\u30a6\u30b1\u308b\u301c\uff08\u2267\u2207\u2266\uff09 \n\u305f\u306e\u3057\u301c(((o(*\uff9f\u25bd\uff9f*)o)))"}, {"positive": "\u304a\u624b\u7d19\u306e\u5185\u5bb9\u3067\u6d99\u817a\u304c\u7de9\u307f\u307e\u3057\u305f\u3002\n\u79c1\u306e\u304a\u3070\u3042\u3061\u3083\u3093\u306f\u7269\u5fc3\u3064\u304f\u524d\u306b\u4ea1\u304f\u306a\u3063\u3066\u3057\u307e\u3063\u305f\u306e\u3067\u3001\u3082\u3057\u307e\u3060\u751f\u304d\u3066\u3044\u305f\u3089\u4ef2\u826f\u304f\u3044\u308d\u3093\u306a\u3053\u3068\u3057\u305f\u304b\u3063\u305f\u306a\u3002\u3063\u3066\u601d\u3044\u307e\u3057\u305f\u3002\u3068\u3066\u3082\u611f\u52d5\u3002", "image": "http://a2.mzstatic.com/jp/r30/Purple1/v4/6c/b8/2a/6cb82a35-8ae4-866f-bbd8-7549fd9ed4ea/icon350x350.jpeg", "score": -175, "id": "905173595", "negative": "\u3059\u3050\u5168\u30af\u30ea\u51fa\u6765\u305fw\n\u30ac\u30ad\u306e\u7a2e\u985e\u5c11\u306a\u3059\u304e\u308b\n\u30ec\u30d9\u30eb\u4e0a\u3052\u30ab\u30f3\u30bf\u30f3\u3059\u304e\u308b\u3057"}, {"positive": "5*****", "image": "http://a5.mzstatic.com/jp/r30/Purple3/v4/c1/bb/44/c1bb4489-03c1-a6fa-fadb-53a9fe49d492/icon350x350.jpeg", "score": -175, "id": "673540001", "negative": "\u3042"}, {"positive": "(*^\u25ef^*)", "image": "http://a1.mzstatic.com/jp/r30/Purple1/v4/12/3d/e4/123de420-2cde-9dea-9892-af284d5edec7/icon350x350.png", "score": -177, "id": "714796093", "negative": "\u306f\u307e\u308b\uff01"}, {"positive": "\u6700\u9ad8\u306a\u3093\u3060\u3051\u3069\n\u30b9\u30bf\u30f3\u30d7\u3092\u30d7\u30ec\u30bc\u30f3\u30c8\n\u3067\u304d\u306a\u304f\u306a\u3063\u305f\u306e\u304c\n\u60b2\u3057\u3044\u3067\u3059\ud83d\ude2d", "image": "http://a3.mzstatic.com/jp/r30/Purple7/v4/91/e4/fd/91e4fd0a-9279-d14c-f655-ef0cad680587/icon350x350.png", "score": -178, "id": "443904275", "negative": "\u3044\u3064\u3082\u304a\u4e16\u8a71\u306b\u306a\u3063\u3066\u3044\u307e\u3059\u3002\n\u6700\u65b0\u306e\u30a2\u30c3\u30d7\u30c7\u30fc\u30c8\u5f8c\u3001\u30d5\u30ea\u30fc\u30ba\u304c\u983b\u767a\u3057\u3068\u3066\u3082\u4f7f\u3044\u3065\u3089\u3044\u72b6\u6cc1\u306a\u306e\u3067\u5831\u544a\u3055\u305b\u3066\u3044\u305f\u3060\u304d\u307e\u3059\u3002\niOS7.1.2 iPhone5s\u3092\u4f7f\u7528\u3057\u3066\u304a\u308a\u307e\u3059\u3002\n\u6539\u5584\u3092\u3088\u308d\u3057\u304f\u304a\u9858\u3044\u3044\u305f\u3057\u307e\u3059\u3002"}, {"positive": "PayPal\u3067\u4f7f\u3048\u306a\u3044\u306e\u304c\u8f9b\u3044", "image": "http://a2.mzstatic.com/jp/r30/Purple3/v4/59/ff/35/59ff35fc-f073-8f73-09c9-82473ac18e99/icon350x350.jpeg", "score": -179, "id": "862800897", "negative": "\u30dd\u30a4\u30f3\u30c8\u660e\u7d30\u304c\u898b\u3084\u3059\u304f\u306a\u3063\u305f\u3002"}, {"positive": "\u306a\u3093\u3082\u3057\u3068\u3089\u3093\u306e\u306b\n\u30b5\u30fc\u30d3\u30b9\u30dd\u30ea\u30b7\u30fc\u3068\u304b\n\u904b\u55b6\u6f70\u308c\u308d\uff08\u256c\uff3e\u2200\uff3e\uff09", "image": "http://a3.mzstatic.com/jp/r30/Purple5/v4/27/8e/13/278e13d6-3e80-0b12-6b73-52f8bfb4ac53/icon350x350.jpeg", "score": -187, "id": "362057947", "negative": "\u30ed\u30b0\u30a4\u30f3\u3067\u304d\u306a\u3044\u3093\u3060\u3051\u3069\u2026\u958b\u3051\u305f\u3068\u601d\u3063\u305f\u3089\u3059\u3050\u306b\u843d\u3061\u308b\u3057\u3002"}, {"positive": "\u6253\u3061\u8fbc\u307f\u753b\u9762\u306b\u306a\u3093\u306e\u5909\u5316\u3082\u306a\u3044\u3067\u3059\n\u3069\u3046\u306b\u304b\u3057\u3066\u304f\u3060\u3055\u3044", "image": "http://a2.mzstatic.com/jp/r30/Purple1/v4/91/5e/80/915e802c-a36b-eac4-70bf-5d089788d43e/icon350x350.png", "score": -190, "id": "899997582", "negative": "Simeji\u3044\u3044\u306d\uff01\n\u304b\u308f\u3044\u3044\u2661\u20dc"}, {"positive": "\u9762\u767d\u3044\u3067\u3059\u843d\u3061\u308b\u3068\u304b\u306a\u3093\u3068\u304b\u3044\u308d\u3044\u308d\u6587\u53e5\u3092\u66f8\u3044\u3066\u308b\u304b\u305f\u3082\u3044\u3089\u3063\u3057\u3083\u3044\u307e\u3059\u304c\u4ed6\u306e\u30a2\u30d7\u3092\u7acb\u3061\u4e0a\u3052\u305f\u307e\u307e\u306b\u3057\u3066\u3044\u307e\u305b\u3093\u304b\uff1f\u4f5c\u696d\u5bb9\u91cf\u3092\u6b8b\u3057\u3066\u304a\u304b\u306a\u3044\u3068\u5f53\u305f\u308a\u524d\u306e\u3053\u3068\u3067\u3059\u304ciPhone\u304c\u3044\u3063\u3071\u3044\u3044\u3063\u3071\u3044\u306b\u306a\u3063\u3066\u30a2\u30d7\u30ea\u304c\u5f37\u5236\u7d42\u4e86\u3057\u3066\u3057\u307e\u3044\u307e\u3059\u3042\u3068\u3042\u306a\u305f\u304c\u304a\u4f7f\u3044\u306e\u7aef\u672b\u306f100%\u554f\u984c\u304c\u7121\u3044\u3068\u3044\u3044\u304d\u308c\u307e\u3059\u304b\uff1f\u7aef\u672b\u306b\u554f\u984c\u304c\u5f97\u308b\u5834\u5408\u306f\u3093\u3048\u3044\u3055\u3093\u306b\u306f\u4f55\u306e\u8cac\u4efb\u3082\u7fa9\u52d9\u3082\u3042\u308a\u307e\u305b\u3093\u6587\u53e5\u3092\u4e26\u3079\u308b\u307e\u3048\u306b\u8abf\u3079\u3066\u3082\u3089\u3063\u3066\u304f\u3060\u3055\u266a", "image": "http://a2.mzstatic.com/jp/r30/Purple3/v4/51/92/f5/5192f5af-889c-4740-3193-897b99b2f192/icon350x350.png", "score": -192, "id": "477396335", "negative": "\u9762\u767d\u304f\u3066\u306a\u304b\u306a\u304b\u30cf\u30de\u308a\u307e\u3059\n\u3088\u304b\u3063\u305f\u3089\u4f7f\u3063\u3066\u304f\u3060\u3055\u3044\n79du47\n\u826f\u3044\u3082\u306e\u304c\u8cb0\u3048\u307e\u3059\u3088\uff01"}, {"positive": "\u5931\u6557\u3057\u3066\u304b\u3089\u306e\u78ba\u8a8d\u753b\u9762\u3044\u3089\u3093\n\u307e\u304e\u3089\u308f\u3057\u3044\u308f", "image": "http://a2.mzstatic.com/jp/r30/Purple5/v4/b9/43/46/b94346c6-4ac2-2875-1b01-f8dda5e7bf26/icon350x350.jpeg", "score": -195, "id": "895761422", "negative": "\u843d\u3061\u307e\u304f\u3063\u3066\u99c4\u76ee\u3067\u3059"}, {"positive": "\u30af\u30bd\u30b2\u30fc\uff01\u5168\u4f53\u7684\u306b\u30af\u30bd\u3059\u304e\u308b\uff01\u8ab2\u91d1\u3055\u305b\u3055\u305b\u304c\u9177\u3044\uff01\u3053\u3093\u306a\u30af\u30bd\u30b2\u30fc \u306f\u65e9\u304f\u7121\u304f\u306a\u3063\u3066\u3057\u307e\u3048\u3070\u3088\u3044\uff01", "image": "http://a5.mzstatic.com/jp/r30/Purple5/v4/c9/6f/ec/c96fec5e-72ad-2ad5-387c-3f5a73d34e94/icon350x350.png", "score": -200, "id": "931894765", "negative": "10\u9023\u30ac\u30c1\u30e3\u300111\u56de\u3057\u3066\u3001\u661f6\u4e00\u679a\u3060\u3051\u3002\u6392\u51fa\u7387\u30a2\u30c3\u30d7\u306a\u306e\u306b\u5168\u7136\u3067\u307e\u305b\u3093\u3002\n\u8ab2\u91d1\u3057\u306a\u3044\u307b\u3046\u304c\u3044\u3044\u3067\u3059\u3088\u30027\u4e07\u5186\u8ab2\u91d1\u3057\u3066\u661f7\u3001\u4e00\u679a\u3060\u3051\u3002\u30e2\u30f3\u30b9\u30c8\u306a\u3069\u306e\u30ac\u30c1\u30e3\u3060\u3068\u3001\u540c\u3058\u91d1\u984d\u56de\u3057\u305f\u3089\u3001\u6700\u9ad8\u30af\u30e9\u30b9\u306e\u30e2\u30f3\u30b9\u30bf\u30fc\u3067\u308b\u306e\u306b\u30021\u67085\u65e5\u304b\u3089\u8abf\u67fb\u306b\u5165\u308b\u307f\u305f\u3044\u306a\u306e\u3067\u3001\u5831\u544a\u304d\u305f\u3089\u30ec\u30d3\u30e5\u30fc\u3057\u307e\u3059"}, {"positive": "\u5909\u306a\u30a2\u30d7\u30ea\u51fa\u3059\u306a\n\u99ac\u9e7f\u30d0\u30ab\u3070\u304b", "image": "http://a5.mzstatic.com/jp/r30/Purple1/v4/ca/75/29/ca7529a6-e94d-c645-bce6-8132b0fda4d8/icon350x350.jpeg", "score": -208, "id": "479159684", "negative": "\u8a87\u5f35\u629c\u304d\u306b\u6587\u5b57\u901a\u308a\u4f7f\u3044\u7269\u306b\u306a\u308a\u307e\u305b\u3093"}, {"positive": "\u30a2\u30d7\u30ea\u304c\u5897\u3048\u308b\uff01", "image": "http://a3.mzstatic.com/jp/r30/Purple7/v4/b9/24/05/b9240500-a45d-edde-eec1-d27b2c92a826/icon350x350.png", "score": -212, "id": "953384575", "negative": "\u304b\u306a\u308a\u53b3\u3057\u3044\u3067\u3059\u3002\n\u5024\u4e0b\u3052\u3063\u3066\u66f8\u3044\u305f\u3060\u3051\u3067\u3082\u30c0\u30e1\u306a\u3093\u3066\u3002\u3002\n\u7981\u6b62\u884c\u70ba\u3042\u308a\u904e\u304e\u3066\u3082\u306f\u3084\u3001\u58f2\u308c\u306a\u3044\u3067\u3059f^_^;)\n\u624b\u6570\u6599\u304b\u304b\u3063\u3066\u3082\u30e1\u30eb\u30ab\u30ea\u304c\u58f2\u308c\u308b\u3088\u3053\u308a\u3083\u3002\u3002"}, {"positive": "\u53cb\u9054\u306e\u8ab0\u304c\u8ab0\u306b\u30b3\u30e1\u30f3\u30c8\u3057\u305f\u3068\u304b\u30a4\u30a4\u306d\u3057\u305f\u3068\u304b\u3063\u3066\u81ea\u5206\u306b\u307e\u3067\u8868\u793a\u3055\u308c\u308b\u306e\u3044\u3089\u306a\u3044\u3002\u81ea\u5206\u306e\u53cb\u9054\u3067\u3082\u306a\u3044\u4eba\u306e\u6295\u7a3f\u3068\u304b\u5225\u306b\u898b\u305f\u304f\u306a\u3044\u3057\u305d\u308c\u3067\u57cb\u3081\u5c3d\u304f\u3055\u308c\u3066\u308b\u304b\u3089\u898b\u305a\u3089\u3044\u3002\u6539\u5584\u3057\u3066\u4e0b\u3055\u3044", "image": "http://a3.mzstatic.com/jp/r30/Purple1/v4/25/8c/2f/258c2f5b-e9c2-fd25-c940-a9bd936a9df2/icon350x350.jpeg", "score": -214, "id": "284882215", "negative": "\u7cde"}, {"positive": "\u66f2\u6570\u3082\u3042\u308b\u3057\u3001Wi-fi\u306a\u304f\u3066\u3082\u5916\u3067\u66f2\u8074\u3051\u308b\u304b\u3089\u3068\u3066\u3082\u4f7f\u3044\u3084\u3059\u3044\u3067\u3059\uff01", "image": "http://a1.mzstatic.com/jp/r30/Purple3/v4/9d/cd/8b/9dcd8bf4-7d7a-f25b-deb6-4d1b03eefc5e/icon350x350.png", "score": -214, "id": "826184770", "negative": "\u76ee\u899a\u307e\u3057\u6a5f\u80fd\u304c\u3042\u308c\u3070\u3044\u3044\u306a\u3068\u601d\u3063\u305f\u3002"}, {"positive": "\u826f\u3044\u3067\u3059\u306a\uff01", "image": "http://a1.mzstatic.com/jp/r30/Purple5/v4/96/e8/8e/96e88eca-7486-69c5-560d-e2c89d054b6b/icon350x350.png", "score": -217, "id": "763377066", "negative": "\u30ec\u30d3\u30e5\u30fc\u306b\u3044\u3044\u306d\uff01\u3057\u3066\u3082\u3089\u3063\u305f\u3068\u304d\u306e\u767b\u9332\u30e1\u30a2\u30c9\u3078\u306e\u9023\u7d61\u304c\u5909\u66f4\u3067\u304d\u306a\u3044\u3057\u3001\u30e1\u30c3\u30bb\u306e\u9001\u53d7\u4fe1\u304c\u30a2\u30d7\u30ea\u3067\u898b\u3089\u308c\u308b\u3088\u3046\u306b\u3057\u3066\u307b\u3057\u3044\uff01"}, {"positive": "\u65b0\u3057\u3044\u30bf\u30a4\u30d7\u306e\u97f3\u30b2\u30fc\u3063\u3066\u3044\u3046\u611f\u3058\u3067\u3059", "image": "http://a5.mzstatic.com/jp/r30/Purple5/v4/ea/a1/3f/eaa13fee-55fe-fda8-f03f-265cb710091a/icon350x350.jpeg", "score": -231, "id": "421254504", "negative": "\u98fd\u304d\u308b\u304b\u3089\uff01\n\u9000\u4f1a\u306f\u8cfc\u8aad\u958b\u59cb\u30e1\u30fc\u30eb\u304c\u5c4a\u3044\u3066\u308b\u304b\u3089\u305d\u3053\u306eiTunes\u3092\u958b\u3044\u3066\u3001\u975e\u516c\u958bURL\u3092\u306f\u3044\u306b\u3057\u3066\u3001\u30b5\u30a4\u30f3\u30a4\u30f3\u3067\u306f\u3044\u3063\u3066\u3001 \u81ea\u52d5\u66f4\u65b0\u3092\u30aa\u30d5\u306b\u3059\u308b\uff017\u65e5\u9593\u306e\u9593\u306b\u5fc5\u305a\u898b\u3064\u3051\u51fa\u3057\u3066\u306d\uff01"}, {"positive": "\u30a2\u30d7\u30ea\u958b\u3051\u307e\u305b\u3093\uff01\n\u554f\u3044\u5408\u308f\u305b\u3082\u8fd4\u7b54\u306a\u3057\uff01\n\u304a\u91d1\u6255\u3063\u3066\u308b\u306e\u306b\u610f\u5473\u304c\u308f\u304b\u3089\u306a\u3044\uff01\n\u30a2\u30d7\u30ea\u958b\u3051\u306a\u3044\u9593\u306e\u304a\u91d1\u8fd4\u3057\u3066\u4e0b\u3055\u3044\uff01", "image": "http://a4.mzstatic.com/jp/r30/Purple1/v4/44/d3/a4/44d3a46d-1998-524f-f732-4138fecd9dd3/icon350x350.png", "score": -242, "id": "340368403", "negative": "\u306a\u305c\u306a\u3093\u3060\u30fc\uff01\n\u6642\u77ed\u30ec\u30b7\u30d4\u3092\u898b\u3066\u3066\u3082\u3053\u308c\u306e\u304a\u304b\u3052\u3067\u518d\u8d77\u52d5\u3057\u305f\u308a\n\u624b\u9593\u304b\u304b\u308a\u3059\u304e(T ^ T)\n\u30d7\u30ec\u30df\u30a2\u30e0\u4f1a\u54e1\u3084\u3081\u305f\u308d\u304b\u306a"}, {"positive": "Good", "image": "http://a5.mzstatic.com/jp/r30/Purple1/v4/80/74/ce/8074ce64-d042-bd46-dfd0-16cbcd2d8718/icon350x350.jpeg", "score": -259, "id": "407906756", "negative": "\u3048\u3048\u3067\u301c"}, {"positive": "\u6700\u4f4e\u3060\u3002\u843d\u3061\u308b", "image": "http://a1.mzstatic.com/jp/r30/Purple3/v4/5b/31/46/5b314606-ffa7-d0ed-a001-90c733d29d06/icon350x350.jpeg", "score": -274, "id": "906930478", "negative": "\u3060\u3081w\u8fd4\u4fe1\u30e1\u30fc\u30eb\u5c4a\u304b\u306a\u3044\u3057\u3001\u30a2\u30d7\u30ea\u3072\u3089\u3051\u306a\u3044\u3057\uff3c(^o^)\uff0f\n\u306a\u3093\u306a\u306e\u3088w"}, {"positive": "\u5e83\u544a\u30c4\u30a4\u30fc\u30c8\u3044\u3089\u306a\u3044\u3002", "image": "http://a1.mzstatic.com/jp/r30/Purple7/v4/d3/25/71/d3257130-2977-979e-ce1f-5deaa8d9715b/icon350x350.png", "score": -286, "id": "333903271", "negative": "\u672a\u3060\u53cd\u6620\u3055\u308c\u3066\u306a\u3044\u307f\u305f\u3044\u306a\u3093\u3067\u3059\u304c\u306a\u3093\u3068\u304b\u3057\u3066\u304f\u308c"}, {"positive": "\u5909\u9854\u3092\u3057\u305f\u3089\ns\u306e\u4f50\u3005\u6728\u5e0c\u3055\u3093\u306b\u306b\u3066\u308b\n\u3068\u8a00\u308f\u308c\u307e\u3057\u305f\n\u304a\u3082\u3057\u308d\u3044\u3067\u3059", "image": "http://a3.mzstatic.com/jp/r30/Purple5/v4/25/5f/dd/255fdda3-52aa-d053-fee1-fcba663d1781/icon350x350.png", "score": -289, "id": "739787904", "negative": "\u3044\u308d\u3093\u306a\u7d50\u679c\u3067\u3066\u304a\u3082\u3057\u308d\u3044\uff01"}, {"positive": "\u30e1\u30f3\u30c6\u30ca\u30f3\u30b9\u9577\u3059\u304e", "image": "http://a4.mzstatic.com/jp/r30/Purple7/v4/f7/63/7c/f7637c08-96a3-63de-6c6a-5cc4b4d704cf/icon350x350.jpeg", "score": -455, "id": "962231849", "negative": "\u30e1\u30f3\u30c6\u30ca\u30f3\u30b9\u3057\u3066\u308b\u3057\u3001\u3069\u3046\u306a\u3063\u3066\u308b\u3093\u3060\uff1f"}, {"positive": "\u30dd\u30c6\u30c8\u30ab\u30c3\u30bf\u30fc\u306f\u4e0a\u4e0b\u306b\u3053\u3059\u308c\u3070\u3044\u3044\u3093\u3060\u3088\u30fcbb\n\u77e2\u5370\u304c\u7dd1\u8272\u306b\u306a\u3063\u305f\u3089\u96e2\u3059\uff01\uff01", "image": "http://a1.mzstatic.com/jp/r30/Purple7/v4/06/13/7f/06137f3b-be13-88c9-e336-a6f7f97017bd/icon350x350.png", "score": -516, "id": "987360477", "negative": "\u3044\u3044\u306d\u3001\u3053\u308c\u0669(\u02ca\u15dc\u02cb*)\u0648"}];

//var yaarData = [{"positive": "\u9375\u57a2\u306e\u4eba\u306e\u6295\u7a3f\u304c\u898b\u308c\u306a\u3044\uff01\u30d5\u30a9\u30ed\u30fc\u3057\u3066\u3082\u3059\u3050\u5916\u308c\u308b\u3001\u306a\u306e\u306b\u30bf\u30a4\u30e0\u30e9\u30a4\u30f3\u306b\u306f\u3042\u304c\u3063\u3066\u304f\u308b\u304b\u3089\u30cf\u30fc\u30c8\u62bc\u3059\u3051\u3069\u3059\u3050\u6d88\u3048\u3061\u3083\u3046\n\u3069\u30fc\u306b\u304b\u3057\u3066", "image": "http://a2.mzstatic.com/jp/r30/Purple1/v4/da/96/ab/da96ab96-8699-495d-4af6-d8215662d449/icon350x350.png", "score": 77, "id": "389801252", "negative": "\u9375\u57a2\u306e\u4eba\u306e\u6295\u7a3f\u304c\u898b\u308c\u306a\u3044\uff01\u30d5\u30a9\u30ed\u30fc\u3057\u3066\u3082\u3059\u3050\u5916\u308c\u308b\u3001\u306a\u306e\u306b\u30bf\u30a4\u30e0\u30e9\u30a4\u30f3\u306b\u306f\u3042\u304c\u3063\u3066\u304f\u308b\u304b\u3089\u30cf\u30fc\u30c8\u62bc\u3059\u3051\u3069\u3059\u3050\u6d88\u3048\u3061\u3083\u3046\n\u3069\u30fc\u306b\u304b\u3057\u3066"}, {"positive": "\u96e3\u3057\u3044\u3051\u3069\u306f\u307e\u308b", "image": "http://a1.mzstatic.com/jp/r30/Purple7/v4/86/3f/67/863f67c3-22d0-6e87-62e3-a96d58ed60c6/icon350x350.png", "score": 62, "id": "984440479", "negative": "\u3082\u3063\u3068\u30b9\u30c6\u30fc\u30b8\u3092\u8ffd\u52a0\u3057\u3066\u307b\u3057\u3043"}, {"positive": "\u4e00\u76ee\u3067\u308f\u304b\u308b\u3057\u4f7f\u3044\u3084\u3059\u3044\u3067\u3059", "image": "http://a3.mzstatic.com/jp/r30/Purple5/v4/a0/55/88/a0558837-c1a1-2da2-a082-a4afb7482f72/icon350x350.png", "score": 37, "id": "876258957", "negative": "\u4e00\u76ee\u3067\u308f\u304b\u308b\u3057\u4f7f\u3044\u3084\u3059\u3044\u3067\u3059"}, {"positive": "\u982d\u306e\u4f53\u64cd\u306b\u3044\u3044\u308f\u3041\u30fc", "image": "http://a1.mzstatic.com/jp/r30/Purple3/v4/9c/d0/ac/9cd0ac97-229d-623e-d8fa-606ef2d3f6ed/icon350x350.png", "score": 17, "id": "955367905", "negative": "\u982d\u306e\u4f53\u64cd\u306b\u3044\u3044\u308f\u3041\u30fc"}, {"positive": "\u304b\u3088\uff01", "image": "http://a3.mzstatic.com/jp/r30/Purple1/v4/b7/a4/de/b7a4deaf-3639-0508-5ff6-afcd898aad77/icon350x350.jpeg", "score": 14, "id": "980865528", "negative": "\u304b\u3088\uff01"}, {"positive": "\u3042\u3044\u3046\u3048\u304a", "image": "http://a2.mzstatic.com/jp/r30/Purple5/v4/91/79/f4/9179f483-7b8d-2a45-8daa-caee9ac5852a/icon350x350.jpeg", "score": 8, "id": "952608759", "negative": "\u3042\u3044\u3046\u3048\u304a"}, {"positive": "\u826f\u3044\u3067\u3059\u3088", "image": "http://a4.mzstatic.com/jp/r30/Purple7/v4/1b/98/c4/1b98c4d5-96ff-f85c-d2ac-977f275bf09b/icon350x350.jpeg", "score": -1, "id": "983904653", "negative": "\u826f\u3044\u3067\u3059\u3088"}, {"positive": "\u4f7f\u3044\u3084\u3059\u3044\u3002", "image": "http://a1.mzstatic.com/jp/r30/Purple3/v4/8b/15/39/8b1539aa-70ce-6499-69a3-0b4b343152be/icon350x350.jpeg", "score": -5, "id": "446278045", "negative": "\u4f7f\u3044\u3084\u3059\u3044\u3002"}, {"positive": "\u4ef2\u9593\u30b3\u30fc\u30c9\nLQJ62CER8L", "image": "http://a1.mzstatic.com/jp/r30/Purple7/v4/ff/4b/7e/ff4b7e06-7ad8-fb28-2585-3c26222552e5/icon350x350.png", "score": -6, "id": "958048961", "negative": "\u4ef2\u9593\u30b3\u30fc\u30c9\nLQJ62CER8L"}, {"positive": "\u4e45\u3057\u3076\u308a\u306b\u97f3\u697d\u30a2\u30d7\u30ea\u3068\u3063\u305f\u3051\u3069\u5927\u6e80\u8db3", "image": "http://a5.mzstatic.com/jp/r30/Purple1/v4/95/5e/95/955e95df-8503-a231-ae2c-c25a1ed6125b/icon350x350.jpeg", "score": -15, "id": "959454698", "negative": "\u4e45\u3057\u3076\u308a\u306b\u97f3\u697d\u30a2\u30d7\u30ea\u3068\u3063\u305f\u3051\u3069\u5927\u6e80\u8db3"}, {"positive": "\u30d0\u30fc\u30b8\u30e7\u30f3\u30a2\u30c3\u30d7\u3067\u4f7f\u3048\u306a\u304f\u306a\u3063\u305f\u3002\u5143\u306b\u623b\u3057\u3066\u3002", "image": "http://a4.mzstatic.com/jp/r30/Purple7/v4/a0/48/38/a0483821-3b00-44fe-aba5-720c52d15e9a/icon350x350.png", "score": -17, "id": "284815942", "negative": "\u30d0\u30fc\u30b8\u30e7\u30f3\u30a2\u30c3\u30d7\u3067\u4f7f\u3048\u306a\u304f\u306a\u3063\u305f\u3002\u5143\u306b\u623b\u3057\u3066\u3002"}, {"positive": "\u3088\u3044\u30fc\uff01", "image": "http://a5.mzstatic.com/jp/r30/Purple7/v4/47/96/37/479637ce-98e1-b9ea-16ee-874772542b5e/icon350x350.jpeg", "score": -19, "id": "607974779", "negative": "\u3068\u3066\u3082\u4f7f\u3044\u3084\u3059\u3044\u3067\u3059\u3002\u65e9\u304f\u30d7\u30ec\u30a4\u30ea\u30b9\u30c8\u3092\u4f5c\u308c\u308b\u3088\u3046\u306b\u3057\u305f\u3044\u3067\u3059\u3002"}, {"positive": "\u30cf\u30de\u308b", "image": "http://a4.mzstatic.com/jp/r30/Purple3/v4/10/67/8c/10678c8c-21d7-3945-7cae-ed3fe8a1cea6/icon350x350.png", "score": -21, "id": "600843984", "negative": "\u30cf\u30de\u308b"}, {"positive": "\u304b\u308f\u3086\u3044", "image": "http://a1.mzstatic.com/jp/r30/Purple1/v4/57/92/94/579294e7-f2c7-18ca-f6c1-e13b56ede240/icon350x350.jpeg", "score": -27, "id": "876291194", "negative": "\u304b\u308f\u3086\u3044"}, {"positive": "\u6700\u9ad8\uff01", "image": "http://a5.mzstatic.com/jp/r30/Purple3/v4/bc/68/14/bc6814f4-0e24-99d2-7d1d-6f5cc141445e/icon350x350.jpeg", "score": -30, "id": "946755072", "negative": "\u6700\u9ad8\uff01"}, {"positive": "\u7c21\u5358\u306b\u3064\u304f\u308c\u308b\uff01\uff01\uff01", "image": "http://a5.mzstatic.com/jp/r30/Purple5/v4/35/a8/20/35a820d5-0a79-5ba2-7c08-98b357c687cf/icon350x350.png", "score": -37, "id": "696463126", "negative": "\u7c21\u5358\u306b\u3064\u304f\u308c\u308b\uff01\uff01\uff01"}, {"positive": "\u3044\u3044\u611f\u3058\u3084\u3093\u306d\u2606", "image": "http://a4.mzstatic.com/jp/r30/Purple7/v4/d7/e8/38/d7e838e6-6099-4b16-2b69-3a75f6228bed/icon350x350.png", "score": -37, "id": "985072363", "negative": "\u3044\u3044\u611f\u3058\u3084\u3093\u306d\u2606"}, {"positive": "\u306a\u304b\u306a\u304b\u826f\u3044\u3067\u3059\u3088\u301c\u266a", "image": "http://a4.mzstatic.com/jp/r30/Purple3/v4/f9/41/66/f94166cc-2d0a-003f-cd06-026f62930abe/icon350x350.png", "score": -46, "id": "472143590", "negative": "\u306a\u304b\u306a\u304b\u826f\u3044\u3067\u3059\u3088\u301c\u266a"}, {"positive": "\u3046\u3093\u3061\u30fc", "image": "http://a2.mzstatic.com/jp/r30/Purple7/v4/39/02/88/390288f6-c12c-b89c-841b-38cba82fb6e0/icon350x350.png", "score": -48, "id": "658511662", "negative": "\u3046\u3093\u3061\u30fc"}, {"positive": "\u7d20\u4eba\u304c\u66f8\u3044\u305f\u6f2b\u753b\u3060\u304b\u3089\u3001\u3064\u307e\u3089\u306a\u3044\u3002\n\u8aad\u3093\u3067\u308b\u3060\u3051\u6642\u9593\u306e\u7121\u99c4\u3002", "image": "http://a5.mzstatic.com/jp/r30/Purple1/v4/03/53/4a/03534a4b-e8bd-a58f-6428-a48f40dae498/icon350x350.png", "score": -69, "id": "721512660", "negative": "\u7d20\u4eba\u304c\u66f8\u3044\u305f\u6f2b\u753b\u3060\u304b\u3089\u3001\u3064\u307e\u3089\u306a\u3044\u3002\n\u8aad\u3093\u3067\u308b\u3060\u3051\u6642\u9593\u306e\u7121\u99c4\u3002"}, {"positive": "\u767a\u60f3\u306e\u8ee2\u63db", "image": "http://a1.mzstatic.com/jp/r30/Purple5/v4/be/20/49/be204971-f789-8489-9d82-ef54c9c95674/icon350x350.png", "score": -69, "id": "909566506", "negative": "\u767a\u60f3\u306e\u8ee2\u63db"}, {"positive": "\u5b9d\u7269\u306f\u5168\u7136\u305f\u307e\u3089\u306a\u3044\u3051\u3069\uff08\u7b11\uff09\n\u6b66\u5c06\u3082\u3089\u3048\u308b\u306e\u3067\u826f\u304b\u3063\u305f\u3089\u4f7f\u3063\u3066\u304f\u3060\u3055\u3044\uff01\nqiJa", "image": "http://a2.mzstatic.com/jp/r30/Purple5/v4/a3/cd/da/a3cdda2e-a4f8-96fd-61bf-b7ecd9d81ece/icon350x350.jpeg", "score": -86, "id": "931854667", "negative": "\u59cb\u3081\u305f\u3070\u304b\u308a\u3067\u3059\u304c\u697d\u3057\u3093\u3067\u307e\u3059\uff01\n\u3088\u304b\u3063\u305f\u3089\u4f7f\u3063\u3066\u4e0b\u3055\u3044\uff01\nqphk"}, {"positive": "\u30a2\u30d7\u30ea\u3067\u5f85\u3063\u3066\u307e\u3057\u305f\uff01", "image": "http://a3.mzstatic.com/jp/r30/Purple1/v4/ca/2d/bc/ca2dbc1d-4af0-b543-06be-3c8dfa5a20c3/icon350x350.jpeg", "score": -87, "id": "551682016", "negative": "\u3044\u3064\u3082\u5f85\u3061\u6642\u9593\u304c\u9577\u3044\u306e\u3067\u52a9\u304b\u308a\u307e\u3059\u3002"}, {"positive": "\u30a8\u30f3\u30c9\u30ec\u30b9\u306b\u898b\u3066\u3057\u307e\u3044\u307e\u3059\u3002", "image": "http://a2.mzstatic.com/jp/r30/Purple5/v4/bf/df/c0/bfdfc02c-6ca4-c4af-51d4-2401657aff8a/icon350x350.jpeg", "score": -90, "id": "933166032", "negative": "\u30a8\u30f3\u30c9\u30ec\u30b9\u306b\u898b\u3066\u3057\u307e\u3044\u307e\u3059\u3002"}, {"positive": "\u3044\u3044\u3088", "image": "http://a1.mzstatic.com/jp/r30/Purple7/v4/9c/91/26/9c9126a9-49ac-b9da-1da2-e4b465f6a5b7/icon350x350.jpeg", "score": -91, "id": "949244365", "negative": "\u3044\u3044\u3088"}, {"positive": "\u5185\u5bb9\u3082\u307e\u3068\u307e\u3063\u3066\u3044\u3066\u3001\u77e5\u308a\u305f\u3044\u60c5\u5831\u304c\u3059\u3050\u8abf\u3079\u3089\u308c\u308b\u3057\u5929\u6c17\u3084\u4eca\u65e5\u306e\u30a6\u30f3\u30c1\u30af\u304c\u5206\u304b\u308b\u306e\u306f\u4f7f\u3063\u3066\u3044\u3066\u98fd\u304d\u306a\u3044\u3067\u3059\uff01", "image": "http://a2.mzstatic.com/jp/r30/Purple1/v4/78/cf/22/78cf22f7-ef0c-ad01-d4e7-51b76f5c31b9/icon350x350.png", "score": -99, "id": "579581125", "negative": "\u6bce\u65e5\u4f7f\u3063\u3066\u308b\uff01\u3053\u308c\u304c\u306a\u3044\u751f\u6d3b\u306f\u8003\u3048\u3089\u308c\u306a\u3044\u3002"}, {"positive": "\u3059\u3054\u304f\u697d\u3057\u304f\u3066\u98fd\u304d\u306a\u3044", "image": "http://a1.mzstatic.com/jp/r30/Purple7/v4/5e/2d/3a/5e2d3a14-2249-0224-3982-843e778b4b01/icon350x350.jpeg", "score": -99, "id": "850417475", "negative": "\u3059\u3054\u304f\u697d\u3057\u304f\u3066\u98fd\u304d\u306a\u3044"}, {"positive": "\u4f7f\u3044\u3084\u3059\u3044\uff01\uff01\uff01", "image": "http://a1.mzstatic.com/jp/r30/Purple1/v4/90/88/99/90889974-3543-b2b5-16d4-5269e3c5b0a6/icon350x350.png", "score": -105, "id": "667861049", "negative": "\u4f7f\u3044\u3084\u3059\u3044\uff01\uff01\uff01"}, {"positive": "\u6bce\u65e5\u30c1\u30a7\u30c3\u30af\u3057\u3066\u3044\u307e\u3059\u3002\n\u3068\u3066\u3082\u91cd\u5b9d\u3057\u3066\u3044\u307e\u3059\ud83d\ude0a", "image": "http://a5.mzstatic.com/jp/r30/Purple5/v4/ba/9e/90/ba9e90b1-2243-877b-987b-be767b0718ac/icon350x350.png", "score": -105, "id": "447339142", "negative": "\u6bce\u65e5\u30c1\u30a7\u30c3\u30af\u3057\u3066\u3044\u307e\u3059\u3002\n\u3068\u3066\u3082\u91cd\u5b9d\u3057\u3066\u3044\u307e\u3059\ud83d\ude0a"}, {"positive": "\u3044\u3044\u3059\u306d", "image": "http://a3.mzstatic.com/jp/r30/Purple7/v4/e3/b2/c3/e3b2c3b7-4d73-0752-6938-462403dad6ea/icon350x350.png", "score": -105, "id": "633246396", "negative": "\u304c\u308f\u304b\u308b\u3088\u3046\u306b\u306a\u3063\u3066\u3001\u3084\u308b\u6c17\u304c\u51fa\u307e\u3057\u305f^ ^"}, {"positive": "\u30a2\u30d7\u30c7\u3057\u3066\u304b\u3089\u97f3\u30ba\u30ec\u6fc0\u3057\u304f\u306a\u3063\u305f\n\u6539\u5584\u3088\u308d\u3057\u304f\u304a\u9858\u3044\u3057\u307e\u3059", "image": "http://a2.mzstatic.com/jp/r30/Purple1/v4/6c/bc/1e/6cbc1e31-a677-c6d7-f998-622281fa0b7b/icon350x350.png", "score": -116, "id": "544007664", "negative": "\u9055\u3046\u753b\u9762\u306b\u3057\u3066\u3044\u3066\u3082\u305a\u3063\u3068\u97f3\u697d\u304c\u306a\u3063\u3066\u3044\u3066\u6b32\u3057\u3044\uff01\n\u30ea\u30d4\u30fc\u30c8\u306e\u6a5f\u80fd\u3092\u3064\u3051\u3066\u6b32\u3057\u3044\uff01"}, {"positive": "\u3061\u3083\u3093\u3068\u4f7f\u3048\u3066\u305f\u306e\u306b\u3001\u753b\u50cf\u306b\u30b9\u30bf\u30f3\u30d7\u3084\u308d\u3046\u3068\u3057\u305f\u3089\u30cd\u30c3\u30c8\u30ef\u30fc\u30af\u30a8\u30e9\u30fc\u3068\u3067\u3066\u4f7f\u3048\u307e\u305b\u3093\u3002\u6a5f\u7a2e\u5909\u66f4\u3057\u3066\u304b\u3089\u3067\u3059\u3002iPhone6", "image": "http://a5.mzstatic.com/jp/r30/Purple1/v4/0a/04/c9/0a04c93d-fd09-bd89-11a1-7fbebc6db1f9/icon350x350.png", "score": -122, "id": "516561342", "negative": "\u3081\u3063\u3061\u3083\u6a5f\u80fd\u3044\u3044\uff01"}, {"positive": "\u5de6\u306b\u30b9\u30ef\u30a4\u30d7\u3059\u308b\u3068\u30c8\u30c3\u30d7\u30da\u30fc\u30b8\u306b\u623b\u308a\u307e\u3059\u3002\u304b\u306a\u308a\u4f7f\u3044\u306b\u304f\u3044", "image": "http://a4.mzstatic.com/jp/r30/Purple1/v4/31/d9/17/31d917c4-7608-67e9-b6e9-951805e76ce5/icon350x350.png", "score": -122, "id": "374254473", "negative": "\u5de6\u306b\u30b9\u30ef\u30a4\u30d7\u3059\u308b\u3068\u30c8\u30c3\u30d7\u30da\u30fc\u30b8\u306b\u623b\u308a\u307e\u3059\u3002\u304b\u306a\u308a\u4f7f\u3044\u306b\u304f\u3044"}, {"positive": "\u7d20\u6575", "image": "http://a3.mzstatic.com/jp/r30/Purple1/v4/c8/1a/fd/c81afd5c-3e97-5fd3-a1f9-c23229a47779/icon350x350.jpeg", "score": -140, "id": "963073142", "negative": "\u7d20\u6575"}, {"positive": "\u843d\u3061\u306a\u304f\u306a\u308a\u307e\u3057\u305f\u306d\u2606\n\u30a2\u30d7\u30c7\u611f\u8b1d\u3067\u3059\u266a", "image": "http://a5.mzstatic.com/jp/r30/Purple/v4/f4/1a/9a/f41a9a61-8940-f8cd-131f-e87e4e8d78c1/icon350x350.png", "score": -148, "id": "491903216", "negative": "\u843d\u3061\u306a\u304f\u306a\u308a\u307e\u3057\u305f\u306d\u2606\n\u30a2\u30d7\u30c7\u611f\u8b1d\u3067\u3059\u266a"}, {"positive": "\u3051\n\u308b", "image": "http://a2.mzstatic.com/jp/r30/Purple5/v4/9d/14/2c/9d142cea-c05c-5498-2141-58f42d715ef5/icon350x350.jpeg", "score": -157, "id": "291676451", "negative": "\u3051\n\u308b"}, {"positive": "\u3060\u3044\u3076\u6e80\u8db3\uff01", "image": "http://a2.mzstatic.com/jp/r30/Purple1/v4/e7/0c/7b/e70c7b16-a413-d93f-ca6a-840d61586958/icon350x350.png", "score": -158, "id": "956081467", "negative": "\u3060\u3044\u3076\u6e80\u8db3\uff01"}, {"positive": "\u3082\u3046\u5c11\u3057\u30b9\u30e0\u30fc\u30ba\u306b\u79fb\u52d5\u3067\u304d\u305f\u3089\u306a\u3068\u601d\u3044\u307e\u3059\n\n\u306a\u306e\u3067\u661f4\u3064", "image": "http://a4.mzstatic.com/jp/r30/Purple7/v4/c1/89/0a/c1890af3-4b1f-136a-adac-49651b52fad9/icon350x350.jpeg", "score": -165, "id": "970817084", "negative": "\u304a\u3082\u308d\u3044"}, {"positive": "iPhone6\u3067\u3059\n\u30d0\u30c3\u30af\u30b0\u30e9\u30a6\u30f3\u30c9\u518d\u751f\u51fa\u6765\u306a\u304f\u306a\u3063\u3066\u308b\u3057\u30c0\u30a6\u30f3\u30ed\u30fc\u30c9\u3082\u6025\u306b\u51fa\u6765\u306a\u304f\u306a\u3063\u3066\u307e\u3059\u3002\n\n\u52d5\u304d\u3082\u3060\u3044\u3076\u9045\u304f\u306a\u3063\u3066\u307e\u3059\n\n\u305a\u3063\u3068\u4f7f\u3063\u3066\u304d\u3066\u308b\u306e\u3067\u56f0\u3063\u3066\u3044\u307e\u3059\u3002\u65e9\u3081\u306e\u5bfe\u5fdc\u304a\u9858\u3044\u3057\u307e\u3059\u3002", "image": "http://a5.mzstatic.com/jp/r30/Purple5/v4/38/5b/1e/385b1ee4-93db-2217-2fba-0cacfcf48d2c/icon350x350.png", "score": -166, "id": "437758919", "negative": "\u6700\u9ad8\uff01\n\u8a00\u3046\u3053\u3068\u306a\u3057\uff01"}, {"positive": "C868B4092C\n\u8ab0\u3082\u3044\u306a\u304b\u3063\u305f\u3089\u304a\u9858\u3044\u3057\u307e\u3059", "image": "http://a4.mzstatic.com/jp/r30/Purple7/v4/32/71/24/32712483-3257-990b-946d-5b692c7fe690/icon350x350.png", "score": -171, "id": "919478091", "negative": "C868B4092C\n\u8ab0\u3082\u3044\u306a\u304b\u3063\u305f\u3089\u304a\u9858\u3044\u3057\u307e\u3059"}, {"positive": "\u4ed6\u306e\u65b9\u3082\u304a\u66f8\u304d\u306b\u306a\u3089\u308c\u3066\u305f\u304c\u3001Message\u304c\u9045\u308c\u308b\u306e\u3092\u3053\u306e\u30a2\u30d7\u30ea\u306b\u7e1b\u308a\u4ed8\u3051\u305f\u3060\u3051\u3067\u3001\u6b63\u76f4\u306a\u3068\u3053\u308d\u4e0d\u5fc5\u8981\u3067\u3042\u308b\u3002Facebook\u306e\u30a2\u30d7\u30ea\u6539\u5909\u3092\u3057\u3066\u307b\u3057\u3044\u3002", "image": "http://a5.mzstatic.com/jp/r30/Purple5/v4/1c/8c/ea/1c8ceaed-06c7-6b45-d3ea-588ead11da29/icon350x350.png", "score": -172, "id": "454638411", "negative": "\u96fb\u8a71\u306fLINE\u3088\u308a\u97f3\u8cea\u3088\u304f\u9014\u5207\u308c\u306a\u3044\u306e\u3067\u3044\u3044\u3068\u601d\u3044\u307e\u3059\u3002"}, {"positive": "\u305f\u306e\u3057\u3044\uff01", "image": "http://a5.mzstatic.com/jp/r30/Purple3/v4/56/db/c4/56dbc421-bd76-2ba7-6825-34d32ec2226a/icon350x350.png", "score": -172, "id": "952578897", "negative": "\u305f\u306e\u3057\u3044\uff01"}, {"positive": "\u304a\u624b\u7d19\u306e\u5185\u5bb9\u3067\u6d99\u817a\u304c\u7de9\u307f\u307e\u3057\u305f\u3002\n\u79c1\u306e\u304a\u3070\u3042\u3061\u3083\u3093\u306f\u7269\u5fc3\u3064\u304f\u524d\u306b\u4ea1\u304f\u306a\u3063\u3066\u3057\u307e\u3063\u305f\u306e\u3067\u3001\u3082\u3057\u307e\u3060\u751f\u304d\u3066\u3044\u305f\u3089\u4ef2\u826f\u304f\u3044\u308d\u3093\u306a\u3053\u3068\u3057\u305f\u304b\u3063\u305f\u306a\u3002\u3063\u3066\u601d\u3044\u307e\u3057\u305f\u3002\u3068\u3066\u3082\u611f\u52d5\u3002", "image": "http://a2.mzstatic.com/jp/r30/Purple1/v4/6c/b8/2a/6cb82a35-8ae4-866f-bbd8-7549fd9ed4ea/icon350x350.jpeg", "score": -175, "id": "905173595", "negative": "\u3059\u3050\u5168\u30af\u30ea\u51fa\u6765\u305fw\n\u30ac\u30ad\u306e\u7a2e\u985e\u5c11\u306a\u3059\u304e\u308b\n\u30ec\u30d9\u30eb\u4e0a\u3052\u30ab\u30f3\u30bf\u30f3\u3059\u304e\u308b\u3057"}, {"positive": "5*****", "image": "http://a5.mzstatic.com/jp/r30/Purple3/v4/c1/bb/44/c1bb4489-03c1-a6fa-fadb-53a9fe49d492/icon350x350.jpeg", "score": -175, "id": "673540001", "negative": "5*****"}, {"positive": "(*^\u25ef^*)", "image": "http://a1.mzstatic.com/jp/r30/Purple1/v4/12/3d/e4/123de420-2cde-9dea-9892-af284d5edec7/icon350x350.png", "score": -177, "id": "714796093", "negative": "(*^\u25ef^*)"}, {"positive": "\u6700\u9ad8\u306a\u3093\u3060\u3051\u3069\n\u30b9\u30bf\u30f3\u30d7\u3092\u30d7\u30ec\u30bc\u30f3\u30c8\n\u3067\u304d\u306a\u304f\u306a\u3063\u305f\u306e\u304c\n\u60b2\u3057\u3044\u3067\u3059\ud83d\ude2d", "image": "http://a3.mzstatic.com/jp/r30/Purple7/v4/91/e4/fd/91e4fd0a-9279-d14c-f655-ef0cad680587/icon350x350.png", "score": -178, "id": "443904275", "negative": "\u3044\u3064\u3082\u304a\u4e16\u8a71\u306b\u306a\u3063\u3066\u3044\u307e\u3059\u3002\n\u6700\u65b0\u306e\u30a2\u30c3\u30d7\u30c7\u30fc\u30c8\u5f8c\u3001\u30d5\u30ea\u30fc\u30ba\u304c\u983b\u767a\u3057\u3068\u3066\u3082\u4f7f\u3044\u3065\u3089\u3044\u72b6\u6cc1\u306a\u306e\u3067\u5831\u544a\u3055\u305b\u3066\u3044\u305f\u3060\u304d\u307e\u3059\u3002\niOS7.1.2 iPhone5s\u3092\u4f7f\u7528\u3057\u3066\u304a\u308a\u307e\u3059\u3002\n\u6539\u5584\u3092\u3088\u308d\u3057\u304f\u304a\u9858\u3044\u3044\u305f\u3057\u307e\u3059\u3002"}, {"positive": "PayPal\u3067\u4f7f\u3048\u306a\u3044\u306e\u304c\u8f9b\u3044", "image": "http://a2.mzstatic.com/jp/r30/Purple3/v4/59/ff/35/59ff35fc-f073-8f73-09c9-82473ac18e99/icon350x350.jpeg", "score": -179, "id": "862800897", "negative": "\u30dd\u30a4\u30f3\u30c8\u660e\u7d30\u304c\u898b\u3084\u3059\u304f\u306a\u3063\u305f\u3002"}, {"positive": "\u306a\u3093\u3082\u3057\u3068\u3089\u3093\u306e\u306b\n\u30b5\u30fc\u30d3\u30b9\u30dd\u30ea\u30b7\u30fc\u3068\u304b\n\u904b\u55b6\u6f70\u308c\u308d\uff08\u256c\uff3e\u2200\uff3e\uff09", "image": "http://a3.mzstatic.com/jp/r30/Purple5/v4/27/8e/13/278e13d6-3e80-0b12-6b73-52f8bfb4ac53/icon350x350.jpeg", "score": -187, "id": "362057947", "negative": "\u30ed\u30b0\u30a4\u30f3\u3067\u304d\u306a\u3044\u3093\u3060\u3051\u3069\u2026\u958b\u3051\u305f\u3068\u601d\u3063\u305f\u3089\u3059\u3050\u306b\u843d\u3061\u308b\u3057\u3002"}, {"positive": "\u6253\u3061\u8fbc\u307f\u753b\u9762\u306b\u306a\u3093\u306e\u5909\u5316\u3082\u306a\u3044\u3067\u3059\n\u3069\u3046\u306b\u304b\u3057\u3066\u304f\u3060\u3055\u3044", "image": "http://a2.mzstatic.com/jp/r30/Purple1/v4/91/5e/80/915e802c-a36b-eac4-70bf-5d089788d43e/icon350x350.png", "score": -190, "id": "899997582", "negative": "Simeji\u3044\u3044\u306d\uff01\n\u304b\u308f\u3044\u3044\u2661\u20dc"}, {"positive": "\u9762\u767d\u3044\u3067\u3059\u843d\u3061\u308b\u3068\u304b\u306a\u3093\u3068\u304b\u3044\u308d\u3044\u308d\u6587\u53e5\u3092\u66f8\u3044\u3066\u308b\u304b\u305f\u3082\u3044\u3089\u3063\u3057\u3083\u3044\u307e\u3059\u304c\u4ed6\u306e\u30a2\u30d7\u3092\u7acb\u3061\u4e0a\u3052\u305f\u307e\u307e\u306b\u3057\u3066\u3044\u307e\u305b\u3093\u304b\uff1f\u4f5c\u696d\u5bb9\u91cf\u3092\u6b8b\u3057\u3066\u304a\u304b\u306a\u3044\u3068\u5f53\u305f\u308a\u524d\u306e\u3053\u3068\u3067\u3059\u304ciPhone\u304c\u3044\u3063\u3071\u3044\u3044\u3063\u3071\u3044\u306b\u306a\u3063\u3066\u30a2\u30d7\u30ea\u304c\u5f37\u5236\u7d42\u4e86\u3057\u3066\u3057\u307e\u3044\u307e\u3059\u3042\u3068\u3042\u306a\u305f\u304c\u304a\u4f7f\u3044\u306e\u7aef\u672b\u306f100%\u554f\u984c\u304c\u7121\u3044\u3068\u3044\u3044\u304d\u308c\u307e\u3059\u304b\uff1f\u7aef\u672b\u306b\u554f\u984c\u304c\u5f97\u308b\u5834\u5408\u306f\u3093\u3048\u3044\u3055\u3093\u306b\u306f\u4f55\u306e\u8cac\u4efb\u3082\u7fa9\u52d9\u3082\u3042\u308a\u307e\u305b\u3093\u6587\u53e5\u3092\u4e26\u3079\u308b\u307e\u3048\u306b\u8abf\u3079\u3066\u3082\u3089\u3063\u3066\u304f\u3060\u3055\u266a", "image": "http://a2.mzstatic.com/jp/r30/Purple3/v4/51/92/f5/5192f5af-889c-4740-3193-897b99b2f192/icon350x350.png", "score": -192, "id": "477396335", "negative": "\u9762\u767d\u304f\u3066\u306a\u304b\u306a\u304b\u30cf\u30de\u308a\u307e\u3059\n\u3088\u304b\u3063\u305f\u3089\u4f7f\u3063\u3066\u304f\u3060\u3055\u3044\n79du47\n\u826f\u3044\u3082\u306e\u304c\u8cb0\u3048\u307e\u3059\u3088\uff01"}, {"positive": "\u5931\u6557\u3057\u3066\u304b\u3089\u306e\u78ba\u8a8d\u753b\u9762\u3044\u3089\u3093\n\u307e\u304e\u3089\u308f\u3057\u3044\u308f", "image": "http://a2.mzstatic.com/jp/r30/Purple5/v4/b9/43/46/b94346c6-4ac2-2875-1b01-f8dda5e7bf26/icon350x350.jpeg", "score": -195, "id": "895761422", "negative": "\u5931\u6557\u3057\u3066\u304b\u3089\u306e\u78ba\u8a8d\u753b\u9762\u3044\u3089\u3093\n\u307e\u304e\u3089\u308f\u3057\u3044\u308f"}, {"positive": "\u30af\u30bd\u30b2\u30fc\uff01\u5168\u4f53\u7684\u306b\u30af\u30bd\u3059\u304e\u308b\uff01\u8ab2\u91d1\u3055\u305b\u3055\u305b\u304c\u9177\u3044\uff01\u3053\u3093\u306a\u30af\u30bd\u30b2\u30fc \u306f\u65e9\u304f\u7121\u304f\u306a\u3063\u3066\u3057\u307e\u3048\u3070\u3088\u3044\uff01", "image": "http://a5.mzstatic.com/jp/r30/Purple5/v4/c9/6f/ec/c96fec5e-72ad-2ad5-387c-3f5a73d34e94/icon350x350.png", "score": -200, "id": "931894765", "negative": "10\u9023\u30ac\u30c1\u30e3\u300111\u56de\u3057\u3066\u3001\u661f6\u4e00\u679a\u3060\u3051\u3002\u6392\u51fa\u7387\u30a2\u30c3\u30d7\u306a\u306e\u306b\u5168\u7136\u3067\u307e\u305b\u3093\u3002\n\u8ab2\u91d1\u3057\u306a\u3044\u307b\u3046\u304c\u3044\u3044\u3067\u3059\u3088\u30027\u4e07\u5186\u8ab2\u91d1\u3057\u3066\u661f7\u3001\u4e00\u679a\u3060\u3051\u3002\u30e2\u30f3\u30b9\u30c8\u306a\u3069\u306e\u30ac\u30c1\u30e3\u3060\u3068\u3001\u540c\u3058\u91d1\u984d\u56de\u3057\u305f\u3089\u3001\u6700\u9ad8\u30af\u30e9\u30b9\u306e\u30e2\u30f3\u30b9\u30bf\u30fc\u3067\u308b\u306e\u306b\u30021\u67085\u65e5\u304b\u3089\u8abf\u67fb\u306b\u5165\u308b\u307f\u305f\u3044\u306a\u306e\u3067\u3001\u5831\u544a\u304d\u305f\u3089\u30ec\u30d3\u30e5\u30fc\u3057\u307e\u3059"}, {"positive": "\u5909\u306a\u30a2\u30d7\u30ea\u51fa\u3059\u306a\n\u99ac\u9e7f\u30d0\u30ab\u3070\u304b", "image": "http://a5.mzstatic.com/jp/r30/Purple1/v4/ca/75/29/ca7529a6-e94d-c645-bce6-8132b0fda4d8/icon350x350.jpeg", "score": -208, "id": "479159684", "negative": "\u5909\u306a\u30a2\u30d7\u30ea\u51fa\u3059\u306a\n\u99ac\u9e7f\u30d0\u30ab\u3070\u304b"}, {"positive": "\u30a2\u30d7\u30ea\u304c\u5897\u3048\u308b\uff01", "image": "http://a3.mzstatic.com/jp/r30/Purple7/v4/b9/24/05/b9240500-a45d-edde-eec1-d27b2c92a826/icon350x350.png", "score": -212, "id": "953384575", "negative": "\u30a2\u30d7\u30ea\u304c\u5897\u3048\u308b\uff01"}, {"positive": "\u53cb\u9054\u306e\u8ab0\u304c\u8ab0\u306b\u30b3\u30e1\u30f3\u30c8\u3057\u305f\u3068\u304b\u30a4\u30a4\u306d\u3057\u305f\u3068\u304b\u3063\u3066\u81ea\u5206\u306b\u307e\u3067\u8868\u793a\u3055\u308c\u308b\u306e\u3044\u3089\u306a\u3044\u3002\u81ea\u5206\u306e\u53cb\u9054\u3067\u3082\u306a\u3044\u4eba\u306e\u6295\u7a3f\u3068\u304b\u5225\u306b\u898b\u305f\u304f\u306a\u3044\u3057\u305d\u308c\u3067\u57cb\u3081\u5c3d\u304f\u3055\u308c\u3066\u308b\u304b\u3089\u898b\u305a\u3089\u3044\u3002\u6539\u5584\u3057\u3066\u4e0b\u3055\u3044", "image": "http://a3.mzstatic.com/jp/r30/Purple1/v4/25/8c/2f/258c2f5b-e9c2-fd25-c940-a9bd936a9df2/icon350x350.jpeg", "score": -214, "id": "284882215", "negative": "\u7cde"}, {"positive": "\u66f2\u6570\u3082\u3042\u308b\u3057\u3001Wi-fi\u306a\u304f\u3066\u3082\u5916\u3067\u66f2\u8074\u3051\u308b\u304b\u3089\u3068\u3066\u3082\u4f7f\u3044\u3084\u3059\u3044\u3067\u3059\uff01", "image": "http://a1.mzstatic.com/jp/r30/Purple3/v4/9d/cd/8b/9dcd8bf4-7d7a-f25b-deb6-4d1b03eefc5e/icon350x350.png", "score": -214, "id": "826184770", "negative": "\u76ee\u899a\u307e\u3057\u6a5f\u80fd\u304c\u3042\u308c\u3070\u3044\u3044\u306a\u3068\u601d\u3063\u305f\u3002"}, {"positive": "\u826f\u3044\u3067\u3059\u306a\uff01", "image": "http://a1.mzstatic.com/jp/r30/Purple5/v4/96/e8/8e/96e88eca-7486-69c5-560d-e2c89d054b6b/icon350x350.png", "score": -217, "id": "763377066", "negative": "\u826f\u3044\u3067\u3059\u306a\uff01"}, {"positive": "\u65b0\u3057\u3044\u30bf\u30a4\u30d7\u306e\u97f3\u30b2\u30fc\u3063\u3066\u3044\u3046\u611f\u3058\u3067\u3059", "image": "http://a5.mzstatic.com/jp/r30/Purple5/v4/ea/a1/3f/eaa13fee-55fe-fda8-f03f-265cb710091a/icon350x350.jpeg", "score": -231, "id": "421254504", "negative": "\u65b0\u3057\u3044\u30bf\u30a4\u30d7\u306e\u97f3\u30b2\u30fc\u3063\u3066\u3044\u3046\u611f\u3058\u3067\u3059"}, {"positive": "\u30a2\u30d7\u30ea\u958b\u3051\u307e\u305b\u3093\uff01\n\u554f\u3044\u5408\u308f\u305b\u3082\u8fd4\u7b54\u306a\u3057\uff01\n\u304a\u91d1\u6255\u3063\u3066\u308b\u306e\u306b\u610f\u5473\u304c\u308f\u304b\u3089\u306a\u3044\uff01\n\u30a2\u30d7\u30ea\u958b\u3051\u306a\u3044\u9593\u306e\u304a\u91d1\u8fd4\u3057\u3066\u4e0b\u3055\u3044\uff01", "image": "http://a4.mzstatic.com/jp/r30/Purple1/v4/44/d3/a4/44d3a46d-1998-524f-f732-4138fecd9dd3/icon350x350.png", "score": -242, "id": "340368403", "negative": "\u306a\u305c\u306a\u3093\u3060\u30fc\uff01\n\u6642\u77ed\u30ec\u30b7\u30d4\u3092\u898b\u3066\u3066\u3082\u3053\u308c\u306e\u304a\u304b\u3052\u3067\u518d\u8d77\u52d5\u3057\u305f\u308a\n\u624b\u9593\u304b\u304b\u308a\u3059\u304e(T ^ T)\n\u30d7\u30ec\u30df\u30a2\u30e0\u4f1a\u54e1\u3084\u3081\u305f\u308d\u304b\u306a"}, {"positive": "Good", "image": "http://a5.mzstatic.com/jp/r30/Purple1/v4/80/74/ce/8074ce64-d042-bd46-dfd0-16cbcd2d8718/icon350x350.jpeg", "score": -259, "id": "407906756", "negative": "Good"}, {"positive": "\u6700\u4f4e\u3060\u3002\u843d\u3061\u308b", "image": "http://a1.mzstatic.com/jp/r30/Purple3/v4/5b/31/46/5b314606-ffa7-d0ed-a001-90c733d29d06/icon350x350.jpeg", "score": -274, "id": "906930478", "negative": "\u6700\u4f4e\u3060\u3002\u843d\u3061\u308b"}, {"positive": "\u5e83\u544a\u30c4\u30a4\u30fc\u30c8\u3044\u3089\u306a\u3044\u3002", "image": "http://a1.mzstatic.com/jp/r30/Purple7/v4/d3/25/71/d3257130-2977-979e-ce1f-5deaa8d9715b/icon350x350.png", "score": -286, "id": "333903271", "negative": "\u5e83\u544a\u30c4\u30a4\u30fc\u30c8\u3044\u3089\u306a\u3044\u3002"}, {"positive": "\u5909\u9854\u3092\u3057\u305f\u3089\ns\u306e\u4f50\u3005\u6728\u5e0c\u3055\u3093\u306b\u306b\u3066\u308b\n\u3068\u8a00\u308f\u308c\u307e\u3057\u305f\n\u304a\u3082\u3057\u308d\u3044\u3067\u3059", "image": "http://a3.mzstatic.com/jp/r30/Purple5/v4/25/5f/dd/255fdda3-52aa-d053-fee1-fcba663d1781/icon350x350.png", "score": -289, "id": "739787904", "negative": "\u5909\u9854\u3092\u3057\u305f\u3089\ns\u306e\u4f50\u3005\u6728\u5e0c\u3055\u3093\u306b\u306b\u3066\u308b\n\u3068\u8a00\u308f\u308c\u307e\u3057\u305f\n\u304a\u3082\u3057\u308d\u3044\u3067\u3059"}, {"positive": "\u30e1\u30f3\u30c6\u30ca\u30f3\u30b9\u9577\u3059\u304e", "image": "http://a4.mzstatic.com/jp/r30/Purple7/v4/f7/63/7c/f7637c08-96a3-63de-6c6a-5cc4b4d704cf/icon350x350.jpeg", "score": -455, "id": "962231849", "negative": "\u30e1\u30f3\u30c6\u30ca\u30f3\u30b9\u9577\u3059\u304e"}, {"positive": "\u30dd\u30c6\u30c8\u30ab\u30c3\u30bf\u30fc\u306f\u4e0a\u4e0b\u306b\u3053\u3059\u308c\u3070\u3044\u3044\u3093\u3060\u3088\u30fcbb\n\u77e2\u5370\u304c\u7dd1\u8272\u306b\u306a\u3063\u305f\u3089\u96e2\u3059\uff01\uff01", "image": "http://a1.mzstatic.com/jp/r30/Purple7/v4/06/13/7f/06137f3b-be13-88c9-e336-a6f7f97017bd/icon350x350.png", "score": -516, "id": "987360477", "negative": "\u3044\u3044\u306d\u3001\u3053\u308c\u0669(\u02ca\u15dc\u02cb*)\u0648"}];
//var yaarData = [{"image": "http://a2.mzstatic.com/jp/r30/Purple1/v4/da/96/ab/da96ab96-8699-495d-4af6-d8215662d449/icon350x350.png", "score": 77, "id": "389801252"}, {"image": "http://a1.mzstatic.com/jp/r30/Purple7/v4/86/3f/67/863f67c3-22d0-6e87-62e3-a96d58ed60c6/icon350x350.png", "score": 62, "id": "984440479"}, {"image": "http://a3.mzstatic.com/jp/r30/Purple5/v4/a0/55/88/a0558837-c1a1-2da2-a082-a4afb7482f72/icon350x350.png", "score": 37, "id": "876258957"}, {"image": "http://a1.mzstatic.com/jp/r30/Purple3/v4/9c/d0/ac/9cd0ac97-229d-623e-d8fa-606ef2d3f6ed/icon350x350.png", "score": 17, "id": "955367905"}, {"image": "http://a3.mzstatic.com/jp/r30/Purple1/v4/b7/a4/de/b7a4deaf-3639-0508-5ff6-afcd898aad77/icon350x350.jpeg", "score": 14, "id": "980865528"}, {"image": "http://a2.mzstatic.com/jp/r30/Purple5/v4/91/79/f4/9179f483-7b8d-2a45-8daa-caee9ac5852a/icon350x350.jpeg", "score": 8, "id": "952608759"}, {"image": "http://a4.mzstatic.com/jp/r30/Purple7/v4/1b/98/c4/1b98c4d5-96ff-f85c-d2ac-977f275bf09b/icon350x350.jpeg", "score": -1, "id": "983904653"}, {"image": "http://a1.mzstatic.com/jp/r30/Purple3/v4/8b/15/39/8b1539aa-70ce-6499-69a3-0b4b343152be/icon350x350.jpeg", "score": -5, "id": "446278045"}, {"image": "http://a1.mzstatic.com/jp/r30/Purple7/v4/ff/4b/7e/ff4b7e06-7ad8-fb28-2585-3c26222552e5/icon350x350.png", "score": -6, "id": "958048961"}, {"image": "http://a5.mzstatic.com/jp/r30/Purple1/v4/95/5e/95/955e95df-8503-a231-ae2c-c25a1ed6125b/icon350x350.jpeg", "score": -15, "id": "959454698"}, {"image": "http://a4.mzstatic.com/jp/r30/Purple7/v4/a0/48/38/a0483821-3b00-44fe-aba5-720c52d15e9a/icon350x350.png", "score": -17, "id": "284815942"}, {"image": "http://a5.mzstatic.com/jp/r30/Purple7/v4/47/96/37/479637ce-98e1-b9ea-16ee-874772542b5e/icon350x350.jpeg", "score": -19, "id": "607974779"}, {"image": "http://a4.mzstatic.com/jp/r30/Purple3/v4/10/67/8c/10678c8c-21d7-3945-7cae-ed3fe8a1cea6/icon350x350.png", "score": -21, "id": "600843984"}, {"image": "http://a1.mzstatic.com/jp/r30/Purple1/v4/57/92/94/579294e7-f2c7-18ca-f6c1-e13b56ede240/icon350x350.jpeg", "score": -27, "id": "876291194"}, {"image": "http://a5.mzstatic.com/jp/r30/Purple3/v4/bc/68/14/bc6814f4-0e24-99d2-7d1d-6f5cc141445e/icon350x350.jpeg", "score": -30, "id": "946755072"}, {"image": "http://a5.mzstatic.com/jp/r30/Purple5/v4/35/a8/20/35a820d5-0a79-5ba2-7c08-98b357c687cf/icon350x350.png", "score": -37, "id": "696463126"}, {"image": "http://a4.mzstatic.com/jp/r30/Purple7/v4/d7/e8/38/d7e838e6-6099-4b16-2b69-3a75f6228bed/icon350x350.png", "score": -37, "id": "985072363"}, {"image": "http://a4.mzstatic.com/jp/r30/Purple3/v4/f9/41/66/f94166cc-2d0a-003f-cd06-026f62930abe/icon350x350.png", "score": -46, "id": "472143590"}, {"image": "http://a2.mzstatic.com/jp/r30/Purple7/v4/39/02/88/390288f6-c12c-b89c-841b-38cba82fb6e0/icon350x350.png", "score": -48, "id": "658511662"}, {"image": "http://a5.mzstatic.com/jp/r30/Purple1/v4/03/53/4a/03534a4b-e8bd-a58f-6428-a48f40dae498/icon350x350.png", "score": -69, "id": "721512660"}, {"image": "http://a1.mzstatic.com/jp/r30/Purple5/v4/be/20/49/be204971-f789-8489-9d82-ef54c9c95674/icon350x350.png", "score": -69, "id": "909566506"}, {"image": "http://a2.mzstatic.com/jp/r30/Purple5/v4/a3/cd/da/a3cdda2e-a4f8-96fd-61bf-b7ecd9d81ece/icon350x350.jpeg", "score": -86, "id": "931854667"}, {"image": "http://a3.mzstatic.com/jp/r30/Purple1/v4/ca/2d/bc/ca2dbc1d-4af0-b543-06be-3c8dfa5a20c3/icon350x350.jpeg", "score": -87, "id": "551682016"}, {"image": "http://a2.mzstatic.com/jp/r30/Purple5/v4/bf/df/c0/bfdfc02c-6ca4-c4af-51d4-2401657aff8a/icon350x350.jpeg", "score": -90, "id": "933166032"}, {"image": "http://a1.mzstatic.com/jp/r30/Purple7/v4/9c/91/26/9c9126a9-49ac-b9da-1da2-e4b465f6a5b7/icon350x350.jpeg", "score": -91, "id": "949244365"}, {"image": "http://a2.mzstatic.com/jp/r30/Purple1/v4/78/cf/22/78cf22f7-ef0c-ad01-d4e7-51b76f5c31b9/icon350x350.png", "score": -99, "id": "579581125"}, {"image": "http://a1.mzstatic.com/jp/r30/Purple7/v4/5e/2d/3a/5e2d3a14-2249-0224-3982-843e778b4b01/icon350x350.jpeg", "score": -99, "id": "850417475"}, {"image": "http://a1.mzstatic.com/jp/r30/Purple1/v4/90/88/99/90889974-3543-b2b5-16d4-5269e3c5b0a6/icon350x350.png", "score": -105, "id": "667861049"}, {"image": "http://a5.mzstatic.com/jp/r30/Purple5/v4/ba/9e/90/ba9e90b1-2243-877b-987b-be767b0718ac/icon350x350.png", "score": -105, "id": "447339142"}, {"image": "http://a3.mzstatic.com/jp/r30/Purple7/v4/e3/b2/c3/e3b2c3b7-4d73-0752-6938-462403dad6ea/icon350x350.png", "score": -105, "id": "633246396"}, {"image": "http://a2.mzstatic.com/jp/r30/Purple1/v4/6c/bc/1e/6cbc1e31-a677-c6d7-f998-622281fa0b7b/icon350x350.png", "score": -116, "id": "544007664"}, {"image": "http://a5.mzstatic.com/jp/r30/Purple1/v4/0a/04/c9/0a04c93d-fd09-bd89-11a1-7fbebc6db1f9/icon350x350.png", "score": -122, "id": "516561342"}, {"image": "http://a4.mzstatic.com/jp/r30/Purple1/v4/31/d9/17/31d917c4-7608-67e9-b6e9-951805e76ce5/icon350x350.png", "score": -122, "id": "374254473"}, {"image": "http://a3.mzstatic.com/jp/r30/Purple1/v4/c8/1a/fd/c81afd5c-3e97-5fd3-a1f9-c23229a47779/icon350x350.jpeg", "score": -140, "id": "963073142"}, {"image": "http://a5.mzstatic.com/jp/r30/Purple/v4/f4/1a/9a/f41a9a61-8940-f8cd-131f-e87e4e8d78c1/icon350x350.png", "score": -148, "id": "491903216"}, {"image": "http://a2.mzstatic.com/jp/r30/Purple5/v4/9d/14/2c/9d142cea-c05c-5498-2141-58f42d715ef5/icon350x350.jpeg", "score": -157, "id": "291676451"}, {"image": "http://a2.mzstatic.com/jp/r30/Purple1/v4/e7/0c/7b/e70c7b16-a413-d93f-ca6a-840d61586958/icon350x350.png", "score": -158, "id": "956081467"}, {"image": "http://a4.mzstatic.com/jp/r30/Purple7/v4/c1/89/0a/c1890af3-4b1f-136a-adac-49651b52fad9/icon350x350.jpeg", "score": -165, "id": "970817084"}, {"image": "http://a5.mzstatic.com/jp/r30/Purple5/v4/38/5b/1e/385b1ee4-93db-2217-2fba-0cacfcf48d2c/icon350x350.png", "score": -166, "id": "437758919"}, {"image": "http://a4.mzstatic.com/jp/r30/Purple7/v4/32/71/24/32712483-3257-990b-946d-5b692c7fe690/icon350x350.png", "score": -171, "id": "919478091"}, {"image": "http://a5.mzstatic.com/jp/r30/Purple5/v4/1c/8c/ea/1c8ceaed-06c7-6b45-d3ea-588ead11da29/icon350x350.png", "score": -172, "id": "454638411"}, {"image": "http://a5.mzstatic.com/jp/r30/Purple3/v4/56/db/c4/56dbc421-bd76-2ba7-6825-34d32ec2226a/icon350x350.png", "score": -172, "id": "952578897"}, {"image": "http://a2.mzstatic.com/jp/r30/Purple1/v4/6c/b8/2a/6cb82a35-8ae4-866f-bbd8-7549fd9ed4ea/icon350x350.jpeg", "score": -175, "id": "905173595"}, {"image": "http://a5.mzstatic.com/jp/r30/Purple3/v4/c1/bb/44/c1bb4489-03c1-a6fa-fadb-53a9fe49d492/icon350x350.jpeg", "score": -175, "id": "673540001"}, {"image": "http://a1.mzstatic.com/jp/r30/Purple1/v4/12/3d/e4/123de420-2cde-9dea-9892-af284d5edec7/icon350x350.png", "score": -177, "id": "714796093"}, {"image": "http://a3.mzstatic.com/jp/r30/Purple7/v4/91/e4/fd/91e4fd0a-9279-d14c-f655-ef0cad680587/icon350x350.png", "score": -178, "id": "443904275"}, {"image": "http://a2.mzstatic.com/jp/r30/Purple3/v4/59/ff/35/59ff35fc-f073-8f73-09c9-82473ac18e99/icon350x350.jpeg", "score": -179, "id": "862800897"}, {"image": "http://a3.mzstatic.com/jp/r30/Purple5/v4/27/8e/13/278e13d6-3e80-0b12-6b73-52f8bfb4ac53/icon350x350.jpeg", "score": -187, "id": "362057947"}, {"image": "http://a2.mzstatic.com/jp/r30/Purple1/v4/91/5e/80/915e802c-a36b-eac4-70bf-5d089788d43e/icon350x350.png", "score": -190, "id": "899997582"}, {"image": "http://a2.mzstatic.com/jp/r30/Purple3/v4/51/92/f5/5192f5af-889c-4740-3193-897b99b2f192/icon350x350.png", "score": -192, "id": "477396335"}, {"image": "http://a2.mzstatic.com/jp/r30/Purple5/v4/b9/43/46/b94346c6-4ac2-2875-1b01-f8dda5e7bf26/icon350x350.jpeg", "score": -195, "id": "895761422"}, {"image": "http://a5.mzstatic.com/jp/r30/Purple5/v4/c9/6f/ec/c96fec5e-72ad-2ad5-387c-3f5a73d34e94/icon350x350.png", "score": -200, "id": "931894765"}, {"image": "http://a5.mzstatic.com/jp/r30/Purple1/v4/ca/75/29/ca7529a6-e94d-c645-bce6-8132b0fda4d8/icon350x350.jpeg", "score": -208, "id": "479159684"}, {"image": "http://a3.mzstatic.com/jp/r30/Purple7/v4/b9/24/05/b9240500-a45d-edde-eec1-d27b2c92a826/icon350x350.png", "score": -212, "id": "953384575"}, {"image": "http://a3.mzstatic.com/jp/r30/Purple1/v4/25/8c/2f/258c2f5b-e9c2-fd25-c940-a9bd936a9df2/icon350x350.jpeg", "score": -214, "id": "284882215"}, {"image": "http://a1.mzstatic.com/jp/r30/Purple3/v4/9d/cd/8b/9dcd8bf4-7d7a-f25b-deb6-4d1b03eefc5e/icon350x350.png", "score": -214, "id": "826184770"}, {"image": "http://a1.mzstatic.com/jp/r30/Purple5/v4/96/e8/8e/96e88eca-7486-69c5-560d-e2c89d054b6b/icon350x350.png", "score": -217, "id": "763377066"}, {"image": "http://a5.mzstatic.com/jp/r30/Purple5/v4/ea/a1/3f/eaa13fee-55fe-fda8-f03f-265cb710091a/icon350x350.jpeg", "score": -231, "id": "421254504"}, {"image": "http://a4.mzstatic.com/jp/r30/Purple1/v4/44/d3/a4/44d3a46d-1998-524f-f732-4138fecd9dd3/icon350x350.png", "score": -242, "id": "340368403"}, {"image": "http://a5.mzstatic.com/jp/r30/Purple1/v4/80/74/ce/8074ce64-d042-bd46-dfd0-16cbcd2d8718/icon350x350.jpeg", "score": -259, "id": "407906756"}, {"image": "http://a1.mzstatic.com/jp/r30/Purple3/v4/5b/31/46/5b314606-ffa7-d0ed-a001-90c733d29d06/icon350x350.jpeg", "score": -274, "id": "906930478"}, {"image": "http://a1.mzstatic.com/jp/r30/Purple7/v4/d3/25/71/d3257130-2977-979e-ce1f-5deaa8d9715b/icon350x350.png", "score": -286, "id": "333903271"}, {"image": "http://a3.mzstatic.com/jp/r30/Purple5/v4/25/5f/dd/255fdda3-52aa-d053-fee1-fcba663d1781/icon350x350.png", "score": -289, "id": "739787904"}, {"image": "http://a4.mzstatic.com/jp/r30/Purple7/v4/f7/63/7c/f7637c08-96a3-63de-6c6a-5cc4b4d704cf/icon350x350.jpeg", "score": -455, "id": "962231849"}, {"image": "http://a1.mzstatic.com/jp/r30/Purple7/v4/06/13/7f/06137f3b-be13-88c9-e336-a6f7f97017bd/icon350x350.png", "score": -516, "id": "987360477"}];