import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent{
  page = 0;
  constructor(private route: ActivatedRoute) {
    console.log(route);
  }
  next() {
    this.page+=1;
  }
  previous() {
    this.page-=1;
  }
}
