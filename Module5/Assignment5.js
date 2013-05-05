var WIDTH = window.innerWidth,
	HEIGHT = window.innerHeight;
var Camera;
var Scene;
var Renderer;
var mouse = { 
	down: false,
	prevY: 0,
	prevX: 0
			}
var keysPressed = [];
var camobject = null;
var MOUSESENS = 0.005;
var Ruins = [];
var RoboHand = null;
var spotLight;
var spotLightObj;
var zPivot;


var SpotLightDirection = new THREE.Vector3(1,0,0);
var GSuniforms;

$(function()
{
	var VIEW_ANGLE = 50, //vertical FOV. Horizontal is approx 80, I guess
		ASPECT = WIDTH / HEIGHT,
		NEAR = 0.1,
		FAR = 100000;
				
	var $container = $('#container');
	
//Create cam, renderer and scene
	Renderer = new THREE.WebGLRenderer({antialias:true});
	Camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR );
	Scene = new THREE.Scene();
	camobject = new THREE.Object3D();
	camobject.add(Camera); //making cam a child of camobject
	camobject.position.z = 5;
	camobject.position.y = 1.0;
	Scene.add(camobject);
	Renderer.setSize(WIDTH, HEIGHT); //Start renderer
	
//Attach the renderer to DOM element
	$container.append(Renderer.domElement);
	
	///Skybox addition
	
	AddSkyBox();
	
	function AddSkyBox()
	{
		var skyboxMaterials = [];
		skyboxMaterials.push( new THREE.MeshBasicMaterial({ map:THREE.ImageUtils.loadTexture("../nightsky/nightsky_west.png") }));
		skyboxMaterials.push( new THREE.MeshBasicMaterial({ map:THREE.ImageUtils.loadTexture("../nightsky/nightsky_east.png") }));
		skyboxMaterials.push( new THREE.MeshBasicMaterial({ map:THREE.ImageUtils.loadTexture("../nightsky/nightsky_up.png") }));
		skyboxMaterials.push( new THREE.MeshBasicMaterial({ map:THREE.ImageUtils.loadTexture("../nightsky/nightsky_down.png") }));
		skyboxMaterials.push( new THREE.MeshBasicMaterial({ map:THREE.ImageUtils.loadTexture("../nightsky/nightsky_north.png") }));
		skyboxMaterials.push( new THREE.MeshBasicMaterial({ map:THREE.ImageUtils.loadTexture("../nightsky/nightsky_south.png") }));
		
		
		$.each(skyboxMaterials, function(i, d){ 	
			d.side = THREE.BackSide;
			d.depthWrite = false;
		});
		var sbmfm = new THREE.MeshFaceMaterial( skyboxMaterials );
		sbmfm.depthWrite = false;
		var skybox = new THREE.Mesh
		(
			new THREE.CubeGeometry(40,40,40,1,1,1), 
			sbmfm
		);
		skybox.position = camobject.position;
		Scene.add(skybox);
	}
	
	
	t_Floor = THREE.ImageUtils.loadTexture("../SquaredConcrete1.jpg");
	
	//Texture filtering:
	t_Floor.anisotropy = Renderer.getMaxAnisotropy();
	
	t_Floor.wrapS = THREE.RepeatWrapping;
	t_Floor.wrapT = THREE.RepeatWrapping;
	t_Floor.repeat.set(256,256);
	
//Adding pivots for easier navigation
	zPivot = new THREE.ArrowHelper( new THREE.Vector3( 0, 1, 0 ), new THREE.Vector3( 0, 0, 1 ), 0.03);
	zPivot.setColor(0x0000ff);
	Camera.add(zPivot);
	
	zPivot.position.set(0.23, -0.12, -0.35);
	
	//y and z pivots we will just add to z one.
	var yPivot = new THREE.ArrowHelper( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, 1 ), 1);
	zPivot.add(yPivot);
	yPivot.rotation.x = -1.57;
	yPivot.position.z = -0.0;
	yPivot.setColor(0x00ff00);
	
	var xPivot = new THREE.ArrowHelper( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, 1 ), 1);
	zPivot.add(xPivot);
	xPivot.rotation.x = 0;
	xPivot.rotation.z = -1.57;
	xPivot.position.z = 0.0;
	xPivot.setColor(0xff0000);
	
	////Adding a directional light
	var directionalLight = new THREE.DirectionalLight( 0x88aaff, 0.68);
	directionalLight.position = new THREE.Vector3(1, 1, -1);
	Scene.add(directionalLight);
	
	////Adding ambient light
	var ambientLight = new THREE.AmbientLight(0x181a1f);
	Scene.add(ambientLight);
	
	////Adding spotlight               ////flashlight or smth
	var intensity = 2.0;
	var sLdistance = 15.0;
	spotLight = new THREE.SpotLight(0xffffaa, intensity, sLdistance);
	spotLight.exponent = 188.1; //spread of spotlight
	spotLight.angle = 0.9; //cone angle 			
	
	spotLightObj = new THREE.Object3D();
	Camera.add(spotLightObj);
	
	spotLight.position.z += 1.0;
	spotLight.target = spotLightObj;
	Scene.add(spotLight);
	


