import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IUserProfile } from 'src/app/_interfaces';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { UsermessagesComponent } from 'src/app/shared/widgets/usermessages/usermessages.component';

@Component({
  selector: 'app-messages-to-user',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
    UsermessagesComponent,
  ],
  templateUrl: './messages-to-user.component.html',
  styleUrls: ['./messages-to-user.component.scss']
})
export class MessagesToUserComponent implements OnInit {

  constructor() { }

  @Input() user = {} as IUserProfile;

  ngOnInit(): void {
  }

}
