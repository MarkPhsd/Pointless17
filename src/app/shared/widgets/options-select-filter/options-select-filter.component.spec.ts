import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionsSelectFilterComponent } from './options-select-filter.component';

describe('OptionsSelectFilterComponent', () => {
  let component: OptionsSelectFilterComponent;
  let fixture: ComponentFixture<OptionsSelectFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OptionsSelectFilterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OptionsSelectFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