////Custom shaders code
	

	GSuniforms = 
	{ 
		 texture: { type: "t", value: THREE.ImageUtils.loadTexture("../rock.jpg") },
		 
		 u_DirLightColor: { type: "v3", value: new THREE.Vector3(directionalLight.color.r, directionalLight.color.g, directionalLight.color.b) },
		 u_AmbientLightColor: { type: "v3", value: new THREE.Vector3(ambientLight.color.r, ambientLight.color.g, ambientLight.color.b) },
		 u_DirLightIntensity: { type: "f", value: directionalLight.intensity},
		 u_DirLightDirection:{ type: "v3", value: Lightdir_XZYtoXYZ(directionalLight.position) },
		 
		 u_SpotLightDirection: {type: "v3", value: SpotLightDirection },
		 u_SpotLightPosition: { type: "v3", value: new THREE.Vector3(spotLight.position.x, spotLight.position.y, spotLight.position.z) },
		 u_SpotLightColor: { type: "v3", value: new THREE.Vector3(spotLight.color.r, spotLight.color.g, spotLight.color.b) },
		 u_SpotLightExp: { type: "f", value: spotLight.exponent},
		 u_SpotLightAngle: { type: "f", value: spotLight.angle},
		 u_SpotLightDistance: { type: "f", value: sLdistance }
	};
	
	var vertShader = document.getElementById('shader-vs').textContent;
	var fragShader = document.getElementById('shader-fs').textContent;
	
	var GroundShader = new THREE.ShaderMaterial
	({
		uniforms: GSuniforms,
		vertexShader: vertShader,//$('shader-vs').textContent,
		fragmentShader: fragShader//$('shader-fs').textContent
	});
	

////Adding ground
	var cube = new THREE.Mesh(
	new THREE.CubeGeometry(950,0.2,950, 1, 1, 1), 
	new THREE.MeshPhongMaterial({   
		map: t_Floor,
		transparent: true}));
	
	Scene.add(cube);
	
////Fog functionality
	Scene.fog = new THREE.FogExp2( 0x172747, 0.05);
	
//Mesh loading functionality
	var loader = new THREE.JSONLoader();
	function handler(geometry, materials)
	{
		Ruins.push( new THREE.Mesh(geometry, GroundShader /*new THREE.MeshLambertMaterial(
		{map: THREE.ImageUtils.loadTexture("../rock.jpg"), transparent: true}
		)*/));
		checkIsAllLoaded();
		
	}
	function checkIsAllLoaded()
	{
		if( Ruins.length == 5 )
		{
			$.each(Ruins, function(i,mesh)
			{
				mesh.rotation.x = Math.PI/2; ///rotate by 90 deg
				Scene.add(mesh);
			});
			Ruins[0].position.z = 13;
			Ruins[1].position.x = -11;
			Ruins[2].position.z = 8;
			Ruins[2].position.x = -5;
			Ruins[4].position.z = 2;
			Ruins[3].position.x = 7;
		}
	}
	//upon finish of the loading process each model will recall a handler func
	loader.load("../meshes/ruins30.js", handler);
	loader.load("../meshes/ruins31.js", handler);
	loader.load("../meshes/ruins33.js", handler);
	loader.load("../meshes/ruins34.js", handler);
	loader.load("../meshes/ruins35.js", handler);
	
