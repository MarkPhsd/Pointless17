import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IUserProfile}  from 'src/app/_interfaces';
import { UserService } from 'src/app/_services';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { DemographicsComponent } from './demographics/demographics.component';
import { SitepointsComponent } from './details/sitepoints/sitepoints.component';
import { MessagesToUserComponent } from './messages-to-user/messages-to-user.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
    DemographicsComponent,SitepointsComponent ,
    MessagesToUserComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})

export class ProfileComponent implements OnInit {

  user = {} as IUserProfile;
  showRoles: boolean;
  devModeOn: boolean;

  constructor(private userService: UserService,
            ) {
  }

  ngOnInit(): void {
    this.refreshProfileDetails();
  }

  displayRoles(){
    if (this.user.roles != 'user') {
        this.showRoles = true;
    }
  };

  refreshProfileDetails(){
    this.userService.getProfile().subscribe(data =>
      {
        this.user = data
        this.displayRoles()
      }
    )
  }

}
