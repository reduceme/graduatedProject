'use strict';

define([
    'workspace/workspace.module',
    'text!post/post-table/post-table-template.html',
    'css!post/post-table/post-table.css'
], function(workspaceModule, PostTableTemplate) {
    workspaceModule.component('postTable', {
        template: PostTableTemplate,
        controller: function($scope) {
            var ctrl = this;
            ctrl.switchState = false;
            //开关
            ctrl.currentState = {
                changeState: function () {
                    ctrl.switchState = !ctrl.switchState;
                    console.log(ctrl.switchState);
                }
            };

            //动态折线图
            var myChart = echarts.init(document.getElementById('myChart'));
            var option = {
                title: {
                    text: '实时空气质量指数',
                    subtext: '纯属虚构'
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                        label: {
                            backgroundColor: '#283b56'
                        }
                    }
                },
                legend: {
                    data:['空气质量指数']
                },
                toolbox: {
                    show: true,
                    feature: {
                        dataView: {readOnly: false},
                        restore: {},
                        saveAsImage: {}
                    }
                },
                dataZoom: {
                    show: false,
                    start: 0,
                    end: 100
                },
                xAxis: [
                    {
                        type: 'category',
                        boundaryGap: true,
                        data: (function (){
                            var now = new Date();
                            var res = [];
                            var len = 10;
                            while (len--) {
                                res.unshift(now.toLocaleTimeString().replace(/^\D*/,''));
                                now = new Date(now - 2000);
                            }
                            return res;
                        })()
                    }
                ],
                yAxis: [
                    {
                        type: 'value',
                        scale: true,
                        name: 'AQI',
                        max: 100,
                        min: 0,
                        boundaryGap: [0.2, 0.2]
                    }
                ],
                series: [
                    {
                        name:'空气质量指数',
                        type:'line',
                        data:(function (){
                            var res = [];
                            var len = 0;
                            while (len < 10) {
                                res.push((Math.random()*10 + 5).toFixed(1) - 0);
                                len++;
                            }
                            return res;
                        })()
                    }
                ]
            };

            setInterval(function (){
                var axisData = (new Date()).toLocaleTimeString().replace(/^\D*/,'');

                var data = option.series[0].data;
                data.shift();
                data.push((Math.random()*10 + 5).toFixed(1) - 0);

                option.xAxis[0].data.shift();
                option.xAxis[0].data.push(axisData);

                myChart.setOption(option);
            }, 2100);

        }
    });
});
