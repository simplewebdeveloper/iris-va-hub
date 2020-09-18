import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainSvpsComponent } from './train-svps.component';

describe('TrainSvpsComponent', () => {
  let component: TrainSvpsComponent;
  let fixture: ComponentFixture<TrainSvpsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrainSvpsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrainSvpsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
