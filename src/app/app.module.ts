import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { Lesson9Component } from './lesson9/lesson9.component';
import { Lesson0to8Component } from './lesson0to8/lesson0to8.component';
import { Lesson10Component } from './lesson10/lesson10.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
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
  }
];
@NgModule({
  declarations: [
    AppComponent,
    Lesson9Component,
    Lesson0to8Component,
    Lesson10Component
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
