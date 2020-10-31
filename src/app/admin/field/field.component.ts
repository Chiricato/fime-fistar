import {Component, OnInit} from '@angular/core';
import {Restangular} from 'ngx-restangular';
// import * as _ from 'lodash';
import {environment} from '../../../environments/environment';
import {ToastrService} from 'ngx-toastr';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import * as _ from 'lodash';
import {AdminFieldDialogComponent} from '../field-dialog/field-dialog.component';

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
        name: null
    };

    constructor(
        private api: Restangular,
        private toast: ToastrService,
        public modalService: BsModalService
    ) {
    }

    ngOnInit() {
        this.env = environment;
        this.getFields();
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
                    this.getFields();
                    this.toast.success('The field has been deleted');
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
            this.getFields();
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
            this.getFields();
        });
    }

    onSearch() {
        if (this.filter.name !== null && this.filter.name !== '') {
            const val = this.filter.name;
            // filter our data
            this.fields = this.crrfields.filter(function (d) {
                return d.code_nm.toLowerCase().indexOf(val) !== -1 || !val;
            });

            this.offset = 0;
        } else {
            this.fields = this.crrfields;
            this.offset = 0;
        }
    }

    onReset() {
        this.filter = {
            name: null
        };
        this.fields = this.crrfields;
        this.offset = 0;
    }
}
