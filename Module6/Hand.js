//A class for a robohand. Will simplify the code and overall usage
function Hand(Scene, x, y, z)
{
	//Starting with shoulder as a parent for alll other arm parts. Adding it as a child to a scene.
	this.Shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.2,30,30), new THREE.MeshLambertMaterial( {color: 0xff0000, transparent: true} ));
	Scene.add(this.Shoulder);
	this.Shoulder.position.x = x;
	this.Shoulder.position.y = y + 1.3; //Height so that whole arm can be upper then floor
	this.Shoulder.position.z = z;
	this.Shoulder.rotation.x = 0;
	this.Shoulder.rotation.y = 0;
	this.Shoulder.rotation.z = 0;
	
	this.UpperArm = new THREE.Mesh(new THREE.CubeGeometry(0.5,0.15,0.15, 1, 1, 1), new THREE.MeshLambertMaterial( {color: 0x00ff00, transparent: true} ));
	this.UpperArm.position.x = x + 0.4;
	this.UpperArm.position.y = y;
	this.UpperArm.position.z = z - 2.01;
	this.Shoulder.add(this.UpperArm);
	
	this.Elbow = new THREE.Mesh(new THREE.SphereGeometry(0.15,30,30), new THREE.MeshLambertMaterial( {color: 0xff00ff, transparent: true} ));
	this.Elbow.position.x = x + 0.3;
	this.Elbow.position.y = y;
	this.Elbow.position.z = z - 2.01;
	this.UpperArm.add(this.Elbow);
	
	this.LowerArm = new THREE.Mesh(new THREE.CubeGeometry(0.5,0.15,0.15, 1, 1, 1), new THREE.MeshLambertMaterial( {color: 0x0000ff, transparent: true} ));
	this.LowerArm.position.x = x + 0.3;
	this.LowerArm.position.y = y;
	this.LowerArm.position.z = z - 2.01;
	this.Elbow.add(this.LowerArm);
	
	this.Wrist = new THREE.Mesh(new THREE.CubeGeometry(0.3,0.32,0.18, 1, 1, 1), new THREE.MeshLambertMaterial( {color: 0x00ffff, transparent: true} ));
	this.Wrist.position.x = x + 0.39;
	this.Wrist.position.y = y;
	this.Wrist.position.z = z - 2.01;
	this.LowerArm.add(this.Wrist);
	
	this.Fingers = [new THREE.Mesh(new THREE.CubeGeometry(0.3,0.05,0.05, 1, 1, 1), new THREE.MeshLambertMaterial( {color: 0xffff0f, transparent: true} )),
				   new THREE.Mesh(new THREE.CubeGeometry(0.3,0.05,0.05, 1, 1, 1), new THREE.MeshLambertMaterial( {color: 0xffff0f, transparent: true} )),
				   new THREE.Mesh(new THREE.CubeGeometry(0.3,0.05,0.05, 1, 1, 1), new THREE.MeshLambertMaterial( {color: 0xffff0f, transparent: true} )),
				   new THREE.Mesh(new THREE.CubeGeometry(0.4,0.05,0.05, 1, 1, 1), new THREE.MeshLambertMaterial( {color: 0xffff0f, transparent: true} ))];
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