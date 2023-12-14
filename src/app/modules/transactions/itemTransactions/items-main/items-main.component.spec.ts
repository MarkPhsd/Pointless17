import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemsMainComponent } from './items-main.component';

describe('ItemsMainComponent', () => {
  let component: ItemsMainComponent;
  let fixture: ComponentFixture<ItemsMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemsMainComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemsMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
