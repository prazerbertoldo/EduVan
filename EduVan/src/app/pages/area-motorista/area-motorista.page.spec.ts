import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AreaMotoristaPage } from './area-motorista.page';

describe('AreaMotoristaPage', () => {
  let component: AreaMotoristaPage;
  let fixture: ComponentFixture<AreaMotoristaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AreaMotoristaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
