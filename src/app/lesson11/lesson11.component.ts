import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { fromEvent, Subject, takeUntil } from 'rxjs';
import { OrbitControls  } from 'three/examples/jsm/controls/OrbitControls';
import * as THREE from 'three';
import gsap from 'gsap';
import { ThisReceiver } from '@angular/compiler';

@Component({
  selector: 'app-lesson11',
  templateUrl: './lesson11.component.html',
  styleUrls: ['./lesson11.component.scss']
})
export class Lesson11Component implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas', {static: false}) canvas!: ElementRef<HTMLCanvasElement>;
  scene: THREE.Scene = new THREE.Scene();
  geometry: THREE.BoxGeometry = new THREE.BoxGeometry(1, 1, 1, 100);
  material!: THREE.MeshBasicMaterial;
  mesh!: THREE.Mesh;
  sizes: {width:number, height:number} = {width: window.innerWidth, height: window.innerHeight};
  camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(65, this.sizes.width/this.sizes.height);
  renderer!: THREE.WebGLRenderer;
  clock: THREE.Clock = new THREE.Clock();
  unsubscribe: Subject<void> = new Subject<void>();
  controls!: OrbitControls;
  constructor() { }

  ngOnInit(): void {
    // html way to create texture
    // const image = new Image();
    // const texture = new THREE.Texture(image);
    // fromEvent(image, 'load').pipe(takeUntil(this.unsubscribe)).subscribe(() => {
    //   texture.needsUpdate = true;
    // });
    // image.src = 'assets/color.jpeg';

    // simpler way
    const loadingManager = new THREE.LoadingManager(
      () => {
        console.log('on load');
      },
      () => {
        console.log('on progress');
      },
      () => {
        console.log('on error');
      }
    );
    const textureLoader = new THREE.TextureLoader(loadingManager);
    const texture = textureLoader.load('assets/checkerboard-8x8.png', () => console.log('abcd'));
    texture.generateMipmaps = false;
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    // center
    // texture.rotation = Math.PI /4;
    // texture.center.x = 0.5;
    // texture.center.y = 0.5;

    // texture.repeat.x =3;
    // texture.repeat.y =3;
    // texture.wrapS = THREE.RepeatWrapping;
    // texture.wrapT = THREE.RepeatWrapping;
    // texture.offset.x = -1.5;
    // texture.offset.y = -1.5;
    this.material = new THREE.MeshBasicMaterial({map: texture});
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
    this.scene.add(this.camera);
    this.camera.position.set(0,0,3);
    
  }

  ngAfterViewInit(): void {
    this.controls = new OrbitControls(this.camera, this.canvas.nativeElement);
    this.renderer = new THREE.WebGLRenderer({canvas: this.canvas.nativeElement});
    this.renderer.setSize(this.sizes.width, this.sizes.height);
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
    // this.mesh.position.z -= this.clock.getDelta();
    gsap.to(this.mesh.position, {duration: 1, z: this.mesh.position.z - this.clock.getDelta()})
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(() => this.tick());
  }

}
