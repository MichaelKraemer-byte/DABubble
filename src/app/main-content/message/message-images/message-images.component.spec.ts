import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageImagesComponent } from './message-images.component';

describe('MessageImagesComponent', () => {
  let component: MessageImagesComponent;
  let fixture: ComponentFixture<MessageImagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageImagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MessageImagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
