let dateView = 'week';
let view = 'window';

$('#windowView').on('click', () => {
    const date= $('#date').calendar('get date');
    view = 'window';
    updateChart(view, dateView, date);
  
})
     
  $('#areaView').on('click',() => {
    const date= $('#date').calendar('get date');
    view = 'area'
    updateChart(view, dateView, date);
})
  
  $('#projectView').on('click', () => {
    const date= $('#date').calendar('get date');
    view = 'installation'
    updateChart(view, dateView, date);
})
$('#date').calendar({
    type: 'date',
    today: true,
    maxDate: new Date(),
    onChange: date => {
        updateChart(view, dateView, date);
    }
});

$('#year').on('click', () => {
  const date= $('#date').calendar('get date');
  dateView = 'year';
  updateChart(view, dateView, date);
})
$('#month').on('click', () => {
  const date= $('#date').calendar('get date');
  dateView = 'month';
  updateChart(view, dateView, date);
});
$('#week').on('click', () => {
  const date= $('#date').calendar('get date');
  dateView = 'week';
  updateChart(view, dateView, date);
});
$('#day').on('click', () => {
  const date= $('#date').calendar('get date');
  dateView = 'day';
  updateChart(view, dateView, date);
});

function removeChart() {
  const charts = $('#container').find('*');
  charts.remove();
}

function setStartAndEndDate(dateView, date) {
  let startDate;
  let endDate;
  let interval;
  switch(dateView) {
    case 'year':
      interval =  'month';
      startDate = new Date(date.getFullYear(), 0, 1).getTime();
      endDate = new Date(date.getFullYear(), 11, 31).getTime();
      break;
    case 'month':
      interval = 'day';
      startDate =  new Date(date.getFullYear(), date.getMonth(), 1).getTime();
      endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0).getTime();
      break;
    case 'week': 
      interval = 'day';
      const weekDay = date.getDay();
      startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - weekDay + (weekDay === 0 ?  -6 : 1)).getTime();
      endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - weekDay + (weekDay === 0 ?  -6 : 1) + 6 ).getTime();
      break;
    case 'day':
      interval = 'hour';
      startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1, 0).getTime();
      endDate = date.getTime();
      break;
    default:
      interval = 'day';
      startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - weekDay + (weekDay === 0 ?  -6 : 1)).getTime();
      endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - weekDay + (weekDay === 0 ?  -6 : 1) + 6 ).getTime();
      break;
    
  }
  const today = new Date().getTime();
  endDate = endDate > today ? today : endDate;
  return { interval, startDate, endDate };
}

function getRequest(url) {
  axios
    .get(url)
    .then(res => {
        drawGraph(res.data);
    })
    .catch(err => {
        console.log(err)
    });
  
}

function initializeChart () {
  const date= $('#date').calendar('get date');
  const { interval, startDate, endDate } = setStartAndEndDate('week', date);
  const url = formulateQueryUrl(interval, startDate, endDate, 'window');
  getRequest(url);
}

function updateChart(view, dateView , date) {
    const { interval, startDate, endDate } = setStartAndEndDate(dateView, date);
    const url = formulateQueryUrl(interval, startDate, endDate, view);
    removeChart();
    getRequest(url);
}

function formulateQueryUrl(interval, startDate, endDate, view) {
    const baseUrl = 'http://localhost:7777';
    return `${baseUrl}/${view}/stats?startDate=${startDate}&endDate=${endDate}&interval=${interval}`;
    
}


function structureData(series) {
  const production = [];
  const lux = [];
  const temp = [];
  const cons = [];
  const datasets = [];
  
  series.forEach(serie => {
    production.push({parameter: 'Solar', name: serie._id.name, unit: serie.data[0].solar.unit ,data: serie.data.map(d => [d.time, d.solar.sum])});
    cons.push({parameter: 'Consumption', name: serie._id.name, unit: serie.data[0].cons.unit ,data: serie.data.map(d => [d.time, d.cons.sum])})
    lux.push({parameter: 'Light intensity', name: serie._id.name, unit: serie.data[0].lux.unit ,data: serie.data.map(d => [d.time, d.lux.avg])})
    temp.push({parameter: 'Temperature', name: serie._id.name, unit: ' ℃', data: serie.data.map(d => [d.time, d.temp.avg])});

  });
  
  datasets.push([production, lux, temp, cons]);
  return datasets;
  
}

