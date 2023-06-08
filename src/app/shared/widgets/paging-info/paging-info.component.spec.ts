import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagingInfoComponent } from './paging-info.component';

describe('PagingInfoComponent', () => {
  let component: PagingInfoComponent;
  let fixture: ComponentFixture<PagingInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PagingInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PagingInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
