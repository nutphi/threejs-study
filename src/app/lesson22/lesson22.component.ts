import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as CANNON from 'cannon';
import GUI from 'lil-gui';
import { Subject } from 'rxjs';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
@Component({
  selector: 'app-lesson22',
  templateUrl: './lesson22.component.html',
  styleUrls: ['./lesson22.component.scss']
})
export class Lesson22Component implements OnInit, AfterViewInit, OnDestroy {
  world!: CANNON.World;
  sphere!: CANNON.Shape;
  plane!: CANNON.Plane;
  body: {[key: string] : CANNON.Body } = {};


  controls!: OrbitControls;

  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  cameraGroup!: THREE.Group;
  renderer!: THREE.WebGLRenderer;
  sizes!: { width: number; height: number };
  meshes: {[key: string] :THREE.Mesh } = {};
  meshToonMaterial!: THREE.MeshToonMaterial;
  gui!: GUI;
  directionalLight!: THREE.DirectionalLight;
  clock!: THREE.Clock;
  unsubscribe: Subject<void> = new Subject();
  textureLoader!: THREE.TextureLoader;
  constructor() { }
  ngOnDestroy(): void {
    this.gui?.hide();
    this.gui?.destroy();
  }

  ngAfterViewInit(): void {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas.nativeElement });
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // this.renderer.setClearColor(0xffffff, 1);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.clock = new THREE.Clock();
    this.animate();
  }

  ngOnInit(): void {
    this.scene = new THREE.Scene();
    this.sizes = { width: window.innerWidth, height: window.innerHeight };
    this.textureLoader = new THREE.TextureLoader();
    this.meshToonMaterial = new THREE.MeshToonMaterial({
      color: 0xffffff,
      gradientMap: this.textureLoader.load('/assets/textures/gradients/5.jpg'),
      side: THREE.DoubleSide
    });
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 15, 10);
    this.camera.rotation.y = Math.PI / 4;
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.cameraGroup = new THREE.Group();
    this.cameraGroup.add(this.camera);
    this.scene.add(this.cameraGroup);
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    this.directionalLight.position.set(0, 1, 0);
    this.directionalLight.castShadow = true;
    this.scene.add(this.directionalLight);
    this.gui = new GUI();
    this.gui.add(this.directionalLight, 'intensity', 0, 10);
    this.initCannon();
    this.initMeshes();
    
  }

  initCannon() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.82, 0);

    const concreteMaterial = new CANNON.Material('concreteMaterial');
    const plasticMaterial = new CANNON.Material('plasticMaterial');
    const groundContactMaterial = new CANNON.ContactMaterial(
      concreteMaterial,
      plasticMaterial,
      {
        friction: 1,
        restitution: 0.0001,
      }
    );
    this.world.addContactMaterial(groundContactMaterial);

    this.sphere = new CANNON.Sphere(0.5);
    this.body['sphere'] = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(0.5, 3, 0),
      shape: this.sphere,
      material: plasticMaterial
    });
    this.body['sphere2'] = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(0, 4, 0),
      shape: this.sphere,
      material: plasticMaterial
    });
    this.body['sphere3'] = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(0.5, 5, 0.5),
      shape: this.sphere,
      material: plasticMaterial
    });
    this.body['sphere4'] = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(0, 6, 0.5),
      shape: this.sphere,
      material: plasticMaterial
    });
    const box = new CANNON.Box(new CANNON.Vec3(0.5, 10, 10));
    this.body['box'] = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(-5, 0, 0),
      shape: box,
      material: concreteMaterial
    });
    const box2 = new CANNON.Box(new CANNON.Vec3(0.5, 10, 10));
    this.body['box2'] = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(5, 0, 0),
      shape: box2,
      material: concreteMaterial
    });
    this.plane = new CANNON.Plane();
    this.body['plane'] = new CANNON.Body({
      mass: 0,
      shape: this.plane,
      material: concreteMaterial
    });
    this.body['plane'].quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)

    // this.body['plane2'] = new CANNON.Body({
    //   mass: 0,
    //   shape: this.plane,
    //   material: concreteMaterial
    // });
    // this.body['plane2'].position.z = 15;

    // this.body['plane3'] = new CANNON.Body({
    //   mass: 0,
    //   shape: this.plane,
    //   material: concreteMaterial
    // });
    // this.body['plane3'].position.z = -15;
    // this.body['plane2'].quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)

    this.world.addBody(this.body['plane']);
    this.world.addBody(this.body['box']);
    this.world.addBody(this.body['box2']);
    // this.world.addBody(this.body['plane3']);
    this.world.addBody(this.body['sphere']);
    this.world.addBody(this.body['sphere2']);
    this.world.addBody(this.body['sphere3']);
    this.world.addBody(this.body['sphere4']);
  }

  initMeshes() {
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const sphere = new THREE.Mesh(geometry, this.meshToonMaterial);
    sphere.castShadow = true;
    const sphere2 = new THREE.Mesh(geometry, this.meshToonMaterial);
    sphere2.castShadow = true;
    const sphere3 = new THREE.Mesh(geometry, this.meshToonMaterial);
    sphere3.castShadow = true;
    const sphere4 = new THREE.Mesh(geometry, this.meshToonMaterial);
    sphere4.castShadow = true;
    const plane = new THREE.PlaneGeometry(100, 100, 32);
    const planeMesh = new THREE.Mesh(plane, this.meshToonMaterial);
    planeMesh.receiveShadow = true;
    planeMesh.rotation.x = Math.PI / 2;
    sphere.position.set(0.5, 3, 0);
    sphere2.position.set(0, 4, 0);
    sphere3.position.set(0.5, 5, 0.5);
    sphere4.position.set(0, 6, 0.5);

    const box = new THREE.BoxGeometry(0.5, 10, 10);
    const boxMesh = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color: 0x00ff88 }));
    const boxMesh2 = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color: 0x00ff88 }));
    const boxMesh3 = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color: 0x00ff88 }));
    const boxMesh4 = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color: 0x00ff88 }));
    boxMesh.position.set(5, 0, 0);
    boxMesh2.position.set(-5, 0, 0);
    boxMesh3.position.set(0, 0, 5);
    boxMesh3.rotation.y = Math.PI / 2;
    boxMesh4.position.set(0, 0, -5);
    boxMesh4.rotation.y = Math.PI / 2;
    boxMesh.castShadow = true;
    boxMesh2.castShadow = true;
    boxMesh3.castShadow = true;
    boxMesh4.castShadow = true;
    this.meshes= { sphere, sphere2, sphere3, sphere4, planeMesh, boxMesh, boxMesh2, boxMesh3, boxMesh4 };
    this.scene.add(sphere, sphere2, sphere3, sphere4, planeMesh, boxMesh, boxMesh2, boxMesh3, boxMesh4);
  }

  animate() {
    this.controls.update();
    const deltaTime = this.clock.getDelta();
    this.world.step(1 / 60, deltaTime, 3);
    this.meshes['sphere'].position.copy({ ... this.body['sphere'].position } as THREE.Vector3);
    this.meshes['sphere2'].position.copy({ ... this.body['sphere2'].position } as THREE.Vector3);
    this.meshes['sphere3'].position.copy({ ... this.body['sphere3'].position } as THREE.Vector3);
    this.meshes['sphere4'].position.copy({ ... this.body['sphere4'].position } as THREE.Vector3);
    // this.cameraGroup.quaternion.copy({ ... this.body.quaternion } as THREE.Quaternion);
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => this.animate());
  }

}
