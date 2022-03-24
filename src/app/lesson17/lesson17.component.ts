import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { GUI } from 'lil-gui';
import { fromEvent, Subject, takeUntil } from 'rxjs';
import * as THREE from 'three';
import { Group, Mesh } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
@Component({
  selector: 'app-lesson17',
  templateUrl: './lesson17.component.html',
  styleUrls: ['./lesson17.component.scss']
})
export class Lesson17Component implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  renderer!: THREE.WebGLRenderer;

  textureLoader!: THREE.TextureLoader;

  house!: THREE.Group;
  gravesGroup!: THREE.Group;
  floor!: THREE.Mesh;

  fog!: THREE.Fog;

  sizes!: {width: number, height: number};
  gui: GUI = new GUI();
  clock!: THREE.Clock;
  control!: OrbitControls;
  ambientLight!: THREE.AmbientLight;
  directionalLight!: THREE.DirectionalLight;
  ghosts: THREE.PointLight[] = [];
  graves: THREE.Mesh[] = [];
  random!: number[];
  unsubscribe: Subject<void> = new Subject<void>();
  constructor() { }
  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  ngAfterViewInit(): void {
    
    this.renderer = new THREE.WebGLRenderer({canvas: this.canvas.nativeElement});

    // shadow
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.setup();
    this.directionalLight.castShadow = true;
    this.floor.receiveShadow = true;

    this.graves.forEach(grave => grave.castShadow = true);

    this.camera.aspect = this.sizes.width/this.sizes.height;

    this.renderer.setClearColor('#262837');
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.control = new OrbitControls(this.camera, this.canvas.nativeElement);
    this.clock = new THREE.Clock();
    const directionalHelper = new THREE.DirectionalLightHelper(this.directionalLight);
    directionalHelper.visible = false;
    this.scene.add(this.camera, this.house, this.floor, this.ambientLight, this.directionalLight, directionalHelper, new THREE.AxesHelper(1));
    this.random = this.ghosts.map(() => Math.random());
    fromEvent(window, 'resize').pipe(takeUntil(this.unsubscribe)).subscribe(() => {
      this.updateWindowSize();
      this.updateCameraSizeRatio();
      this.updateRendererSizeRatio();
    });
    this.tick();
  }

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

  tick() {
    const elapsed = this.clock.getElapsedTime();
    this.ghosts.forEach((ghost, i) => {
      ghost.position.x = (i%2? -1: 1) * Math.cos(elapsed) * 5 * (i%3? Math.sin(elapsed * this.random[i]) : 1);
      ghost.position.z = (i%2? -1: 1) * Math.sin(elapsed) * 5 * (i%4? Math.sin(elapsed * this.random[i]) : 1);
      ghost.position.y = (Math.sin(elapsed) * 2 + 2) + Math.sin(elapsed * i) * this.random[i];
    })

    this.renderer.render(this.scene, this.camera);
    this.control.update();
    window.requestAnimationFrame(() => this.tick());
  }

  setup(): void {
    this.scene = new THREE.Scene();
    this.fog = new THREE.Fog('#262837', 1, 15);
    this.scene.fog = this.fog;
    this.sizes = { width: window.innerWidth, height: window.innerHeight};
    this.camera = new THREE.PerspectiveCamera(65, this.sizes.width/this.sizes.height, 0.1, 100);
    this.camera.position.z = -10;
    this.camera.position.y = 5;

    this.textureLoader = new THREE.TextureLoader();
    const doorColorTexture = this.textureLoader.load('/assets/textures/door/color.jpg');
    const doorAlphaTexture = this.textureLoader.load('/assets/textures/door/alpha.jpg');
    const doorAmbientOcculusionTexture = this.textureLoader.load('/assets/textures/door/ambientOcclusion.jpg');
    const doorHeightTexture = this.textureLoader.load('/assets/textures/door/height.jpg');
    const doorNormalTexture = this.textureLoader.load('/assets/textures/door/normal.jpg');
    const doorMetalnessTexture = this.textureLoader.load('/assets/textures/door/metalness.jpg');
    const doorRoughnessTexture = this.textureLoader.load('/assets/textures/door/roughness.jpg');

    const brickColorTexture = this.textureLoader.load('/assets/textures/bricks/color.jpg');
    const brickAmbientOcclusionTexture = this.textureLoader.load('/assets/textures/bricks/ambientOcclusion.jpg');
    const brickNormalTexture = this.textureLoader.load('/assets/textures/bricks/normal.jpg');
    const brickRoughnessTexture = this.textureLoader.load('/assets/textures/bricks/roughness.jpg');

    const grassColorTexture = this.textureLoader.load('/assets/textures/grass/color.jpg');
    const grassAmbientOcclusionTexture = this.textureLoader.load('/assets/textures/grass/ambientOcclusion.jpg');
    const grassNormalTexture = this.textureLoader.load('/assets/textures/grass/normal.jpg');
    const grassRoughnessTexture = this.textureLoader.load('/assets/textures/grass/roughness.jpg');

    grassColorTexture.repeat.set(8,8);
    grassAmbientOcclusionTexture.repeat.set(8,8);
    grassNormalTexture.repeat.set(8,8);
    grassRoughnessTexture.repeat.set(8,8);

    grassColorTexture.wrapS = THREE.RepeatWrapping;
    grassColorTexture.wrapT = THREE.RepeatWrapping;

    grassAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping;
    grassAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping;

    grassNormalTexture.wrapS = THREE.RepeatWrapping;
    grassNormalTexture.wrapT = THREE.RepeatWrapping;

    grassRoughnessTexture.wrapS = THREE.RepeatWrapping;
    grassRoughnessTexture.wrapT = THREE.RepeatWrapping;

    this.floor = new Mesh(new THREE.PlaneBufferGeometry(20, 20), new THREE.MeshStandardMaterial({
      map: grassColorTexture,
      aoMap: grassAmbientOcclusionTexture,
      normalMap: grassNormalTexture,
      roughnessMap: grassRoughnessTexture
    }));
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.geometry.setAttribute(
      'uv',
      new THREE.Float32BufferAttribute((this.floor.geometry.attributes as any).uv.array, 2)
    )

    this.house = new THREE.Group();
    const wallsHeight = 2.5;
    const wallsWidth = 5;
    const roofHeight = 1.5;
    const doorHeight = 2;

    const walls = new THREE.Mesh(
      new THREE.BoxBufferGeometry(wallsWidth, wallsHeight, 5),
      new THREE.MeshStandardMaterial({
        map: brickColorTexture,
        aoMap: brickAmbientOcclusionTexture,
        normalMap: brickNormalTexture,
        roughnessMap: brickRoughnessTexture
      })
    );
    walls.castShadow = true;
    walls.geometry.setAttribute(
      'uv',
      new THREE.Float32BufferAttribute((walls.geometry.attributes as any).uv.array, 2)
    )

    const roof = new THREE.Mesh(new THREE.ConeBufferGeometry(4, roofHeight, 4), new THREE.MeshStandardMaterial({color: '#b35f45'}));
    const door = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, doorHeight, 100, 100),
      new THREE.MeshStandardMaterial({
        map: doorColorTexture,
        transparent: true,
        alphaMap: doorAlphaTexture, // set transparent: true
        aoMap: doorAmbientOcculusionTexture, // set door geometry uv below to make it work
        displacementMap: doorHeightTexture, // need more vertices 3,4 parameters from geomotry
        displacementScale: 0.15,
        normalMap: doorNormalTexture,
        metalnessMap: doorMetalnessTexture,
        roughnessMap: doorRoughnessTexture
      }));
    door.geometry.setAttribute(
      'uv',
      new THREE.Float32BufferAttribute((door.geometry.attributes as any).uv.array, 2)
    )
    
    const bushMaterial = new THREE.MeshStandardMaterial({ color: '#89c854'});

    const bush1 = new THREE.Mesh(new THREE.SphereBufferGeometry(0.4, 10, 10), bushMaterial);
    bush1.position.x = - wallsWidth / 2;
    bush1.position.y = 0.2;
    bush1.position.z = - wallsWidth / 2 - 0.3;
    bush1.castShadow = true;
    const bush2 = new THREE.Mesh(new THREE.SphereBufferGeometry(0.6, 10, 10), bushMaterial);
    bush2.position.x = - wallsWidth / 2 + 0.8;
    bush2.position.y = 0.3;
    bush2.position.z = - wallsWidth / 2 - 0.4;
    bush2.castShadow = true;
    const bush3 = new THREE.Mesh(new THREE.SphereBufferGeometry(0.4, 10, 10), bushMaterial);
    bush3.position.x = wallsWidth / 2;
    bush3.position.y = 0.2;
    bush3.position.z = - wallsWidth / 2 - 0.3;
    bush3.castShadow = true;
    const bush4 = new THREE.Mesh(new THREE.SphereBufferGeometry(0.6, 10, 10), bushMaterial);
    bush4.position.x = wallsWidth / 2 - 0.8;
    bush4.position.y = 0.3;
    bush4.position.z = - wallsWidth / 2 - 0.4;
    bush4.castShadow = true;

    const doorLight = new THREE.PointLight('#ff7d46', 1, 7);
    doorLight.shadow.mapSize.width = 256
    doorLight.shadow.mapSize.height = 256
    doorLight.shadow.camera.far = 7
    doorLight.position.set(0, 2.2, -2.7);
    this.house.add(doorLight);
    this.gui.close();

    this.gui.add(roof.position, 'y', -9, 9, 0.001);
    door.position.z = -(wallsWidth / 2) - 0.0001;
    door.position.y = doorHeight / 2;
    door.rotation.y = Math.PI;
    walls.position.y = wallsHeight / 2;
    roof.position.y = wallsHeight + (roofHeight / 2);
    roof.rotation.y = Math.PI / 4;

    this.gravesGroup = new THREE.Group();
    this.scene.add(this.gravesGroup);
    const graveGeometry = new THREE.BoxBufferGeometry(0.6, 0.8, 0.2);
    const graveMaterial = new THREE.MeshStandardMaterial({color: '#b2b6b1'});
    Array(50).fill(0).forEach(() => {
      const angel = Math.PI * 2 * Math.random();
      const radius = wallsWidth + Math.random() * 4;
      const x = Math.sin(angel) * radius;
      const y = Math.random() * 0.3;
      const z = Math.cos(angel) * radius;
      const grave = new THREE.Mesh(graveGeometry, graveMaterial);
      grave.position.set(x, y, z);
      grave.rotation.x = (Math.PI/6) * Math.random();
      grave.rotation.y = (Math.PI) * Math.random();
      this.graves.push(grave);
    });
    this.gravesGroup.add(...this.graves);

    this.house.add(walls);
    this.house.add(roof);
    this.house.add(door);
    this.house.add(bush1, bush2, bush3, bush4);
    

    this.gui.add(this.floor.rotation, 'x', -9, 9, 0.001);
    this.gui.add(this.floor.rotation, 'y', -9, 9, 0.001);
    this.gui.add(this.floor.rotation, 'z', -9, 9, 0.001);

    this.ambientLight = new THREE.AmbientLight('#b9b5ff', 0.1);
    this.directionalLight = new THREE.DirectionalLight('#b9b5ff', 0.2);
    this.directionalLight.position.set(5, 10, -5);
    this.directionalLight.shadow.mapSize.width = 256
    this.directionalLight.shadow.mapSize.height = 256
    this.directionalLight.shadow.camera.far = 15
    const ambient = this.gui.addFolder('ambient light');
    const directional = this.gui.addFolder('directional light');
    ambient.add(this.ambientLight, 'intensity', 0, 2, 0.01);
    directional.add(this.directionalLight, 'intensity', 0, 2, 0.01);
    directional.add(this.directionalLight.rotation, 'x', 0, 1, 0.01);
    directional.add(this.directionalLight.rotation, 'y', 0, 1, 0.01);
    directional.add(this.directionalLight.position, 'x', -10, 10, 0.1);
    directional.add(this.directionalLight.position, 'y', -10, 10, 0.1);
    directional.add(this.directionalLight.position, 'z', -10, 10, 0.1);

    // this.scene.add(this.ghosts);
    Array(4).fill(0).forEach(() => {
      const random = Math.round(0xffffff * Math.random()).toString(16);
      const tostring = `#${random}`;
      const ghost = new THREE.PointLight(tostring, 2 ,3);
      ghost.shadow.mapSize.width = 256
      ghost.shadow.mapSize.height = 256
      ghost.shadow.camera.far = 7
      const helper = new THREE.PointLightHelper(ghost);
      helper.visible = false;
      this.scene.add(helper);
      this.gui.add(helper, 'visible');
      this.gui.addColor(ghost, 'color');
      this.scene.add(ghost);
      this.ghosts.push(ghost);
    })
    

  }

}
