const PROJECT = '5c8fd50a5dcaa32bb21b7a43';
const AREA_A = '5c94bb6780f6f4143fcb330c';
const AREA_B = '5c94b4c7ff642c13470f1d79';
const AREA_C = '5c94bb6c80f6f4143fcb330d';
const WIN_A = '5c8fd4955dcaa32bb21b7a39';
const WIN_B = '5c8fd4535dcaa32bb21b7a32';
const WIN_C = '5c8fd4b25dcaa32bb21b7a3b';
const WIN_D = '5c8fd46f5dcaa32bb21b7a34';
const WIN_E = '5c8fd47b5dcaa32bb21b7a36';
const WIN_G = '5c93a46d92cdcd02c63492f5';


let dateView = 'day';
let view = 'window';

$('#year').on('click', () => {
  dateView = 'year';
  updateChart(view, dateView);
})
$('#month').on('click', () => {
  dateView = 'month';
  updateChart(view, dateView);
});
$('#week').on('click', () => {
  dateView = 'week';
  updateChart(view, dateView);
});
$('#day').on('click', () => {
  dateView = 'day';
  updateChart(view, dateView);
});

function removeChart() {
  const charts = $('#container').find('*');
  charts.remove();
}

function setStartAndEndDate(dateView) {
  let startDate;
  let endDate = new Date();
  let interval;
  switch(dateView) {
    case 'year':
      interval =  'month';
      startDate = new Date(endDate.getFullYear(), 0, 1).getTime();
      endDate = endDate.getTime();
      break;
    case 'month':
      interval = 'day';
      startDate =  new Date(endDate.getFullYear(), endDate.getMonth(), 1).getTime();
      endDate = endDate.getTime();
      break;
    case 'week': 
      interval = 'day';
      const weekDay = endDate.getDay();
      startDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() - weekDay + (weekDay === 0 ?  -6 : 1)).getTime();
      endDate = endDate.getTime();
      break;
    case 'day':
      interval = 'hour';
      startDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 0).getTime();
      endDate = endDate.getTime();
      break;
    default:
      interval = 'hour';
      startDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 0).getTime();
      endDate = endDate.getTime();
      break;
    
  }
  return { interval, startDate, endDate };
}

function getRequest(url) {
  axios
    .get(url)
    .then(res => {
        console.log(res.data);
        drawGraph(res.data);
    })
    .catch(err => {
        console.log(err)
    });
  
}

function initializeChart () {
  const { interval, startDate, endDate } = setStartAndEndDate('day');
  const url = formulateQueryUrl(interval, startDate, endDate, 'window');
  getRequest(url);
}

function updateChart(view, dateView) {
    const { interval, startDate, endDate } = setStartAndEndDate(dateView);
    const url = formulateQueryUrl(interval, startDate, endDate, view);
    removeChart();
    getRequest(url);
}

function getIds(view) { 
  let ids;
  switch(view) {
    case 'window':
      ids= [WIN_A, WIN_B, WIN_C, WIN_D, WIN_E, WIN_G];
      break;
    case 'area':
      ids= [AREA_A, AREA_B, AREA_C];
      break;
    case 'installation':
      ids= [PROJECT];
      break;
    default:
      ids= [PROJECT];
    
  }
  return ids;
}

function formulateQueryUrl(interval, startDate, endDate, view) {
    const baseUrl = 'http://localhost:8080';
    const ids = getIds(view);
    return `${baseUrl}/${view}/${ids}/stats?startDate=${startDate}&endDate=${endDate}&interval=${interval}`;
    
}





$(function () {
    initializeChart(dateView);
});

$('#windowView').on('click', async () => {
  view = 'window';
  updateChart(view, dateView);

})
   
$('#areaView').on('click', async () => {
  view = 'area'
  updateChart(view, dateView);
})

$('#projectView').on('click', async () => {
  view = 'installation'
  updateChart(view, dateView);
})

function structureData(series) {
  const production = [];
  const lux = [];
  const volt = [];
  const cons = [];
  const datasets = [];
  
  series.forEach(serie => {
    production.push({parameter: 'solar', name: serie._id.name, unit: serie.data[0].solar.unit ,data: serie.data.map(d => [d.time, d.solar.sum])});
    cons.push({parameter: 'consumption', name: serie._id.name, unit: serie.data[0].cons.unit ,data: serie.data.map(d => [d.time, d.cons.sum])})
    lux.push({parameter: 'light intensity', name: serie._id.name, unit: serie.data[0].lux.unit ,data: serie.data.map(d => [d.time, d.lux.avg])})
    volt.push({parameter: 'volt', name: serie._id.name, unit: serie.data[0].volt.unit, data: serie.data.map(d => [d.time, d.volt.avg])});

  });
  
  datasets.push([production, cons, lux, volt]);
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
              marginLeft: 40, // Keep all charts left aligned
              spacingTop: 20,
              spacingBottom: 20
          },
          title: {
              text: parameter[0].parameter,
              align: 'left',
              margin: 0,
              x: 30
          },
          credits: {
              enabled: false
          },
          legend: {
              enabled: true
          },
          xAxis: {
              type: 'datetime',
              labels: {
                formatter: dateLabel,
              },
              crosshair: true,
              events: {
                  setExtremes: syncExtremes
              },
              
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
                  fontSize: '18px'
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
function syncExtremes(e) {
  const thisChart = this.chart;
  if (e.trigger !== 'syncExtremes') { // Prevent feedback loop
    Highcharts.each(Highcharts.charts, function (chart) {
      if (chart !== thisChart) {
        if (chart.xAxis[0].setExtremes) { // It is null while updating
          chart.xAxis[0].setExtremes(
            e.min,
            e.max,
            undefined,
            false,
            { trigger: 'syncExtremes' }
          );
        }
      }
    });
  }
};

function dateLabel() {
  let dateLabel;
  switch(dateView) {
    case 'year':
      dateLabel = Highcharts.dateFormat('%Y %b', this.value);
      break;
    case 'month':
      dateLabel =  Highcharts.dateFormat('%Y %b %e', this.value);
      break;
    case 'week':
      dateLabel = Highcharts.dateFormat('%Y %b %e', this.value);
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
