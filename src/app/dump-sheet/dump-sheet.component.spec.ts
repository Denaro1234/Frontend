import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DumpSheetComponent } from './dump-sheet.component';

describe('DumpSheetComponent', () => {
  let component: DumpSheetComponent;
  let fixture: ComponentFixture<DumpSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DumpSheetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DumpSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
