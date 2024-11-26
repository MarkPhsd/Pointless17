import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from 'src/app/_services';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { EbaySettingsComponent } from '../ebay-settings.component';

@Component({
  selector: 'ebay-auth-redirect',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
    EbaySettingsComponent,
  SharedPipesModule],
  templateUrl: './ebay-auth-redirect.component.html',
  styleUrls: ['./ebay-auth-redirect.component.scss']
})
export class EbayAuthRedirectComponent implements OnInit {

  decodedValue: string;

  constructor( private authenticationService: AuthenticationService,
               private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      if (code) {
        // You have the authorization code here. Handle it as needed.
        // console.log('Authorization Code:', code);
        this.decodeAuth(code)
        // You might want to exchange it for tokens or store it
      }
    });
  }

  captureAuth() {

  }

  decodeAuth(data) {
    this.decodedValue = JSON.stringify(data) // this.authenticationService.decodeAuth(data)
    // console.log('decodedValue', this.decodedValue)
  }

}
