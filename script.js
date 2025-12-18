if (Notification.permission !== "granted") {
  Notification.requestPermission();
}

const form = document.getElementById("alertForm");
const list = document.getElementById("alertList");

let alerts = JSON.parse(localStorage.getItem("alerts")) || [];

function saveAlerts() {
  localStorage.setItem("alerts", JSON.stringify(alerts));
}

function renderAlerts() {
  list.innerHTML = "";
  alerts.forEach((alert, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${alert.task}</strong>
      <br>
      Statut : ${alert.active ? "Active" : "Désactivée"}
      <br>
      <button onclick="disableAlert(${index})">Désactiver</button>
    `;
    list.appendChild(li);
  });
}

function disableAlert(index) {
  alerts[index].active = false;
  saveAlerts();
  renderAlerts();
}

function sendNotification(alert) {
  if (Notification.permission === "granted") {
    new Notification("Alerte", {
      body: `Tâche : ${alert.task}\nReviens sur le site pour la désactiver`
    });
  }
}

function scheduleAlert(alert) {
  const delayMs = alert.delay * 60 * 1000;
  setTimeout(() => {
    if (alert.active) {
      sendNotification(alert);
    }
  }, delayMs);
}

form.addEventListener("submit", e => {
  e.preventDefault();

  const task = document.getElementById("task").value;
  const delay = Number(document.getElementById("delay").value);

  const alert = {
    task,
    delay,
    active: true,
    createdAt: Date.now()
  };

  alerts.push(alert);
  saveAlerts();
  scheduleAlert(alert);
  renderAlerts();

  form.reset();
});

alerts.forEach(alert => {
  if (alert.active) {
    const elapsed = (Date.now() - alert.createdAt) / 60000;
    const remaining = alert.delay - elapsed;
    if (remaining > 0) {
      setTimeout(() => {
        if (alert.active) sendNotification(alert);
      }, remaining * 60000);
    }
  }
});

renderAlerts();
