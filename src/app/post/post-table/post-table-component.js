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

            ctrl.PM25 = 22;
            ctrl.isSearch = false;
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



            /*$scope.getToday = function () {
                $scope.today = new Date();
                $scope.today.setHours(0, 0, 0, 0);
                $scope.startTime = mainService.timeConvert($scope.today / 1000);
                $scope.now = new Date();
                $scope.endTime = mainService.timeConvert($scope.now / 1000);
                $scope.getChannelList();
            };*/

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
                        alert("获取空气净化器当前开关状态失败！");
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
                // var flagSearch = false;
                searchTime = Math.ceil(new Date(searchTime).getTime() / 1000);
                var postData = {
                    "start": (searchTime - 2).toString(),
                    "end": (searchTime + 2).toString()
                };
                $.ajax({
                    type: "POST",
                    url: ctrl.urlHeader + "/search",
                    dataType: "text",
                    data: postData,
                    success: function (response) {
                        response = JSON.parse(response);
                        ctrl.saveMes = response;
                    },
                    error: function (err) {
                        alert("error!");
                    }
                })
            };

            ctrl.showMess = function (time) {
                if (time) {
                    ctrl.searchTimeFunc(time);
                    ctrl.PM2_5 = ctrl.saveMes[0].PM2_5;
                    ctrl.PM10 = ctrl.saveMes[0].PM10;
                    ctrl.isSearch = true;
                }else {
                    alert("请选择查询时间！");
                }
            };

            //时间转换
            var formatTime = function (data) {
                if (data < 10) {
                    return "0" + data;
                }
                else {
                    return data;
                }
            };

            var timeConvert = function (timestamp) {
                var timestamp = new Date(timestamp);
                return timestamp.getFullYear() + "-" + formatTime((timestamp.getMonth() + 1)) + "-" + formatTime(timestamp.getDate()) + " " + formatTime(timestamp.getHours()) + ":" + formatTime(timestamp.getMinutes());
            };


            //获取指定时间段数据
            var getSpecialData = function (arr) {
                for(var i = 0, len = arr.length; i < len; i++) {
                    var searchTime = arr[i];
                    var postData = {
                        "start": (searchTime - 2000).toString(),
                        "end": (searchTime + 2000).toString()
                    };
                    $.ajax({
                        type: "POST",
                        url: ctrl.urlHeader + "/search",
                        dataType: "text",
                        data: postData,
                        success: function (response) {
                            response = JSON.parse(response);
                            searchOption.series[0].data.push(response[0].PM2_5.toString());
                            searchOption.series[1].data.push(response[0].PM10.toString());
                            //应该用闭包来实现，但是怎么实现呢？？？
                            if(i === len){
                                searchLinechart.setOption(searchOption);
                            }
                        },
                        error: function (err) {
                            alert("error!");
                        }
                    });
                    searchOption.xAxis.data.push(timeConvert(arr[i]));
                }
            };

            //获取一小时
            var anHour = 3600000;
            var halfHour = 1800000;
            var oneDay = 60 * 60 * 24 * 1000;
            ctrl.getHour = function () {
                var timeArr = [];
                timeArr[0] = new Date().getTime();
                timeArr[1] = timeArr[0] - halfHour;
                timeArr[2] = timeArr[0] - anHour;

                searchOption.series[0].data = [];
                searchOption.series[1].data = [];
                searchOption.xAxis.data = [];
                getSpecialData(timeArr);
            };

            //过去一天
            ctrl.getToday = function () {
                var timeArr = [];
                timeArr[0] = new Date().getTime();
                for(var i = 1; i < 24; i++){
                    timeArr[i] = timeArr[0] - i * oneDay;
                }
                console.log(timeArr);

                searchOption.series[0].data = [];
                searchOption.series[1].data = [];
                searchOption.xAxis.data = [];
                getSpecialData(timeArr);
            };

            //过去一周
            ctrl.getWeek = function () {
                var timeArr = [];
                timeArr[0] = new Date();
                timeArr[0].setHours(12,0,0,0);
                for (var i = 1; i < 7; i++){
                    timeArr[i] = timeArr[0] - i * oneDay;
                }
                timeArr[0] = (new Date(timeArr[0])).getTime();

                searchOption.series[0].data = [];
                searchOption.series[1].data = [];
                searchOption.xAxis.data = [];
                getSpecialData(timeArr);
            };

            //动态折线图
            var myChart = echarts.init(document.getElementById('myChart'));
            var searchLinechart = echarts.init(document.getElementById('search-linechart'));
            var option = {
                title: {
                    text: '实时空气质量指数'
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
                    data: ["PM2.5浓度","PM10浓度"]
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
                        color: ['#CD9B1D'],
                        name: 'PM2.5浓度',
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
                    },
                    {
                        color: ['#ff3d3d'],
                        name: "PM10浓度",
                        type: "line",
                        data: (function () {
                            var res = [];
                            var len = 0;
                            while (len < 10) {
                                res.push((Math.random() * 10 + 10).toFixed(1) - 0);
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
                var dataTwo = option.series[1].data;

                data.shift();
                dataTwo.shift();

                data.push((Math.random() * 10 + 5).toFixed(1) - 0);
                dataTwo.push((Math.random() * 10 + 10).toFixed(1) - 0);

                option.xAxis[0].data.shift();
                option.xAxis[0].data.push(axisData);

                myChart.setOption(option);
            }, 2100);

            //查询折线图
            var searchOption = {
                title: {
                    text: '指定时间段平均空气质量指数'
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
                toolbox: {
                    show: true,
                    feature: {
                        dataView: {readOnly: false},
                        restore: {},
                        saveAsImage: {}
                    }
                },
                legend: {
                    data: ["PM2.5浓度", "PM10浓度"]
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
                    max: 100,
                    min: 0,
                    splitLine: { //网格线
                        show: true,
                        lineStyle: {
                            color: ['#b1b1b1'],
                            type: 'dashed'
                        }
                    }
                },
                series: [
                    {
                        color: ['#CD9B1D'],
                        name: 'PM2.5浓度',
                        type: 'line',
                        data: ['10', '15', '30', '5', '70', '15', '66'],
                        label: {
                            normal: {
                                show: true,
                                position: 'top' //值显示
                            }
                        }
                    },{
                        color: ['#ff3d3d'],
                        name: 'PM10浓度',
                        type: 'line',
                        data: ['20', '35', '15', '80', '77', '2', '87'],
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