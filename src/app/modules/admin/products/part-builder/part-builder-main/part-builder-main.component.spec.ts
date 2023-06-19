import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartBuilderMainComponent } from './part-builder-main.component';

describe('PartBuilderMainComponent', () => {
  let component: PartBuilderMainComponent;
  let fixture: ComponentFixture<PartBuilderMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PartBuilderMainComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartBuilderMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
