import { Component, ViewChild, ElementRef, AfterViewInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import GUI from 'lil-gui';
import { fromEvent, Subject } from 'rxjs';
import gsap from 'gsap';

@Component({
  selector: 'app-lesson21',
  templateUrl: './lesson21.component.html',
  styleUrls: ['./lesson21.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class Lesson21Component implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  cameraGroup!: THREE.Group;
  renderer!: THREE.WebGLRenderer;
  sizes!: { width: number; height: number };
  meshes: THREE.Mesh[] = [];
  meshToonMaterial!: THREE.MeshToonMaterial;
  gui!: GUI;
  directionalLight!: THREE.DirectionalLight;
  clock!: THREE.Clock;
  unsubscribe: Subject<void> = new Subject();
  textureLoader!: THREE.TextureLoader;
  parameters = { materialColor: 0x808080 };
  scrollY!: number;
  objectDistance!: number;
  cursor: { x: number; y: number } = { x: 0, y: 0 };
  currentSection!: number;
  constructor() { }
  ngOnDestroy(): void {
    this.gui?.hide();
    this.gui?.destroy();
  }
  
  ngAfterViewInit(): void {
    
    this.init();
    this.animate();
    this.currentSection = Math.round(window.scrollY/this.sizes.height);
    // assign window scroll y
    this.scrollY = window.scrollY;
    fromEvent(window, 'scroll').subscribe(() => {
      this.scrollY = window.scrollY;
      this.currentSection = Math.round(window.scrollY/this.sizes.height);
      gsap.to(this.meshes[2-this.currentSection].rotation,
        {
          duration: 3.5,
          ease: 'power2.inOut',
          x: '+=10',
          y: '+=10'
        }
        );
    });
    // mouse move for cursor ratio
    fromEvent(window, 'mousemove').subscribe((event: Event) => {
      this.cursor.x = (event as MouseEvent).clientX / this.sizes.width - 0.5;
      this.cursor.y = (event as MouseEvent).clientY / this.sizes.height - 0.5;
    });
  }

  init() {
    this.textureLoader = new THREE.TextureLoader();
    const texture = this.textureLoader.load('assets/textures/gradients/3.jpg');
    texture.magFilter = THREE.NearestFilter;
    this.sizes = {width: window.innerWidth, height: window.innerHeight};
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(35, this.sizes.width / this.sizes.height, 0.1, 1000);
    this.cameraGroup = new THREE.Group();
    // Material
    this.meshToonMaterial = new THREE.MeshToonMaterial({ color: this.parameters.materialColor,
      gradientMap: texture })
    /**
     * Objects
     */
    // object distance
    this.objectDistance = 4;

    // Meshes
    this.meshes.unshift(new THREE.Mesh(
      new THREE.TorusGeometry(1, 0.4, 16, 60),
      this.meshToonMaterial
    ));
    this.meshes.unshift(new THREE.Mesh(
      new THREE.ConeGeometry(1, 2, 32),
      this.meshToonMaterial
    ));
    this.meshes.unshift(new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
      this.meshToonMaterial
    ));

    // update position y of meshes from distance
    this.meshes.forEach((mesh, index) => {
      mesh.position.x = (index === 1 ? 1.5 : -1.5);
      mesh.position.y = this.objectDistance * (index - 2);
    });

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    this.directionalLight.position.set(1, 1, 0);
    this.scene.add(this.directionalLight);


    this.scene.add(...this.meshes);

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas.nativeElement, alpha: true });
    
    /**
     * Particles
     */
    // Geometry
    const particlesCount = 2000
    const positions = new Float32Array(particlesCount * 3)

    for(let i = 0; i < particlesCount; i++)
    {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (this.objectDistance *0.5) -  (Math.random() * this.objectDistance * this.meshes.length);
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }

    const particlesGeometry = new THREE.BufferGeometry()
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    // Material
    const particlesMaterial = new THREE.PointsMaterial({
      color: this.parameters.materialColor,
      sizeAttenuation: true,
      size: 0.03
    })

    // Points
    const particles = new THREE.Points(particlesGeometry, particlesMaterial)
    this.scene.add(particles)


    this.camera.position.set(0, 0, 5);
    this.cameraGroup.add(this.camera);
    this.scene.add(this.cameraGroup);
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    this.clock = new THREE.Clock();
    this.gui = new GUI(this.renderer.domElement);
    this.gui.addColor(this.parameters, 'materialColor').onChange(() => {
      this.meshToonMaterial.color.set(this.parameters.materialColor);
    });
    fromEvent(window, 'resize').subscribe(() => {
      this.sizes = {width: window.innerWidth, height: window.innerHeight};
      this.renderer.setSize(this.sizes.width, this.sizes.height);
      this.camera.aspect = this.sizes.width / this.sizes.height;
      this.camera.updateProjectionMatrix();
    });
  }
  previousTime = 0;
  animate() {
    const elapsedTime = this.clock.getElapsedTime();
    const deltaTime = elapsedTime - this.previousTime;
    this.previousTime = elapsedTime;

    // set camara position from scrollY with right direction
    this.camera.position.y = - this.scrollY / this.sizes.height * this.objectDistance;

    // parallax camera
    const parallaxX = this.cursor.x;
    const parallaxY = this.cursor.y;
    this.cameraGroup.position.x += (parallaxX - this.cameraGroup.position.x) * 2 * deltaTime;
    this.cameraGroup.position.y += (parallaxY - this.cameraGroup.position.y) * 2 * deltaTime;

    // animate mesh in different speed
    this.meshes.forEach((mesh, index) => {
      mesh.rotation.x += deltaTime * (index + 1) * 0.5;
      mesh.rotation.y += deltaTime * (index + 1) * 0.2;
    });
    // this.camera.lookAt(this.scene.position);
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(() => this.animate());
  }
}
