import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { Mesh } from 'three';
import GUI from 'lil-gui';
import gasp from 'gsap';
import { fromEvent, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-lesson10',
  templateUrl: './lesson10.component.html',
  styleUrls: ['./lesson10.component.scss']
})
export class Lesson10Component implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('webgl', {static: false}) canvas!: ElementRef;
  scene = new THREE.Scene();
  parameter = {
    color: '#ff00ff',
    spinner: () => {
      gasp.to(this.mesh.rotation, {duration:1, y: this.mesh.rotation.y + (Math.PI * Math.random())})
    }
  };
  material = new THREE.MeshBasicMaterial({color: this.parameter.color});
  mesh = new Mesh(new THREE.SphereGeometry(1,10,10), this.material)
  sizes = { width: window.innerWidth, height: window.innerHeight};
  camera = new THREE.PerspectiveCamera(65, this.sizes.width/this.sizes.height);
  gui = new GUI();
  renderer!: THREE.WebGLRenderer;
  unsubscribe: Subject<void> = new Subject<void>();
  constructor() { }
  ngOnDestroy(): void {
    this.gui.hide();
    this.gui.destroy();
    
  }
  ngAfterViewInit(): void {
    fromEvent(window, 'keyup').pipe(takeUntil(this.unsubscribe)).subscribe((event: Event) => {
      if ((event as KeyboardEvent)['key'] === 'h') {
        this.gui._hidden ? this.gui.show() : this.gui.hide();
      }
    });
    this.gui.addColor(this.parameter, 'color').onChange((newColor: string) => {
      this.material.color.set(newColor);
    });
    this.renderer = new THREE.WebGLRenderer({canvas: this.canvas.nativeElement});
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const clock = new THREE.Clock();
    this.tick(clock);
    // this.gui.add(this.mesh.position, 'y', -3, 3, 0.01);
    this.gui
      .add(this.mesh.position, 'y')
      .min(-3)
      .max(3)
      .step(0.01);
    this.gui
      .add(this.mesh, 'visible');
    this.gui.add(this.material, 'wireframe');
    this.gui.add(this.parameter, 'spinner');
    
    // this.gui.addColor(this.material, 'color');
  }

  tick(clock: THREE.Clock) {
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(() => this.tick(clock));
  }

  ngOnInit(): void {
    
    this.scene.add(this.mesh);
    this.scene.add(this.camera);
    // this.gui.add(this.mesh.position, 'x');
    this.camera.position.set(0,0,3);
  }



}
