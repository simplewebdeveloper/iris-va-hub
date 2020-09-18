import { TestBed } from '@angular/core/testing';

import { ChatboxService } from './chatbox.service';

describe('ChatboxService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ChatboxService = TestBed.get(ChatboxService);
    expect(service).toBeTruthy();
  });
});
