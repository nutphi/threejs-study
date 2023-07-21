import { AfterViewInit, Component, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import GUI from 'lil-gui';
import { WebGLRenderer } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

@Component({
  selector: 'app-lesson25',
  templateUrl: './lesson25.component.html',
  styleUrls: ['./lesson25.component.scss']
})
export class Lesson25Component implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  gltfLoader = new GLTFLoader();
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  sphereGeometry = new THREE.SphereGeometry(1, 30, 30);
  planeGeometry = new THREE.PlaneBufferGeometry(10, 10);
  sphereMaterial = new THREE.MeshStandardMaterial({
    // metalness: 0.3,
    // roughness: 0.4,
    // envMap: this.environmentMapTexture,
    // envMapIntensity: 0.5
  });
  planeMaterial = new THREE.MeshStandardMaterial({ color: 'white' });
  sphere = new THREE.Mesh(this.sphereGeometry, this.sphereMaterial);
  plane = new THREE.Mesh(this.planeGeometry, this.planeMaterial);
  directionalLight = new THREE.DirectionalLight('white', 3);
  cameraHelper!:THREE.CameraHelper;
  renderer!: WebGLRenderer;
  size = new WindowSize();
  control!: OrbitControls;
  gui = new GUI();
  debugObject = {
    envMapIntensity: 5
  };

  // environmentMapTexture = new THREE.CubeTextureLoader().load([
  //   './assets/textures/environmentMaps/0/px.jpg',
  //   './assets/textures/environmentMaps/0/nx.jpg',
  //   './assets/textures/environmentMaps/0/py.jpg',
  //   './assets/textures/environmentMaps/0/ny.jpg',
  //   './assets/textures/environmentMaps/0/pz.jpg',
  //   './assets/textures/environmentMaps/0/nz.jpg'
  // ]);
  environmentMapTextures = [
    this.getEnvironmentMapTexture(0),
    this.getEnvironmentMapTexture(1),
    this.getEnvironmentMapTexture(2),
    this.getEnvironmentMapTexture(3),
    // this.getEnvironmentMapTexture(4),
  ]

  getEnvironmentMapTexture(i: number): THREE.CubeTexture {
    return new THREE.CubeTextureLoader().load([
      `./assets/textures/environmentMaps/${i}/px.jpg`,
      `./assets/textures/environmentMaps/${i}/nx.jpg`,
      `./assets/textures/environmentMaps/${i}/py.jpg`,
      `./assets/textures/environmentMaps/${i}/ny.jpg`,
      `./assets/textures/environmentMaps/${i}/pz.jpg`,
      `./assets/textures/environmentMaps/${i}/nz.jpg`
    ]);
  }
  params = {
    texture: 0
  }

  constructor() { }

  ngOnDestroy(): void {
    this.gui.hide();
    this.gui?.destroy();
  }

  ngAfterViewInit(): void {
    this.environmentMapTextures[0].encoding = THREE.sRGBEncoding;
    this.environmentMapTextures[1].encoding = THREE.sRGBEncoding;
    this.environmentMapTextures[2].encoding = THREE.sRGBEncoding;
    this.environmentMapTextures[3].encoding = THREE.sRGBEncoding;
    // this.environmentMapTextures[4].encoding = THREE.sRGBEncoding;
    this.scene.background = this.environmentMapTextures[0];
    this.scene.environment = this.environmentMapTextures[0];
    this.camera.position.set(0, 2, 3);
    this.plane.rotation.x = Math.PI * -0.5;
    this.sphere.position.y = 1;
    this.directionalLight.position.set(0.25, 3, -2.25);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.camera.far = 10;
    this.directionalLight.shadow.mapSize.set(1024,1024);
    this.directionalLight.shadow.normalBias = 0.05;
    
    // this.cameraHelper = new THREE.CameraHelper(this.directionalLight.shadow.camera);
    // this.scene.add(this.cameraHelper);
    // , this.sphere, this.plane
    this.scene.add(this.camera, this.directionalLight);
    
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('./assets/draco/');
    
    this.gltfLoader.setDRACOLoader(dracoLoader);
    /**
     * models
     */
    this.gltfLoader.load(
    // './assets/models/FlightHelmet/glTF/FlightHelmet.gltf',
    './assets/models/hamburger.glb',
    (gltf) => {
      const helmet = gltf.scene;
      helmet.scale.set(0.5, 0.5, 0.5);
      helmet.position.set(0, -2, 0);
      helmet.rotation.y = Math.PI * 0.25;
      this.scene.add(helmet);
      this.gui.add(helmet.rotation, 'y', 0, Math.PI * 2, 0.001).name('rotation');
      this.updateAllMaterial();
    }
  );
  this.gui.add(this.params, 'texture', 0, 4, 1).name('texture').onChange((i: number) => {
    this.scene.matrixWorldNeedsUpdate = true;
    this.scene.environment = this.environmentMapTextures[i];
    this.scene.background = this.environmentMapTextures[i];
  });
    this.gui.add(this.directionalLight, 'intensity', 0, 10, 0.0001).name('light intensity');
    this.gui.add(this.directionalLight.position, 'x', -5, 5, 0.001).name('light x');
    this.gui.add(this.directionalLight.position, 'y', -5, 5, 0.001).name('light y');
    this.gui.add(this.directionalLight.position, 'z', -5, 5, 0.001).name('light z');
    this.gui.add(this.debugObject, 'envMapIntensity', 0, 10, 0.001).name('envMapIntensity').onChange(this.updateAllMaterial.bind(this));
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas.nativeElement, antialias: true });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 3;

    this.gui.add(this.renderer, 'toneMappingExposure', 0, 10, 0.001).name('toneMappingExposure');
    this.gui.add(this.renderer, 'toneMapping', {
      No: THREE.NoToneMapping,
      Liner: THREE.LinearToneMapping,
      Reinhard: THREE.ReinhardToneMapping,
      Cineon: THREE.CineonToneMapping,
      ASESFilmic: THREE.ACESFilmicToneMapping
    })
    .onFinishChange(() => {
      this.renderer.toneMapping = Number(this.renderer.toneMapping);
      this.updateAllMaterial();
    })


    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.physicallyCorrectLights = true;
    // this.directionalLight.castShadow = true;
    // this.plane.castShadow = true;
    // this.plane.receiveShadow = true;
    // this.sphere.castShadow = true;
    // this.sphere.receiveShadow = true;

    this.renderer.setSize(this.size.width, this.size.height);
    this.control = new OrbitControls(this.camera, this.renderer.domElement);
    this.animate();
  }

  animate(): void {
    this.renderer.render(this.scene, this.camera);
    this.control.update();
    window.requestAnimationFrame(() => this.animate());
  }

  updateAllMaterial(): void {
    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        child.material.envMapIntensity = this.debugObject.envMapIntensity;
        child.material.needsUpdate = true;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    })
  }
}

class WindowSize {
  public width: number;
  public height: number;
  constructor() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }

  update() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }
}