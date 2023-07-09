import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChairsLayoutComponent } from './chairs-layout.component';

describe('ChairsLayoutComponent', () => {
  let component: ChairsLayoutComponent;
  let fixture: ComponentFixture<ChairsLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChairsLayoutComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChairsLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
