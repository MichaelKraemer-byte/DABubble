import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchBarComponentDevSpace } from './search-bar.component';

describe('SearchBarComponent', () => {
  let component: SearchBarComponentDevSpace;
  let fixture: ComponentFixture<SearchBarComponentDevSpace>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchBarComponentDevSpace]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchBarComponentDevSpace);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
