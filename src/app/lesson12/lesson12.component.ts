import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Subject, fromEvent, takeUntil } from 'rxjs';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import GUI from 'lil-gui';

const MAT_LIST = [ 'normal', 'basic', 'matcap', 'depth', 'lambert', 'phong', 'toon', 'standard'] as const;
type MAT_TYPE = typeof MAT_LIST[number];

const SIDE_LIST = ['FrontSide', 'BackSide', 'DoubleSide'] as const;
type SIDE_TYPE = typeof SIDE_LIST[number];

const TEXTURE_LIST = [ 'none', 'alpha texture', 'ambient occlusion texture', 'color texture', 'height texture', 'metalness texture', 'roughness texture', 'normal texture' ];

const CUBETEXTURE_LIST = [ '0', '1', '2', '3', '4' ];

const FILTER_LIST = ['NearestFilter', 'LinearFilter'] as const;
type FILTER_TYPE = typeof FILTER_LIST[number];

@Component({
  selector: 'app-lesson12',
  templateUrl: './lesson12.component.html',
  styleUrls: ['./lesson12.component.scss']
})
export class Lesson12Component implements OnInit {
  @ViewChild('canvas', {static: false}) canvas!: ElementRef<HTMLCanvasElement>;
  scene: THREE.Scene = new THREE.Scene();
  material = {
    basic: new THREE.MeshBasicMaterial(),
    normal: new THREE.MeshNormalMaterial(),
    matcap: new THREE.MeshMatcapMaterial(),
    depth: new THREE.MeshDepthMaterial(),
    lambert: new THREE.MeshLambertMaterial(),
    phong: new THREE.MeshPhongMaterial(),
    toon: new THREE.MeshToonMaterial(),
    standard: new THREE.MeshStandardMaterial()
    // physical material is too much gpu same as standard
    // points material later
    // shader material later
    // raw shader material later
  }
  gui: GUI = new GUI();
  sphere!: THREE.Mesh;
  plane!: THREE.Mesh;
  torus!: THREE.Mesh;
  sizes: {width:number, height:number} = {width: window.innerWidth, height: window.innerHeight};
  camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(65, this.sizes.width/this.sizes.height);
  renderer!: THREE.WebGLRenderer;
  clock: THREE.Clock = new THREE.Clock();
  unsubscribe: Subject<void> = new Subject<void>();
  controls!: OrbitControls;
  texture: {[key:string]: THREE.Texture} = {};
  matcapTexture: {[key:string]: THREE.Texture} = {};
  toonGradients: {[key:string]: THREE.Texture} = {};
  cubeTexture: {[key:string]: THREE.Texture} = {};
  defaultMaterial: MAT_TYPE = 'standard'

  constructor() { }

