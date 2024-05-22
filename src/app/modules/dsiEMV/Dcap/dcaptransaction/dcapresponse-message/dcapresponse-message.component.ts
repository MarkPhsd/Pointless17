import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dcapresponse-message',
  templateUrl: './dcapresponse-message.component.html',
  styleUrls: ['./dcapresponse-message.component.scss']
})
export class DCAPResponseMessageComponent {

  @Input() response:any;
  @Input() errorMessage: string;
  @Input() resultMessage: string;
  @Input() message: any;
  @Input() processing: boolean;
  @Input() saleComplete: boolean;

}
