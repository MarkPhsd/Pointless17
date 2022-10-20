import { Component, OnInit, Output,EventEmitter } from '@angular/core';
import { IRequestMessage } from 'src/app/_services/system/request-message.service';

@Component({
  selector: 'app-request-message',
  templateUrl: './request-message.component.html',
  styleUrls: ['./request-message.component.scss']
})
export class RequestMessageComponent implements OnInit {

  @Output() actionEvent = new EventEmitter();
  @Output() archiveEvent = new EventEmitter();
  
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
