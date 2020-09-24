import {Component, OnInit, Inject, PLATFORM_ID} from '@angular/core';
import {Restangular} from 'ngx-restangular';
import * as _ from 'lodash';
import * as moment from 'moment';
import {environment} from '../../../environments/environment';
import {Router} from '@angular/router';
import {formatDate} from '@angular/common';
import {ToastrService} from 'ngx-toastr';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { PointRatioComponent } from '../point-ratio/point-ratio.component';

@Component({
    selector: 'app-admin-point',
    templateUrl: './point.component.html',
    styleUrls: [
        './point.component.scss'
    ]
})
export class AdminPointComponent implements OnInit {
    public points: any;
    public env: any;
    public total: any;
    public modalRef: BsModalRef;
    public filter = {
        level_1: false,
        level_2: false,
        level_3: false,
        level_4: false,
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
        this.sort = 'asc';
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

        this.api.all('point-policy').customGET('',
            {
                page: this.pageIndex, pageSize: this.pageSize, column: this.column, sort: this.sort,
                level_1: this.filter.level_1,
                level_2: this.filter.level_2,
                level_3: this.filter.level_3,
                level_4: this.filter.level_4,
                disable: this.filter.disable,
                enable: this.filter.enable,
                from: from, to: to
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
        this.column = 'id';
        this.sort = 'asc';
        this.filter = {
            level_1: false,
            level_2: false,
            level_3: false,
            level_4: false,
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

    Ratio() {
        this.api.all('point-ratio').customGET().subscribe(res => {
            const initialState = {
                ratio: res.result
            };
            this.modalRef = this.modalService.show(
                PointRatioComponent,
                {initialState}
            );

            this.modalRef.content.onClose.subscribe(res => {
                
            });
        });
    }

}
