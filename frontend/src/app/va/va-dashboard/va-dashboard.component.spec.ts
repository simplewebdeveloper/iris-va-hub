import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VaDashboardComponent } from './va-dashboard.component';

describe('VaDashboardComponent', () => {
  let component: VaDashboardComponent;
  let fixture: ComponentFixture<VaDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VaDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VaDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
