'use strict';

define([
    'workspace/workspace.module',
    'text!workspace/workspace-template.html',
    'workspace/left-nav/leftnav-component',
    'workspace/top-nav/topnav-component',
    'workspace/footer-info/footer-info-component'
// ], function(workspaceModule,WorkspaceTemplate,LeftNavComponent,TopNavComponent, FooterInfoComponent) {
], function(workspaceModule,WorkspaceTemplate) {
    workspaceModule.component('workspace', {
        template: WorkspaceTemplate,
        controller: function() {}
    });
});