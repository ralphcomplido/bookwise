import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Bookkeeper } from './bookkeeper';

describe('Bookkeeper', () => {
  let component: Bookkeeper;
  let fixture: ComponentFixture<Bookkeeper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Bookkeeper]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Bookkeeper);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
