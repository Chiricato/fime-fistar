import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({ name: 'formatDate' })
export class FormatDate implements PipeTransform {
    transform(value: string) {
        var datePipe = new DatePipe("en-US");
         value = datePipe.transform(value, 'yyyy-MM-dd');
         return value;
     }
}
