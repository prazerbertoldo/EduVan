import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AreaAlunoPage } from './area-aluno.page';

describe('AreaAlunoPage', () => {
  let component: AreaAlunoPage;
  let fixture: ComponentFixture<AreaAlunoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AreaAlunoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
