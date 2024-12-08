import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevspaceComponent } from './devspace.component';

describe('DevspaceComponent', () => {
  let component: DevspaceComponent;
  let fixture: ComponentFixture<DevspaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevspaceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevspaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
