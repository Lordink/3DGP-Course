var Scene = null;
var Camera = null;
var Renderer = null;

var WIDTH = window.innerWidth -15,
	HEIGHT = window.innerWidth * 9/16;

$(function(){
	var VIEW_ANGLE = 50, 
		ASPECT = WIDTH / HEIGHT,
		NEAR = 0.1,
		FAR = 100000;
				
	var $container = $('#container');
	Renderer = new THREE.WebGLRenderer({antialias:true});
	Camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR );
	Scene = new THREE.Scene();
	Renderer.setSize(WIDTH, HEIGHT); //Start renderer
	
	Camera.position.z = 2;
	
	$container.append(Renderer.domElement);
	
	var rockTexture = THREE.ImageUtils.loadTexture("rock.jpg");
	var fire = THREE.ImageUtils.loadTexture("../Media/fire.png");
	var plasma = THREE.ImageUtils.loadTexture("../Media/plasma.png");
	rockTexture.wrapS = THREE.RepeatWrapping;
	rockTexture.wrapT = THREE.RepeatWrapping;
	
	var plane1 = new THREE.Mesh( new THREE.PlaneGeometry(1,1), new THREE.MeshBasicMaterial(
	{
		color: 0xffffff,
		map: rockTexture,
		depthTest: true,
		depthWrite: false,
		transparent: true,
		blending: THREE.NoBlending
	}) );
	plane1.position.x = -0.33;
	plane1.position.z = -0.5;
	
	var plane2 = new THREE.Mesh( new THREE.PlaneGeometry(1,1), new THREE.MeshBasicMaterial(
	{
		//color: 0x00ff00,
		map: fire,
		depthTest: true,
		depthWrite: false,
		transparent: true,
		blending: THREE.AdditiveBlending
	}) );
	
	var plane3 = new THREE.Mesh( new THREE.PlaneGeometry(1,1), new THREE.MeshBasicMaterial({
		map: plasma,
		color: 0x0000ff,
		depthtest:true,
		depthWrite: false,
		transparent: true,
		blending: THREE.AdditiveBlending
	}) );
	plane3.position.x = 0.33;
	plane3.position.z = 0.5;
	
	Scene.add(plane1);
	Scene.add(plane2);
	Scene.add(plane3);
	
	plane1.renderDepth = 30; 
	plane2.renderDepth = 10;
	plane3.renderDepth = 20;
	
	update();
});
	
function update()
{
	Renderer.setClearColor(0x000000, 1.0);
	Renderer.render(Scene, Camera);
	requestAnimationFrame(update);
}