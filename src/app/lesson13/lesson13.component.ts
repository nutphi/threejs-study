import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import GUI from 'lil-gui';
import { fromEvent } from 'rxjs';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

@Component({
  selector: 'app-lesson13',
  templateUrl: './lesson13.component.html',
  styleUrls: ['./lesson13.component.scss']
})
export class Lesson13Component implements OnInit, AfterViewInit {
  @ViewChild('canvas', { static: false }) canvas!: ElementRef;
  scene: THREE.Scene = new THREE.Scene();
  sizes: {width: number, height: number} = {width: window.innerWidth, height: window.innerHeight};
  renderer!: THREE.WebGLRenderer;
  loadingManager: THREE.LoadingManager = new THREE.LoadingManager();
  textureLoader: THREE.TextureLoader = new THREE.TextureLoader();
  fontLoader: FontLoader = new FontLoader();

  // geometry = new THREE.BoxGeometry(1, 1, 1);
  // material = new THREE.MeshBasicMaterial();
  // mesh = new THREE.Mesh(this.geometry, this.material);
  camera = new THREE.PerspectiveCamera(65, this.sizes.width/this.sizes.height, 0.1, 100);
  clock = new THREE.Clock();
  control!: OrbitControls;
  gui = new GUI();
  textures: {[key:string]: THREE.Texture} = {};
  textGeometry!: TextGeometry;
  textFont: any;
  params: {textTexture: number, donutTexture: number, text: string, font: number} = {textTexture: 1, donutTexture: 1, text: 'je t\'aime', font: 1};
  textMesh!: THREE.Mesh;
  fonts: Font[] = [];
  constructor() { }

  ngOnInit(): void {
    this.textures[1] = this.textureLoader.load('assets/textures/matcaps/1.png');
    this.textures[2] = this.textureLoader.load('assets/textures/matcaps/2.png');
    this.textures[3] = this.textureLoader.load('assets/textures/matcaps/3.png');
    this.textures[4] = this.textureLoader.load('assets/textures/matcaps/4.png');
    this.textures[5] = this.textureLoader.load('assets/textures/matcaps/5.png');
    this.textures[6] = this.textureLoader.load('assets/textures/matcaps/6.png');
    this.textures[7] = this.textureLoader.load('assets/textures/matcaps/7.png');
    this.textures[8] = this.textureLoader.load('assets/textures/matcaps/8.png');

    // helvetiker_bold.typeface.json
    // Scriptina_Regular.json
    // const axesHelper = new THREE.AxesHelper();
    // this.scene.add(axesHelper);
    this.fontLoader.load('assets/fonts/Scriptina_Regular.json', (font: Font) => {
      this.fonts.push(font);
      this.textFont = this.fonts[0];
      this.textGeometry = new TextGeometry(this.params.text, {font, size: 0.5, height: 0.2,
        curveSegments: 2, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.01, bevelOffset: 0.001});
      // this.textGeometry.computeBoundingBox();
      // const x = this.textGeometry?.boundingBox?.max?.x as number;
      // const y = this.textGeometry?.boundingBox?.max?.y as number;
      // const z = this.textGeometry?.boundingBox?.max?.z as number;
      // this.textGeometry.translate(
      //   -(x-0.01)/2,-(y-0.01)/2,-(z-0.03)/2,
      // );
      // this.textGeometry.computeBoundingBox();
      this.textGeometry.center();
      const textMaterial = new THREE.MeshMatcapMaterial({matcap: this.textures[this.params.textTexture]});
      this.textMesh = new THREE.Mesh(this.textGeometry, textMaterial);
      this.scene.add(this.textMesh);
      const donutGeometry = new THREE.TorusBufferGeometry(0.1, 0.05, 5, 50);
      const donutMaterial = new THREE.MeshMatcapMaterial({matcap: this.textures[this.params.donutTexture]});
      const donuts = [...Array(10000).keys()].map(() => {
        const donut = new THREE.Mesh(donutGeometry, donutMaterial);
        const length = 100;
        donut.position.x = (Math.random() * length) - (length/2);
        donut.position.y = (Math.random() * length) - (length/2);
        donut.position.z = (Math.random() * length) - (length/2);
        donut.rotation.x = (Math.random() * Math.PI);
        donut.rotation.y = (Math.random() * Math.PI);
        const scale = Math.random();
        donut.scale.x = scale;
        donut.scale.y = scale;
        donut.scale.z = scale;
        return donut;
      });
      donuts.forEach((donut) => this.scene.add(donut));
      this.gui.add(this.params, 'textTexture', Array.from(Array(8).keys()).map(a => a+1)).onChange((n: number) => {
        textMaterial.matcap = this.textures[n];
      });
      this.gui.add(this.params, 'donutTexture', Array.from(Array(8).keys()).map(a => a+1)).onChange((n: number) => {
        donutMaterial.matcap = this.textures[n];
      });
      this.gui.add(this.params, 'font', Array.from(Array(2).keys()).map(a => a+1)).onChange((n: number) => {
        this.updateTextMesh(this.fonts[n - 1]);
      });
    });

    this.fontLoader.load('assets/fonts/helvetiker_bold.typeface.json', (font: Font) => {
      this.fonts.push(font);
    });
  }

  updateInput(newtext: string) {
    this.params.text = newtext;
    this.updateTextMesh();
  }

  updateTextMesh(newFont?: Font) {
    console.log(newFont);
    if (newFont) {
      this.textFont = newFont;
    }
    this.scene.remove(this.textMesh);
    this.textGeometry = new TextGeometry(this.params.text, {font: this.textFont, size: 0.5, height: 0.2,
      curveSegments: 2, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.01, bevelOffset: 0.001});
    this.textGeometry.center();
    const textMaterial = new THREE.MeshMatcapMaterial({matcap: this.textures[this.params.textTexture]});
    this.textMesh = new THREE.Mesh(this.textGeometry, textMaterial);
    this.scene.add(this.textMesh);
  }

  ngAfterViewInit(): void {
    this.control = new OrbitControls(this.camera, this.canvas.nativeElement);
    this.camera.position.z = 3;
    this.scene.add(this.camera);
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas.nativeElement });
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    fromEvent(window, 'resize').subscribe(() => {
      // set width height sizes
      this.sizes.width = window.innerWidth;
      this.sizes.height = window.innerHeight;

      // update camera
      this.camera.aspect = this.sizes.width/this.sizes.height;
      this.camera.updateProjectionMatrix();

      // update renderer size and pixel ratio
      this.renderer.setSize(this.sizes.width, this.sizes.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    });
    this.tick();
  }

  tick() {
    // this.mesh.position.x += this.clock.getDelta();
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(() => this.tick());
  }

  ngOnDestroy(): void {
    this.gui.hide();
    this.gui.destroy();
  }

}
