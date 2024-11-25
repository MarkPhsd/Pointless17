import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IPagedList } from 'src/app/_services/system/paging.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-paging-info',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],

  templateUrl: './paging-info.component.html',
  styleUrls: ['./paging-info.component.scss']
})
export class PagingInfoComponent implements OnInit {

  @Input() paging: IPagedList;

  constructor() { }

  ngOnInit(): void {
  }

}
