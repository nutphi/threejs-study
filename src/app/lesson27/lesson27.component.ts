import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import testVertexShader from './shaders/test/vertex.glsl';
import testFragmentShader from './shaders/test/fragment.glsl';
import GUI from 'lil-gui';

@Component({
  selector: 'app-lesson27',
  templateUrl: './lesson27.component.html',
  styleUrls: ['./lesson27.component.scss']
})
export class Lesson27Component implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  textureLoader = new THREE.TextureLoader();
  scene = new THREE.Scene();
  sizes = {width: window.innerWidth, height: window.innerHeight};
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer!:THREE.WebGLRenderer;
  geometry = new THREE.PlaneBufferGeometry(15, 10, 32, 32);
  // material = new THREE.MeshBasicMaterial({color: 'red'});
  controls!: OrbitControls;
  gui = new GUI();
  material = new THREE.RawShaderMaterial({
    vertexShader: testVertexShader,
    fragmentShader: testFragmentShader,
    side: THREE.DoubleSide,
    transparent: true,
    uniforms: {
      uFrequency: {value: new THREE.Vector2(1.0, 2.0)},
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('lightblue')},
      uTexture: { value: this.textureLoader.load('assets/textures/flags/thailand_640.png')}
    }
    // flatShading: true
    // wireframe: true
  })
  mesh!: THREE.Mesh;
  clock = new THREE.Clock();
  constructor() { }
  ngOnDestroy(): void {
    this.gui?.hide();
    this.gui?.destroy();
  }
  ngAfterViewInit(): void {
    const count = this.geometry.attributes['position'].count;
    const random = new Float32Array(count);
    for( let i = 0; i < count; i++) {
      random[i] = Math.random();
    }
    this.geometry.setAttribute('aRandom', new THREE.BufferAttribute(random, 1));
    // console.log(this.geometry);
    this.gui.add(this.material.uniforms['uFrequency'].value, 'x', 0, 10, 0.001).name('Frequency X');
    this.gui.add(this.material.uniforms['uFrequency'].value, 'y', 0, 10, 0.001).name('Frequency Y');
    this.renderer = new THREE.WebGLRenderer({canvas: this.canvas.nativeElement, antialias: true});
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.camera.position.set(0, 0, 10);
    this.controls = new OrbitControls(this.camera, this.canvas.nativeElement);
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.camera,this.mesh);
    this.tick();
  }

  tick() {
    const elapsedTime = this.clock.getElapsedTime();
    this.material.uniforms['uTime'].value = elapsedTime;
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(() => this.tick());
  }

  ngOnInit(): void {
  }

}
