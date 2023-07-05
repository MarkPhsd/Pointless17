import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartBuilderSelectorComponent } from './part-builder-selector.component';

describe('PartBuilderSelectorComponent', () => {
  let component: PartBuilderSelectorComponent;
  let fixture: ComponentFixture<PartBuilderSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PartBuilderSelectorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartBuilderSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
