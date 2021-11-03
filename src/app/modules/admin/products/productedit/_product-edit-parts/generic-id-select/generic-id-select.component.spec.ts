import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericIdSelectComponent } from './generic-id-select.component';

describe('GenericIdSelectComponent', () => {
  let component: GenericIdSelectComponent;
  let fixture: ComponentFixture<GenericIdSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenericIdSelectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericIdSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
