import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetrcIntakeHeaderComponent } from './metrc-intake-header.component';

describe('MetrcIntakeHeaderComponent', () => {
  let component: MetrcIntakeHeaderComponent;
  let fixture: ComponentFixture<MetrcIntakeHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MetrcIntakeHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MetrcIntakeHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
