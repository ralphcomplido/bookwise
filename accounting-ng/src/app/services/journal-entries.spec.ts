import { TestBed } from '@angular/core/testing';

import { JournalEntries } from './journal-entries';

describe('JournalEntries', () => {
  let service: JournalEntries;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JournalEntries);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
