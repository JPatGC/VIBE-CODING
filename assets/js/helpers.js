// utility functions used across the app

function pad(n) {
  return n.toString().padStart(2, "0");
}

function formatTime(date) {
  var h = date.getHours();
  var m = date.getMinutes();
  var ampm = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return h + ":" + pad(m) + " " + ampm;
}

function logSession(type, minutes) {
  var log = document.getElementById("session-log");

  // clear empty message
  var emptyMsg = log.querySelector(".empty-msg");
  if (emptyMsg) emptyMsg.remove();

  var entry = document.createElement("div");
  entry.className = "session-entry";

  var label = document.createElement("span");
  label.className = "session-type";
  label.textContent = type + " \u00B7 " + minutes + "min";

  var time = document.createElement("span");
  time.className = "session-time";
  time.textContent = formatTime(new Date());

  entry.appendChild(label);
  entry.appendChild(time);
  log.appendChild(entry);
}
