import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { DirectionalLightHelper, Vector3, WebGLRenderer } from 'three';
import GUI from 'lil-gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { fromEvent, Subject, takeUntil } from 'rxjs';
@Component({
  selector: 'app-lesson15',
  templateUrl: './lesson15.component.html',
  styleUrls: ['./lesson15.component.scss']
})
export class Lesson15Component implements OnInit, AfterViewInit {
  material!: THREE.Material;
  sphere!: THREE.SphereBufferGeometry;
  box!: THREE.BoxBufferGeometry;
  torus!: THREE.TorusBufferGeometry;
  plane!: THREE.PlaneBufferGeometry;

  sphereMesh!: THREE.Mesh;
  boxMesh!: THREE.Mesh;
  torusMesh!: THREE.Mesh;
  planeMesh!: THREE.Mesh;

  sizes!: {width: number, height: number};
  camera!: THREE.PerspectiveCamera;
  scene!: THREE.Scene;
  renderer!: WebGLRenderer;
  gui: GUI = new GUI();
  controls!: OrbitControls;

  unsubscribe: Subject<void> = new Subject<void>();
  @ViewChild('canvas', {static: false}) canvas!: ElementRef;
  constructor() { }

  updateWindowSize() {
    this.sizes = {width: window.innerWidth, height: window.innerHeight};
  }

  updateCameraSizeRatio() {
    this.camera.aspect = this.sizes.width/this.sizes.height;
    this.camera.updateProjectionMatrix();
  }

  updateRendererSizeRatio() {
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
  }

  updateLight() {
    // const ambientLight = new THREE.AmbientLight(0x00ff00, 0.5);
    const pointLight = new THREE.PointLight(0xfc00cf, 0.5, 1);
    pointLight.position.x = 1.5;
    pointLight.position.y = 0;
    // this.gui.add(ambientLight, 'intensity').max(1).min(0).step(0.001);
    // this.gui.addColor(ambientLight, 'color');
    // this.scene.add(ambientLight);
    this.scene.add(pointLight);
    const directionLight = new THREE.DirectionalLight(0x00ff00, 0.3);
    directionLight.position.set(1.5, 1.25, -2);
    this.scene.add(directionLight);
    // const rectareaLight = new THREE.RectAreaLight('yellow', 1, 4 ,4);
    // rectareaLight.position.z = 1;
    // rectareaLight.position.y = 0;
    // this.scene.add(rectareaLight);
    // const hemisphereLight = new THREE.HemisphereLight(0xff0000, 0x00ff00, 0.3);
    // this.scene.add(hemisphereLight);
    // 
    
    // const spotlight = new THREE.SpotLight('red', 1, 10, Math.PI * 0.1, 0, 0.5);
    
    // const spotlighthelper = new THREE.SpotLightHelper(spotlight);
    // (0x78ff00, 0.5, 10, Math.PI * 0.1, 0.25, 1);
    // this.scene.add(spotlight);
    // this.scene.add(spotlighthelper);
    // spotlight.position.set(0, 2, -3);
    // window.requestAnimationFrame(() => {
    //   spotlight.target.position.x = 3;
    //   // console.log(mesh?.position);
    //   // spotlight.target.lookAt(mesh?.position || new Vector3());
    // });
    
    
    
    // this.scene.add(spotlight.target);
  }

  udpateLightWithShadow() {
    const directionLight = new THREE.DirectionalLight(0xffffff, 0.4);
    directionLight.position.set(2.9, 3.6, -0.8);
    this.gui.add(directionLight.position, 'x', -10, 10, 0.1);
    this.gui.add(directionLight.position, 'y', -10, 10, 0.1);
    this.gui.add(directionLight.position, 'z', -10, 10, 0.1);
    directionLight.castShadow = true;
    directionLight.shadow.mapSize.set(2048,2048);
    directionLight.shadow.camera.near = 1
    directionLight.shadow.camera.far = 10;
    directionLight.shadow.camera.top = 10;
    directionLight.shadow.camera.bottom = -2;
    directionLight.shadow.camera.left = 10;
    directionLight.shadow.camera.right = -10;
    this.gui.add(directionLight.shadow.camera, 'near', -10, 10, 0.1);
    this.gui.add(directionLight.shadow.camera, 'far', -10, 10, 0.1);
    this.gui.add(directionLight.shadow.camera, 'top', -10, 10, 0.1);
    this.gui.add(directionLight.shadow.camera, 'left', -10, 10, 0.1);
    this.gui.add(directionLight.shadow.camera, 'right', -10, 10, 0.1);
    // directionLight.shadow.camera.bottom = -50;
    this.sphereMesh.castShadow = true;
    this.torusMesh.castShadow = true;
    this.boxMesh.castShadow = true;
    this.planeMesh.receiveShadow = true;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const directionalLightCameraHelper = new THREE.CameraHelper(directionLight.shadow.camera);
    directionalLightCameraHelper.visible = false;
    const helper = new THREE.DirectionalLightHelper(directionLight);
    this.scene.add(helper);
    this.scene.add(directionalLightCameraHelper);
    this.scene.add(directionLight);
  }

  ngAfterViewInit(): void {
    this.updateWindowSize();
    
    this.box = new THREE.BoxBufferGeometry(1, 1, 1);
    this.sphere = new THREE.SphereBufferGeometry(1, 11, 11);
    this.torus = new THREE.TorusBufferGeometry(0.6, 0.3, 50, 100);
    this.plane = new THREE.PlaneBufferGeometry(15, 15);
    this.material = new THREE.MeshStandardMaterial();
    this.scene = new THREE.Scene();

    

    this.camera = new THREE.PerspectiveCamera(65, this.sizes.width/this.sizes.height);
    this.camera.position.z = -3;
    this.camera.position.y = 1;

    this.boxMesh = new THREE.Mesh(this.box, this.material);
    this.boxMesh.position.x = -3;
    this.sphereMesh = new THREE.Mesh(this.sphere, this.material);
    this.torusMesh = new THREE.Mesh(this.torus, this.material);
    this.torusMesh.position.x = 3;
    this.planeMesh = new THREE.Mesh(this.plane, this.material);
    this.planeMesh.position.y = -0.9;
    this.planeMesh.rotation.y = Math.PI;
    this.planeMesh.rotation.x = Math.PI / 2;

    // this.updateLight();
    
    this.scene.add(this.boxMesh, this.sphereMesh, this.torusMesh, this.planeMesh, this.camera);
    this.renderer = new WebGLRenderer({canvas: this.canvas.nativeElement});
    this.udpateLightWithShadow();
    this.controls = new OrbitControls(this.camera, this.canvas.nativeElement);
    this.updateRendererSizeRatio();
    const clock = new THREE.Clock();
    clock.getDelta();
    this.tick(clock);
    fromEvent(window, 'resize').pipe(takeUntil(this.unsubscribe)).subscribe(() => {
      this.updateWindowSize();
      this.updateCameraSizeRatio();
      this.updateRendererSizeRatio();
    });
    
  }

  tick(clock: THREE.Clock) {
    const delta = clock.getDelta();
    this.sphere.rotateX(Math.random() * delta);
    this.sphere.rotateY(Math.random() * delta);
    this.box.rotateX(Math.random() * delta);
    this.box.rotateY(Math.random() * delta);
    this.torus.rotateX(Math.random() * delta);
    this.torus.rotateY(Math.random() * delta);
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(() => this.tick(clock));
  }

  ngOnInit(): void {
  }

}
