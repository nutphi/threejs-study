import { AfterViewInit, Component, OnInit } from '@angular/core';
import { fromEvent, Subject, takeUntil } from 'rxjs';
import * as THREE from 'three';
@Component({
  selector: 'app-lesson9',
  templateUrl: './lesson9.component.html',
  styleUrls: ['./lesson9.component.scss']
})
export class Lesson9Component implements OnInit, AfterViewInit {
  direction: { x: boolean, y: boolean, z: boolean} =  { x: true, y: false, z: true};
  scene = new THREE.Scene();
  sizes = {width: window.innerWidth, height: window.innerHeight};
  camera = new THREE.PerspectiveCamera(65, this.sizes.width/this.sizes.height);
  mesh: THREE.Mesh = new THREE.Mesh();
  renderer: any;
  canvas: HTMLCanvasElement | undefined;
  unsubscribe: Subject<void> = new Subject<void>();
  constructor() { }
  ngAfterViewInit(): void {
    const count = 50;
    const positionsArray = new Float32Array(count * 3 * 3);
    // const positionsArray = new Float32Array([
    //   0,0,0,
    //   0,1,0,
    //   1,0,0
    // ]);
    // positionsArray.forEach((value => value = Math.random()));
    for (let i = 0; i < count * 3 * 3; i++ ) {
      positionsArray[i] = Math.random();
    }
    // console.log(positionsArray);
    const positionsAttribute = new THREE.BufferAttribute(positionsArray, 3);
    const bufferGeometry = new THREE.BufferGeometry();
    bufferGeometry.setAttribute('position', positionsAttribute);
    
    this.mesh = new THREE.Mesh(bufferGeometry, new THREE.MeshBasicMaterial({color: 'red', wireframe: true}));
    this.mesh.position.set(0, 0, 0);
    this.scene.add(this.mesh);
    this.scene.add(this.camera);
    this.camera.position.set(0, 0, 3);
    this.canvas = document.querySelector('.webgl9') as HTMLCanvasElement;
    this.renderer = new THREE.WebGLRenderer({canvas: this.canvas});
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.render(this.scene, this.camera);
    // const clock = new THREE.Clock();
    // this.tick(clock);

    // this.screen();
  }

  screen () {
    fromEvent(window, 'dblclick').pipe(takeUntil(this.unsubscribe)).subscribe(() => {
      const fullscreenElement = document.fullscreenElement || (document as any)['webkitRequestFullscreen']
      if (!fullscreenElement) {
        if (this.canvas?.requestFullscreen) {
          this.canvas.requestFullscreen();
        } else if ((this.canvas as any)['webkitRequestFullscreen']) {
          (this.canvas as any)['webkitRequestFullscreen']();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if ((document as any)['webkitExitFullscreen']) {
          (document as any)['webkitExitFullscreen']();
        }
      }
    });
  }

  ngOnInit(): void {
  }

  tick(clock: THREE.Clock) {
    if (this.mesh.position.x >= 2.5) {
      this.direction.x = false;
      
    } else if (this.mesh.position.x <= -2.5) {
      this.direction.x = true;
    }

    if (this.mesh.position.y >= 2.5) {
      this.direction.y = false;
    } else if (this.mesh.position.y <= -2.5) {
      this.direction.y = true;
    }

    if (this.mesh.position.z >= 2.5) {
      this.direction.z = false;
    } else if (this.mesh.position.z <= -2.5) {
      this.direction.z = true;
    }
    const delta = clock.getDelta();
    if (this.direction.x) {
      console.log('x+');
      this.mesh.position.x+= delta;
    } else {
      console.log('x-');
      this.mesh.position.x-= delta;
    }

    if (this.direction.y) {
      console.log('y+');
      this.mesh.position.y+= delta;
    } else {
      console.log('y-');
      this.mesh.position.y-= delta;
    }

    if (this.direction.z) {
      console.log('z+');
      this.mesh.position.z+= delta;
    } else {
      console.log('z-');
      this.mesh.position.z-= delta;
    }

    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(() => this.tick(clock));
  }

}
