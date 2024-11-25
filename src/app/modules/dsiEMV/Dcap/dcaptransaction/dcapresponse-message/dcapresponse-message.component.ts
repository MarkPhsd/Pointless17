import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-dcapresponse-message',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ]
  templateUrl: './dcapresponse-message.component.html',
  styleUrls: ['./dcapresponse-message.component.scss']
})
export class DCAPResponseMessageComponent {

  @Input() response     : any;
  @Input() errorMessage : string;
  @Input() resultMessage: string;
  @Input() message      : any;
  @Input() processing   : boolean;
  @Input() saleComplete : boolean;

}
