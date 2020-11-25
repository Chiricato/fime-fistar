import { Component, OnInit, Inject, PLATFORM_ID, ViewEncapsulation } from '@angular/core';
import { Restangular } from 'ngx-restangular';
import { CookieService } from '../../../services/cookie.service';
// import * as _ from 'lodash';
import { environment } from '../../../environments/environment';
import {ActivatedRoute, Router} from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';
import { formatDate } from '@angular/common';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { AdminReviewDetailsComponent } from '../review-detail/review-details.component';

@Component({
    selector: 'app-admin-question',
    templateUrl: './question.component.html',
    styleUrls: [
        './question.component.scss'
    ]
})
export class AdminQuestionComponent implements OnInit {
    public pageIndex: any;
    public pageSize: any;
    public questions = [];
    public images = [];
    public totalReviews: any;
    public env: any;
    public modalRef: BsModalRef;
    public selected = [];
    public categories = [];
    public users = [];
    public showDelete = false;
    public showDeactivate = false;
    public showActive = false;
    public showNormal = false;
    public showPopular = false;
    public showRestore = false;
    public column = 'review_no';
    public sort = 'desc';
    public auto_enable = false;
    public enable_log =  {
        content: ''
    };
    public fashion: any;
    public beauty: any;
    public food: any;
    public logs: any;
    public pageIndexLog = 1;
    public pageSizeLog = 10;
    public totallogs = 0;
    public filter = {
        name: null,
        category: 'null',
        from: null,
        to: null,
        catalog:  'null',
        reg_name: null,
        status: null
    };
    public tryId: string;
    public pageLimitOptions = [];
    constructor(
        private api: Restangular,
        private toast: ToastrService,
        private router: Router,
        private route: ActivatedRoute,
        public modalService: BsModalService
    ) { }

    getRowClass = (row) => {
       return {
        'row-color1': row.review_report === true,
       };
      }
    ngOnInit() {
        this.env = environment;
        this.pageIndex = 1;
        this.pageSize = 10;
        this.column = 'review_no';
        this.sort = 'desc';
        this.getCategories();
        this.getQuestions();
        this.getUsers();
        this.pageLimitOptions = [
            {value: 5},
            {value: 10},
            {value: 20},
            {value: 25},
            {value: 50}
        ];
        this.getFashion();
        this.getBeauty();
        this.getFood();
        
    }

    changePageLimit(limit: any): void {
        this.pageSize = limit;
        this.getQuestions();

    }

    getQuestions() {
        const from = this.filter.from ? formatDate(this.filter.from, 'MM/dd/yyyy', 'en-US') : null;
        const to = this.filter.to ? formatDate(this.filter.to, 'MM/dd/yyyy', 'en-US') : null;

        this.api.all('questions/all').customGET('', {
            page: this.pageIndex, pageSize: this.pageSize, column: this.column, sort: this.sort,
            category: this.filter.category, catalog: this.filter.catalog, name: this.filter.name,
            from: from, to: to,reg_name: this.filter.reg_name,status: this.filter.status,
        }).subscribe(res => {
            console.log(res.result);
            this.questions = res.result.data;
            this.totalReviews = res.result.total;
            // for (let i = 0; i < this.questions.length; i++) {
            //     this.questions[i].view_cnt = parseInt(this.questions[i].view_cnt);
            // }
        });
        
    }

    getCategories() {
        this.api.all('categories').customGET('').subscribe(res => {
            this.categories = res.result;
        });
    }
    getFashion() {
        this.api.all('sub-fashion').customGET('').subscribe(res => {
            this.fashion = res.result;
        });
    }
    getBeauty() {
        this.api.all('sub-beauty').customGET('').subscribe(res => {
            this.beauty = res.result;
        });
    }
    getFood() {
        this.api.all('sub-food').customGET('').subscribe(res => {
            this.food = res.result;
        });
    }
    getUsers() {
        this.api.all('admin/users/get-list').customGET('').subscribe(res => {
            this.users = res.result;
        });
    }

