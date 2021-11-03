import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientTypeEditComponent } from './client-type-edit.component';

describe('ClientTypeEditComponent', () => {
  let component: ClientTypeEditComponent;
  let fixture: ComponentFixture<ClientTypeEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientTypeEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientTypeEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
