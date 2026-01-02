// ====== CHARTS.JS ======

// References to canvas
let yearlyCtx = document.getElementById("yearlyChart").getContext("2d");
let monthlyCtx = document.getElementById("monthlyChart").getContext("2d");
let monthYearSelect = document.getElementById("monthYearSelect");

let yearlyChart, monthlyChart;

// Render Yearly Chart
function renderYearlyChart() {
  // Group transactions by year and calculate cumulative net worth
  let yearMap = {}; 
  transactions.forEach(t => {
    let year = new Date(t.date).getFullYear();
    let change = t.type === "Income" ? t.amount : -t.amount;
    if (!yearMap[year]) yearMap[year] = 0;
    yearMap[year] += change;
  });

  // Sort years
  let years = Object.keys(yearMap).sort((a,b)=>a-b);
  let cumulative = 0;
  let values = years.map(y => {
    cumulative += yearMap[y];
    return cumulative;
  });

  // Destroy previous chart if exists
  if(yearlyChart) yearlyChart.destroy();

  yearlyChart = new Chart(yearlyCtx, {
    type: 'line',
    data: {
      labels: years,
      datasets: [{
        label: 'Net Worth',
        data: values,
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.2)',
        fill: true,
        tension: 0.4, // smooth curve
      }]
    },
    options: {
      responsive: true,
      plugins: {legend:{display:false}},
      scales: {y:{beginAtZero:true}}
    }
  });
}

// Populate Year selection for Monthly Chart
function populateMonthYearSelect() {
  let years = [...new Set(transactions.map(t => new Date(t.date).getFullYear()))].sort((a,b)=>a-b);
  monthYearSelect.innerHTML = years.map(y=>`<option value="${y}">${y}</option>`).join('');
}

// Render Monthly Chart
function renderMonthlyChart() {
  let selectedYear = +monthYearSelect.value;

  // Start with previous year cumulative balance
  let cumulative = 0;
  transactions.forEach(t => {
    let year = new Date(t.date).getFullYear();
    if(year < selectedYear){
      cumulative += (t.type==="Income"?t.amount:-t.amount);
    }
  });

  // Month-wise cumulative for selected year
  let months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  let monthlyValues = new Array(12).fill(0);

  transactions.forEach(t => {
    let date = new Date(t.date);
    if(date.getFullYear()===selectedYear){
      let monthIdx = date.getMonth();
      monthlyValues[monthIdx] += (t.type==="Income"?t.amount:-t.amount);
    }
  });

  // Convert to cumulative
  for(let i=0;i<12;i++){
    monthlyValues[i] += cumulative;
    cumulative = monthlyValues[i];
  }

  // Destroy previous chart if exists
  if(monthlyChart) monthlyChart.destroy();

  monthlyChart = new Chart(monthlyCtx, {
    type: 'line',
    data: {
      labels: months,
      datasets:[{
        label: `Net Worth ${selectedYear}`,
        data: monthlyValues,
        borderColor:'#388e3c',
        backgroundColor:'rgba(56,142,60,0.2)',
        fill:true,
        tension:0.4
      }]
    },
    options:{
      responsive:true,
      plugins:{legend:{display:false}},
      scales:{y:{beginAtZero:true}}
    }
  });
}

// Initial setup
function initCharts() {
  renderYearlyChart();
  populateMonthYearSelect();
  renderMonthlyChart();
}

// Call after initial render
initCharts();