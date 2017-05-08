'use strict';

define([
    'workspace/workspace.module',
    'text!post/post-table/post-table-template.html',
    'css!post/post-table/post-table.css'
], function (workspaceModule, PostTableTemplate) {
    workspaceModule.component('postTable', {
        template: PostTableTemplate,
        controller: function () {
            var ctrl = this;

            ctrl.isSearch = false;
            ctrl.todayPeak = 200;
            ctrl.urlHeader = "http://localhost:3000";

            //添加点击样式
            var addClickClass = function () {
                $("#searchBtn button").click(function () {
                    var index = $(this).index() + 1;
                    if (index === 1) {
                        return;
                    } else {
                        $(".btn").removeClass("visited");
                        $(this).addClass("visited");
                    }
                });
            };
            addClickClass();

            //获取当前空气净化器开关状态
            ctrl.switchState = true;
            var getCurrSwichSta = function () {
                var option = {
                    type: "get",
                    url: ctrl.urlHeader + "/get_air",
                    success: function (data) {
                        console.log(data[0].controller.controller);
                        ctrl.switchState = data[0].controller.controller;
                    },
                    error: function (err) {
                        alert("获取空气净化器当前开关状态失败！")
                    }
                };
                $.ajax(option);
            };

            getCurrSwichSta();

            //开关空气净化器
            ctrl.changeAirStatus = function (data){
                data = !data;
                var option = {
                    type: "post",
                    url: ctrl.urlHeader + "/change_air_status",
                    data: {
                        controller: data
                    },
                    success: function (data) {
                        alert("success");
                    },
                    error: function (data) {
                        alert("error");
                    }
                };
                $.ajax(option);
            };

            ctrl.searchTimeFunc = function (searchTime) {
                if (searchTime) {
                    searchTime = new Date(searchTime).getTime();
                    searchTime = searchTime.toString();
                    console.log(searchTime);
                    ctrl.isSearch = true;
                    var option = {
                        type: "POST",
                        url: ctrl.urlHeader + "/search",
                        dataType: "text",
                        //测试数据
                        data: {
                            time: "1493950256000"
                        },
                        success: function (response) {
                            response = response.toString();
                            console.log(response);
                        },
                        error: function (err) {
                            alert("error!");
                        }
                    };
                    $.ajax(option);
                } else {
                    alert("请选择查询时间！");
                }
            };

            ctrl.oneDay = 60 * 60 * 24 * 1000;

            //本周
            ctrl.getWeek = function () {
                ctrl.endTime = new Date().getTime();
                ctrl.startTime = new Date(ctrl.endTime - 6 * ctrl.oneDay).setHours(0, 0, 0, 0);
            };

            //30天
            ctrl.getThirtieth = function () {
                ctrl.endTime = new Date().getTime();
                ctrl.startTime = new Date(ctrl.endTime - 29 * ctrl.oneDay).setHours(0, 0, 0, 0);
            };

            //本月
            ctrl.getCurrentMonthFirst = function () {
                ctrl.endTime = new Date().getTime();
                ctrl.startTime = new Date().setDate(1);
            };

            //动态折线图
            var myChart = echarts.init(document.getElementById('myChart'));
            var searchLinechart = echarts.init(document.getElementById('search-linechart'));
            var option = {
                title: {
                    text: '实时空气质量指数'
                },
                color: ['#ff3d3d'],
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
                    data: ['空气质量指数']
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
                        data: (function () {
                            var now = new Date();
                            var res = [];
                            var len = 10;
                            while (len--) {
                                res.unshift(now.toLocaleTimeString().replace(/^\D*/, ''));
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
                        boundaryGap: [0.2, 0.2],
                        splitLine: { //网格线
                            show: true,
                            lineStyle: {
                                color: ['#b1b1b1'],
                                type: 'dashed'
                            }
                        }
                    }
                ],
                series: [
                    {
                        name: '空气质量指数',
                        type: 'line',
                        data: (function () {
                            var res = [];
                            var len = 0;
                            while (len < 10) {
                                res.push((Math.random() * 10 + 5).toFixed(1) - 0);
                                len++;
                            }
                            return res;
                        })()
                    }
                ]
            };

            setInterval(function () {
                var axisData = (new Date()).toLocaleTimeString().replace(/^\D*/, '');

                var data = option.series[0].data;
                data.shift();
                data.push((Math.random() * 10 + 5).toFixed(1) - 0);

                option.xAxis[0].data.shift();
                option.xAxis[0].data.push(axisData);

                myChart.setOption(option);
            }, 2100);

            //查询折线图
            var searchOption = {
                title: {
                    text: '指定时间段平均空气质量指数'
                },
                color: ['#ff3d3d'],
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                        label: {
                            backgroundColor: '#283b56'
                        }
                    }
                },
                toolbox: {
                    show: true,
                    feature: {
                        dataView: {readOnly: false},
                        restore: {},
                        saveAsImage: {}
                    }
                },
                legend: {
                    data: ['空气质量指数']
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    splitLine: { //网格线
                        show: false,
                        lineStyle: {
                            color: ['#b1b1b1'],
                            type: 'dashed'
                        }
                    },
                    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
                },
                yAxis: {
                    type: 'value',
                    scale: true,
                    name: 'AQI',
                    max: 500,
                    min: 0,
                    splitLine: { //网格线
                        show: true,
                        lineStyle: {
                            color: ['#b1b1b1'],
                            type: 'dashed'
                        }
                    }
                },
                series: [{
                    name: '空气质量指数',
                    type: 'line',
                    data: ['200', '300', '500', '300', '280', '290', '230'],
                    label: {
                        normal: {
                            show: true,
                            position: 'top' //值显示
                        }
                    }
                }]
            };

            searchLinechart.setOption(searchOption);
        }
    });
});