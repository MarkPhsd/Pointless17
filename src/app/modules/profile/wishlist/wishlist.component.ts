import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss']
})

export class WishlistComponent  {

  devModeOn: boolean;

  constructor() { }

  // ngOnInit(): void {
  //   // this.devModeOn = this.devService.devMode;
  // }


}
