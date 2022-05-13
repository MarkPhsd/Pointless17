/**
 * Helper interface for listbox items
 */
 export interface IListBoxItem {
  // id: string;
  // name: string;
  value: string;
  text: string;
  groupID: number;
}
/**
* Helper interface to emit event when
* items are moved between boxes
*/
export interface IItemsMovedEvent {
  available: Array<{}>;
  selected: Array<{}>;
  movedItems: Array<{}>;
  from: 'selected' | 'available';
  to  : 'selected' | 'available';
}
