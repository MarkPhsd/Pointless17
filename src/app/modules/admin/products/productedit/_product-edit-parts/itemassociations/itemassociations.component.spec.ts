import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemassociationsComponent } from './itemassociations.component';

describe('ItemassociationsComponent', () => {
  let component: ItemassociationsComponent;
  let fixture: ComponentFixture<ItemassociationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItemassociationsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemassociationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
