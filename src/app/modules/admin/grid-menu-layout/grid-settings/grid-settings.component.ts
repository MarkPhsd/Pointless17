import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-grid-settings',
  templateUrl: './grid-settings.component.html',
  styleUrls: ['./grid-settings.component.scss']
})
export class GridSettingsComponent implements OnInit {
  @Input() modal: boolean;

  // Tell to parent component that modal is close
  @Output() closeModal = new EventEmitter();
  constructor() { }

  ngOnInit(): void {
    const i = 0
  }

}
