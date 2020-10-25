import { TestBed } from '@angular/core/testing';

import { VaService } from './va.service';

describe('VaService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: VaService = TestBed.get(VaService);
    expect(service).toBeTruthy();
  });
});
