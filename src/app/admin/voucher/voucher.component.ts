import {Component, OnInit, Inject, PLATFORM_ID} from '@angular/core';
import {Restangular} from 'ngx-restangular';
import * as _ from 'lodash';
import * as moment from 'moment';
import {environment} from '../../../environments/environment';
import {Router} from '@angular/router';
import {formatDate} from '@angular/common';
import {ToastrService} from 'ngx-toastr';

@Component({
    selector: 'app-admin-voucher',
    templateUrl: './voucher.component.html',
    styleUrls: [
        './voucher.component.scss'
    ]
})
export class AdminVoucherComponent implements OnInit {
    public vouchers: any;
    public env: any;
    public total: any;
    public filter = {
        name: null,
        status: 'null',
        type: 'null',
        brand: 'null',
        catalog: 'null',
        from: null,
        to: null,
        voucher_type: 'null',
        status_voucher: 'null'
    };
    public column = 'id';
    public sort = 'desc';
    public pageIndex = 1;
    public pageSize = 10;
    public selected = [];
    public brands = [];
    public categories = [];
    public showDelete = false;
    public showDeactivate = false;
    public showActive = false;
    public pageLimitOptions = [];
    public category_type: any;
    public fashion = [];
    public food = [];
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
        this.getBrands();
        this.getCategories();
        this.getFashion();
        this.getFood();
        this.pageLimitOptions = [
            {value: 5},
            {value: 10},
            {value: 20},
            {value: 25},
            {value: 50}
        ];

    }

    getBrands() {
        this.api.all('brands').customGET('').subscribe(res => {
            this.brands = res.result;
        });
    }

    getCategories() {
        this.api.all('categories').customGET('').subscribe(res => {
            this.categories = res.result;
        });
    }
    getFashion() {
        this.api.all('getFashion').customGET('').subscribe(res => {
            this.fashion = res.result;
        });
    }
    getFood() {
        this.api.all('getFood').customGET('').subscribe(res => {
            this.food = res.result;
        });
    }

    getVouchers() {
        const from = this.filter.from ? formatDate(this.filter.from, 'MM/dd/yyyy', 'en-US') : null;
        const to = this.filter.to ? formatDate(this.filter.to, 'MM/dd/yyyy', 'en-US') : null;

        this.api.all('vouchers/all').customGET('',
            {
                page: this.pageIndex, pageSize: this.pageSize, column: this.column, sort: this.sort,
                catalog: this.filter.catalog, brand: this.filter.brand,
                name: this.filter.name, status: this.filter.status, type: this.filter.type, voucher_type: this.filter.voucher_type,
                from: from, to: to, status_voucher: this.filter.status_voucher
            }).subscribe(res => {
            this.vouchers = res.result.data;
            for (let i = 0; i < this.vouchers.length; i++) {
                this.vouchers[i].start_date = moment.utc(this.vouchers[i].start_date);
                this.vouchers[i].end_date = moment.utc(this.vouchers[i].end_date);
                this.category_type = this.vouchers[i].catalog.slice(0, 3);
            }
            this.vouchers = _.orderBy(this.vouchers, ['count_down_type'], ['desc']);
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

    onSelect({selected}) {
        this.selected.splice(0, this.selected.length);
        this.selected.push(...selected);
        if (this.selected.length > 0) {
            this.showDelete = true;

            let showDeactivate = true;
            let showActive = true;
            for (const item of this.selected) {
                if (item.is_disabled === 'Y') {
                    showActive = false;
                } else {
                    showDeactivate = false;
                }
            }

            this.showDeactivate = showDeactivate;
            this.showActive = showActive;
        } else {
            this.showDeactivate = false;
            this.showActive = false;
            this.showDelete = false;
        }
    }

    onReset() {
        this.filter = {
            name: null,
            status: 'null',
            type: 'null',
            brand: 'null',
            catalog: 'null',
            from: null,
            to: null,
            voucher_type: null,
            status_voucher: null
        };

        this.getVouchers();
    }

    onToggle(rows, togggle) {
        const ids = _.map(rows, 'cntnts_no');

        this.api.all('tries').customPUT({ids: ids, toggle: togggle}, 'toggle').subscribe(res => {
            if (res.result) {
                for (const row of rows) {
                    row.is_disabled = togggle ? 'N' : 'Y';
                }

                if (togggle) {
                    this.toast.success('The try has been disabled');
                } else {
                    this.toast.success('The try has been enabled');
                }
                this.selected = [];
            }
        });
    }

    onToggleMulti(toggle) {
        if (this.selected.length > 0) {
            this.onToggle(this.selected, toggle);
        }
    }

    onDelete(rows) {
        const ids = _.map(rows, 'cntnts_no');

        this.api.all('tries').customPOST({ids: ids}, 'deleteMulti').subscribe(res => {
            if (res.result) {
                this.getVouchers();
                this.toast.success('The try has been deleted');
            }
        });
    }

    onDeleteMulti() {
        if (this.selected.length > 0) {
            this.onDelete(this.selected);
        }
    }

    onDownload() {
        const from = this.filter.from ? formatDate(this.filter.from, 'MM/dd/yyyy', 'en-US') : null;
        const to = this.filter.to ? formatDate(this.filter.to, 'MM/dd/yyyy', 'en-US') : null;

        this.api.all('admin/export').customGET('tries', {
            catalog: this.filter.catalog,
            brand: this.filter.brand,
            name: this.filter.name,
            status: this.filter.status,
            type: this.filter.type,
            voucher_type: this.filter.voucher_type,
            from: from, to: to
        }).subscribe(res => {
            if (res.result) {
                window.open(this.env.rootHost + res.result.path, '_blank');
            }
        });
    }

    changePageLimit(limit: any): void {
        this.pageSize = limit;
        this.getVouchers();
    }

}
