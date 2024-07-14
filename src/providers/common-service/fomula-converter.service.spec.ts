import { TestBed } from '@angular/core/testing';

import { FomulaConverterService } from './fomula-converter.service';

describe('FomulaConverterService', () => {
  let service: FomulaConverterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FomulaConverterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
