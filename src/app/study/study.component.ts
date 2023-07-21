import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import * as CANNON from 'cannon';
import GUI from 'lil-gui';
import { fromEvent } from 'rxjs';
import * as THREE from 'three';
import { PlaneBufferGeometry } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

@Component({
  selector: 'app-study',
  templateUrl: './study.component.html',
  styleUrls: ['./study.component.scss']
})
export class StudyComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  camera!: THREE.PerspectiveCamera;
  sizes!: {width: number, height: number};
  renderer!: THREE.WebGLRenderer;

  scene!: THREE.Scene;
  geometry!: THREE.SphereBufferGeometry;
  cubeGeometry!: THREE.BoxBufferGeometry;
  material!: THREE.MeshStandardMaterial;
  clock!: THREE.Clock;
  ground!: THREE.Mesh;
  sphere!: THREE.Mesh;
  controls!: OrbitControls;
  ambientLight!: THREE.AmbientLight;

  world!: CANNON.World;
  cGround!: CANNON.Body;
  cSphere!: CANNON.Body;

  spheres: {body: CANNON.Body, mesh: THREE.Mesh}[] = [];
  cubes: {body: CANNON.Body, mesh: THREE.Mesh}[] = [];

  plastic = new CANNON.Material('plastic');
  concrete = new CANNON.Material('concrete');
  plasticContactMaterial = new CANNON.ContactMaterial(
    this.plastic,
    this.plastic,
    {
        friction: 0.1,
        restitution: 0.8
    }
  )

  concretePlasticContactMaterial = new CANNON.ContactMaterial(
    this.concrete,
    this.plastic,
    {
        friction: 0.1,
        restitution: 0.2
    }
  )
  gui: GUI = new GUI();
  textureLoader: THREE.TextureLoader = new THREE.TextureLoader();
  cubeTextureLoader: THREE.CubeTextureLoader = new THREE.CubeTextureLoader();
  cubeTexture!: THREE.CubeTexture;
  directionalLight!: THREE.DirectionalLight;
  oldElapsedTime: number = 0;
  hitSound = new Audio('assets/sounds/hit.mp3')
  constructor() { }
  ngOnDestroy(): void {
    this.gui.hide();
    this.gui.destroy();
  }

  ngOnInit(): void {
    this.gui.add(this, 'create sphere');
    this.gui.add(this, 'create cube');
    this.gui.add(this, 'reset');
  }

  playSound(collision: CANNON.ICollisionEvent) {
    const loud = collision.contact.getImpactVelocityAlongNormal();
    console.log(loud);
    if (loud > 1) {
      this.hitSound.volume = loud / 10;
      this.hitSound.currentTime = 0;
      this.hitSound.play();
    }

  }

  reset(): void {
    for( let obj of this.spheres ) {
      obj.body.removeEventListener('collide', this.playSound);
      this.world.remove(obj.body);
      this.scene.remove(obj.mesh);
    }
    this.spheres.splice(0, this.spheres.length);
    for( let obj of this.cubes ) {
      obj.body.removeEventListener('collide', this.playSound);
      this.world.remove(obj.body);
      this.scene.remove(obj.mesh);
    }
    this.cubes.splice(0, this.spheres.length);
  }

  'create cube'(): void {
    const radius = Math.random() * 0.5;
    const x = Math.random() * 5;
    const z = Math.random() * 5;
    const y = Math.random() * 5;

    const body = new CANNON.Body({
      mass: 1,
      shape: new CANNON.Box(new CANNON.Vec3(radius/2,radius/2,radius/2)),
      position: new CANNON.Vec3(x,y,z),
      material: this.plastic
    })
    body.addEventListener('collide', this.playSound.bind(this));
    this.world.addBody(body);
    const mesh = new THREE.Mesh(this.cubeGeometry, this.material);
    mesh.scale.set(radius, radius, radius);
    mesh.castShadow = true;
    this.scene.add(mesh);
    this.cubes.push({mesh, body});
  }

  'create sphere'(): void {
    const radius = Math.random() * 0.5;
    const x = (Math.random() - 0.5) * 5;
    const z = (Math.random() - 0.5) * 5;
    const y = Math.random() * 5;

    const body = new CANNON.Body({
      mass: 1 * radius,
      shape: new CANNON.Sphere(radius),
      position: new CANNON.Vec3(x,y,z),
      material: this.plastic
    })
    body.addEventListener('collide', this.playSound.bind(this));
    this.world.addBody(body);
    const mesh = new THREE.Mesh(this.geometry, this.material);
    mesh.scale.set(radius, radius, radius);
    mesh.castShadow = true;
    this.scene.add(mesh);
    this.spheres.push({mesh, body});
  }

  ngAfterViewInit(): void {
    this.cannonInit();
    this.threeInit();

    this.gui.add(this.cGround.position, 'x', 0, 5, 0.1);
    this.gui.add(this.cGround.position, 'y', 0, 5, 0.1);
    this.gui.add(this.cGround.position, 'z', 0, 5, 0.1);
    this.clock.getDelta();
    this.animate();
  }

  cannonInit(): void {
    this.world = new CANNON.World();
    this.world.addContactMaterial(this.concretePlasticContactMaterial);
    this.world.addContactMaterial(this.plasticContactMaterial);
    this.world.gravity.set(0, -9.82, 0);
    this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    this.world.allowSleep = true;
    this.cGround = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Plane(),
      position: new CANNON.Vec3(1,0,0),
      material: this.concrete
    });
    this.cGround.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), - Math.PI / 2);
    this.world.addBody(this.cGround);
  }

  threeInit(): void {
    this.scene = new THREE.Scene();
    this.sizes = {width: window.innerWidth, height: window.innerHeight};
    this.camera = new THREE.PerspectiveCamera(65, this.sizes.width/this.sizes.height, 1, 100);
    this.camera.position.set(0, 2, -10);
    this.renderer = new THREE.WebGLRenderer({canvas: this.canvas.nativeElement});
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // shadow
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.ground = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshStandardMaterial({color: 'white'}));
    this.ground.position.set(0,0,0);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = true;

    
    this.ambientLight = new THREE.AmbientLight('white', 0.5);
    this.directionalLight = new THREE.DirectionalLight('blue', 1);
    this.directionalLight.castShadow = true;
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.geometry = new THREE.SphereBufferGeometry(1, 30, 30);
    this.cubeGeometry = new THREE.BoxBufferGeometry(1, 1, 1);
    this.cubeTexture = this.cubeTextureLoader.load([
      'assets/textures/environmentMaps/0/px.jpg',
      'assets/textures/environmentMaps/0/nx.jpg',
      'assets/textures/environmentMaps/0/py.jpg',
      'assets/textures/environmentMaps/0/ny.jpg',
      'assets/textures/environmentMaps/0/pz.jpg',
      'assets/textures/environmentMaps/0/nz.jpg',
    ])
    this.material = new THREE.MeshStandardMaterial({
      metalness: 0.3,
      roughness: 0.4,
      envMap: this.cubeTexture,
      envMapIntensity: 0.5      
    });

    fromEvent(window, 'resize').subscribe(() => {
      // set width height sizes
      this.sizes.width = window.innerWidth;
      this.sizes.height = window.innerHeight;

      // update camera
      this.camera.aspect = this.sizes.width/this.sizes.height;
      this.camera.updateProjectionMatrix();

      // update renderer size and pixel ratio
      this.renderer.setSize(this.sizes.width, this.sizes.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    });
    this.clock = new THREE.Clock();
    this.scene.add(this.ground, this.ambientLight, this.directionalLight);
  }

  animate(): void {
    // const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();
    const deltaTime = elapsedTime - this.oldElapsedTime;
    this.oldElapsedTime = elapsedTime
    this.controls.update();
    this.world.step(1 / 60, deltaTime, 3);
    for (let sphere of this.spheres) {
      sphere.mesh.position.copy({... sphere.body.position} as THREE.Vector3);
      sphere.mesh.quaternion.copy({... sphere.body.quaternion} as THREE.Quaternion);
    }
    for (let cube of this.cubes) {
      cube.mesh.position.copy({... cube.body.position} as THREE.Vector3);
      cube.mesh.quaternion.copy({... cube.body.quaternion} as THREE.Quaternion);
    }
    this.ground.position.copy({... this.cGround.position} as THREE.Vector3);
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(() => this.animate());
  }
}