function drawGraph(data) {
  const datasets = structureData(data);
  datasets.forEach((dataset) => {
    dataset.forEach(parameter => {
      const chartDiv = document.createElement('div');
      document.getElementById('container').appendChild(chartDiv);
      const series = [];
      for (let i = 0; i < parameter.length; i += 1) {
         series.push({
            data: parameter[i].data,
            name: parameter[i].name,
            fillOpacity: 0.3,
            tooltip: {
                valueSuffix:  ' ' + parameter[i].unit
            }
          })
      }
      
     
      const chart = new Highcharts.chart(chartDiv, {
            chart: {
              marginLeft: 40, 
              spacingTop: 20,
              spacingBottom: 20,
              height: 300.
          },
          title: {
              text: parameter[0].parameter,
              align: 'left',
              margin: 0,
              x: 30,
              style: {
                fontFamily: 'Museo-Sans',
                fontWeight: 100,
                fontSize: '2em',
                color: '#636363',
              }
          },
          credits: {
              enabled: false
          },
          legend: {
              enabled: true,
              style: {
                fontFamily: 'Roboto',
                fontWeight: 100,
                fontSize: '1em',
                color: '#636363',
              }
              
          },
          xAxis: {
              type: 'datetime',
              labels: {
                formatter: dateLabel,
                style: {
                    fontFamily: 'Roboto',
                    fontWeight: 300,
                    fontSize: '1em',
                    color: '#636363',
                  }
              },
              crosshair: true,
              
          },
          yAxis: {
              title: {
                  text: null
              }
          },
          tooltip: {
              positioner: function() {
                  return {
                      // right aligned
                      x: this.chart.chartWidth - (this.label.width) * 1.5,
                      y: 10 // align to title
                  };
              },
              borderWidth: 0,
              backgroundColor: 'none',
              pointFormat: '{point.y}',
              headerFormat: '',
              shadow: false,
              style: {
                fontFamily: 'Museo-Sans',
                fontWeight: 300,
                fontSize: '2em',
                color: '#636363',
              },
              // valueDecimals: dataset.valueDecimals
          },
          series: series
          });
        }) 
    })   
}
// make the line into curves
Highcharts.seriesTypes.line.prototype.getPointSpline = Highcharts.seriesTypes.spline.prototype.getPointSpline;
Highcharts.setOptions({
    colors: ['#7FD6DB', '#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572', '#FF9655', '#FFF263', '#6AF9C4']
});
  // Override the reset function, for not hiding the tooltips or crosshairs
Highcharts.Pointer.prototype.reset = function () {
  return undefined;
};
// highlight a point by showing tooltips, setting hover state & draw crosshairs
Highcharts.Point.prototype.highlight = function (event) {
  event = this.series.chart.pointer.normalize(event);
  this.onMouseOver(); // Show the hover marker
  this.series.chart.tooltip.refresh(this); // Show the tooltip
  this.series.chart.xAxis[0].drawCrosshair(event, this); // Show the crosshair
};


function dateLabel() {
  let dateLabel;
  switch(dateView) {
    case 'year':
      dateLabel = Highcharts.dateFormat('%Y %b', this.value);
      break;
    case 'month':
      dateLabel =  Highcharts.dateFormat('%b %e', this.value);
      break;
    case 'week':
      dateLabel = Highcharts.dateFormat('%b %e', this.value);
      break;
    case 'day':
      dateLabel = Highcharts.dateFormat('%b %e %H', this.value);
      break;
   
    default:
      dateLabel = Highcharts.dateFormat('%Y %b %d', this.value) + '<br/>' + Highcharts.dateFormat('%H:%M', this.value);
    }
    return dateLabel;

}






export default initializeChart;
