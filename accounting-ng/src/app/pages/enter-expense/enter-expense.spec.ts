import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnterExpense } from './enter-expense';

describe('EnterExpense', () => {
  let component: EnterExpense;
  let fixture: ComponentFixture<EnterExpense>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnterExpense]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnterExpense);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
