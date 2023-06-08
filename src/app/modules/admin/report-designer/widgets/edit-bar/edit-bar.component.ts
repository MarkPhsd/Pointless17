import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'pgReporting-edit-bar',
  templateUrl: './edit-bar.component.html',
  styleUrls: ['./edit-bar.component.scss']
})
export class EditBarComponent implements OnInit {

  @Input() hideSave: boolean = false;
  @Input() hideCopy: boolean = false;
  @Input() hideAdd: boolean = false;
  @Input() hideDelete: boolean = false;
  @Output() delete = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<boolean>();
  @Output() copy = new EventEmitter<boolean>();
  @Output() add = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit(): void {
  }
  addEvent() {
    this.add.emit(true)
    console.log('add event')
  }
  saveEvent() {
    this.save.emit(true)
  }
  copyEvent() {
    this.copy.emit(true)
  }
  deleteEvent() {
    const confirm = window.confirm('Are you sure you want to delte this? It is not reversible.')
    if (!confirm) { return }
    this.delete.emit(true)
  }

}
