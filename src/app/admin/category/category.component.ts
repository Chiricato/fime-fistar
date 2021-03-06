import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Restangular } from 'ngx-restangular';
import { CookieService } from '../../../services/cookie.service';
// import * as _ from 'lodash';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { AdminCategoryDialogComponent } from '../category-dialog/category-dialog.component';
import * as _ from 'lodash';

@Component({
    selector: 'app-admin-category',
    templateUrl: './category.component.html',
    styleUrls: ['./category.component.scss']
})
export class AdminCategoryComponent implements OnInit {
    public message: string;
    public categories = [];
    public mappingCategories: any;
    public env: any;
    public modalRef: BsModalRef;
    public filter = {
        name: null,
        category_id: 'null'
    };
    public pageSize = 10;
    public pageLimitOptions = [];
    public total: any;
    public pageIndex = 1;
    constructor(
        private api: Restangular,
        private toast: ToastrService,
        public modalService: BsModalService
    ) {}

    ngOnInit() {
        this.env = environment;
        this.getCategories();
        this.pageSize = 10;
        this.pageLimitOptions = [
            {value: 5},
            {value: 10},
            {value: 20},
            {value: 25},
            {value: 50}
        ];
    }

    changePageLimit(limit: any): void {
        this.pageSize = limit;
        this.getCategories();
    }
    setPage(pageInfo) {
        this.pageIndex = pageInfo.offset + 1;
        this.getCategories();
    }

    getCategories() {
        this.api
            .all('categories')
            .customGET('',{name: this.filter.name, category_id: this.filter.category_id})
            .subscribe(res => {
                this.categories = res.result;
            });
    }

    onDelete(row) {
        this.api
            .one('del-categories', row.code)
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
            AdminCategoryDialogComponent,
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
            AdminCategoryDialogComponent,
            { initialState }
        );

        this.modalRef.content.onClose.subscribe(result => {
            this.getCategories();
        });
    }
    onReset() {
        this.filter = {
            name: null,
            category_id: 'null'
        };
        // this.pageIndex = 1;
        this.getCategories();
    }
    onSearch() {
        // this.pageIndex = 1;
        this.getCategories();
    }
}
