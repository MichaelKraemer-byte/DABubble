import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccessCreatingAccountComponent } from './success-creating-account.component';

describe('SuccessCreatingAccountComponent', () => {
  let component: SuccessCreatingAccountComponent;
  let fixture: ComponentFixture<SuccessCreatingAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuccessCreatingAccountComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuccessCreatingAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
