Vue.component("year-chart", {
    extends: VueChartJs.Pie,
    props: ["data"],
    data() {
        return {
            labels: ["Year 1", "Year 2", "Year 3", "Year 4"], 
            datapoints: [0, 0, 0, 0]
        }
    },
    watch: {
        data: function(newVar, oldVar) {
            for (var i = 0; i < this.labels.length; i++) {
                this.datapoints[i] = newVar[this.labels[i]]
            }
            this.plot();
        }
    }, 
    methods: {
        plot: function() {
            this.renderChart(
                { labels: this.labels, datasets: [{ label: "Label", backgroundColor: ['#b2cefe', '#baed91', '#faf884', '#f8b88b'], data: this.datapoints }] },
                { responsive: true, maintainAspectRatio: false }
            );
        }
    },
    mounted() {
        this.plot();
    }
});
