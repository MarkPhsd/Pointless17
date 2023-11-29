import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResaleClassesMainComponent } from './resale-classes-main.component';

describe('ResaleClassesMainComponent', () => {
  let component: ResaleClassesMainComponent;
  let fixture: ComponentFixture<ResaleClassesMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResaleClassesMainComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResaleClassesMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
