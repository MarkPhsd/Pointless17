import { Injectable } from '@angular/core';

const range = (start, stop, step) => Array.from({ length: (stop - start) / step + 1 }, (_, i) => start + (i * step));

@Injectable({
  providedIn: 'root'
})

export class PagerService {
    getPager(totalPages: number, currentPage: number = 0) {

        let startPage: number;
        let endPage: number;
        const  noOfPages = totalPages;

        const pages = range(startPage, endPage, 1);

        // return object with all pager properties required by the view
        return {
            currentPage,
            totalPages,
            startPage,
            endPage,
            pages,
            noOfPages
        };
    }
}
