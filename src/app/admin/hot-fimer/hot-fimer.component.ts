import {Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {Restangular} from 'ngx-restangular';
import {CookieService} from '../../../services/cookie.service';
import {Router} from '@angular/router';
import * as _ from 'lodash';
import {ToastrService} from 'ngx-toastr';
import {environment} from '../../../environments/environment';
import {UserPage} from '../user-management/user-page';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import {PointsDialogComponent} from '../user-management/points-dialog/points-dialog.component';

@Component({
    selector: 'app-hot-fimer',
    templateUrl: './hot-fimer.component.html',
    styleUrls: ['./hot-fimer.component.scss']
})
export class AdminHotFimerComponent implements OnInit {

    public env: any;
    public users = [];
    public page = new UserPage();
    public userType = 'fimer';
    public selected = [];
    public showDeactivate = false;
    public showActive = false;

    public filterOptions = [
        {'id': 'user_no', 'name': 'User No'},
        {'id': 'email', 'name': 'Email'},
        {'id': 'cellphone', 'name': 'Phone'},
        {'id': 'reg_name', 'name': 'Full Name'},
        {'id': 'id', 'name': 'Display Name'}
    ];
    public filterSelected = this.filterOptions[1].id;

    public activedCheckbox = true;
    public deletedCheckbox = false;
    public allowComment = true;
    public allowReview = true;
    public filtervalue;
    public modalRef: BsModalRef;
    public pageSize = 10;
    public pageLimitOptions = [];

    constructor(private api: Restangular,
                private cookieService: CookieService,
                private router: Router,
                private toast: ToastrService,
                public modalService: BsModalService,
                @Inject(PLATFORM_ID) private platformId: Object) {
        this.page.pageNumber = 0;
        this.page.size = 10;
    }

    static handleData(data) {
        if (data.length) {
            const length = data.length;
            for (let i = 0; i < length; i++) {
                data[i].deleted = data[i].delete_at === 'N' ? 0 : 1;
                data[i].active = data[i].drmncy_at === 'N' ? 1 : 0;
            }
        }
        return data;
    }

    ngOnInit() {
        this.env = environment;
        this.setPage({offset: 0});
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
        this.getUsers();
    }

    setPage(pageInfo) {
        this.page.pageNumber = pageInfo.offset;
        this.getUsers();
    }

    getUsers() {
        this.api.all('fimers/getHotFimer').customGET('', {
            'page': this.page.pageNumber + 1,
            'searchType': this.filterSelected,
            'searchValue': this.filtervalue ? this.filtervalue : '',
            'allowComment': this.allowComment ? 1 : 0,
            'allowReview': this.allowReview ? 1 : 0,
            'isActive': this.activedCheckbox,
            'isDelete': this.deletedCheckbox,
            'role': this.userType,
            'pageSize': this.pageSize
        }).subscribe(res => {
            this.page.pageNumber = res.result.current_page - 1;
            this.users = AdminHotFimerComponent.handleData(res.result.data);
            this.page.totalElements = res.result.total;
            this.page.totalPages = res.result.last_page;
        });
    }

    search() {
        this.page.pageNumber = 0;
        this.getUsers();
    }

    // onSelect({selected}) {

    // }

    activeUser(row, togggle) {
        const user = row[0];
        user.active = togggle;
        this.updateUser(user);
    }

    allowUserComment(row, togggle) {
        const user = row[0];
        user.allow_comment = togggle;
        this.updateUser(user);
    }

    allowUserReview(row, togggle) {
        const user = row[0];
        user.allow_review = togggle;
        this.updateUser(user);
    }

    updateUser(user) {
        this.api.all('admin/user/' + user.user_no + '/updateStatus').customPOST(user).subscribe(res => {
            // this.getUsers();
        });
    }

    onDelete(row) {
        this.api.one('admin/user/', row.user_no).customDELETE('').subscribe(res => {
            this.getUsers();
        });
    }
    pointsDialog(row) {
        if (row.points && row.points.length) {
            const initialState = {
                points: row.points
            };
            this.modalRef = this.modalService.show(
                PointsDialogComponent,
                {initialState}
            );
        }
    }

    onToggle(rows, toggle) {
        const ids = _.map(rows, 'user_no');
    
        this.api.all('fimers').customPUT({ ids: ids, toggle: toggle }, 'toggle').subscribe(res => {
            if (res.result) {
                for (const row of rows) {
                    row.hot_fimer = toggle ? 1 : 0;
                }
    
                if (toggle) {
                    this.toast.success('Fimer has been display');
                } else {
                    this.toast.success('Fimer has been hidden');
                }
                this.selected = [];
            }
        });
      }

      onSelect({ selected }) {
        this.selected.splice(0, this.selected.length);
        this.selected.push(...selected);
        if (this.selected.length > 0) {
    
            let showDeactivate = true;
            let showActive = true;
            for (const item of this.selected) {
                if (item.hot_fimer === '0') {
                    showDeactivate = false;
                } else {
                    showActive = false;
                }
            }
    
            this.showDeactivate = showDeactivate;
            this.showActive = showActive;
        } else {
            this.showDeactivate = false;
            this.showActive = false;
        }
      }
}
