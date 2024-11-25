import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-ionic-swipe-to-delete',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
    IonicModule
  ],
  templateUrl: './ionic-swipe-to-delete.component.html',
  styleUrls: ['./ionic-swipe-to-delete.component.scss']
})
export class IonicSwipeToDeleteComponent implements OnInit {

  items: any[];
  item: any;

  constructor() { }

  ngOnInit(): void {
    console.log('what')
  }

  favorite(item) {
    console.log(item)
  }

  unread(item) {
    console.log(item)
  }

  share(item) {
    console.log(item)
  }
}
