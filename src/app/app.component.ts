import { AfterViewInit, Component, OnInit } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit, OnInit {
  scene = new THREE.Scene();
  sizes = {width: 800, height: 600};
  mesh = new THREE.Mesh(new THREE.BoxGeometry(1,1,1) , new THREE.MeshBasicMaterial({color: 'red'}));
  mesh2 = new THREE.Mesh(new THREE.BoxGeometry(1,1,1) , new THREE.MeshBasicMaterial({color: 'blue'}));
  mesh3 = new THREE.Mesh(new THREE.BoxGeometry(1,1,1) , new THREE.MeshBasicMaterial({color: 'green'}));
  mesh4 = new THREE.Mesh(new THREE.BoxGeometry(1,1,1) , new THREE.MeshBasicMaterial({color: 'yellow'}));
  group = new THREE.Group();

  clock = new THREE.Clock();
  axisHelper = new THREE.AxesHelper(2);
  camera = new THREE.PerspectiveCamera(45, this.sizes.width/this.sizes.height, 0.1, 100);
  renderer: any;
  counter: number = 0;
  time: number = 0;
  disabled: boolean = false;
  countdown: number = 3;

  downloadBlob: Blob| null = null;
  constructor() {}
  ngOnInit(): void {
    this.mesh.position.x = 1.5;
    this.mesh2.position.x = -1.5;
    this.mesh3.position.y = 1.5;
    this.mesh4.position.y = -1.5;
    this.group.add(this.mesh, this.mesh2, this.mesh3, this.mesh4);
    // this.group.rotation.x = Math.PI / 2;
    
    this.camera.position.z = 10;
    this.scene.add(this.camera);
    this.scene.add(this.group);
    this.scene.add(this.axisHelper);
  }

  ngAfterViewInit(): void {
    const canvas = document.querySelector('.webgl') as HTMLCanvasElement;
    this.renderer = new THREE.WebGLRenderer({canvas});
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    console.time('frame rate');
    this.time = Date.now();
    this.tick();
  }
  

  tick() {
    // const currentTime = Date.now();
    // const deltaTime = currentTime - this.time;
    // this.time = currentTime;
    // this.group.rotation.z += deltaTime * 0.001;
    this.group.rotation.z = this.clock.getElapsedTime();
    // this.group.rotation.y = this.clock.getElapsedTime();
    this.group.rotation.x = this.clock.getElapsedTime();
    this.group.position.x = Math.sin(this.clock.getElapsedTime());
    this.group.position.y = Math.cos(this.clock.getElapsedTime());
    this.renderer.render(this.scene, this.camera);
    this.counter++;
    window.requestAnimationFrame(() => this.tick());
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
        this.countdown = 3;
      } else {
        this.countdown--;
      }
    }, 1000); // stop recording in 3s
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
