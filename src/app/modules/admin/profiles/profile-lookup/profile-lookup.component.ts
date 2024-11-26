import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { ProfileListComponent } from '../profile-list/profile-list.component';

@Component({
  selector: 'app-profile-lookup',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
    ProfileListComponent,
  ],
  templateUrl: './profile-lookup.component.html',
  styleUrls: ['./profile-lookup.component.scss']
})
export class ProfileLookupComponent implements OnInit {

  constructor( private router: Router,) { }

  ngOnInit(): void {
    const i = 1
  }

  scanID() {
    this.router.navigate(["/imagecapture/"]);
  }
}
