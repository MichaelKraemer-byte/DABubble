import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageNameComponent } from './message-name.component';

describe('MessageNameComponent', () => {
  let component: MessageNameComponent;
  let fixture: ComponentFixture<MessageNameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageNameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MessageNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
