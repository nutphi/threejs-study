import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Subject, fromEvent, takeUntil } from 'rxjs';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import GUI from 'lil-gui';
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
    normal: new THREE.MeshNormalMaterial()
  }
  
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
  
  constructor() { }

  ngOnInit(): void {
    // add param for gui
    const param = {material: 'normal' as 'normal' | 'basic', texture: 'alpha texture', alphaMap: 'alpha texture', opacity: 0.5, side: 'DoubleSide'};
    
    // load texture
    const loadingmanager = new THREE.LoadingManager(
      () => console.log('load'), 
      () => console.log('processed'),
      () => console.log('error')
    );
    const textloader = new THREE.TextureLoader(loadingmanager);
    this.texture['alpha texture'] = textloader.load('assets/textures/door/alpha.jpg', () => console.log('load'));
    this.texture['ambient occlusion texture'] = textloader.load('assets/textures/door/ambientOcclusion.jpg', () => console.log('load'));
    this.texture['color textture'] = textloader.load('assets/textures/door/color.jpg', () => console.log('load'));
    this.texture['height textture'] = textloader.load('assets/textures/door/height.jpg', () => console.log('load'));
    this.texture['metalness textture'] = textloader.load('assets/textures/door/metalness.jpg', () => console.log('load'));
    this.texture['roughness textture'] = textloader.load('assets/textures/door/roughness.jpg', () => console.log('load'));

    // update material texture, side
    this.material.basic.map = this.texture[param.texture];
    this.material.basic.side = THREE.DoubleSide;

    this.sphere = new THREE.Mesh(new THREE.SphereBufferGeometry(0.5, 16, 16), this.material[param.material]);
    this.sphere.position.x = -1.5;
    this.plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, 1), this.material[param.material]);
    this.torus = new THREE.Mesh(new THREE.TorusBufferGeometry(0.4, 0.1, 16, 32), this.material[param.material]);
    this.torus.position.x = 1.5;
    this.scene.add(this.sphere, this.plane, this.torus);
    this.scene.add(this.camera);
    this.camera.position.set(0,0,3);
    const gui = new GUI();
    gui.add(param, 'material', ['basic', 'normal']).onChange((text: 'basic' | 'normal') => {
      this.sphere.material = this.material[text];
      this.plane.material = this.material[text];
      this.torus.material = this.material[text];
    })
    const basicGui = gui.addFolder('basic material');
    const normalGui = gui.addFolder('normal material');
    gui.folders.push(basicGui, normalGui);
    basicGui.addColor(this.material.basic, 'color');
    basicGui.add(param, 'texture', [ 'alpha texture', 'ambient occlusion texture', 'color textture', 'height textture', 'metalness textture', 'roughness textture' ] ).onChange((text: string) => {
      this.material.basic.map = this.texture[text];
    });
    basicGui.add(this.material.basic, 'wireframe');
    basicGui.add(param, 'opacity', 0, 1, 0.1).onChange((n: number) => {
      this.material.basic.transparent = true;
      this.material.basic.opacity = n;
    });

    basicGui.add(param, 'texture', [ 'none', 'alpha texture', 'ambient occlusion texture', 'color textture', 'height textture', 'metalness textture', 'roughness textture' ] ).onChange((text: string) => {
      if (text !== 'none') {
        this.material.basic.map = this.texture[text];
      } else {
        this.material.basic.map = null;
      }
    });

    basicGui.add(param, 'alphaMap', [ 'none', 'alpha texture', 'ambient occlusion texture', 'color textture', 'height textture', 'metalness textture', 'roughness textture' ] ).onChange((text: string) => {
      this.material.basic.transparent = true;
      if (text !== 'none') {
        this.material.basic.alphaMap = this.texture[text];
      } else {
        this.material.basic.alphaMap = null;
      }
    });

    basicGui.add(param, 'side', ['FrontSide', 'BackSide', 'DoubleSide']).onChange((side: 'FrontSide' | 'BackSide' | 'DoubleSide') => {
      this.material.basic.side = THREE[side];
    })
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
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  tick() {
    const elapsedTime = this.clock.getElapsedTime();
    this.sphere.rotation.set(elapsedTime * 0.1, elapsedTime * 0.05, this.sphere.rotation.z);
    this.plane.rotation.set(elapsedTime * 0.15, elapsedTime * 0.05, this.plane.rotation.z);
    this.torus.rotation.set(elapsedTime * 0.1, elapsedTime * 0.15, this.torus.rotation.z);
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(() => this.tick());
  }

}
