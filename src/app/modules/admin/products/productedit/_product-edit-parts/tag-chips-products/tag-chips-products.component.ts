import { Component, ElementRef, Input, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { FormControl,FormGroup } from '@angular/forms';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { IItemBasic } from 'src/app/_services';


@Component({
  selector: 'tag-chips-products',
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
