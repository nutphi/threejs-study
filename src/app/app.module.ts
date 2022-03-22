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

const routes: Routes = [
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
    component: Lesson15Component
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
    Lesson16Component
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
