import {Component, OnInit, Inject, PLATFORM_ID, NgModule} from '@angular/core';
import {Restangular} from 'ngx-restangular';
import * as _ from 'lodash';
import * as moment from 'moment';
import {environment} from '../../../environments/environment';
import {Router} from '@angular/router';
import {formatDate} from '@angular/common';
import {ToastrService} from 'ngx-toastr';
import { BsModalRef, BsModalService  } from 'ngx-bootstrap';
import { PointRatioComponent } from '../point-ratio/point-ratio.component';

@Component({
    selector: 'app-admin-point-log',
    templateUrl: './street-log.component.html',
    styleUrls: [
        './street-log.component.scss'
    ]
})
export class AdminStreetLogComponent implements OnInit {
    public points: any;
    public env: any;
    public total: any;
    public modalRef: BsModalRef;
    public filter = {
        type: 'user_no',
        key: null,
        from: null,
        to: null
    };
    public column = 'id';
    public sort = 'desc';
    public pageIndex = 1;
    public pageSize = 20;
    public selected = [];
    public expired = 0;
    public pageLimitOptions = [];
    constructor(
        private api: Restangular,
        private toast: ToastrService,
        private router: Router,
        public modalService: BsModalService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
    }

    ngOnInit() {
        this.env = environment;
        this.pageIndex = 1;
        this.pageSize = 20;
        this.column = 'id';
        this.sort = 'desc';
        this.getPointPolicy();
        this.pageLimitOptions = [
            {value: 5},
            {value: 10},
            {value: 20},
            {value: 25},
            {value: 50}
        ];

    }

    getPointPolicy() {
        const from = this.filter.from ? formatDate(this.filter.from, 'MM/dd/yyyy', 'en-US') : null;
        const to = this.filter.to ? formatDate(this.filter.to, 'MM/dd/yyyy', 'en-US') : null;

        this.api.all('street-log').customGET('',
            {
                page: this.pageIndex, pageSize: this.pageSize, column: this.column, sort: this.sort,
                type: this.filter.type,
                key: this.filter.key,
                from: from, to: to,
                expired: this.expired
            }).subscribe(res => {
            this.points = res.result.data;
            this.total = res.result.total;
        });
    }

    onSearch() {
        this.pageIndex = 1;
        this.getPointPolicy();
    }

    setPage(pageInfo) {
        this.pageIndex = pageInfo.offset + 1;
        this.getPointPolicy();
    }

    onSort(event) {
        this.column = event.sorts[0].prop;
        this.sort = event.sorts[0].dir;
        this.pageIndex = 1;
        this.getPointPolicy();
        return false;
    }

    onReset() {
        this.filter = {
            type: 'user_no',
            key: null,
            from: null,
            to: null
        };
        this.column = 'id';
        this.sort = 'desc';
        this.getPointPolicy();
    }

    changePageLimit(limit: any): void {
        this.pageSize = limit;
        this.getPointPolicy();
    }

}
