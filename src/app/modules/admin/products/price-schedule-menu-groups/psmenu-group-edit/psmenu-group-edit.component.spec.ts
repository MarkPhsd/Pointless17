import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PSMenuGroupEditComponent } from './psmenu-group-edit.component';

describe('PSMenuGroupEditComponent', () => {
  let component: PSMenuGroupEditComponent;
  let fixture: ComponentFixture<PSMenuGroupEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PSMenuGroupEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PSMenuGroupEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
