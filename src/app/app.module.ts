import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { Lesson9Component } from './lesson9/lesson9.component';
import { Lesson0to8Component } from './lesson0to8/lesson0to8.component';
import { Lesson10Component } from './lesson10/lesson10.component';
import { RouterModule, Routes } from '@angular/router';
import { Lesson11Component } from './lesson11/lesson11.component';
import { Lesson12Component } from './lesson12/lesson12.component';
import { Lesson13Component } from './lesson13/lesson13.component';
import { Lesson15Component } from './lesson15/lesson15.component';
import { Lesson16Component } from './lesson16/lesson16.component';
import { Lesson17Component } from './lesson17/lesson17.component';
import { Lesson18Component } from './lesson18/lesson18.component';
import { Lesson20Component } from './lesson20/lesson20.component';
import { Lesson21Component } from './lesson21/lesson21.component';
import { Lesson22Component } from './lesson22/lesson22.component';
import { StudyComponent } from './study/study.component';
import { Lesson23Component } from './lesson23/lesson23.component';
import { Lesson25Component } from './lesson25/lesson25.component';
import { Lesson27Component } from './lesson27/lesson27.component';
import { Lesson28Component } from './lesson28/lesson28.component';

const routes: Routes = [
  {
    path: 'lesson27',
    component: Lesson27Component
  },
  {
    path: 'lesson25',
    component: Lesson25Component
  },
  {
    path: 'lesson23',
    component: Lesson23Component
  },
  {
    path: 'lesson22',
    component: Lesson22Component
  },
  {
    path: 'lesson21',
    component: Lesson21Component
  },
  {
    path: 'lesson20',
    component: Lesson20Component
  },
  {
    path: 'lesson18',
    component: Lesson18Component
  },
  {
    path: 'lesson17',
    component: Lesson17Component
  },
  {
    path: 'lesson16',
    component: Lesson16Component
  },
  {
    path: 'lesson15',
    component: Lesson15Component
  },
  {
    path: 'lesson13',
    component: Lesson13Component
  },
  {
    path: 'lesson12',
    component: Lesson12Component
  },
  {
    path: 'lesson11',
    component: Lesson11Component
  },
  {
    path: 'lesson10',
    component: Lesson10Component
  },
  {
    path: 'lesson9',
    component: Lesson9Component
  },
  {
    path: 'lesson0to8',
    component: Lesson0to8Component
  },
  {
    path: '**',
    component: StudyComponent
  }
];
@NgModule({
  declarations: [
    AppComponent,
    Lesson9Component,
    Lesson0to8Component,
    Lesson10Component,
    Lesson11Component,
    Lesson12Component,
    Lesson13Component,
    Lesson15Component,
    Lesson16Component,
    Lesson17Component,
    Lesson18Component,
    Lesson20Component,
    Lesson21Component,
    Lesson22Component,
    StudyComponent,
    Lesson23Component,
    Lesson25Component,
    Lesson27Component,
    Lesson28Component
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(routes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
