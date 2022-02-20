import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Lesson0to8Component } from './lesson0to8.component';

describe('Lesson0to8Component', () => {
  let component: Lesson0to8Component;
  let fixture: ComponentFixture<Lesson0to8Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Lesson0to8Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Lesson0to8Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
