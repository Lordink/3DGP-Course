//Map class for utilizing with Three.js

function Map(camera, scene, renderer)
{
	/// Constructor:--------------------------------------------------- ///
	console.log('Started Map constructor');
	this.Camera = camera;
	this.Scene = scene;
	this.Renderer = renderer;
	
	this.Skybox = null;
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
	
	this.Fog = null;
	
	this.camobject = new THREE.Object3D();
	this.camobject.add(this.Camera); //making cam a child of camobject
	this.camobject.position.z = 5;
	this.camobject.position.y = 1.0;
	
	this.Scene.add(this.camobject);
	
	
	console.log('Constructor: Finished');
	/// ----------------------------------------------------------------///

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
		this.Skybox.renderDepth = 0;
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
		this.Scene.add(this.DirLight);
	};
	
	//Adding ambient light
	this.AddAmbientLight = function(color){
		
		this.AmbientLight = new THREE.AmbientLight(color);
		this.Scene.add(this.AmbientLight);
	};
	
	//Adding spotlight 
	this.AddSpotLight = function(color, intensity, angle, exponent, MaxDistance, cameraoffset){
		////flashlight or smth
		this.SpotLight = new THREE.SpotLight(color, intensity, MaxDistance);
		this.SpotLight.exponent = exponent; //spread of spotlight
		this.SpotLight.angle = angle; //cone angle 			
		
		spotLightObj = new THREE.Object3D();
		this.Camera.add(spotLightObj);
		
		this.SpotLight.position.add(cameraoffset);
		this.SpotLight.target = spotLightObj;
		this.Scene.add(this.SpotLight);
	};
	
	
	//Fog functionality
	this.AddFog = function(color, near, far){
		this.Scene.fog = new THREE.Fog(color, near, far);
	};
	
	this.GetLightShaderUniforms = function(texture){  
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
			u_SpotLightDistance: { type: "f", value: this.SpotLight.distance },
			
			fogColor:{ type: "v3", value: new THREE.Vector3(this.Scene.fog.color.r, this.Scene.fog.color.g, this.Scene.fog.color.b) },
			fogNear:{ type: "f", value: this.Scene.fog.near },
			fogFar:{ type: "f", value: this.Scene.fog.far },
		};
		return uniforms;
	};
	
	this.MeshHandler = function(geometry, MaterialIndex){
		var m = new THREE.Mesh(geometry, this.ShaderMaterials[MaterialIndex]);
		m.renderDepth = 2000;
		this.Meshes.push( m );
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

