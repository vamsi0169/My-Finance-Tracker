// chart.js

let accountChart;

function renderAccountChart() {
  // Only accounts with positive or zero balances
  const filteredAccounts = accounts.filter(a => a.amount !== 0);

  const labels = filteredAccounts.map(a => a.name);
  const data = filteredAccounts.map(a => a.amount);

  // Use some colors for up to 10 accounts, repeat if more
  const colors = ["#1976d2","#388e3c","#fbc02d","#d32f2f","#7b1fa2","#009688","#ff5722","#607d8b","#9c27b0","#795548"];
  
  const ctx = document.getElementById("accountChart").getContext("2d");
  if(accountChart) accountChart.destroy();

  accountChart = new Chart(ctx,{
    type:'pie',
    data:{
      labels: labels,
      datasets:[{data:data, backgroundColor: colors.slice(0,labels.length)}]
    },
    options:{
      responsive:true,
      plugins:{
        legend:{position:'bottom'},
        tooltip:{
          callbacks:{
            label: function(context){
              let value = context.raw;
              let total = context.dataset.data.reduce((a,b)=>a+b,0);
              let percent = ((value/total)*100).toFixed(2);
              return `${context.label}: ₹${value} (${percent}%)`;
            }
          }
        }
      }
    }
  });
}

// Render chart after page load
window.addEventListener('load', () => {
  renderAccountChart();
});