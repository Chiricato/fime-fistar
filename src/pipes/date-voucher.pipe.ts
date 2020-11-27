import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({ name: 'formatDateVoucher' })
export class FormatDateVoucher implements PipeTransform {
    transform(value: string) {
        var datePipe = new DatePipe("en-US");
         value = datePipe.transform(value, 'dd.MM.yyyy');
         return value;
     }
}
