//Map class for utilizing with Three.js

function Map(camera, scene, renderer, callback)
{
	/// Constructor:--------------------------------------------------- ///
	console.log('Started Map constructor');
	this.Camera = camera;
	this.Scene = scene;
	this.Renderer = renderer;
	
	this.SkyBox = null;
	this.HelpPivot = null;
	this.Ground = null;
	this.DirLight = null;
	this.AmbientLight = null;
	this.SpotLight = null;
	this.SpotLightDirection = null;
	this.ShaderMaterials = [];
	this.ShaderUniforms = [];
	this.Meshes = [];
	this.MeshLoader = new THREE.JSONLoader();
	this.keysPressed = [];
	this.Movement = 0.0;
	
	this.camobject = new THREE.Object3D();
	this.camobject.add(this.Camera); //making cam a child of camobject
	this.camobject.position.z = 5;
	this.camobject.position.y = 1.0;
	
	this.Scene.add(this.camobject);
	
	
	console.log('Constructor: Finished');
	callback(); //The main code will continue execution only after this constructor finishes his stuff
	/// ----------------------------------------------------------------///
	
	this.getMov = function(){ return this.Movement; };
	
	//Continious update of positions and rotation
	this.Animate = function() {
		var Moving = false;
		Renderer.setClearColorHex(0x000000, 1.0);
		Renderer.clear(true);
		Renderer.render(this.Scene, this.Camera);
		if(this.RoboHand)
			this.RoboHand.Wave(Date.now());
		
		//Update spotlight position
		this.SpotLight.position = this.camobject.position;
		var dir = new THREE.Vector3(0,0,-1);
		var dirW = dir.applyMatrix4(this.camobject.matrixRotationWorld);
		this.SpotLight.target.position = dirW;
		
		var SpotTarget = this.SpotLight.target.position.clone();
		var Wstarget = this.Camera.localToWorld(SpotTarget);
		this.SpotLightDirection = Wstarget.sub(this.SpotLight.position);
		this.SpotLightDirection.multiplyScalar(-1);
		this.ShaderUniforms[0].u_SpotLightDirection.value = this.SpotLightDirection.clone();
		var NewLightLoc = new THREE.Vector3(this.SpotLight.position.x, this.SpotLight.position.y, this.SpotLight.position.z); 
		this.ShaderUniforms[0].u_SpotLightPosition.value = NewLightLoc.clone();
		
		
		//Rotate pivots
		if(this.HelpPivot)
		{
			this.HelpPivot.rotation.z = this.camobject.rotation.y;
			this.HelpPivot.rotation.x = 1.57 -this.Camera.rotation.x;
		}
		
		
		if( this.keysPressed["W".charCodeAt(0)] == true ){
			var dir = new THREE.Vector3(0,0,-1);
			var dirW = dir.applyMatrix4(this.camobject.matrixRotationWorld);
			this.camobject.translate(0.1, dirW);
			Moving = true;
			
		}
		if( this.keysPressed["S".charCodeAt(0)] == true ){
			var dir = new THREE.Vector3(0,0,-1);
			var dirW = dir.applyMatrix4(this.camobject.matrixRotationWorld);
			Moving = true;
			this.camobject.translate(-0.1, dirW);
		}
		if( this.keysPressed["A".charCodeAt(0)] == true ){
			var dir = new THREE.Vector3(-1,0,0);
			var dirW = dir.applyMatrix4(this.camobject.matrixRotationWorld);
			Moving = true;
			this.camobject.translate(0.1, dirW);
		}
		if( this.keysPressed["D".charCodeAt(0)] == true ){
			var dir = new THREE.Vector3(1,0,0);
			var dirW = dir.applyMatrix4(this.camobject.matrixRotationWorld);
			Moving = true;
			this.camobject.translate(0.1, dirW);
		}  
		if(Moving){
			this.Movement += 0.14;
			this.camobject.position.y = Math.sin(this.Movement)*0.1 + 1;
		}
		requestAnimationFrame(this.Animate); //called by browser-supported timer loop. 
	};
	
	//Adding Skybox to the scene
	this.AddSkyBox = function( Materials, Size ) { 
		
		
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
	};
		
	//Adding ground
	this.AddGround = function(texture){
		this.Ground = new THREE.Mesh(
		new THREE.CubeGeometry(950,0.2,950, 1, 1, 1), 
		new THREE.MeshPhongMaterial({   
			map: texture,
		transparent: true}));
	
		this.Scene.add(this.Ground);
	};
	
	//Adding a directional light
	this.AddDirectionalLight = function(color, intensity, position){
		
		this.DirLight = new THREE.DirectionalLight( color, intensity);
		this.DirLight.position = position;
		Scene.add(this.DirLight);
	};
	
	//Adding ambient light
	this.AddAmbientLight = function(color){
		
		this.AmbientLight = new THREE.AmbientLight(color);
		Scene.add(this.AmbientLight);
	};
	
	//Adding spotlight 
	this.AddSpotLight = function(color, intensity, angle, exponent, MaxDistance, cameraoffset){
		////flashlight or smth
		this.SpotLight = new THREE.SpotLight(color, intensity, MaxDistance);
		this.SpotLight.exponent = exponent; //spread of spotlight
		this.SpotLight.angle = angle; //cone angle 			
		
		spotLightObj = new THREE.Object3D();
		Camera.add(spotLightObj);
		
		this.SpotLight.position.add(cameraoffset);
		this.SpotLight.target = spotLightObj;
		Scene.add(this.SpotLight);
	};
	
	//Fog functionality
	this.AddExpFog = function(color, exponent){
		Scene.fog = new THREE.FogExp2(color, exponent);
	};
	
	this.GetLightShaderUniforms = function(texture){  /////No idea if it would even work
		uniforms = { //Defining a new property for our map class
			texture: { type: "t", value: THREE.ImageUtils.loadTexture(texture) },
			
			u_DirLightColor: { type: "v3", value: new THREE.Vector3(this.DirLight.color.r, this.DirLight.color.g, this.DirLight.color.b) },
			u_AmbientLightColor: { type: "v3", value: new THREE.Vector3(this.AmbientLight.color.r, this.AmbientLight.color.g, this.AmbientLight.color.b) },
			u_DirLightIntensity: { type: "f", value: this.DirLight.intensity},
			u_DirLightDirection:{ type: "v3", value: Lightdir_XZYtoXYZ(this.DirLight.position) }, //Might not work
			
			u_SpotLightDirection: {type: "v3", value: this.SpotLightDirection },
			u_SpotLightPosition: { type: "v3", value: new THREE.Vector3(this.SpotLight.position.x, this.SpotLight.position.y, this.SpotLight.position.z) },
			u_SpotLightColor: { type: "v3", value: new THREE.Vector3(this.SpotLight.color.r, this.SpotLight.color.g, this.SpotLight.color.b) },
			u_SpotLightExp: { type: "f", value: this.SpotLight.exponent},
			u_SpotLightAngle: { type: "f", value: this.SpotLight.angle},
			u_SpotLightDistance: { type: "f", value: this.SpotLight.distance }
		};
		return uniforms;
	};
	
	this.MeshHandler = function(geometry, MaterialIndex){
		this.Meshes.push( new THREE.Mesh(geometry, this.ShaderMaterials[MaterialIndex]));
	};
	
	
}

	//Adding pivots for easier navigation
Map.prototype.AddPivotHelper = function(screenoffset_x, screenoffset_y, screenoffset_z){
	this.HelpPivot = new THREE.ArrowHelper( new THREE.Vector3( 0, 1, 0 ), new THREE.Vector3( 0, 0, 1 ), 0.03);
	this.HelpPivot.setColor(0x0000ff);
	this.Camera.add(this.HelpPivot);
	
	this.HelpPivot.position.set(screenoffset_x, screenoffset_y, screenoffset_z);
	
	//y and z pivots we will just add to z one.
	var yPivot = new THREE.ArrowHelper( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, 1 ), 1);
	this.HelpPivot.add(yPivot);
	yPivot.rotation.x = -1.57;
	yPivot.position.z = -0.0;
	yPivot.setColor(0x00ff00);
	
	var xPivot = new THREE.ArrowHelper( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, 1 ), 1);
	this.HelpPivot.add(xPivot);
	xPivot.rotation.x = 0;
	xPivot.rotation.z = -1.57;
	xPivot.position.z = 0.0;
	xPivot.setColor(0xff0000);
};