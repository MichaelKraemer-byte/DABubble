import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatMessageFieldComponent } from './chat-message-field.component';

describe('ChatMessageFieldComponent', () => {
  let component: ChatMessageFieldComponent;
  let fixture: ComponentFixture<ChatMessageFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatMessageFieldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatMessageFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
