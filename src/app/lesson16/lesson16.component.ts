import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as dat from 'lil-gui';
import { Mesh, MeshBasicMaterial, PointLight } from 'three';
import { fromEvent, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-lesson16',
  templateUrl: './lesson16.component.html',
  styleUrls: ['./lesson16.component.scss']
})
export class Lesson16Component implements OnInit, AfterViewInit, OnDestroy {
  unsubscribe: Subject<void> = new Subject<void>();
  @ViewChild('canvas', {static: false}) canvas!: ElementRef;
  scene = new THREE.Scene();
  gui = new dat.GUI();
  material!: THREE.MeshBasicMaterial;
  sphere!: THREE.Mesh;
  plane!: THREE.Mesh;
  size!: {width: number, height: number};
  camera!: THREE.PerspectiveCamera;
  renderer!: THREE.WebGLRenderer;
  ambientLight!: THREE.AmbientLight;
  light!: THREE.DirectionalLight;
  spotlight!: THREE.SpotLight;
  pointLight!: THREE.PointLight;
  controls!: OrbitControls;
  sphereShadow!: THREE.Mesh;
  sphereShadowMaterial!: THREE.MeshBasicMaterial;
  change!: { bake: boolean, simple: boolean };

  constructor() { }

  ngOnDestroy(): void {
    this.gui.hide();
    this.gui.destroy();
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  ngAfterViewInit(): void {
    const textureLoader = new THREE.TextureLoader();
    const bakeShadow = textureLoader.load('/assets/textures/shadows/bakedShadow.jpg');
    const simpleShadow = textureLoader.load('/assets/textures/shadows/simpleShadow.jpg');
    this.sphere = new THREE.Mesh(new THREE.SphereBufferGeometry(0.5, 20, 20), new THREE.MeshStandardMaterial());
    this.plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(10, 10, 5), new THREE.MeshStandardMaterial());
    this.size = {width: window.innerWidth, height: window.innerHeight};

    this.sphere.position.y = 0.5;
    this.plane.rotation.x = - Math.PI * 0.5;
    const sphereGui = this.gui.addFolder('sphere');
    const ambientLightGui = this.gui.addFolder('ambient light');
    const directionalGui = this.gui.addFolder('directional light');
    const spotlightGui = this.gui.addFolder('spotlight');
    const pointLightGui = this.gui.addFolder('point light');
    const textureLightGui = this.gui.addFolder('texture light');
    // this.gui.add(this.plane.rotation, 'x', 0, Math.PI * 2, 0.001);
    // this.gui.add(this.plane.rotation, 'y', 0, Math.PI * 2, 0.001);
    // this.gui.add(this.plane.rotation, 'z', 0, Math.PI * 2, 0.001);
    this.camera = new THREE.PerspectiveCamera(65, this.size.width/this.size.height, 1, 100);
    this.camera.position.set(0, 1.5, -5);
    this.scene.add(this.sphere, this.plane);
    this.scene.add(this.camera);
    this.controls = new OrbitControls(this.camera, this.canvas.nativeElement);
    this.renderer = new THREE.WebGLRenderer({canvas: this.canvas.nativeElement});
    this.renderer.setSize(this.size.width, this.size.height);

    // ambient light
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(this.ambientLight);

    // directional light shadow
    this.light = new THREE.DirectionalLight(0xffffff, 0.01);
    this.scene.add(this.light);
    this.light.position.set(1.64, 3.12, -5.98);
    this.light.castShadow = true;
    this.light.shadow.camera.top = 5;

    const directionalShadowCameraHelper = new THREE.CameraHelper(this.light.shadow.camera);
    directionalShadowCameraHelper.visible = false;
    this.scene.add(directionalShadowCameraHelper);
    const directionalLightHelper = new THREE.DirectionalLightHelper(this.light);
    directionalLightHelper.visible = false;
    this.scene.add(directionalLightHelper);

    // spotlight shadow
    this.spotlight = new THREE.SpotLight(0xffffff, 0.02, 10, Math.PI * 0.3);
    this.scene.add(this.spotlight);
    this.spotlight.castShadow = true;
    this.spotlight.shadow.mapSize.set(1024,1024);
    this.spotlight.shadow.camera.fov = 60;
    this.spotlight.shadow.camera.near = 1;
    this.spotlight.shadow.camera.far = 6;

    const spotlightHelper = new THREE.SpotLightHelper(this.spotlight);
    spotlightHelper.visible = false;
    this.scene.add(spotlightHelper);
    const spotlightShowdowCameraHelper = new THREE.CameraHelper(this.spotlight.shadow.camera);
    spotlightShowdowCameraHelper.visible = false;
    this.scene.add(spotlightShowdowCameraHelper);


    // point light
    this.pointLight = new THREE.PointLight(0xffffff, 0.1);
    this.pointLight.position.y = 2;
    this.pointLight.position.x = -1;
    this.pointLight.castShadow = true;
    this.scene.add(this.pointLight);

    const pointLightHelper = new THREE.PointLightHelper(this.pointLight);
    pointLightHelper.visible = false;
    this.scene.add(pointLightHelper);
    const pointLightShadowCamera = new THREE.CameraHelper(this.pointLight.shadow.camera);
    pointLightShadowCamera.visible = false;
    this.scene.add(pointLightShadowCamera);
    this.sphereShadowMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      alphaMap: simpleShadow
    });
    this.sphereShadow = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(1.5, 1.5),
      this.sphereShadowMaterial);
    this.sphereShadow.rotation.x = - Math.PI * 0.5;
    this.sphereShadow.position.y = this.plane.position.y + 0.001;
    this.scene.add(this.sphereShadow);

    sphereGui.add(this.sphere.position, 'x', -10, 10, 0.01);
    sphereGui.add(this.sphere.position, 'y', 0.5, 10, 0.01);
    sphereGui.add(this.sphere.position, 'z', -3.5, 1, 0.01);
    ambientLightGui.add(this.ambientLight, 'intensity', 0, 1, 0.01);
    // directionalGui.add(directionalLightHelper, 'visible');
    directionalGui.add(directionalShadowCameraHelper, 'visible');
    directionalGui.add(this.light, 'intensity', 0, 1, 0.01);
    directionalGui.add(this.light.position, 'x', -10, 10, 0.01);
    directionalGui.add(this.light.position, 'y', -10, 10, 0.01);
    directionalGui.add(this.light.position, 'z', -10, 10, 0.01);

    // directionalGui.add(this.light.shadow.camera, 'top', -10, 10, 0.01);
    // directionalGui.add(this.light.shadow.camera, 'bottom', -10, 10, 0.01);
    // directionalGui.add(this.light.shadow.camera, 'left', -10, 10, 0.01);
    // directionalGui.add(this.light.shadow.camera, 'right', -10, 10, 0.01);
    // spotlightGui.add(spotlightHelper, 'visible');
    spotlightGui.add(spotlightShowdowCameraHelper, 'visible');
    spotlightGui.add(this.spotlight, 'intensity', 0, 1, 0.01);
    spotlightGui.add(this.spotlight.position, 'x', -10, 10, 0.01);
    spotlightGui.add(this.spotlight.position, 'y', -10, 10, 0.01);
    spotlightGui.add(this.spotlight.position, 'z', -10, 10, 0.01);

    // spotlightGui.add(this.spotlight.shadow.camera, 'top', -10, 10, 0.01);
    // spotlightGui.add(this.spotlight.shadow.camera, 'bottom', -10, 10, 0.01);
    // spotlightGui.add(this.spotlight.shadow.camera, 'left', -10, 10, 0.01);
    // spotlightGui.add(this.spotlight.shadow.camera, 'right', -10, 10, 0.01);
    // pointLightGui.add(pointLightHelper, 'visible');
    pointLightGui.add(pointLightShadowCamera, 'visible');
    pointLightGui.add(this.pointLight, 'intensity', 0, 1, 0.01);
    pointLightGui.add(this.pointLight.position, 'x', -10, 10, 0.01);
    pointLightGui.add(this.pointLight.position, 'y', -10, 10, 0.01);
    pointLightGui.add(this.pointLight.position, 'z', -10, 10, 0.01);

    this.change = {bake: false, simple: false};
    textureLightGui.add(this.change, 'bake').onChange((v: boolean) => {
      if (v) {
        this.plane.material = new THREE.MeshBasicMaterial({map: bakeShadow});
        this.sphere.position.set(0, 0.5, 0);
      } else {
        this.plane.material = new THREE.MeshStandardMaterial();
      }
    });
    textureLightGui.add(this.change, 'simple').onChange((v: boolean) => {
      this.sphereShadow.visible = v;
    });
    this.sphere.castShadow = true;
    this.plane.receiveShadow = true;
    this.renderer.shadowMap.enabled = true;
    const clock = new THREE.Clock();
    clock.getDelta();
    this.tick(clock);
    fromEvent(window, 'resize').pipe(takeUntil(this.unsubscribe)).subscribe(() => {
      this.updateWindowSize();
      this.updateCameraSizeRatio();
      this.updateRendererSizeRatio();
    });
  }

  updateWindowSize() {
    this.size = {width: window.innerWidth, height: window.innerHeight};
  }

  updateCameraSizeRatio() {
    this.camera.aspect = this.size.width/this.size.height;
    this.camera.updateProjectionMatrix();
  }

  updateRendererSizeRatio() {
    this.renderer.setSize(this.size.width, this.size.height);
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
  }

  ngOnInit(): void {
  }

  tick(clock: THREE.Clock) {
    const delta = clock.getElapsedTime();
    if (!this.change.bake) {
      this.sphere.position.x = Math.cos(delta) * 1.5;
      this.sphere.position.z = Math.sin(delta) * 1.5;
      this.sphere.position.y = Math.abs(Math.sin(delta * 2) * 1) + 0.5;
      this.sphereShadow.position.x = this.sphere.position.x;
      this.sphereShadow.position.z = this.sphere.position.z;
      (this.sphereShadow.material as MeshBasicMaterial).opacity  = (1 - this.sphere.position.y) * 4;
    }
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(() => this.tick(clock));
  }

}
