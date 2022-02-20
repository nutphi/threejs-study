import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { Mesh } from 'three';
import GUI from 'lil-gui';

@Component({
  selector: 'app-lesson10',
  templateUrl: './lesson10.component.html',
  styleUrls: ['./lesson10.component.scss']
})
export class Lesson10Component implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('webgl', {static: false}) canvas!: ElementRef;
  scene = new THREE.Scene();
  parameter = {
    color: '#ff00ff'
  };
  material = new THREE.MeshBasicMaterial({color: this.parameter.color});
  mesh = new Mesh(new THREE.SphereGeometry(1,10,10), this.material)
  sizes = { width: window.innerWidth, height: window.innerHeight};
  camera = new THREE.PerspectiveCamera(65, this.sizes.width/this.sizes.height);
  gui = new GUI();
  renderer!: THREE.WebGLRenderer;
  constructor() { }
  ngOnDestroy(): void {
    this.gui.hide();
    this.gui.destroy();
    
  }
  ngAfterViewInit(): void {
    this.gui.addColor(this.parameter, 'color').onChange((newColor: string) => {
      this.material.color.set(newColor);
    });
    this.renderer = new THREE.WebGLRenderer({canvas: this.canvas.nativeElement});
    this.renderer.setSize(this.sizes.width, this.sizes.height);
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
