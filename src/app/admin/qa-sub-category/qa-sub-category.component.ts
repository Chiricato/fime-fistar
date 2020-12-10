import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Restangular } from 'ngx-restangular';
import { CookieService } from '../../../services/cookie.service';
// import * as _ from 'lodash';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import * as _ from 'lodash';
import { AdminQaSubCategoryDialogComponent } from '../qa-sub-category-dialog/qa-sub-category-dialog.component';

@Component({
    selector: 'app-admin-qa-sub-category',
    templateUrl: './qa-sub-category.component.html',
    styleUrls: ['./qa-sub-category.component.scss']
})
export class AdminQaSubCategoryComponent implements OnInit {
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
            .all('qa-sub-category')
            .customGET('')
            .subscribe(res => {
                if(res.result)
                {
                    this.categories = res.result.data;
                }
            });
            
    }

    onDelete(row) {
        this.api
            .one('delete-sub-category', row.id)
            .customPUT('')
            .subscribe(res => {
                if (res.result) {
                    this.getCategories();
                    this.toast.success('The q&a sub category has been deleted');
                }
            });
    }

    addCategory() {
        const initialState = {
            category: {}
        };
        this.modalRef = this.modalService.show(
            AdminQaSubCategoryDialogComponent,
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
        console.log(initialState);
        this.modalRef = this.modalService.show(
            AdminQaSubCategoryDialogComponent,
            { initialState }
        );

        this.modalRef.content.onClose.subscribe(result => {
            this.getCategories();
        });
    }
}
