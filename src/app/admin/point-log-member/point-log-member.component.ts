import {Component, OnInit, Inject, PLATFORM_ID, NgModule} from '@angular/core';
import {Restangular} from 'ngx-restangular';
import * as _ from 'lodash';
import * as moment from 'moment';
import {environment} from '../../../environments/environment';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {formatDate} from '@angular/common';
import {ToastrService} from 'ngx-toastr';
import { BsModalRef, BsModalService  } from 'ngx-bootstrap';
import { PointRatioComponent } from '../point-ratio/point-ratio.component';

@Component({
    selector: 'app-admin-point-log-member',
    templateUrl: './point-log-member.component.html',
    styleUrls: [
        './point-log-member.component.scss'
    ]
})
export class AdminPointLogMemberComponent implements OnInit {
    public points: any;
    public user: any;
    public env: any;
    public total: any;
    public modalRef: BsModalRef;
    public filter = {
        type: 'policy',
        key: null,
        enable: false,
        disable: false,
        from: null,
        to: null
    };
    public column = 'id';
    public sort = 'desc';
    public pageIndex = 1;
    public pageSize = 20;
    public selected = [];
    public expired = 0;
    public total_point = 0;
    public total_basic = 0;
    public old_point = 0;
    public basic_point = 0;
    public total_event = 0;
    public user_no: any;
    public pageLimitOptions = [];
    constructor(
        private api: Restangular,
        private toast: ToastrService,
        private router: Router,
        public activeRoute: ActivatedRoute,
        public modalService: BsModalService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
    }

    ngOnInit() {
        this.env = environment;
        this.activeRoute.params.forEach((params: Params) => {
            this.user_no = params['user_no'];
        });
        this.pageIndex = 1;
        this.user = {};
        this.pageSize = 20;
        this.column = 'id';
        this.sort = 'desc';
        this.getPointPolicy();
        this.getTotalPoint();
        this.getUser();
        this.pageLimitOptions = [
            {value: 5},
            {value: 10},
            {value: 20},
            {value: 25},
            {value: 50}
        ];

    }
    getUser() {

        this.api.all('admin/user/get').customGET(this.user_no).subscribe(res => {
            this.user = res.result;
        });
    }
    getTotalPoint() {

        this.api.all('get-total-point-member').customGET(this.user_no,
            {
                expired: this.expired
            }).subscribe(res => {
            this.total_point = res.result.total;
            this.total_basic = res.result.total_basic;
            this.total_event = res.result.total_event;
            this.old_point = res.result.old_point;
            this.basic_point = res.result.basic_point;
        });
    }

    getPointPolicy() {
        const from = this.filter.from ? formatDate(this.filter.from, 'MM/dd/yyyy', 'en-US') : null;
        const to = this.filter.to ? formatDate(this.filter.to, 'MM/dd/yyyy', 'en-US') : null;

        this.api.all('point-log').customGET('',
            {
                page: this.pageIndex, pageSize: this.pageSize, column: this.column, sort: this.sort,
                type: this.filter.type,
                key: this.filter.key,
                disable: this.filter.disable,
                enable: this.filter.enable,
                from: from, to: to,
                expired: this.expired,
                user_no: this.user_no
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
            type: 'policy',
            key: null,
            enable: false,
            disable: false,
            from: null,
            to: null
        };

        this.getPointPolicy();
    }

    onToggle(rows, status) {
        const ids = _.map(rows, 'id');

        this.api.all('change-status').customPUT({ids: ids, status: status}).subscribe(res => {
            if (res.result) {
                for (const row of rows) {
                    row.status = status;
                }
                if (status == 2) {
                    this.toast.success('The point policy has been disabled');
                } else {
                    this.toast.success('The point policy has been enabled');
                }
                this.selected = [];
            }
        });
    }

    onDelete(rows) {
        const ids = _.map(rows, 'id');

        this.api.all('delete').customPOST({ids: ids}).subscribe(res => {
            if (res.result) {
                this.getPointPolicy();
                this.toast.success('The point policy has been deleted');
            }
        });
    }

    onDeleteMulti() {
        if (this.selected.length > 0) {
            this.onDelete(this.selected);
        }
    }

    changePageLimit(limit: any): void {
        this.pageSize = limit;
        this.getPointPolicy();
    }

    tabChanged($event) {
        if ($event.index === 0) {
            this.expired = 0;
        } else {
            this.expired = 1;
        }
        this.filter = {
           type: 'policy',
           key: null,
           enable: false,
           disable: false,
           from: null,
           to: null
        };
        this.getPointPolicy();
        this.getTotalPoint();
    }

    onDownload() {
        const from = this.filter.from ? formatDate(this.filter.from, 'MM/dd/yyyy', 'en-US') : null;
        const to = this.filter.to ? formatDate(this.filter.to, 'MM/dd/yyyy', 'en-US') : null;
        this.api.all('point-log-excel').customGET('', {
            page: this.pageIndex, pageSize: this.pageSize, column: this.column, sort: this.sort,
            type: this.filter.type,
            key: this.filter.key,
            disable: this.filter.disable,
            enable: this.filter.enable,
            from: from, to: to,
            expired: this.expired,
            user_no: this.user_no
        }).subscribe(res => {
            if (res.result) {
                window.open(this.env.rootHost + res.result.path, '_blank');
            }
        });
    }

}
