import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainIntentsComponent } from './train-intents.component';

describe('TrainComponent', () => {
  let component: TrainIntentsComponent;
  let fixture: ComponentFixture<TrainIntentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrainIntentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainIntentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
