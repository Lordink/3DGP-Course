//Map class for utilizing with Three.js

function Map(camera, scene, renderer)
{
	/// Constructor:--------------------------------------------------- ///
	this.Camera = camera;
	this.Scene = scene;
	this.Renderer = renderer;
	
	this.SkyBox = null;
	this.HelpPivot = null;
	this.Ground = null;
	this.DirLight = null;
	this.AmbientLight = null;
	this.SpotLight = null;
	this.ShaderMaterials = [];
	this.ShaderUniforms = [];
	this.Meshes = [];
	this.MeshLoader = new THREE.JSONLoader();
	
	this.camobject = new THREE.Object3D();
	this.camobject.add(this.Camera); //making cam a child of camobject
	this.camobject.position.z = 5;
	this.camobject.position.y = 1.0;
	this.Scene.add(this.camobject);
	/// ----------------------------------------------------------------///
	
	//Continious update of positions and rotation
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
	
	//Adding Skybox to the scene
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
	
	//Adding pivots for easier navigation
	this.AddPivotHelper = function(screenoffset_x, screenoffset_y, screenoffset_z){
	
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
	}
	
	//Adding ground
	this.AddGround = function(texture){
		this.Ground = new THREE.Mesh(
		new THREE.CubeGeometry(950,0.2,950, 1, 1, 1), 
		new THREE.MeshPhongMaterial({   
			map: texture,
		transparent: true}));
	
		this.Scene.add(this.Ground);
	}
	
	//Adding a directional light
	this.AddDirectionalLight = function(color, intensity, position){
		
		this.DirLight = new THREE.DirectionalLight( color, intensity);
		this.DirLight.position = position;
		this.Scene.add(this.DirLight);
	}
	
	//Adding ambient light
	this.AddAmbientLight = function(color){
		
		this.AmbientLight = new THREE.AmbientLight(color);
		this.Scene.add(this.AmbientLight);
	}
	
	//Adding spotlight 
	this.AddSpotLight = function(color, intensity, angle, exponent, MaxDistance, cameraoffset){
		////flashlight or smth
		this.SpotLight = new THREE.SpotLight(color, intensity, MaxDistance);
		this.SpotLight.exponent = exponent; //spread of spotlight
		this.SpotLight.angle = angle; //cone angle 			
		
		spotLightObj = new THREE.Object3D();
		this.Camera.add(spotLightObj);
		
		this.SpotLight.position.Add(cameraOffset);
		this.SpotLight.target = spotLightObj;
		this.Scene.add(this.SpotLight);
	}
	
	//Fog functionality
	this.AddExpFog = function(color, exponent){
		this.Scene.fog = new THREE.FogExp2(color, exponent);
	}
	
	this.GetLightShaderUniforms = function(texture){	/* NOT FINISHED */  /////No idea if it would even work
		uniforms = { //Defining a new property for our map class
			texture: { type: "t", value: THREE.ImageUtils.loadTexture(texture) },
			
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
		return uniforms;
	}
	
	this.MeshHandler = function(geometry, MaterialIndex){
		this.Meshes.push( new THREE.Mesh(geometry, this.ShaderMaterials[MaterialIndex]));
	}
	
	
}