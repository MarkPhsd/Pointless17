import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UntypedFormGroup,FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
// Generated by https://quicktype.io
// import { ItemBasic } from "src/app/modules/admin/report-designer/interfaces/reports";
export interface ItemBasic {
  id: number;
  name: string;
}
@Component({
  selector: 'app-mat-chip-list',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
  templateUrl: './mat-chip-list.component.html',
  styleUrls: ['./mat-chip-list.component.scss']
})
export class MatChipListComponent  implements OnInit {
 // Input to receive the initial list from the parent
 @Input() list: ItemBasic[] | null = [];
 @Input() addButtonEnabled: boolean;
 // Output to emit the updated list
 @Output() listChange = new EventEmitter<ItemBasic[]>();

 // BehaviorSubject to manage the internal list state
 private itemsSubject = new BehaviorSubject<ItemBasic[]>([]);
 items$ = this.itemsSubject.asObservable();

 // Temporary holder for the new item name
 newItemName: string = '';

inputForm: UntypedFormGroup;

 constructor(private fb: FormBuilder){}


 // Initialize the BehaviorSubject with the provided list
 ngOnInit(): void {
   this.inputForm = this.fb.group({
    listItems: []
   })

   const initialList = this.list ?? []; // Fallback to an empty array if list is null
   this.itemsSubject.next(initialList);
 }

 // Add a new item to the list
 addItem() {
   const currentItems = this.itemsSubject.getValue();
   const newItem: ItemBasic = { id: currentItems.length + 1, name: this.newItemName.trim() };

   if (newItem.name) {
     const updatedList = [...currentItems, newItem];
     this.itemsSubject.next(updatedList);
     this.listChange.emit(updatedList); // Emit the updated list
     this.newItemName = ''; // Reset the input field
   }
 }

 // Update item name directly
 updateItemName(index: number, newName: string) {
   const currentItems = this.itemsSubject.getValue();
   if (newName.trim()) {
     currentItems[index].name = newName.trim();
     const updatedList = [...currentItems];
     this.itemsSubject.next(updatedList);
     this.listChange.emit(updatedList); // Emit the updated list
   }
 }

 // Delete an item from the list
 deleteItem(index: number) {
   const currentItems = this.itemsSubject.getValue();
   currentItems.splice(index, 1);
   const updatedList = [...currentItems];
   this.itemsSubject.next(updatedList);
   this.listChange.emit(updatedList); // Emit the updated list
 }
}
