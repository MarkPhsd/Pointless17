import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyThingComponent } from './my-thing.component';

describe('MyThingComponent', () => {
  let component: MyThingComponent;
  let fixture: ComponentFixture<MyThingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyThingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyThingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
