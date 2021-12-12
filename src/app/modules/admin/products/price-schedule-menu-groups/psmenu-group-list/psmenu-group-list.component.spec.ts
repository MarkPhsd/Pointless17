import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PSMenuGroupListComponent } from './psmenu-group-list.component';

describe('PSMenuGroupListComponent', () => {
  let component: PSMenuGroupListComponent;
  let fixture: ComponentFixture<PSMenuGroupListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PSMenuGroupListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PSMenuGroupListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
