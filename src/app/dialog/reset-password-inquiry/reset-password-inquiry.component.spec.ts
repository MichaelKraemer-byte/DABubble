import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetPasswordInquiryComponent } from './reset-password-inquiry.component';

describe('ResetPasswordInquiryComponent', () => {
  let component: ResetPasswordInquiryComponent;
  let fixture: ComponentFixture<ResetPasswordInquiryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetPasswordInquiryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResetPasswordInquiryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
