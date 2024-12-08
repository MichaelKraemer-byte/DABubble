import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreadImagesPreviewComponent } from './thread-images-preview.component';

describe('ThreadImagesPreviewComponent', () => {
  let component: ThreadImagesPreviewComponent;
  let fixture: ComponentFixture<ThreadImagesPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThreadImagesPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThreadImagesPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
