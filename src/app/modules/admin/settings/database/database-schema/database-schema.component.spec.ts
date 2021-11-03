import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatabaseSchemaComponent } from './database-schema.component';

describe('DatabaseSchemaComponent', () => {
  let component: DatabaseSchemaComponent;
  let fixture: ComponentFixture<DatabaseSchemaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatabaseSchemaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DatabaseSchemaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
