import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AreaAdminPage } from './area-admin.page';

describe('AreaAdminPage', () => {
  let component: AreaAdminPage;
  let fixture: ComponentFixture<AreaAdminPage>;
 
  beforeEach(() => {
    fixture = TestBed.createComponent(AreaAdminPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
