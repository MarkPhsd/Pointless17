import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericNameSelectComponent } from './generic-name-select.component';

describe('GenericNameSelectComponent', () => {
  let component: GenericNameSelectComponent;
  let fixture: ComponentFixture<GenericNameSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenericNameSelectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenericNameSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
