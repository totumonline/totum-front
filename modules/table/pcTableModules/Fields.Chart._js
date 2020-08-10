fieldTypes.chart = {
    icon: 'fa-bar-chart',
    getCellText: function (fieldValue, td, item) {
        let div = $('<div>');

        if (item[this.name].ch) {
            this.loadChart(() => {
                this.chartSimple(div, item[this.name].ch)
            });
        }

        return div;
    },
    async loadChart(func) {
        if (!window.ChartLoaded) {
            let resolve, reject;

            window.ChartLoaded = new Promise((_resolve, _reject) => {
                resolve = _resolve;
                reject = _reject;
            });
            window.ChartLoaded.then(func);

            $.getScript('/js/lib/chart.js').then(() => {
                resolve();
            })
        } else
            window.ChartLoaded.then(func)
    },
    chartSimple: function (div, data) {
        let canvas = $('<canvas class="ttm-chart"></canvas>');

        div.html(canvas);
        let expraProps = {};
        let options = {...this.chartOptions};

        if (this.category === 'column' || this.column) {
            canvas.attr('height', "23")
            // canvas.wrap($('<div>').height(23).width(div.width() - 10).css('position', 'absolute'))
            expraProps.layout = {
                padding: {
                    left: 5,
                    right: 5,
                    top: 2,
                    bottom: 2
                }
            }
            expraProps.scales = {
                yAxes: [{display: false}], xAxes: [{display: false}]
            }
        } else if (this.f && this.f.height) {
            canvas.attr('height', this.f.height)

        }

        if (window.innerWidth < ((localStorage.getItem('TreeMinimizer') || "false") !== "false" ? 600 : 800)) {
            expraProps.layout = {
                ...options.layout, ...{
                    padding: {
                        left: 5,
                        right: 5,
                        top: 2,
                        bottom: 2
                    }
                }
            }

            expraProps.scales = {};

            if (options.scales && options.scales.yAxes) {
                expraProps.scales.yAxes = options.scales.yAxes.map((sc) => {
                    return {...sc, display: false}
                })
            } else {
                expraProps.scales.yAxes = [{display: false}]
            }
            if (options.scales && options.scales.xAxes) {
                expraProps.scales.xAxes = options.scales.xAxes.map((sc) => {
                    return {...sc, display: false}
                })
            } else {
                expraProps.scales.xAxes = [{display: false}]
            }
            expraProps.aspectRatio = options.aspectRatioMobile || ((options.aspectRatio || 2) / 1.6);
        }

        let ctx = canvas.get(0).getContext('2d');

        let type = options.type || 'line';
        delete options.type;

        let datasets = data.values.map(() => new Object());

        if (options.data && options.data.datasets) {
            datasets = options.data.datasets;
        }
        if (data.datasets) {
            datasets = data.datasets
        }
        let _data = options.data || {};
        _data.datasets = datasets;

        if (data.labels)
            _data.labels = data.labels
        delete options.data;

        datasets.forEach((set, i) => {
            set.data = data.values[i]
        })

        new Chart(ctx, {
            type: type,
            data: _data,
            options: {...options, ...expraProps}
        });

        if (this.pcTable._container.getNiceScroll) {
            this.pcTable._container.getNiceScroll().resize()
        }

        canvas.on('contextmenu', () => {
            return false;
        })
        canvas.on('dblclick', () => {
            window.top.BootstrapDialog.show({
                message: '<canvas></canvas>',
                draggable: true,
                title: this.pcTable.__getCellTitle(this),
                cssClass: 'dialog-chart-topper',
                onshown: (dialog) => {
                    new Chart(dialog.$modalBody.find('canvas').get(0).getContext('2d'), {
                        type: type,
                        data: _data,
                        options: options
                    });
                }
            });
        })

    }
}