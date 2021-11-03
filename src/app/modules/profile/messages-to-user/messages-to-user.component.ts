import { Component, Input, OnInit } from '@angular/core';
import { IUserProfile } from 'src/app/_interfaces';

@Component({
  selector: 'app-messages-to-user',
  templateUrl: './messages-to-user.component.html',
  styleUrls: ['./messages-to-user.component.scss']
})
export class MessagesToUserComponent implements OnInit {

  constructor() { }
  
  @Input() user = {} as IUserProfile;

  ngOnInit(): void {
  }

}
