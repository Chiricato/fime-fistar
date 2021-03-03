import {Component, OnInit} from '@angular/core';
import {Restangular} from 'ngx-restangular';
// import * as _ from 'lodash';
import {environment} from '../../../environments/environment';
import {ToastrService} from 'ngx-toastr';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import * as _ from 'lodash';
import {AdminFieldDialogComponent} from '../field-dialog/field-dialog.component';
import {formatDate} from '@angular/common';

@Component({
    selector: 'app-admin-field',
    templateUrl: './field.component.html',
    styleUrls: ['./field.component.scss']
})
export class AdminFieldComponent implements OnInit {
    public message: string;
    public fields = [];
    public crrfields = [];
    public env: any;
    public modalRef: BsModalRef;
    public offset = 0;
    public filter = {
        name: null,
        enable: false,
        disable: false,
        pending: false,
        from: null,
        to: null
    };
    public column = 'status';
    public sort = 'asc';
    public pageIndex = 1;
    public pageSize = 10;
    public selected = [];
    public pageLimitOptions = [];
    public total: any;

    constructor(
        private api: Restangular,
        private toast: ToastrService,
        public modalService: BsModalService
    ) {
    }

    ngOnInit() {
        this.env = environment;
        this.pageLimitOptions = [
            {value: 5},
            {value: 10},
            {value: 20},
            {value: 25},
            {value: 50}
        ];
        this.getStreet();
    }

    getStreet() {
        const from = this.filter.from ? formatDate(this.filter.from, 'MM/dd/yyyy', 'en-US') : null;
        const to = this.filter.to ? formatDate(this.filter.to, 'MM/dd/yyyy', 'en-US') : null;

        this.api.all('field').customGET('',
            {
                page: this.pageIndex, pageSize: this.pageSize, column: this.column, sort: this.sort,
                name: this.filter.name,
                disable: this.filter.disable,
                enable: this.filter.enable,
                pending: this.filter.pending,
                from: from, to: to,
            }).subscribe(res => {
            this.fields = res.result.data;
            this.total = res.result.total;
        });
    }

    getFields() {
        this.api
            .all('field')
            .customGET('')
            .subscribe(res => {
                this.fields = res.result;
                this.crrfields = res.result;
            });
    }

    onDelete(row) {
        this.api
            .one('field', row.id)
            .customDELETE('')
            .subscribe(res => {
                if (res.result) {
                    this.getStreet();
                    this.toast.success('The street has been deleted');
                }
            });
    }

    addField() {
        const initialState = {
            field: {}
        };
        this.modalRef = this.modalService.show(
            AdminFieldDialogComponent,
            {initialState}
        );

        this.modalRef.content.onClose.subscribe(result => {
            this.getStreet();
        });
    }

    editField(field) {
        const initialState = {
            field: _.cloneDeep(field)
        };
        this.modalRef = this.modalService.show(
            AdminFieldDialogComponent,
            {initialState}
        );

        this.modalRef.content.onClose.subscribe(result => {
            this.getStreet();
        });
    }

    onSearch() {
        this.pageIndex = 1;
        this.getStreet();
    }

    setPage(pageInfo) {
        this.pageIndex = pageInfo.offset + 1;
        this.getStreet();
    }

    onSort(event) {
        this.column = event.sorts[0].prop;
        this.sort = event.sorts[0].dir;
        this.pageIndex = 1;
        this.getStreet();
        return false;
    }

    onReset() {
        this.filter = {
            name: null,
            enable: false,
            disable: false,
            pending: false,
            from: null,
            to: null
        };
        this.column = 'id';
        this.sort = 'desc';
        this.getStreet();
    }
    changePageLimit(limit: any): void {
        this.pageSize = limit;
        this.getStreet();
    }

    onToggle(rows, status) {
        const ids = _.map(rows, 'id');

        this.api.all('change-status-field').customPUT({ids: ids, status: status}).subscribe(res => {
            if (res.result) {
                for (const row of rows) {
                    row.status = status;
                }
                if (status == 2) {
                    this.toast.success('The street has been disabled');
                } else {
                    this.toast.success('The street has been enabled');
                }
            }
        });
    }
}
