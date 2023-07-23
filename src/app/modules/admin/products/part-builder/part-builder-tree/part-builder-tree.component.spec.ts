import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartBuilderTreeComponent } from './part-builder-tree.component';

describe('PartBuilderTreeComponent', () => {
  let component: PartBuilderTreeComponent;
  let fixture: ComponentFixture<PartBuilderTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PartBuilderTreeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartBuilderTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
