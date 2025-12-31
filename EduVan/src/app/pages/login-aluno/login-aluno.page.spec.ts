import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginAlunoPage } from './login-aluno.page';

describe('LoginAlunoPage', () => {
  let component: LoginAlunoPage;
  let fixture: ComponentFixture<LoginAlunoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginAlunoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
