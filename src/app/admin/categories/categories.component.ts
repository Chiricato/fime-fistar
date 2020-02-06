import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Restangular } from 'ngx-restangular';
import { CookieService } from '../../../services/cookie.service';
// import * as _ from 'lodash';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { AdminCategoriesDialogComponent } from '../categories-dialog/categories-dialog.component';
import * as _ from 'lodash';

@Component({
    selector: 'app-admin-categories',
    templateUrl: './categories.component.html',
    styleUrls: ['./categories.component.scss']
})
export class AdminCategoriesComponent implements OnInit {
    public message: string;
    public categories = [];
    public mappingCategories: any;
    public env: any;
    public modalRef: BsModalRef;

    constructor(
        private api: Restangular,
        private toast: ToastrService,
        public modalService: BsModalService
    ) {}

    ngOnInit() {
        this.env = environment;
        this.getCategories();
    }

    getCategories() {
        this.api
            .all('getAllCategories')
            .customGET('')
            .subscribe(res => {
                if(res.result)
                {
                    this.categories = res.result;
                }
            });
            
    }

    onDelete(row) {
        console.log(row.code_group);
        this.api
            .one('delete-categories', row.code_group)
            .customDELETE('')
            .subscribe(res => {
                if (res.result) {
                    this.getCategories();
                    this.toast.success('The category has been deleted');
                }
            });
    }

    addCategory() {
        const initialState = {
            category: {}
        };
        this.modalRef = this.modalService.show(
            AdminCategoriesDialogComponent,
            { initialState }
        );

        this.modalRef.content.onClose.subscribe(result => {
            this.getCategories();
        });
    }

    editCategory(category) {
        const initialState = {
            category: _.cloneDeep(category)
        };
        this.modalRef = this.modalService.show(
            AdminCategoriesDialogComponent,
            { initialState }
        );

        this.modalRef.content.onClose.subscribe(result => {
            this.getCategories();
        });
    }
}
