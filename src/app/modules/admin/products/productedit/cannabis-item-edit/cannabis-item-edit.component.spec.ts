import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CannabisItemEditComponent } from './cannabis-item-edit.component';

describe('CannabisItemEditComponent', () => {
  let component: CannabisItemEditComponent;
  let fixture: ComponentFixture<CannabisItemEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CannabisItemEditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CannabisItemEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
