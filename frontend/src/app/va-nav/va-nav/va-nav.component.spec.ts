import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VaNavComponent } from './va-nav.component';

describe('VaNavComponent', () => {
  let component: VaNavComponent;
  let fixture: ComponentFixture<VaNavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VaNavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VaNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
