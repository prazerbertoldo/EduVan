import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginMotoristaPage } from './login-motorista.page';

describe('LoginMotoristaPage', () => {
  let component: LoginMotoristaPage;
  let fixture: ComponentFixture<LoginMotoristaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginMotoristaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
