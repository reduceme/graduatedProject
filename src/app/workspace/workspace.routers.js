'use strict';
define([], function() {
    //工作空间路由定义
    return [{
        parent: 'workspace',
        name: 'post',
        url: '/post',
        component: 'postTable',
        authenticate: true,
        resolve: {
            lazyload: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load({files: ['post/post-table/post-table-component'], cache: false}).then(function () {
                    $ocLazyLoad.inject('workspace.module');
                });
            }]
        }
    }];
});
