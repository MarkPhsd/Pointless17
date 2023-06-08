import { Component, Input, OnInit } from '@angular/core';
import { IPagedList } from 'src/app/_services/system/paging.service';

@Component({
  selector: 'app-paging-info',
  templateUrl: './paging-info.component.html',
  styleUrls: ['./paging-info.component.scss']
})
export class PagingInfoComponent implements OnInit {

  @Input() paging: IPagedList;

  constructor() { }

  ngOnInit(): void {
  }

}
