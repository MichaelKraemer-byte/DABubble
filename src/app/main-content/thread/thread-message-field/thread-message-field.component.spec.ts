import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreadMessageFieldComponent } from './thread-message-field.component';

describe('ThreadMessageFieldComponent', () => {
  let component: ThreadMessageFieldComponent;
  let fixture: ComponentFixture<ThreadMessageFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreadMessageFieldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreadMessageFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
