import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { FormControl,FormGroup } from '@angular/forms';
import { MatLegacyAutocomplete as MatAutocomplete } from '@angular/material/legacy-autocomplete';
import { IItemBasic } from 'src/app/_services';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';


@Component({
  selector: 'tag-chips-products',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],
  templateUrl: './tag-chips-products.component.html',
  styleUrls: ['./tag-chips-products.component.scss']
})
export class TagChipsProductsComponent implements OnInit {

  @Output() remove = new EventEmitter<any>();
  @Input()  addOnItems: IItemBasic;
  removable: true;
  constructor() { }

  ngOnInit(): void {
    const i = 0;
  }

  removeItem(event) {
    this.remove.emit(event)
  }
}
