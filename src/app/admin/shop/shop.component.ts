import {Component, OnInit, Inject, PLATFORM_ID, NgModule} from '@angular/core';
import {Restangular} from 'ngx-restangular';
import * as _ from 'lodash';
import * as moment from 'moment';
import {environment} from '../../../environments/environment';
import {Router} from '@angular/router';
import {formatDate} from '@angular/common';
import {ToastrService} from 'ngx-toastr';
import { BsModalRef, BsModalService  } from 'ngx-bootstrap';
import { FileUploader, FileSelectDirective, Headers } from 'ng2-file-upload';
const URL_UL = environment.host + '/uploadShop';
@Component({
    selector: 'app-admin-point-log',
    templateUrl: './shop.component.html',
    styleUrls: [
        './shop.component.scss'
    ]
})
export class AdminShopComponent implements OnInit {
    public shops: any;
    public env: any;
    public total: any;
    public modalRef: BsModalRef;
    public filter = {
        type: 'name',
        key: null,
        field_1: null,
        field_2: null,
        enable: false,
        disable: false,
        pending: false,
        from: null,
        to: null
    };
    public column = 'id';
    public sort = 'desc';
    public pageIndex = 1;
    public pageSize = 20;
    public selected = [];
    public pageLimitOptions = [];
    public uploader: FileUploader;
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
        this.getShop();
        this.pageLimitOptions = [
            {value: 5},
            {value: 10},
            {value: 20},
            {value: 25},
            {value: 50}
        ];
        this.uploader = new FileUploader({
            url: URL_UL,
            itemAlias: 'file'
        });
        this.uploader.onAfterAddingFile = (file) => {
            file.withCredentials = false;
        };

    }

    getShop() {
        const from = this.filter.from ? formatDate(this.filter.from, 'MM/dd/yyyy', 'en-US') : null;
        const to = this.filter.to ? formatDate(this.filter.to, 'MM/dd/yyyy', 'en-US') : null;

        this.api.all('shop').customGET('',
            {
                page: this.pageIndex, pageSize: this.pageSize, column: this.column, sort: this.sort,
                type: this.filter.type,
                key: this.filter.key,
                disable: this.filter.disable,
                enable: this.filter.enable,
                pending: this.filter.pending,
                from: from, to: to,
            }).subscribe(res => {
            this.shops = res.result.data;
            this.total = res.result.total;
        });
    }

    onSearch() {
        this.pageIndex = 1;
        this.getShop();
    }

    setPage(pageInfo) {
        this.pageIndex = pageInfo.offset + 1;
        this.getShop();
    }

    onSort(event) {
        this.column = event.sorts[0].prop;
        this.sort = event.sorts[0].dir;
        this.pageIndex = 1;
        this.getShop();
        return false;
    }

    onReset() {
        this.filter = {
            type: 'name',
            key: null,
            field_1: null,
            field_2: null,
            enable: false,
            disable: false,
            pending: false,
            from: null,
            to: null
        };
        this.column = 'id';
        this.sort = 'desc';
        this.getShop();
    }

    onToggle(rows, status) {
        const ids = _.map(rows, 'id');

        this.api.all('change-status-shop').customPUT({ids: ids, status: status}).subscribe(res => {
            if (res.result) {
                for (const row of rows) {
                    row.status = status;
                }
                if (status == 2) {
                    this.toast.success('The shop has been disabled');
                } else {
                    this.toast.success('The shop has been enabled');
                }
                this.selected = [];
            }
        });
    }

    onDelete(rows) {
        const ids = _.map(rows, 'id');

        this.api.all('delete-shop').customPOST({ids: ids}).subscribe(res => {
            if (res.result) {
                this.getShop();
                this.toast.success('The shop has been deleted');
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
        this.getShop();
    }

    onSelectFile(event) {
        const files = event.target.files;
        if (this.uploader.queue && this.uploader.queue.length) {
            this.uploader.uploadAll();
            this.uploader.onCompleteAll = () => {
                this.getShop();
                this.toast.success('Import success');

            };
        }
    }

}
