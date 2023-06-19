import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartBuilderEditComponent } from './part-builder-edit.component';

describe('PartBuilderEditComponent', () => {
  let component: PartBuilderEditComponent;
  let fixture: ComponentFixture<PartBuilderEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PartBuilderEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartBuilderEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
