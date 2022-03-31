import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { fromEvent, Subject, takeUntil } from 'rxjs';
import * as THREE from 'three';
import { Raycaster } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface CustomMesh {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
}

interface CustomMeshSet {
  [key: string]: CustomMesh;
  sphere1: CustomMesh;
  sphere2: CustomMesh;
  sphere3: CustomMesh;
}

interface ScreenSize {
  width: number;
  height: number;
}

@Component({
  selector: 'app-lesson20',
  templateUrl: './lesson20.component.html',
  styleUrls: ['./lesson20.component.scss']
})
export class Lesson20Component implements AfterViewInit {
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  size!: ScreenSize;

  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;

  control!: OrbitControls;

  renderer!: THREE.WebGLRenderer;
  

  meshes!: THREE.Mesh[];
  meshSet!: CustomMeshSet;

  ambientLight!: THREE.AmbientLight;

  clock!: THREE.Clock;

  raycaster!: THREE.Raycaster;
  mouse!: THREE.Vector2;

  unsubscribe = new Subject<void>();

  currentIntersect: any;
  constructor() { }

  ngAfterViewInit(): void {
    this.scene = new THREE.Scene();
    this.size = {width: window.innerWidth, height: window.innerHeight};

    const geometry1 = new THREE.SphereBufferGeometry(0.5, 16, 16);
    const geometry2 = new THREE.SphereBufferGeometry(0.5, 16, 16);
    const geometry3 = new THREE.SphereBufferGeometry(0.5, 16, 16);
    const material1 = new THREE.MeshBasicMaterial({color: '#ff0000'});
    const material2 = new THREE.MeshBasicMaterial({color: '#ff0000'});
    const material3 = new THREE.MeshBasicMaterial({color: '#ff0000'});
    const cameraPosition = [0,0,4] as const;
    const sphereMesh1Position = [-2,0,0] as const;
    const sphereMesh2Position = [0,0,0] as const;
    const sphereMesh3Position = [2,0,0] as const;

    this.camera = new THREE.PerspectiveCamera(65, this.size.width/this.size.height, 0.001, 3000);
    this.camera.position.set(...cameraPosition);

    this.control = new OrbitControls(this.camera, this.canvas.nativeElement);

    this.meshSet = {
      sphere1: {geometry: geometry1, material: material1},
      sphere2: {geometry: geometry2, material: material2},
      sphere3: {geometry: geometry3, material: material3}
    };

    const sphereMesh1 = new THREE.Mesh(this.meshSet.sphere1.geometry, this.meshSet.sphere1.material);
    sphereMesh1.position.set(...sphereMesh1Position);
    const sphereMesh2 = new THREE.Mesh(this.meshSet.sphere2.geometry, this.meshSet.sphere2.material);
    sphereMesh2.position.set(...sphereMesh2Position);
    const sphereMesh3 = new THREE.Mesh(this.meshSet.sphere3.geometry, this.meshSet.sphere3.material);
    sphereMesh3.position.set(...sphereMesh3Position);

    this.raycaster = new THREE.Raycaster();

    // const rayorigin = new THREE.Vector3(-3, 0, 0);
    // const rayDirection = new THREE.Vector3(10, 0, 0);
    // rayDirection.normalize(); // change to 1 unit (before it is 0 -> 10 = 10 units)

    // this.raycaster.set(rayorigin, rayDirection);

    // const intersect = this.raycaster.intersectObject(sphereMesh2);
    // const intersects = this.raycaster.intersectObjects([sphereMesh1, sphereMesh2, sphereMesh3]);
    this.meshes = [];
    this.meshes.push(sphereMesh1, sphereMesh2, sphereMesh3);
    this.scene.add(this.camera, ...this.meshes);
    this.renderer = new THREE.WebGLRenderer({canvas: this.canvas.nativeElement});
    this.renderer.setSize(this.size.width, this.size.height);

    this.mouse = new THREE.Vector2();
    fromEvent(window, 'mousemove').pipe(takeUntil(this.unsubscribe))
      .subscribe((event: Event) => {
        this.mouse.x = (event as MouseEvent).clientX / this.size.width * 2 - 1;
        this.mouse.y = - (event as MouseEvent).clientY / this.size.height * 2 + 1; // 1 at the top and -1 at the bottom
    });
    fromEvent(window, 'click').pipe(takeUntil(this.unsubscribe))
    .subscribe((event: Event) => {
      
      if (this.currentIntersect) {
        const index = this.meshes.map((mesh,i) => ({mesh, i})).filter(m => m.mesh === this.currentIntersect.object).map(m => m.i);
        console.log('click on sphere:' + index);
      }
      // this.mouse.x = (event as MouseEvent).clientX / this.size.width * 2 - 1;
      // this.mouse.y = - (event as MouseEvent).clientY / this.size.height * 2 + 1; // 1 at the top and -1 at the bottom
  });
    this.clock = new THREE.Clock();
    this.tick();
  }

  tick() {
    const elapsed = this.clock.getElapsedTime();
    this.meshes[0].position.y = Math.sin(elapsed * 0.3) * 1.5;
    this.meshes[1].position.y = Math.sin(elapsed * 0.9) * 1.5;
    this.meshes[2].position.y = Math.sin(elapsed * 1.5) * 1.5;

    // cast (Create) a ray
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // const raycaster = new THREE.Raycaster();

    // const rayorigin = new THREE.Vector3(-3, 0, 0);
    // const rayDirection = new THREE.Vector3(10, 0, 0);
    // rayDirection.normalize(); // change to 1 unit (before it is 0 -> 10 = 10 units)

    // this.raycaster.set(rayorigin, rayDirection);
    this.meshes.forEach(mesh => {
      (mesh.material as THREE.MeshBasicMaterial).color.set('#ff0000');
    })

    const intersects  = this.raycaster.intersectObjects(this.meshes);
    intersects.forEach(intersect => {
      const mesh = intersect.object as THREE.Mesh;
      (mesh.material as THREE.MeshBasicMaterial).color.set('#00ff00');
    })

    // mouse enter/ mouse leave
    if (intersects.length) {
      if (!this.currentIntersect) {
        console.log('mouse enter');
      }
      this.currentIntersect = intersects[0];
    } else {
      if (this.currentIntersect) {
        console.log('mouse leave');
      }
      this.currentIntersect = null;
    }
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(() => this.tick());
  }

}
