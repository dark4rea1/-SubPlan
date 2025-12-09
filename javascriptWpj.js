function getSubscriptions() {
  return JSON.parse(localStorage.getItem('subscriptions')) || [];
}

// Save to storage
function saveSubscriptions(subs) {
  localStorage.setItem('subscriptions', JSON.stringify(subs)); 
}

// Calculate next payment
function calculateNextPayment(renewalDate, frequency) {
  let today = new Date();
  let renew = new Date(renewalDate);
  while (renew < today) {
    if (frequency === 'monthly') renew.setMonth(renew.getMonth() + 1);
    else renew.setFullYear(renew.getFullYear() + 1);
  }
  return renew;
}

// Format date
function formatDate(date) {
  let d = new Date(date); //Converts the input date to a js data object
  let month = (d.getMonth() + 1).toString().padStart(2, '0'); //0-11 , 1-12 , string , 2.0df
  let day = d.getDate().toString().padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

// Render subscriptions
function displaySubscriptions() {
  const subs = getSubscriptions();
  const table = document.getElementById('subscription-table');
  table.innerHTML = ''; //c.t redraw all rows fresh
  let totalMonthly = 0, totalYearly = 0; //totalMonthly & totalYearly --> will keep track of total costs
  const today = new Date();

  subs.forEach((sub, index) => {
    const nextPayment = calculateNextPayment(sub.renewalDate, sub.frequency); //1 subscription object from your array of subscriptions
    const totalYearlyValue = sub.frequency === 'monthly' ? sub.price * 12 : sub.price; 
    const monthlyEquivalent = sub.frequency === 'yearly' ? sub.price / 12 : sub.price;
    totalMonthly += monthlyEquivalent; 
    totalYearly += totalYearlyValue;


    //Im isam ( I learned this formula which it is the nextpayment date - today / 1000*60*60*24) to get the difference in days between the next payment date and today
    const diffDays = Math.ceil((nextPayment - today) / (1000 * 60 * 60 * 24)); // next payment - today is the javascript object we identified earlier representing the next payment date (from calculateNextPayment)
    const dueClass = (diffDays <= 9 && !sub.paid) ? 'due-soon' : ''; // new thing that I learned, due-soon is a shortcut to if/else

    table.innerHTML += ` 
      <tr id="sub-${index}" class="${dueClass}">
        <td>${sub.name}</td>
        <td>$${parseFloat(sub.price).toFixed(2)}</td>
        <td>${sub.frequency}</td>
        <td>${sub.renewalDate}</td>
        <td>${formatDate(nextPayment)}</td>
        <td><input type="checkbox" class="paid-checkbox" ${sub.paid ? 'checked' : ''} onchange="togglePaid(${index}, this.checked)"></td>
        <td>$${totalYearlyValue.toFixed(2)}</td>
        <td>$${monthlyEquivalent.toFixed(2)}</td>
        <td><button onclick="showDeleteConfirm(${index})">Delete</button></td>
      </tr>`;
  });

  document.getElementById('total-cost').innerText =
    `Total Monthly Cost: $${totalMonthly.toFixed(2)} | Total Yearly Cost: $${totalYearly.toFixed(2)}`;
}

// Toggle paid
function togglePaid(index, status) {
  const subs = getSubscriptions();
  subs[index].paid = status;
  saveSubscriptions(subs);
  displaySubscriptions();
}

// Add subscription
document.getElementById('subForm').addEventListener('submit', e => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const price = parseFloat(document.getElementById('price').value);
  const frequency = document.getElementById('frequency').value;
  const renewalDate = document.getElementById('renewalDate').value;

  const subs = getSubscriptions();
  subs.push({ name, price, frequency, renewalDate, paid: false });
  saveSubscriptions(subs);
  e.target.reset();
  displaySubscriptions(); //Calls the function that rebuilds the subscription table showing the newly added subscription immediately
});

// Delete confirmation
function showDeleteConfirm(index) {
  const row = document.getElementById(`sub-${index}`); //sub-0, sub-1
  const cell = row.querySelector('td:last-child'); //cell
  cell.innerHTML = `
    <button class="confirm" onclick="deleteSub(${index})">Confirm</button>
    <button class="cancel" onclick="displaySubscriptions()">Cancel</button>
  `; //cc
}



function deleteSub(index) {
  const subs = getSubscriptions(); //get 
  subs.splice(index, 1); //Remove
  saveSubscriptions(subs); //save the changes 
  displaySubscriptions();
}

// Initialize
displaySubscriptions();
