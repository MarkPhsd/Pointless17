import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiStoredValueComponent } from './api-stored-value.component';

describe('ApiStoredValueComponent', () => {
  let component: ApiStoredValueComponent;
  let fixture: ComponentFixture<ApiStoredValueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApiStoredValueComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApiStoredValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
