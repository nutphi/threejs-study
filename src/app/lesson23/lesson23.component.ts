import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import GUI from 'lil-gui';
import { fromEvent, Subject, takeUntil } from 'rxjs';
import { AmbientLight, AnimationClip, AnimationMixer, Clock, DirectionalLight, Mesh, MeshStandardMaterial, PerspectiveCamera, PlaneGeometry, Scene, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
export interface WindowSize {
  width: number;
  height: number;
}

@Component({
  selector: 'app-lesson23',
  templateUrl: './lesson23.component.html',
  styleUrls: ['./lesson23.component.scss']
})
export class Lesson23Component implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvas !: ElementRef<HTMLCanvasElement>;
  unsubscribe: Subject<void> = new Subject<void>();

  ambientLight!: AmbientLight;
  directionalLight!: DirectionalLight;
  camera!: PerspectiveCamera;
  renderer!: WebGLRenderer;
  floorGeometry!: PlaneGeometry;
  sizes!: WindowSize;
  scene!: Scene;
  objects: { [key:string]: Mesh } = {};

  control!: OrbitControls;
  clock!: Clock;
  gui!: GUI;

  gltfLoader!: GLTFLoader;
  dracoLoader!: DRACOLoader;

  mixer!: AnimationMixer;
  animationClip!: AnimationClip[];
  param = {
    i: 0
  };
  constructor() { }

  ngAfterViewInit(): void {
    this.gui = new GUI();
    this.gltfLoader = new GLTFLoader();
    // this.gltfLoader.load('./assets/models/Duck/glTF/Duck.gltf',
    //   (gltf) => {
    //     console.log('success');
    //     console.log(gltf);
    //     for(const child of gltf.scene.children)
    //     {
    //         this.scene.add(child)
    //     }
    //   },
    // (gltf) => {
    //   console.log('process');
    //   console.log(gltf);
    // },
    // (gltf) => {
    //   console.log('error');
    //   console.log(gltf);
    // }
    // );
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('./assets/draco/');
    
    this.gltfLoader.setDRACOLoader(this.dracoLoader);
    
    this.gltfLoader.load('./assets/models/hamburger.glb', (gltf) => {
      this.scene.add(gltf.scene);
    });
    // this.gltfLoader.load('./assets/models/FlightHelmet/glTF/FlightHelmet.gltf',
    //   (gltf) => {
    //     // console.log(gltf);
    //     gltf.scene.position.x += 2;
    //     this.scene.add(gltf.scene);
    //     // for(const child of gltf.scene.children)
    //     // {
    //     //     this.scene.add(child)
    //     // }
    //     // while(gltf.scene.children.length)
    //     // {
    //     //     this.scene.add(gltf.scene.children[0])
    //     // }
    // });
    this.gltfLoader.load(
    './assets/models/Fox/glTF/Fox.gltf',
    (gltf) => {
      gltf.scene.scale.set(0.025, 0.025, 0.025);
      this.mixer = new AnimationMixer(gltf.scene);
      this.animationClip = gltf.animations;
      let action = this.mixer.clipAction(gltf.animations[0]);
      action.play();
      console.log(gltf.animations.length);
      this.gui.add(this.param, 'i', 0, gltf.animations.length - 1, 1).onChange((i: any) => {
        if (action) {
          action.stop();
        }
        action = this.mixer.clipAction(gltf.animations[i]);
        action.play();
      })
      this.scene.add(gltf.scene);
    });
    this.sizes = { width: window.innerWidth, height: window.innerHeight };
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(45, this.sizes.width/this.sizes.height);
    this.camera.position.set(0, 15, 10);
    this.directionalLight = new DirectionalLight('#fff', 1);
    this.ambientLight = new AmbientLight('#fff', 1);
    this.floorGeometry = new PlaneGeometry(10,10);
    const planeMesh = new Mesh(this.floorGeometry, new MeshStandardMaterial());
    this.objects['floor'] = planeMesh;
    planeMesh.rotation.x = Math.PI * -0.5;
    this.gui.add(this.camera.position, 'y', 1, 15, 1);
    this.gui.add(this.camera.position, 'z', 1, 10, 1);
    
    this.gui.addColor(this.directionalLight, 'color');
    this.gui.addColor(this.ambientLight, 'color');
    this.scene.add(planeMesh, this.camera, this.ambientLight, this.directionalLight);
    this.renderer = new WebGLRenderer({canvas: this.canvas.nativeElement, antialias: true});
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    

    this.control = new OrbitControls(this.camera, this.renderer.domElement);
    this.clock = new Clock();
    this.animate();
  }

  oldElapsedTime!: number;
  animate() {
    const elapsedTime = this.clock.getElapsedTime();
    if (!this.oldElapsedTime) {
      this.oldElapsedTime = elapsedTime;
    }
    const delta = elapsedTime - this.oldElapsedTime;
    this.oldElapsedTime = elapsedTime;
    this.renderer.render(this.scene, this.camera);

    // this.objects['floor'].rotation.x = elapsedTime;
    if (this.mixer) {
      this.mixer.update(delta);
    }
    this.control.update();
    window.requestAnimationFrame(() => this.animate());
  }

  ngOnDestroy(): void {
    this.gui?.hide();
    this.gui?.destroy();
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  addListener() {
    fromEvent(window, 'resize').pipe(takeUntil(this.unsubscribe)).subscribe(() => {
      this.resize.updateSize();
      this.resize.updateCamera();
      this.resize.updateRenderer();

    })
  }
  private resize = {
    updateSize:() => {
      this.sizes = {
        width: window.innerWidth,
        height: window.innerHeight
      }
    },

    updateCamera:() => {
      this.camera.aspect = this.sizes.width/this.sizes.height;
      this.camera.updateProjectionMatrix();
    },

    updateRenderer:() => {
      this.renderer.setSize(this.sizes.width, this.sizes.height);
      this.renderer.setPixelRatio(Math.max(window.devicePixelRatio, 2));
    }
  }
}
