import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartBuilderComponentEditComponent } from './part-builder-component-edit.component';

describe('PartBuilderComponentEditComponent', () => {
  let component: PartBuilderComponentEditComponent;
  let fixture: ComponentFixture<PartBuilderComponentEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PartBuilderComponentEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartBuilderComponentEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
