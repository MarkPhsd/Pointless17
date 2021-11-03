import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StrainsAddComponent } from './strains-add.component';

describe('StrainsAddComponent', () => {
  let component: StrainsAddComponent;
  let fixture: ComponentFixture<StrainsAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StrainsAddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StrainsAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
