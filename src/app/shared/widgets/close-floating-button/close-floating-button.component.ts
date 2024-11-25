import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AppMaterialModule } from 'src/app/app-material.module';

@Component({
  selector: 'close-floating-button',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,],
  templateUrl: './close-floating-button.component.html',
  styleUrls: ['./close-floating-button.component.scss']
})
export class CloseFloatingButtonComponent implements OnInit {

  @Input() position: string;
  @Output() ouputClose = new EventEmitter<any>();
  firstChange: boolean;
  changesMade: boolean;

  constructor() { }

  ngOnInit(): void {
    if (!this.position) {
      this.position = 'float-upper-right'
    }
  }

  outPutUpdateSetting() {
    this.ouputClose.emit('true');
  }
}

