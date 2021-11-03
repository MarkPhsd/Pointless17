import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IUserProfile } from 'src/app/_interfaces';

@Component({
  selector: 'app-demographics',
  templateUrl: './demographics.component.html',
  styleUrls: ['./demographics.component.scss']
})
export class DemographicsComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,) { }

  @Input()   user = {} as IUserProfile;

  ngOnInit(): void {
    if (this.user) {
      console.log(this.user)

    } else {
      console.log("user not found")
    }
  }

  editProfile() {
    this.router.navigate(["profileeditor", {id:this.user.id}]);
  }

}
