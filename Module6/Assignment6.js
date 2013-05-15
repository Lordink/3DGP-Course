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

var CParticleSystem = null;
var BonFire = null;
var BonSmoke = null;

var SpotLightDirection = new THREE.Vector3(1,0,0);
var GSuniforms;

$(function(){
	var VIEW_ANGLE = 50, //vertical FOV. Horizontal is approx 80, I guess
		ASPECT = WIDTH / HEIGHT,
		NEAR = 0.1,
		FAR = 100000;
				
	var $container = $('#container');
	
//Create cam, renderer and scene
	var lRenderer = new THREE.WebGLRenderer({antialias:true});
	var lCamera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR );
	var lScene = new THREE.Scene();
	lRenderer.setSize(WIDTH, HEIGHT); //Start renderer
	
//Attach the renderer to DOM element
	$container.append(lRenderer.domElement);

	var RuinsMap = new Map(lCamera, lScene, lRenderer);

	RuinsMap.AddPivotHelper(0.23, -0.12, -0.35);
	RuinsMap.AddDirectionalLight( 0x88aaff, 0.68,  new THREE.Vector3(1, 1, -1) ); //Goes to Ruinsmap.DirLight
	RuinsMap.AddAmbientLight(0x181a1f);
	RuinsMap.AddSpotLight(0xffffaa, 2.0, 0.9, 188.1, 15.0, new THREE.Vector3(0.0, 0.0, 1.0))
	RuinsMap.AddFog(0x172747, 10.0, 50.0);
	RoboHand = new Hand(lScene, 0,0,2);
	
	
	//Skybox addition
	var skyboxMaterials = [];  
	skyboxMaterials.push( new THREE.MeshBasicMaterial({ map:THREE.ImageUtils.loadTexture("../nightsky/nightsky_west.png") }));
	skyboxMaterials.push( new THREE.MeshBasicMaterial({ map:THREE.ImageUtils.loadTexture("../nightsky/nightsky_east.png") }));
	skyboxMaterials.push( new THREE.MeshBasicMaterial({ map:THREE.ImageUtils.loadTexture("../nightsky/nightsky_up.png") }));
	skyboxMaterials.push( new THREE.MeshBasicMaterial({ map:THREE.ImageUtils.loadTexture("../nightsky/nightsky_down.png") }));
	skyboxMaterials.push( new THREE.MeshBasicMaterial({ map:THREE.ImageUtils.loadTexture("../nightsky/nightsky_north.png") }));
	skyboxMaterials.push( new THREE.MeshBasicMaterial({ map:THREE.ImageUtils.loadTexture("../nightsky/nightsky_south.png") }));
	RuinsMap.AddSkyBox(skyboxMaterials, new THREE.Vector3(1,1,1));
	
	
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
		vertexShader: $('#shader-vs')[0].textContent,
		fragmentShader: $('#shader-fs')[0].textContent,
		transparent: false
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
	
	CParticleSystem = new CustomParticleSystem(
	{
		maxParticles: 10,
		energyDecrement: 0.3,
		PPS: 2.0,
		material: new THREE.ParticleBasicMaterial({
				color:0xff5f5f,
				size: 1,
				transparent: true,
				map: THREE.ImageUtils.loadTexture( "Media/plasma.png" ),
				blending: THREE.CustomBlending,
				blendEquation: THREE.AddEquation,
				blendSrc: THREE.SrcAlphaFactor,
				blendDst: THREE.OneFactor,
				depthWrite: false,
				fog: true
			}),
			onParticleInit: function(particle)
			{
				particle.set(0,0,2);
				particle.velocity = new THREE.Vector3(0,1.0,0);
				
				particle.energy = 1.0;	//Particle lifetime  
			},
			onParticleUpdate: function( particle, delta )
			{ 
				particle.add(particle.velocity.clone().multiplyScalar(delta));
				particle.energy -= CParticleSystem.options.energyDecrement * delta;
			}
	}); 
	CParticleSystem.start(RuinsMap.Scene);
	
	//bonfire code:	
	BonFire = new CustomParticleSystem(
	{
		maxParticles: 100,
		locationRange: 0.25, //how far from selected point particles can spawn
		energyDecrement: 1.3,
		PPS: 30.0, //Particle per second
		material: new THREE.ParticleBasicMaterial({
			color: 0xffffff,
			size: 1,
			transparent: true,
			map: THREE.ImageUtils.loadTexture( "Media/fire.png" ),
			blending: THREE.CustomBlending,
			blendEquation: THREE.AddEquation,
			blendSrc: THREE.SrcAlphaFactor,
			blendDst: THREE.OneFactor, 
			depthWrite: false,
			fog: true
		}),
		onParticleInit: function(particle)
		{
			var locr = BonFire.options.locationRange;
			var position = new THREE.Vector3( 0, 0, 9.6);
			particle.set((-0.2 + Math.random()*locr*2- locr), 0.2, 9.6 + (Math.random()*locr*2- locr)); //Let's add some random factor
			particle.velocity = new THREE.Vector3(0,1.0,0);
			particle.energy = 1.0;	//Particle lifetime  
		},
		onParticleUpdate: function( particle, delta )
		{ 
			particle.add(particle.velocity.clone().multiplyScalar(delta));
			particle.energy -= BonFire.options.energyDecrement * delta;
		}
	});
	
	BonFire.start(RuinsMap.Scene);
	
	BonSmoke = new CustomParticleSystem(
	{
		maxParticles: 100,
		locationRange: 0.35, //how far from selected point particles can spawn
		energyDecrement: 0.58,
		PPS: 15.0, //Particle per second
		material: new THREE.ParticleBasicMaterial({
			color: 0x3f3f3f,
			size: 2.5,
			transparent: true,
			map: THREE.ImageUtils.loadTexture( "Media/smoke.png" ),
			blending: THREE.AdditiveBlending,
			depthWrite: false,
			fog: true
		}),
		onParticleInit: function(particle)
		{
			var locr = BonSmoke.options.locationRange;
			var position = new THREE.Vector3( 0, 0, 9.6);
			particle.set((-0.2 + Math.random()*locr*2- locr), 0.9, 9.6 + (Math.random()*locr*2- locr)); //Let's add some random factor
			particle.velocity = new THREE.Vector3(Math.random() - 0.5, Math.random()*3.8, Math.random() - 0.5);
			particle.energy = 1.0;	//Particle lifetime  
		},
		onParticleUpdate: function( particle, delta )
		{ 
			particle.add(particle.velocity.clone().multiplyScalar(delta));
			particle.energy -= BonSmoke.options.energyDecrement * delta;
		}
	});
	
	BonSmoke.start(RuinsMap.Scene);
	
	Animate();
	
	//Continious update of positions and rotation		
	function Animate() {
		var Moving = false;
		RuinsMap.Renderer.setClearColorHex(0x000000, 1.0);
		RuinsMap.Renderer.clear(true);
		RuinsMap.Renderer.render(RuinsMap.Scene, RuinsMap.Camera);
		if(RoboHand)
			RoboHand.Wave(Date.now());
		
		//Update spotlight position
		RuinsMap.SpotLight.position = RuinsMap.camobject.position;
		var dir = new THREE.Vector3(0,0,-1);
		var dirW = dir.applyMatrix4(RuinsMap.camobject.matrixRotationWorld);
		RuinsMap.SpotLight.target.position = dirW;
		
		var SpotTarget = RuinsMap.SpotLight.target.position.clone();
		var Wstarget = RuinsMap.Camera.localToWorld(SpotTarget);
		RuinsMap.SpotLightDirection = Wstarget.sub(RuinsMap.SpotLight.position);
		RuinsMap.SpotLightDirection.multiplyScalar(-1);
		RuinsMap.ShaderUniforms[0].u_SpotLightDirection.value = RuinsMap.SpotLightDirection.clone();
		var NewLightLoc = new THREE.Vector3(RuinsMap.SpotLight.position.x, RuinsMap.SpotLight.position.y, RuinsMap.SpotLight.position.z); 
		RuinsMap.ShaderUniforms[0].u_SpotLightPosition.value = NewLightLoc.clone();
		
		
		//Rotate pivots
		if(RuinsMap.HelpPivot)
		{
			RuinsMap.HelpPivot.rotation.z = RuinsMap.camobject.rotation.y;
			RuinsMap.HelpPivot.rotation.x = 1.57 -RuinsMap.Camera.rotation.x;
		}
		
		if(CParticleSystem != null)
			CParticleSystem.update();
		if(BonFire != null)
			BonFire.update();
		if(BonSmoke != null)
			BonSmoke.update();
		
		if( keysPressed["W".charCodeAt(0)] == true ){
			var dir = new THREE.Vector3(0,0,-1);
			var dirW = dir.applyMatrix4(RuinsMap.camobject.matrixRotationWorld);
			RuinsMap.camobject.translate(0.1, dirW);
			Moving = true;
			
		}
		if( keysPressed["S".charCodeAt(0)] == true ){
			var dir = new THREE.Vector3(0,0,-1);
			var dirW = dir.applyMatrix4(RuinsMap.camobject.matrixRotationWorld);
			Moving = true;
			RuinsMap.camobject.translate(-0.1, dirW);
		}
		if( keysPressed["A".charCodeAt(0)] == true ){
			var dir = new THREE.Vector3(-1,0,0);
			var dirW = dir.applyMatrix4(RuinsMap.camobject.matrixRotationWorld);
			Moving = true;
			RuinsMap.camobject.translate(0.1, dirW);
		}
		if( keysPressed["D".charCodeAt(0)] == true ){
			var dir = new THREE.Vector3(1,0,0);
			var dirW = dir.applyMatrix4(RuinsMap.camobject.matrixRotationWorld);
			Moving = true;
			RuinsMap.camobject.translate(0.1, dirW);
		}  
		if(Moving){
			RuinsMap.Movement += 0.14;
			RuinsMap.camobject.position.y = Math.sin(RuinsMap.Movement)*0.1 + 1;
		}
		
		if( keysPressed["P".charCodeAt(0)] == true ){
			CParticleSystem.init(1);
		}  
		
		requestAnimationFrame(Animate); //called by browser-supported timer loop. 
	}
	

///Handle mouse input
	document.onmousedown = function(ev){
		mouse.down = true;
		mouse.prevY = ev.pageY;
		mouse.prevX = ev.pageX;
	}
	document.onmouseup = function(ev){
		mouse.down = false;
	}
	document.onmousemove = function(ev){
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

function Lightdir_XZYtoXYZ(LightPosition){
		//Works for light pointing to 0,0,0
		var LightDirection = LightPosition;
		LightDirection = new THREE.Vector3(-1*LightDirection.x, -1*LightDirection.z, LightDirection.y );
		LightDirection.multiplyScalar(-1);
		return LightDirection;
}

var CustomParticleSystem = function( options )
{
	this.particles = new THREE.Geometry();
	this.options = options; // some old school oop stuff
	this.numAlive = 0;
	this.prevTime = new Date();
	this.throughput = 0.0;
	this.PPS = 0.0; //Particle per second
	if(	options.PPS !== undefined	)
		this.PPS = options.PPS;
		
	//Add amount of particles to geometry
	for( var i = 0; i < this.options.maxParticles; i++ )
	{
		this.particles.vertices.push( new THREE.Vector3() );
	}
	
	this.ps = new THREE.ParticleSystem( this.particles, this.options.material );
	this.ps.renderDepth = 0;
	this.ps.sortParticles = false;
	this.ps.geometry.__webglParticleCount = 0;
	
	this.getNumParticlesAlive = function(){	return this.numAlive;	};
	this.setNumParticlesAlive = function(coun){	this.numAlive = coun;	};
	this.getMaxParticleCount = function(){		return this.ps.geometry.vertices.length;	};
	
	this.init = function(particleCount){
		var previouslyAlive = this.getNumParticlesAlive();
		var  newTotal = particleCount + previouslyAlive; // Adding argumented new particles to the ones which are already alive
		newTotal = (newTotal > this.getMaxParticleCount() ? 
			this.getMaxParticleCount() : newTotal );
		// console.log("particle init: Alive " + newTotal + ", maximum " + this.getMaxParticleCount());
		this.setNumParticlesAlive(newTotal);
		for( var p = previouslyAlive; p < newTotal; p++ )
			this.options.onParticleInit( this.ps.geometry.vertices[p] );
		this.ps.geometry.verticesNeedUpdate = true;
	}
	
	this.update = function(){
		
		var now = new Date();
		var delta = ( now.getTime() - this.prevTime.getTime() ) / 1000.0;
		
		this.ps.geometry.__webglParticleCount = this.getNumParticlesAlive(); //quick hack to make things work
		
		//seek and destroy dead ones.
		this.remDeadParticles();
		
		var endPoint = this.getNumParticlesAlive();
		for( var p = 0; p < endPoint; p++ )
		{
			var particle = this.ps.geometry.vertices[p];
			if( particle !== undefined )
			{
				this.options.onParticleUpdate(particle, delta);
			}
		}
		
		//Add new particles according to thoughtput factor
		this.throughput += (this.options.PPS * delta);
		var howManyToCreate = Math.floor(this.throughput);
		if( howManyToCreate >= 1 ){
			this.throughput -= howManyToCreate;
			this.init(howManyToCreate);
		}
		
		this.ps.geometry.verticesNeedUpdate = true; // as positions is changed
		
		this.prevTime = now;
	}
	
	this.remDeadParticles = function(){
		var endPoint = this.getNumParticlesAlive();
		for(var p = 0; p < endPoint; p++)
		{
			var particle = this.ps.geometry.vertices[p];
			if( particle.energy <= 0.0 ){
				var tmp = this.ps.geometry.vertices.splice( p, 1 ); //remove from array
				this.ps.geometry.vertices.push(tmp[0]); //append to the end of array
				//vertices have shifted, don go so far any more
				endPoint--;
				this.setNumParticlesAlive( this.getNumParticlesAlive() - 1 ); 
			}
		}
	}
	
	this.start = function(scene){
		scene.add(this.ps);
	}
	
}