///Now adding the hand
	RoboHand = new Hand(Scene, 0,0,2);
	
	Renderer.render(Scene, Camera);
	Animate();
	
///Handle mouse input
	document.onmousedown = function(ev)
	{
		mouse.down = true;
		mouse.prevY = ev.pageY;
		mouse.prevX = ev.pageX;
	}
	document.onmouseup = function(ev)
	{
		mouse.down = false;
	}
	document.onmousemove = function(ev)
	{
		if( mouse.down )
		{
			var rot = (ev.pageY - mouse.prevY) * MOUSESENS;
			var rotY = (ev.pageX - mouse.prevX) * MOUSESENS;
			camobject.rotation.y -= rotY;
		//Make sure we dont "overlook" down or up:
			if( ( (Camera.rotation.x <= 1.5) || (rot > 0.0) ) && ( (Camera.rotation.x >= -1.5) || (rot < 0.0)))
				Camera.rotation.x -= rot;
			mouse.prevY = ev.pageY;
			mouse.prevX = ev.pageX;
		}
	}
///Handle keyboard input
	document.onkeydown = function(event){
		keysPressed[event.keyCode] = true;
	}
	document.onkeyup = function(event){
		keysPressed[event.keyCode] = false;
	}
	
	
});

function Lightdir_XZYtoXYZ(LightPosition)
{
		//Works for light pointing to 0,0,0
		var LightDirection = LightPosition;
		LightDirection = new THREE.Vector3(-1*LightDirection.x, -1*LightDirection.z, LightDirection.y );
		LightDirection.multiplyScalar(-1);
		return LightDirection;
}

var Movement = 0.0;
	
function Animate()
{
	var Moving = false;
	Renderer.setClearColorHex(0x000000, 1.0);
	Renderer.clear(true);
	Renderer.render(Scene, Camera);
	if(RoboHand)
		RoboHand.Wave(Date.now());

///Update spotlight position
	spotLight.position = camobject.position;
	var dir = new THREE.Vector3(0,0,-1);
	var dirW = dir.applyMatrix4(camobject.matrixRotationWorld);
	spotLight.target.position = dirW;
	
	var SpotTarget = spotLight.target.position.clone();
	var Wstarget = Camera.localToWorld(SpotTarget);
	SpotLightDirection = Wstarget.sub(spotLight.position);
	SpotLightDirection.multiplyScalar(-1);
	GSuniforms.u_SpotLightDirection.value = SpotLightDirection.clone(); //I was figuring out for 3 hrs that you have to do this
	var NewLightLoc = new THREE.Vector3(spotLight.position.x, spotLight.position.y, spotLight.position.z); 
	GSuniforms.u_SpotLightPosition.value = NewLightLoc.clone();
	
	
///Rotate pivots	
	zPivot.rotation.z = camobject.rotation.y;
	zPivot.rotation.x = 1.57 -Camera.rotation.x;
	
	if( keysPressed["W".charCodeAt(0)] == true ){
		var dir = new THREE.Vector3(0,0,-1);
		var dirW = dir.applyMatrix4(camobject.matrixRotationWorld);
		camobject.translate(0.1, dirW);
		Moving = true;
		
	}
	if( keysPressed["S".charCodeAt(0)] == true ){
		var dir = new THREE.Vector3(0,0,-1);
		var dirW = dir.applyMatrix4(camobject.matrixRotationWorld);
		Moving = true;
		camobject.translate(-0.1, dirW);

		//alert(SpotLightDirection.x + " " + SpotLightDirection.y + " " + SpotLightDirection.z); 
	}
	if( keysPressed["A".charCodeAt(0)] == true ){
		var dir = new THREE.Vector3(-1,0,0);
		var dirW = dir.applyMatrix4(camobject.matrixRotationWorld);
		Moving = true;
		camobject.translate(0.1, dirW);
	}
	if( keysPressed["D".charCodeAt(0)] == true ){
		var dir = new THREE.Vector3(1,0,0);
		var dirW = dir.applyMatrix4(camobject.matrixRotationWorld);
		Moving = true;
		camobject.translate(0.1, dirW);
	}
	
	if(Moving){
		Movement += 0.14;
		camobject.position.y = Math.sin(Movement)*0.1 + 1;
	}
	
	requestAnimationFrame(Animate); //called by browser-supported timer loop. 
}

