import {Component, OnInit, Inject, PLATFORM_ID} from '@angular/core';
import {Restangular} from 'ngx-restangular';
import * as _ from 'lodash';
import * as moment from 'moment';
import {environment} from '../../../environments/environment';
import {Router} from '@angular/router';
import {formatDate} from '@angular/common';
import {ToastrService} from 'ngx-toastr';

@Component({
    selector: 'app-admin-voucher-transaction',
    templateUrl: './voucher-transaction.component.html',
    styleUrls: [
        './voucher-transaction.component.scss'
    ]
})
export class AdminVoucherTransactionComponent implements OnInit {
    public vouchers: any;
    public env: any;
    public total: any;
    public filter = {
        used_code: null,
        voucher_name: null,
        user_no: null,
        redeem_date_from: null,
        redeem_date_to: null,
        used_date_from: null,
        used_date_to: null,
    };
    public column = 'id';
    public sort = 'desc';
    public pageIndex = 1;
    public pageSize = 10;
    public pageLimitOptions = [];
    public category_type: any;
    constructor(
        private api: Restangular,
        private toast: ToastrService,
        private router: Router,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
    }

    ngOnInit() {
        this.env = environment;
        this.pageIndex = 1;
        this.pageSize = 10;
        this.column = 'id';
        this.sort = 'desc';
        this.getVouchers();
        this.pageLimitOptions = [
            {value: 5},
            {value: 10},
            {value: 20},
            {value: 25},
            {value: 50}
        ];

    }


    getVouchers() {
        const redeem_date_from = this.filter.redeem_date_from ? formatDate(this.filter.redeem_date_from, 'MM/dd/yyyy', 'en-US') : null;
        const redeem_date_to = this.filter.redeem_date_to ? formatDate(this.filter.redeem_date_to, 'MM/dd/yyyy', 'en-US') : null;
        const used_date_from = this.filter.used_date_from ? formatDate(this.filter.used_date_from, 'MM/dd/yyyy', 'en-US') : null;
        const used_date_to = this.filter.used_date_to ? formatDate(this.filter.used_date_to, 'MM/dd/yyyy', 'en-US') : null;
        this.api.all('voucher-transaction').customGET('',
            {
                page: this.pageIndex, pageSize: this.pageSize, column: this.column, sort: this.sort,
                used_code: this.filter.used_code, voucher_name: this.filter.voucher_name,
                user_no: this.filter.user_no, redeem_date_from: redeem_date_from, redeem_date_to: redeem_date_to,
                used_date_from: used_date_from, used_date_to: used_date_to
            }).subscribe(res => {
            this.vouchers = res.result.data;
            console.log(this.vouchers);
            for (let i = 0; i < this.vouchers.length; i++) {
                // this.vouchers[i].created_at = moment.utc(this.vouchers[i].created_at);
            }
            this.total = res.result.total;
        });
    }

    onSearch() {
        this.pageIndex = 1;
        this.getVouchers();
    }

    setPage(pageInfo) {
        this.pageIndex = pageInfo.offset + 1;
        this.getVouchers();
    }

    onSort(event) {
        this.column = event.sorts[0].prop;
        this.sort = event.sorts[0].dir;
        this.pageIndex = 1;
        this.getVouchers();
        return false;
    }


    onReset() {
        this.filter = {
            used_code: null,
            voucher_name: null,
            user_no: null ,
            redeem_date_from: null,
            redeem_date_to: null,
            used_date_from: null,
            used_date_to: null,
        };

        this.getVouchers();
    }

    changePageLimit(limit: any): void {
        this.pageSize = limit;
        this.getVouchers();
    }

}
