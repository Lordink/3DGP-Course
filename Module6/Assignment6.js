var WIDTH = window.innerWidth -15,
	HEIGHT = window.innerWidth * 9/16;
///var Camera;
///var Scene;
///var Renderer;
//Mouse struct:
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
		///
	}
	
	t_Floor = THREE.ImageUtils.loadTexture("../SquaredConcrete1.jpg");
	t_Floor.anisotropy = RuinsMap.Renderer.getMaxAnisotropy();
	t_Floor.wrapS = THREE.RepeatWrapping;
	t_Floor.wrapT = THREE.RepeatWrapping;
	t_Floor.repeat.set(256,256);
	RuinsMap.AddGround(t_Floor);
	
	RuinsMap.AddDirectionalLight( 0x88aaff, 0.68,  new THREE.Vector3(1, 1, -1) ); //Goes to Ruinsmap.DirLight
	RuinsMap.AddAmbientLight(0x181a1f);
	RuinsMap.AddSpotLight(0xffffaa, 2.0, 0.9, 188.1, 15.0, new THREE.Vector3(0.0, 0.0, 1.0))
	RuinsMap.AddExpFog(0x172747, 0.05);
	
	RuinsMap.ShaderUniforms[0] = RuinsMap.GetLightShaderUniforms("../rock.jpg");

	//var vertShader = document.getElementById('shader-vs').textContent;
	//var fragShader = document.getElementById('shader-fs').textContent;
	
	var GroundShader = new THREE.ShaderMaterial({
		uniforms: RuinsMap.ShaderUniforms[0],
		vertexShader: $('shader-vs').textContent,
		fragmentShader: $('shader-fs').textContent
	});
	RuinsMap.Materials[0] = GroundShader; 
	
	function checkIsAllLoaded(){
		if( RuinsMap.Meshes.length == 5 )
		{
			$.each(RuinsMap.Meshes, function(i,mesh)
			{
				mesh.rotation.x = Math.PI/2; ///rotate by 90 deg
				RuinsMap.Scene.add(mesh);
			});
			RuinsMap.Meshes[0].position.z = 13;
			RuinsMap.Meshes[1].position.x = -11;
			RuinsMap.Meshes[2].position.z = 8;
			RuinsMap.Meshes[2].position.x = -5;
			RuinsMap.Meshes[4].position.z = 2;
			RuinsMap.Meshes[3].position.x = 7;
		}
	}
	function handler(geometry, materials){
		RuinsMap.MeshHandler(geometry, 0)
		checkIsAllLoaded();
	}
	//upon finish of the loading process each model will recall a handler func
	RuinsMap.MeshLoader.load("../meshes/ruins30.js", handler);
	RuinsMap.MeshLoader.load("../meshes/ruins31.js", handler);
	RuinsMap.MeshLoader.load("../meshes/ruins33.js", handler);
	RuinsMap.MeshLoader.load("../meshes/ruins34.js", handler);
	RuinsMap.MeshLoader.load("../meshes/ruins35.js", handler);
	
///Now adding the hand
	RoboHand = new Hand(RuinsMap.Scene, 0,0,2);
	
	RuinsMap.Animate();
	
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