  ngOnInit(): void {
    // add param for gui
    const param = {
      material: this.defaultMaterial, 
      // basic
      texture: 'alpha texture', alphaMap: 'alpha texture', opacity: 0.5, side: 'DoubleSide',
      matcap: {
        texture: '1'
      },
      // phong
      shininess: 100,
      specular: null,
      // toon
      gradient: null,
      minFilter: null,
      maxFilter: null,

      // standard
      displacementMap: 'alpha texture',
      envMap: '0'
    };
    
    // load texture
    const loadingmanager = new THREE.LoadingManager(
      () => console.log('load'), 
      () => console.log('processed'),
      () => console.log('error')
    );
    const textloader = new THREE.TextureLoader(loadingmanager);
    const cubeTextloader = new THREE.CubeTextureLoader(loadingmanager);
    this.texture['alpha texture'] = textloader.load('assets/textures/door/alpha.jpg', () => console.log('load'));
    this.texture['ambient occlusion texture'] = textloader.load('assets/textures/door/ambientOcclusion.jpg', () => console.log('load'));
    this.texture['color texture'] = textloader.load('assets/textures/door/color.jpg', () => console.log('load'));
    this.texture['height texture'] = textloader.load('assets/textures/door/height.jpg', () => console.log('load'));
    this.texture['metalness texture'] = textloader.load('assets/textures/door/metalness.jpg', () => console.log('load'));
    this.texture['roughness texture'] = textloader.load('assets/textures/door/roughness.jpg', () => console.log('load'));
    this.texture['normal texture'] = textloader.load('assets/textures/door/normal.jpg', () => console.log('load'));
    this.cubeTexture['0'] = cubeTextloader.load([
      'assets/textures/environmentMaps/0/px.jpg',
      'assets/textures/environmentMaps/0/nx.jpg',
      'assets/textures/environmentMaps/0/py.jpg',
      'assets/textures/environmentMaps/0/ny.jpg',
      'assets/textures/environmentMaps/0/pz.jpg',
      'assets/textures/environmentMaps/0/nz.jpg',
    ]);
    this.cubeTexture['1'] = cubeTextloader.load([
      'assets/textures/environmentMaps/1/px.jpg',
      'assets/textures/environmentMaps/1/nx.jpg',
      'assets/textures/environmentMaps/1/py.jpg',
      'assets/textures/environmentMaps/1/ny.jpg',
      'assets/textures/environmentMaps/1/pz.jpg',
      'assets/textures/environmentMaps/1/nz.jpg',
    ]);
    this.cubeTexture['2'] = cubeTextloader.load([
      'assets/textures/environmentMaps/2/px.jpg',
      'assets/textures/environmentMaps/2/nx.jpg',
      'assets/textures/environmentMaps/2/py.jpg',
      'assets/textures/environmentMaps/2/ny.jpg',
      'assets/textures/environmentMaps/2/pz.jpg',
      'assets/textures/environmentMaps/2/nz.jpg',
    ]);
    this.cubeTexture['3'] = cubeTextloader.load([
      'assets/textures/environmentMaps/3/px.jpg',
      'assets/textures/environmentMaps/3/nx.jpg',
      'assets/textures/environmentMaps/3/py.jpg',
      'assets/textures/environmentMaps/3/ny.jpg',
      'assets/textures/environmentMaps/3/pz.jpg',
      'assets/textures/environmentMaps/3/nz.jpg',
    ]);
    this.cubeTexture['4'] = cubeTextloader.load([
      'assets/textures/environmentMaps/4/px.png',
      'assets/textures/environmentMaps/4/nx.png',
      'assets/textures/environmentMaps/4/py.png',
      'assets/textures/environmentMaps/4/ny.png',
      'assets/textures/environmentMaps/4/pz.png',
      'assets/textures/environmentMaps/4/nz.png',
    ]);
    this.matcapTexture['1'] = textloader.load('assets/textures/matcaps/1.png', () => console.log('load'));
    this.matcapTexture['2'] = textloader.load('assets/textures/matcaps/2.png', () => console.log('load'));
    this.matcapTexture['3'] = textloader.load('assets/textures/matcaps/3.png', () => console.log('load'));
    this.matcapTexture['4'] = textloader.load('assets/textures/matcaps/4.png', () => console.log('load'));
    this.matcapTexture['5'] = textloader.load('assets/textures/matcaps/5.png', () => console.log('load'));
    this.matcapTexture['6'] = textloader.load('assets/textures/matcaps/6.png', () => console.log('load'));
    this.matcapTexture['7'] = textloader.load('assets/textures/matcaps/7.png', () => console.log('load'));
    this.matcapTexture['8'] = textloader.load('assets/textures/matcaps/8.png', () => console.log('load'));

    this.toonGradients['3'] = textloader.load('assets/textures/gradients/3.jpg', () => console.log('load'));
    this.toonGradients['5'] = textloader.load('assets/textures/gradients/5.jpg', () => console.log('load'));
    
    // update material texture, side
    this.material.basic.map = this.texture[param.texture];
    this.material.basic.alphaMap = this.texture[param.texture];
    this.material.basic.side = THREE.DoubleSide;

    this.sphere = new THREE.Mesh(new THREE.SphereBufferGeometry(0.5, 64, 64), this.material[param.material]);
    this.sphere.position.x = -1.5;
    this.sphere.geometry.setAttribute('uv2', new THREE.BufferAttribute(this.sphere.geometry.attributes['uv'].array, 2));
    this.plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, 1, 100, 100), this.material[param.material]);
    this.plane.geometry.setAttribute('uv2', new THREE.BufferAttribute(this.plane.geometry.attributes['uv'].array, 2));
    this.torus = new THREE.Mesh(new THREE.TorusBufferGeometry(0.4, 0.1, 16, 32), this.material[param.material]);
    this.torus.geometry.setAttribute('uv2', new THREE.BufferAttribute(this.torus.geometry.attributes['uv'].array, 2));
    this.torus.position.x = 1.5;

    this.material.standard.metalness = 0.7;
    this.material.standard.roughness = 0.2;
    this.material.standard.envMap = this.cubeTexture['0'];
    // this.material.standard.map = this.texture['color texture'];
    // this.material.standard.aoMap = this.texture['ambient occlusion texture'];
    // this.material.standard.aoMapIntensity = 0.1;
    // this.material.standard.displacementMap = this.texture['height texture'];
    // this.material.standard.metalnessMap = this.texture['metalness texture'];
    // this.material.standard.roughnessMap = this.texture['roughness texture'];
    // this.material.standard.normalMap = this.texture['normal texture'];
    // this.material.standard.normalScale.set(0.5, 0.5);
    // this.material.standard.transparent = true;
    // this.material.standard.alphaMap = this.texture['alpha texture'];
    // add light for some material
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.x = 2;
    pointLight.position.y = 3;
    pointLight.position.z = 4;
    this.scene.add(ambientLight);
    this.scene.add(pointLight);

    this.scene.add(this.sphere, this.plane, this.torus);
    this.scene.add(this.camera);
    this.camera.position.set(0,0,3);
    
    this.gui.add(param, 'material', Object.values(MAT_LIST)).onChange((text: MAT_TYPE) => {
      this.sphere.material = this.material[text];
      this.plane.material = this.material[text];
      this.torus.material = this.material[text];
    })
    const basicGui = this.gui.addFolder('basic material').close();
    const normalGui = this.gui.addFolder('normal material').close();
    const matcapGui = this.gui.addFolder('matcap material').close();
    const depthGui = this.gui.addFolder('depth material').close();
    const lambert = this.gui.addFolder('lambert material').close();
    const phongGui = this.gui.addFolder('phong material').close();
    const toonGui = this.gui.addFolder('toon material').close();
    const standardGui = this.gui.addFolder('standard material');
    this.gui.folders.push(basicGui, normalGui, matcapGui, depthGui, lambert, phongGui, toonGui, standardGui);

    // basic gui;
    {
      basicGui.addColor(this.material.basic, 'color');
      basicGui.add(param, 'texture', TEXTURE_LIST ).onChange((text: string) => {
        this.material.basic.map = this.texture[text];
      });
      basicGui.add(this.material.basic, 'wireframe');
      basicGui.add(param, 'opacity', 0, 1, 0.1).onChange((n: number) => {
        this.material.basic.transparent = true;
        this.material.basic.opacity = n;
      });
      basicGui.add(param, 'texture', TEXTURE_LIST ).onChange((text: string) => {
        if (text !== 'none') {
          this.material.basic.map = this.texture[text];
        } else {
          this.material.basic.map = null;
        }
      });
      basicGui.add(param, 'alphaMap', TEXTURE_LIST ).onChange((text: string) => {
        this.material.basic.transparent = true;
        if (text !== 'none') {
          this.material.basic.alphaMap = this.texture[text];
        } else {
          this.material.basic.alphaMap = null;
        }
      });
      basicGui.add(param, 'side', SIDE_LIST).onChange((side: SIDE_TYPE) => {
        this.material.basic.side = THREE[side];
      })
    }

    // matcap gui;
    {
      matcapGui.add(param.matcap, 'texture', ['1', '2', '3', '4', '5', '6', '7', '8']).onChange((text: string) => {
        this.material.matcap.map = this.matcapTexture[text];  
      });
    }
    // depth gui;
    {
    }

    // lambert
    {

    }

    // phong
    {
      phongGui.add(param, 'shininess', 0, 100, 0.1).onChange((n: number) => {
        this.material.phong.shininess = n;
      });
      phongGui.addColor(this.material.phong, 'specular');
    }

    // toon
    {
      toonGui.add(param, 'gradient', ['3', '5']).onChange((s: string) => {
        this.material.toon.gradientMap = this.toonGradients[s];
      });
      toonGui.add(param, 'minFilter', FILTER_LIST).onChange((filter: FILTER_TYPE) => {
        if (param.gradient && this.toonGradients[param.gradient].minFilter) {
          switch (filter) {
            case 'LinearFilter':              
              this.toonGradients[param.gradient].minFilter = THREE.LinearFilter;
              break;
            case 'NearestFilter':
              this.toonGradients[param.gradient].minFilter = THREE.NearestFilter;
              break;
          }
        }
      });
      toonGui.add(param, 'maxFilter', FILTER_LIST).onChange((filter: FILTER_TYPE) => {
        if (param.gradient && this.toonGradients[param.gradient].magFilter) {
          switch (filter) {
            case 'LinearFilter':
              this.toonGradients[param.gradient].magFilter = THREE.LinearFilter;
              break;
            case 'NearestFilter':
              this.toonGradients[param.gradient].magFilter = THREE.NearestFilter;
              break;
          }
          this.material.toon.gradientMap = this.toonGradients[param.gradient];
        }
      });
    }

    // standard
    {
      standardGui.add(this.material.standard, 'metalness').max(1).min(0).step(0.0001);
      standardGui.add(this.material.standard, 'roughness').max(1).min(0).step(0.0001);
      standardGui.add(param, 'texture', TEXTURE_LIST ).onChange((text: string) => {
        if (text !== 'none') {
          this.material.standard.map = this.texture[text];
        } else {
          this.material.standard.map = null;
        }
      });
      standardGui.add(param, 'displacementMap', TEXTURE_LIST ).onChange((text: string) => {
        this.material.standard.transparent = true;
        if (text !== 'none') {
          this.material.standard.displacementMap = this.texture[text];
        } else {
          this.material.standard.displacementMap = null;
        }
      });

      standardGui.add(this.material.standard, 'aoMapIntensity', 0, 100, 0.01);
      standardGui.add(this.material.standard, 'displacementScale', 0, 0.5, 0.0001);
      standardGui.add(param, 'envMap', CUBETEXTURE_LIST).onChange((text: string) => {
        this.material.standard.envMap = this.cubeTexture[text];  
      });
    }
  }

  ngAfterViewInit(): void {
    this.controls = new OrbitControls(this.camera, this.canvas.nativeElement);
    this.renderer = new THREE.WebGLRenderer({canvas: this.canvas.nativeElement});
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.clock.getDelta();
    this.tick();
    fromEvent(window, 'resize').pipe(takeUntil(this.unsubscribe)).subscribe(() => {
      // Update sizes
      this.sizes.width = window.innerWidth
      this.sizes.height = window.innerHeight

      // Update camera
      this.camera.aspect = this.sizes.width / this.sizes.height
      this.camera.updateProjectionMatrix()

      // Update render
      this.renderer.setSize(this.sizes.width, this.sizes.height);
      this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    });
  }

  ngOnDestroy(): void {
    this.gui.hide();
    this.gui.destroy();
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  tick() {
    // const elapsedTime = this.clock.getElapsedTime();
    // this.sphere.rotation.set(elapsedTime * 0.1, elapsedTime * 0.05, this.sphere.rotation.z);
    // this.plane.rotation.set(elapsedTime * 0.15, elapsedTime * 0.05, this.plane.rotation.z);
    // this.torus.rotation.set(elapsedTime * 0.1, elapsedTime * 0.15, this.torus.rotation.z);
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(() => this.tick());
  }

}
