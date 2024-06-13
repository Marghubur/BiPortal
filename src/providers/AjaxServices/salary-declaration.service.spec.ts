import { TestBed } from '@angular/core/testing';

import { SalaryDeclarationHttpService } from './salary-declaration-http.service';

describe('SalaryDeclarationHttpService', () => {
  let service: SalaryDeclarationHttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SalaryDeclarationHttpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
