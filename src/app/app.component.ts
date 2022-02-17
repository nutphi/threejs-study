import { AfterViewInit, Component, OnInit } from '@angular/core';
import { fromEvent, Subject, takeUntil } from 'rxjs';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import gsap from 'gsap';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit, OnInit {
  readonly COUNT_VDO_RENDER_IN_SEC = 10;
  scene = new THREE.Scene();
  sizes = {width: window.innerWidth, height: window.innerHeight};
  mesh = new THREE.Mesh(new THREE.BoxGeometry(1,1,1) , new THREE.MeshBasicMaterial({color: 'red', wireframe: true}));
  mesh2 = new THREE.Mesh(new THREE.BoxGeometry(1,1,1) , new THREE.MeshBasicMaterial({color: 'blue', wireframe: true}));
  mesh3 = new THREE.Mesh(new THREE.SphereGeometry(1, 9) , new THREE.MeshBasicMaterial({color: 'yellow', wireframe: true}));
  // mesh3 = new THREE.Mesh(new THREE.BoxGeometry(1,1,1) , new THREE.MeshBasicMaterial({color: 'green'}));
  // mesh4 = new THREE.Mesh(new THREE.BoxGeometry(1,1,1) , new THREE.MeshBasicMaterial({color: 'yellow'}));
  // group = new THREE.Group();

  clock = new THREE.Clock();
  axisHelper = new THREE.AxesHelper(2);
  camera = new THREE.PerspectiveCamera(45, this.sizes.width/this.sizes.height, 0.1, 100);
  renderer: any;
  counter: number = 0;
  time: number = 0;
  disabled: boolean = false;
  countdown: number = this.COUNT_VDO_RENDER_IN_SEC;

  downloadBlob: Blob| null = null;
  control: OrbitControls| undefined;
  unsubscribe = new Subject<void>();
  test: boolean = false;
  constructor() {}
  ngOnInit(): void {
    this.mesh.position.x = 2;
    this.mesh.position.y = -2.5;
    this.mesh2.position.x = -2;
    this.mesh2.position.y = -2.5;
    this.mesh3.position.x = 0;
    this.mesh3.position.y = -2.5;
    // this.mesh2.position.x = -1.5;
    // this.mesh3.position.y = 1.5;
    // this.mesh4.position.y = -1.5;
    // this.group.add(this.mesh, this.mesh2, this.mesh3, this.mesh4);
    // this.group.rotation.x = Math.PI / 2;
    
    this.camera.position.z = 10;
    this.scene.add(this.camera);
    // this.scene.add(this.group);
    this.scene.add(this.mesh);
    this.scene.add(this.mesh2);
    this.scene.add(this.mesh3);
    // this.scene.add(this.axisHelper);
    fromEvent(window, 'resize').pipe(takeUntil(this.unsubscribe)).subscribe(() => {
      this.sizes = { width: window.innerWidth, height: window.innerHeight };
      this.renderer.setSize(this.sizes.width, this.sizes.height);
    })
  }
  
  swap() {
    this.test = !this.test;
    // this.renderer.render(this.scene, this.camera);
  }

  ngAfterViewInit(): void {
    const canvas = document.querySelector('.webgl') as HTMLCanvasElement;
    this.control = new OrbitControls(this.camera, canvas);
    this.control.enableDamping = true;    
    this.renderer = new THREE.WebGLRenderer({canvas});
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    console.time('frame rate');
    this.time = Date.now();
    // gsap.to(this.group.position, {duration: 2, delay: 1, x: 3});
    // gsap.to(this.group.position, {duration: 2, delay: 1, x: -3});
    const clock = new THREE.Clock();
    this.tick(clock);
  }
  

  tick(clock: THREE.Clock) {
    const currentTime = Date.now();
    const deltaTime = currentTime - this.time;
    this.time = currentTime;
    this.mesh.rotation.y = clock.getElapsedTime();
    this.mesh2.rotation.y = -clock.getElapsedTime();
    // this.group.rotation.z += deltaTime * 0.001;
    // this.group.rotation.z = this.clock.getElapsedTime();
    // this.group.rotation.y = this.clock.getElapsedTime();
    // this.group.rotation.x = this.clock.getElapsedTime();
    // this.group.position.x = Math.sin(this.clock.getElapsedTime());
    // this.group.position.y = Math.cos(this.clock.getElapsedTime());
    if (this.test) {
      this.mesh3.rotation.z = clock.getElapsedTime() / 4;
      this.camera.lookAt(this.mesh.position);
    } else {
      this.mesh3.rotation.z = -clock.getElapsedTime() / 4;
      this.camera.lookAt(this.mesh2.position);
    }
    this.renderer.render(this.scene, this.camera);
    this.counter++;
    window.requestAnimationFrame(() => this.tick(clock));
    if (this.counter === 60) {
      console.timeLog('frame rate');
      this.counter = 0;
    }
    
  }

  startRecording() {
    if (this.disabled) {
      return;
    }
    this.disabled = true;
    const isSafari = /^((?!chrome|chromium|android).)*safari/i.test(navigator.userAgent);
    const chunks: any[] = []; // here we will store our recorded media chunks (Blobs)
    const canvas = document.querySelector('.webgl') as HTMLCanvasElement;
    const stream = canvas.captureStream(); // grab our canvas MediaStream
    const rec = new MediaRecorder(stream); // init the recorder
    // every time the recorder has new data, we will store it in our array
    rec.ondataavailable = e => chunks.push(e.data);
    // only when the recorder stops, we construct a complete Blob from all the chunks
    rec.onstop = e => this.downloadBlob = new Blob(chunks, {type: isSafari ? 'video/mpeg4' : 'video/webm'});
    
    rec.start();
    const countdownInterval = setInterval(()=> {
      if (this.countdown === 0) {
        rec.stop();
        clearInterval(countdownInterval);
        this.disabled = false;
        this.countdown = this.COUNT_VDO_RENDER_IN_SEC;
      } else {
        this.countdown--;
      }
    }, 1000);
  }

  download() {
    if (this.downloadBlob != null) {
      const vid = document.createElement('video');
      vid.src = URL.createObjectURL(this.downloadBlob);
      vid.controls = true;
      const a = document.createElement('a');
      a.download = 'myvid.mp4';
      a.href = vid.src;
      a.click();
    }
  }

  seeVideo() {
    if (this.downloadBlob != null) {
      const vid = document.createElement('video');
      vid.src = URL.createObjectURL(this.downloadBlob);
      vid.controls = true;
      document.querySelector('.video')?.appendChild(vid);
    }
  }  
}
