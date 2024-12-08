import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageTextComponent } from './message-text.component';

describe('MessageTextComponent', () => {
  let component: MessageTextComponent;
  let fixture: ComponentFixture<MessageTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageTextComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MessageTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
