import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Registered } from './registered';

describe('Registered', () => {
  let component: Registered;
  let fixture: ComponentFixture<Registered>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Registered]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Registered);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
