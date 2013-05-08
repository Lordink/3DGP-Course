var WIDTH = window.innerWidth -15,
	HEIGHT = window.innerWidth * 9/16;
///var Camera;
///var Scene;
///var Renderer;
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


//Creating a class, contating the whole map with methods and properties
function Map(camera, scene, renderer)
{
	/// Constructor:--------------------------------------------------- ///
	this.Camera = camera;
	this.Scene = scene;
	this.Renderer = renderer;
	this.SkyBox = null;
	
	this.camobject = new THREE.Object3D();
	this.camobject.add(this.Camera); //making cam a child of camobject
	this.camobject.position.z = 5;
	this.camobject.position.y = 1.0;
	this.Scene.add(this.camobject);
	/// ----------------------------------------------------------------///
	
	this.Animate = function() { /* NOT FINISHED */
		var Moving = false;
		this.Renderer.setClearColorHex(0x000000, 1.0);
		this.Renderer.clear(true);
		this.Renderer.render(Scene, Camera);
		if(this.RoboHand)
		this.RoboHand.Wave(Date.now());
		
		///Update spotlight position
		/*  ///WORK ON THIS LATER
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
		*/
		requestAnimationFrame(this.Animate); //called by browser-supported timer loop. 
	}
	
	this.AddSkyBox = function( Materials, Size ) { /* NOT FINISHED */
		/* var skyboxMaterials = [];  ///TO BE MADE IN MAIN CODE
		skyboxMaterials.push( new THREE.MeshBasicMaterial({ map:THREE.ImageUtils.loadTexture("../nightsky/nightsky_west.png") }));
		skyboxMaterials.push( new THREE.MeshBasicMaterial({ map:THREE.ImageUtils.loadTexture("../nightsky/nightsky_east.png") }));
		skyboxMaterials.push( new THREE.MeshBasicMaterial({ map:THREE.ImageUtils.loadTexture("../nightsky/nightsky_up.png") }));
		skyboxMaterials.push( new THREE.MeshBasicMaterial({ map:THREE.ImageUtils.loadTexture("../nightsky/nightsky_down.png") }));
		skyboxMaterials.push( new THREE.MeshBasicMaterial({ map:THREE.ImageUtils.loadTexture("../nightsky/nightsky_north.png") }));
		skyboxMaterials.push( new THREE.MeshBasicMaterial({ map:THREE.ImageUtils.loadTexture("../nightsky/nightsky_south.png") }));
		*/
		
		$.each(Materials, function(i, d){ 	
			d.side = THREE.BackSide;
			d.depthWrite = false;
		});
		var sbmfm = new THREE.MeshFaceMaterial( Materials );
		sbmfm.depthWrite = false;
		this.Skybox = new THREE.Mesh
		(
			new THREE.CubeGeometry(Size.x, Size.y, Size.z, 1, 1, 1), 
			sbmfm
		);
		this.Skybox.position = this.camobject.position;
		this.Scene.add(this.Skybox);
	}

}


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
		transparent: true})/*GroundShader*/);
	
	Scene.add(cube);
	
////Fog functionality
	Scene.fog = new THREE.FogExp2( 0x172747, 0.05);
	
//Mesh loading functionality
	var loader = new THREE.JSONLoader();
	function handler(geometry, materials)
	{
		Ruins.push( new THREE.Mesh(geometry, GroundShader));
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
	///
}