///Making a class for a hand. Will simplify the code and overall usage
function Hand(Scene, x, y, z)
{
	//Starting with shoulder as a parent for alll other arm parts. Adding it as a child to a scene.
	this.Shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.2,30,30), new THREE.MeshLambertMaterial( {color: 0xff0000} ));
	Scene.add(this.Shoulder);
	this.Shoulder.position.x = x;
	this.Shoulder.position.y = y + 1.3; //Height so that whole arm can be upper then floor
	this.Shoulder.position.z = z;
	this.Shoulder.rotation.x = 0;
	this.Shoulder.rotation.y = 0;
	this.Shoulder.rotation.z = 0;
	///WRITE HERE ROTATION MANUALY
	
	this.UpperArm = new THREE.Mesh(new THREE.CubeGeometry(0.5,0.15,0.15, 1, 1, 1), new THREE.MeshLambertMaterial( {color: 0x00ff00} ));
	this.UpperArm.position.x = x + 0.4;
	this.UpperArm.position.y = y;
	this.UpperArm.position.z = z - 2.01;
	this.Shoulder.add(this.UpperArm);
	
	this.Elbow = new THREE.Mesh(new THREE.SphereGeometry(0.15,30,30), new THREE.MeshLambertMaterial( {color: 0xff00ff} ));
	this.Elbow.position.x = x + 0.3;
	this.Elbow.position.y = y;
	this.Elbow.position.z = z - 2.01;
	this.UpperArm.add(this.Elbow);
	
	this.LowerArm = new THREE.Mesh(new THREE.CubeGeometry(0.5,0.15,0.15, 1, 1, 1), new THREE.MeshLambertMaterial( {color: 0x0000ff} ));
	this.LowerArm.position.x = x + 0.3;
	this.LowerArm.position.y = y;
	this.LowerArm.position.z = z - 2.01;
	this.Elbow.add(this.LowerArm);
	
	this.Wrist = new THREE.Mesh(new THREE.CubeGeometry(0.3,0.32,0.18, 1, 1, 1), new THREE.MeshLambertMaterial( {color: 0x00ffff} ));
	this.Wrist.position.x = x + 0.39;
	this.Wrist.position.y = y;
	this.Wrist.position.z = z - 2.01;
	this.LowerArm.add(this.Wrist);
	
	this.Fingers = [new THREE.Mesh(new THREE.CubeGeometry(0.3,0.05,0.05, 1, 1, 1), new THREE.MeshLambertMaterial( {color: 0xffff0f} )),
				   new THREE.Mesh(new THREE.CubeGeometry(0.3,0.05,0.05, 1, 1, 1), new THREE.MeshLambertMaterial( {color: 0xffff0f} )),
				   new THREE.Mesh(new THREE.CubeGeometry(0.3,0.05,0.05, 1, 1, 1), new THREE.MeshLambertMaterial( {color: 0xffff0f} )),
				   new THREE.Mesh(new THREE.CubeGeometry(0.4,0.05,0.05, 1, 1, 1), new THREE.MeshLambertMaterial( {color: 0xffff0f} ))];
	for( i = 0; i < this.Fingers.length; i++){
		this.Fingers[i].position.x = x + 0.28;
		this.Fingers[i].position.y = y +0.11 - (0.1 * i);
		this.Fingers[i].position.z = z - 2.01;
		this.Wrist.add(this.Fingers[i]);
	}
	//Thumb:
	this.Fingers[3].rotation.z -= 0.7;
	this.Fingers[3].position.x -= 0.2;
	
///Method of waving:
	this.Wave = function(Delta)
	{ 
		//Let's start with some simple upperhand movement
		this.Shoulder.rotation.z = Math.PI/2 + (Math.cos( Delta * 0.001 ))* 1.7;
		//Next, let's work on elbow rotation
		this.Elbow.rotation.z = Math.sin(Delta * 0.0015 );
		//At last, let's make the wrist move
		this.Wrist.rotation.y = Math.cos(Delta * 0.0017 );
	}
}