    onToggle(rows, toggle) {
        const ids = _.map(rows, 'review_no');

        this.api.all('reviews').customPUT({ ids: ids, toggle: toggle }, 'toggle').subscribe(res => {
            if (res.result) {
                for (const row of rows) {
                    row.expsr_at = toggle ? 'Y' : 'N';
                }

                if (toggle) {
                    this.toast.success('The review has been approve');
                } else {
                    this.toast.success('The review has been disapprove');
                }
                this.selected = [];
            }
        });
    }

    onTogglePopular(rows, toggle) {
        const ids = _.map(rows, 'review_no');

        this.api.all('reviews').customPUT({ ids: ids, toggle: toggle }, 'togglePopular').subscribe(res => {
            if (res.result) {
                for (const row of rows) {
                    row.conts_seq = toggle;
                }

                if (toggle) {
                    this.toast.success('The review has been made popular');
                } else {
                    this.toast.success('The review has been normalized');
                }
                this.selected = [];
            }
        });
    }

    onDelete(rows) {
        const ids = _.map(rows, 'id');

        this.api.all('delete-question').customPUT({ ids: ids }, '').subscribe(res => {
            if (res.result) {
                this.getQuestions();
                this.toast.success('The question has been deleted');
            }
        });
    }
    onRestore(rows) {
        const ids = _.map(rows, 'review_no');

        this.api.all('reviews-restore').customPOST({ ids: ids }, '').subscribe(res => {
            if (res.result) {
                this.getQuestions();
                this.toast.success('The review has been restored');
            }
        });
    }

    onSelect({ selected }) {
        this.selected.splice(0, this.selected.length);
        this.selected.push(...selected);
        if (this.selected.length > 0) {
            this.showDelete = true;
            this.showRestore = true;

            let showDeactivate = true;
            let showActive = true;
            let showNormal = true;
            let showPopular = true;
            for (const item of this.selected) {
                if (item.expsr_at === 'N') {
                    showDeactivate = false;
                } else {
                    showActive = false;
                }
                if (!item.conts_seq) {
                    showNormal = false;
                } else {
                    showPopular = false;
                }
            }

            this.showDeactivate = showDeactivate;
            this.showActive = showActive;
            this.showNormal = showNormal;
            this.showPopular = showPopular;
        } else {
            this.showDeactivate = false;
            this.showActive = false;
            this.showDelete = false;
            this.showRestore = false;
            this.showNormal = false;
            this.showPopular = false;
        }
    }

    onToggleMulti(toggle) {
        if (this.selected.length > 0) {
            this.onToggle(this.selected, toggle);
        }
    }

    onDeleteMulti() {
        if (this.selected.length > 0) {
            this.onDelete(this.selected);
            this.showDeactivate = false;
            this.showActive = false;
            this.showDelete = false;
            this.showRestore = false;
            this.showNormal = false;
            this.showPopular = false;
        }
    }
    onRestoreMulti() {
        if (this.selected.length > 0) {
            this.onRestore(this.selected);
        }
    }

    onTogglePopularMulti(toggle) {
        if (this.selected.length > 0) {
            this.onTogglePopular(this.selected, toggle);
        }
    }

    onSearch() {
        this.getQuestions();
    }

    onReset() {
        this.filter = {
            name: null,
            category: 'null',
            catalog: 'null',
            from: null,
            to: null,
            reg_name: null,
            status: null
        };
        this.getQuestions();
    }

    setPage(pageInfo) {
        this.pageIndex = pageInfo.offset + 1;
        this.getQuestions();
    }

    onSort(event) {
        this.column = event.sorts[0].prop;
        this.sort = event.sorts[0].dir;
        this.pageIndex = 1;
        this.getQuestions();
        return false;
    }

    openReviewDetail(url) {
        window.open(url);
    }

    getReviewsDetail(slug) {
        this.images = [];
        this.api.all('reviews/details').customGET(slug).subscribe(res => {
            const initialState = {
                review: res.result
            };
            this.modalRef = this.modalService.show(
                AdminReviewDetailsComponent,
                {initialState}
            );

            this.modalRef.content.onClose.subscribe(res => {
                this.questions = res.result;
            });
        });
    }

    onChange($event){
        console.log(this.auto_enable);
        this.api.all('review-enable-log').customPOST({
            status: this.auto_enable
        }).subscribe(res => {
            console.log(res.result);
            this.enable_log = res.result;
        });
    }




}
