import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnterIncome } from './enter-income';

describe('EnterIncome', () => {
  let component: EnterIncome;
  let fixture: ComponentFixture<EnterIncome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnterIncome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnterIncome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
