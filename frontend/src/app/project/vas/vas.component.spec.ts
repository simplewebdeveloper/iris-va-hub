import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VasComponent } from './vas.component';

describe('VasComponent', () => {
  let component: VasComponent;
  let fixture: ComponentFixture<VasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
