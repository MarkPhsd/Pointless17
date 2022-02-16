import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-lookup',
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
