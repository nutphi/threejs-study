import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import GUI from 'lil-gui';
import { fromEvent, Subject, takeUntil } from 'rxjs';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
const particleRendererList = ['alphaTest', 'depthTest', 'depthWrite', 'blending'] as const
type ParticleRendererType = typeof particleRendererList[number];

@Component({
  selector: 'app-lesson18',
  templateUrl: './lesson18.component.html',
  styleUrls: ['./lesson18.component.scss']
})
export class Lesson18Component implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  renderer!: THREE.WebGLRenderer;
  sizes!: {width: number, height: number};

  // texture loader
  loader!: THREE.TextureLoader;

  // optional
  controls!: OrbitControls;
  gui!: GUI;
  params: {textureNo: number, particleType: ParticleRendererType, 'show box': boolean, 'multi color': boolean, 'is wave': boolean} = {textureNo: 0, particleType: 'alphaTest', 'show box': false, 'multi color': true, 'is wave': false};

  material!: THREE.PointsMaterial;
  geometry!: THREE.BufferGeometry;
  particle!: THREE.Points;
  textures: THREE.Texture[] = [];

  clock = new THREE.Clock();
  unsubscribe: Subject<void> = new Subject<void>();

  count = 50000; // particle
  positions!: Float32Array;
  constructor() { }
  ngOnDestroy(): void {
    this.gui?.hide();
    this.gui?.destroy();
  }

  ngAfterViewInit(): void {
    // setup
    this.sizes = {width: window.innerWidth, height: window.innerHeight};
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(65, this.sizes.width/this.sizes.height, 0.1 , 100);
    this.renderer = new THREE.WebGLRenderer({canvas: this.canvas.nativeElement});
    this.renderer.setSize(this.sizes.width, this.sizes.height);

    // texture
    this.loader = new THREE.TextureLoader();
    this.textures.push(this.loader.load('/assets/textures/particles/1.png'));
    this.textures.push(this.loader.load('/assets/textures/particles/2.png'));
    this.textures.push(this.loader.load('/assets/textures/particles/3.png'));
    this.textures.push(this.loader.load('/assets/textures/particles/4.png'));
    this.textures.push(this.loader.load('/assets/textures/particles/5.png'));
    this.textures.push(this.loader.load('/assets/textures/particles/6.png'));
    this.textures.push(this.loader.load('/assets/textures/particles/7.png'));
    this.textures.push(this.loader.load('/assets/textures/particles/8.png'));
    this.textures.push(this.loader.load('/assets/textures/particles/9.png'));
    this.textures.push(this.loader.load('/assets/textures/particles/10.png'));
    this.textures.push(this.loader.load('/assets/textures/particles/11.png'));

    // positioning
    this.camera.position.set(0, 1, -2);

    // option
    this.controls = new OrbitControls(this.camera, this.canvas.nativeElement);

    // set material
    this.material = new THREE.PointsMaterial();
    this.material.size = 0.04;
    this.material.sizeAttenuation = true;
    this.material.transparent = true;
    this.material.alphaMap = this.textures[0];
    // this.material.alphaTest = 0.00001;
    // this.material.depthTest = false; // depthTest will create a bug if you add another mesh into the screen you will see particle behind
    this.material.depthWrite = false; // remove the depth write to fill particle inside other
    this.material.blending = THREE.AdditiveBlending;
    this.geometry = new THREE.BufferGeometry();
    
    this.positions = new Float32Array(this.count * 3).map(i => (Math.random() - 0.5) * 10);
    const colors = new Float32Array(this.count * 3).map(i => Math.random());

    // applied particle color
    this.geometry.setAttribute(
      'color',
      new THREE.BufferAttribute(colors, 3)
    )
    this.material.vertexColors = this.params['multi color'];
    this.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(this.positions, 3)
    )
    
    this.particle = new THREE.Points(this.geometry, this.material);

    // apply into gui
    this.gui = new GUI();
    this.gui.addColor(this.material, 'color');
    this.gui.add(this.params, 'textureNo', Array.from(Array(this.textures.length - 1).keys()).map(a => a)).onChange((n: number) => {
      this.material.alphaMap = this.textures[n];
    });
    this.gui.add(this.params, 'particleType', particleRendererList).onChange((t: ParticleRendererType) => {
      switch (t) {
        case 'alphaTest':
          this.material.alphaTest = 0.0001;
          this.material.blending = THREE.NormalBlending;
          this.material.depthTest = false;
          this.material.depthWrite = true;
          break;
        case 'blending':
          this.material.alphaTest = 0;
          this.material.blending = THREE.AdditiveBlending;
          this.material.depthTest = false;
          this.material.depthWrite = true;
          break;
        case 'depthTest':
          this.material.alphaTest = 0;
          this.material.blending = THREE.NormalBlending;
          this.material.depthTest = true;
          this.material.depthWrite = true;
          break;
        case 'depthWrite':
          this.material.alphaTest = 0;
          this.material.blending = THREE.NormalBlending;
          this.material.depthTest = false;
          this.material.depthWrite = false;
          break;
      }
    })

    // update screen size
    fromEvent(window, 'resize')
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(() => {
        this.updateNewWindowSizes();
        this.updateCameraAspectRatio();
        this.updateRendererRatio();
    });

    const box = new THREE.Mesh(new THREE.BoxBufferGeometry(0.5,0.5,0.5), new THREE.MeshBasicMaterial({color: 'white'}));
    this.gui.add(this.params, 'show box').onChange((isShow: boolean) => {
      if (isShow) {
        this.scene.add(box);
      } else {
        this.scene.remove(box);
      }
    });

    this.gui.add(this.params, 'multi color').onChange((isMultiColor: boolean) => {
      this.material.vertexColors = isMultiColor;
    });

    this.gui.add(this.params, 'is wave').onChange((isWave: boolean) => {
      if (!isWave) {
        this.geometry.setAttribute(
          'position',
          new THREE.BufferAttribute(this.positions, 3)
        )
      }
    });

    // put into screen
    this.scene.add(this.camera, this.particle);

    this.tick();
  }

  updateNewWindowSizes() {
    this.sizes = {width: window.innerWidth, height: window.innerHeight};
  }

  updateCameraAspectRatio() {
    this.camera.aspect = this.sizes.width / this.sizes.height;
    this.camera.updateProjectionMatrix();
  }

  updateRendererRatio() {
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
  }

  tick() {
    this.renderer.render(this.scene, this.camera);
    this.controls.update();
    if (this.params['is wave']) {
      const elapsedTime = this.clock.getElapsedTime();
      for(let i = 0; i < this.count; i++)
      {
          let i3 = i * 3;
          const x = this.geometry.attributes['position'].array[i3];
          (this.geometry.attributes['position'].array[i3 + 1] as number) = Math.sin(elapsedTime + x);
      }
      this.geometry.attributes['position'].needsUpdate = true;
    } else {
      
    }
    window.requestAnimationFrame(this.tick.bind(this));
  }
}
