import { CommonModule } from '@angular/common';
import { Component, OnInit, Output,EventEmitter,Input } from '@angular/core';
import { IRequestMessage } from 'src/app/_services/system/request-message.service';
import { AppMaterialModule } from 'src/app/app-material.module';

@Component({
  selector: 'app-request-message',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,],
  templateUrl: './request-message.component.html',
  styleUrls: ['./request-message.component.scss']
})
export class RequestMessageComponent implements OnInit {

  @Output() actionEvent = new EventEmitter();
  @Output() archiveEvent = new EventEmitter();
  @Input() enableActions : boolean
  message: IRequestMessage

  constructor() { }

  ngOnInit(): void {
    const i = 0
  }

  action() {
    this.actionEvent.emit(this.message)
  }

  toggleArchive() {
    this.archiveEvent.emit(this.message)
  }
}
