import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetaTagChipsComponent } from './meta-tag-chips.component';

describe('MetaTagChipsComponent', () => {
  let component: MetaTagChipsComponent;
  let fixture: ComponentFixture<MetaTagChipsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MetaTagChipsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MetaTagChipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
