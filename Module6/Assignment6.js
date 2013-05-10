var WIDTH = window.innerWidth -15,
	HEIGHT = window.innerWidth * 9/16;
//Mouse struct:
var mouse = { 
	down: false,
	prevY: 0,
	prevX: 0
			}
var keysPressed = [];
var MOUSESENS = 0.005;


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
	$.getScript("../three.js", function(){ 
		var lRenderer = new THREE.WebGLRenderer({antialias:true});
		var lCamera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR );
		var lScene = new THREE.Scene();
		lRenderer.setSize(WIDTH, HEIGHT); //Start renderer
		console.log('Camera shit ' + lCamera.position.x);
		
	//Attach the renderer to DOM element
		$container.append(lRenderer.domElement);

		var RuinsMap = new Map(lCamera, lScene, lRenderer)
		
		console.log(RuinsMap.getMov());
		RuinsMap.AddPivotHelper(0.23, -0.12, -0.35);
		RuinsMap.AddDirectionalLight( 0x88aaff, 0.68,  new THREE.Vector3(1, 1, -1) ); //Goes to Ruinsmap.DirLight
		RuinsMap.AddAmbientLight(0x181a1f);
		RuinsMap.AddSpotLight(0xffffaa, 2.0, 0.9, 188.1, 15.0, new THREE.Vector3(0.0, 0.0, 1.0))
		RuinsMap.AddExpFog(0x172747, 0.05);
		RoboHand = new Hand(lScene, 0,0,2);
		
		
		//Skybox addition
		var skyboxMaterials = [];  
		skyboxMaterials.push( new THREE.MeshBasicMaterial({ map:THREE.ImageUtils.loadTexture("../nightsky/nightsky_west.png") }));
		skyboxMaterials.push( new THREE.MeshBasicMaterial({ map:THREE.ImageUtils.loadTexture("../nightsky/nightsky_east.png") }));
		skyboxMaterials.push( new THREE.MeshBasicMaterial({ map:THREE.ImageUtils.loadTexture("../nightsky/nightsky_up.png") }));
		skyboxMaterials.push( new THREE.MeshBasicMaterial({ map:THREE.ImageUtils.loadTexture("../nightsky/nightsky_down.png") }));
		skyboxMaterials.push( new THREE.MeshBasicMaterial({ map:THREE.ImageUtils.loadTexture("../nightsky/nightsky_north.png") }));
		skyboxMaterials.push( new THREE.MeshBasicMaterial({ map:THREE.ImageUtils.loadTexture("../nightsky/nightsky_south.png") }));
		RuinsMap.AddSkyBox(skyboxMaterials, new THREE.Vector3(40,40,40));
		
		
		//Adding ground
		t_Floor = THREE.ImageUtils.loadTexture("../SquaredConcrete1.jpg");
		t_Floor.anisotropy = RuinsMap.Renderer.getMaxAnisotropy();
		t_Floor.wrapS = THREE.RepeatWrapping;
		t_Floor.wrapT = THREE.RepeatWrapping;
		t_Floor.repeat.set(256,256);
		RuinsMap.AddGround(t_Floor);
			
		//Adding custom shaded ruins 
		RuinsMap.ShaderUniforms[0] = RuinsMap.GetLightShaderUniforms("../rock.jpg");
		var GroundShader = new THREE.ShaderMaterial({
			uniforms: RuinsMap.ShaderUniforms[0],
			vertexShader: $('shader-vs').text(),
			fragmentShader: $('shader-fs').text()
		});
		RuinsMap.ShaderMaterials[0] = GroundShader; 
		
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
				RuinsMap.camobject.rotation.y -= rotY;
			//Make sure we dont "overlook" down or up:
				if( ( (RuinsMap.Camera.rotation.x <= 1.5) || (rot > 0.0) ) && ( (RuinsMap.Camera.rotation.x >= -1.5) || (rot < 0.0)))
					RuinsMap.Camera.rotation.x -= rot;
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
});

function Lightdir_XZYtoXYZ(LightPosition)
{
		//Works for light pointing to 0,0,0
		var LightDirection = LightPosition;
		LightDirection = new THREE.Vector3(-1*LightDirection.x, -1*LightDirection.z, LightDirection.y );
		LightDirection.multiplyScalar(-1);
		return LightDirection;
}

