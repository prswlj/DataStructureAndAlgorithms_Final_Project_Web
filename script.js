"use strict";

const STORAGE_KEY = "oralcare_dsa_final_v2";
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const todayISO = () => new Date().toISOString().slice(0, 10);
const makeId = () => Date.now() + Math.floor(Math.random() * 1000);
const money = value => `₱${Number(value || 0).toLocaleString("en-PH")}`;
const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const dateLabel = value => value ? new Date(`${value}T00:00:00`).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) : "—";

class LinkedListNode { constructor(value) { this.value = value; this.next = null; } }
class LinkedList {
  constructor() { this.head = null; this.length = 0; }
  append(value) { const node = new LinkedListNode(value); if (!this.head) this.head = node; else { let current = this.head; while (current.next) current = current.next; current.next = node; } this.length++; }
  traverse(callback) { let current = this.head; let index = 0; while (current) { callback(current.value, index++); current = current.next; } }
  toArray() { const result = []; this.traverse(value => result.push(value)); return result; }
}
class Stack {
  constructor() { this.items = []; }
  push(value) { this.items.push(value); }
  pop() { return this.items.pop(); }
  peek() { return this.items[this.items.length - 1]; }
  isEmpty() { return this.items.length === 0; }
  size() { return this.items.length; }
}
class Queue {
  constructor() { this.items = []; this.frontIndex = 0; }
  enqueue(value) { this.items.push(value); }
  dequeue() { if (this.isEmpty()) return null; const value = this.items[this.frontIndex++]; if (this.frontIndex > 30 && this.frontIndex * 2 >= this.items.length) { this.items = this.items.slice(this.frontIndex); this.frontIndex = 0; } return value; }
  peek() { return this.items[this.frontIndex] ?? null; }
  isEmpty() { return this.frontIndex >= this.items.length; }
  size() { return this.items.length - this.frontIndex; }
  toArray() { return this.items.slice(this.frontIndex); }
}
class BSTNode { constructor(value) { this.value = value; this.left = null; this.right = null; } }
class BinarySearchTree {
  constructor() { this.root = null; }
  insert(value) { const node = new BSTNode(value); if (!this.root) { this.root = node; return true; } let current = this.root; while (true) { if (value.id === current.value.id) return false; const side = value.id < current.value.id ? "left" : "right"; if (!current[side]) { current[side] = node; return true; } current = current[side]; } }
  search(id) { let current = this.root; const path = []; while (current) { path.push(current.value); if (Number(id) === Number(current.value.id)) return { found: current.value, path }; current = Number(id) < Number(current.value.id) ? current.left : current.right; } return { found: null, path }; }
  inorder(node = this.root, output = []) { if (!node) return output; this.inorder(node.left, output); output.push(node.value); this.inorder(node.right, output); return output; }
}
class Graph {
  constructor() { this.adjacency = new Map(); }
  addVertex(vertex) { if (!this.adjacency.has(vertex)) this.adjacency.set(vertex, new Set()); }
  addEdge(a, b) { this.addVertex(a); this.addVertex(b); this.adjacency.get(a).add(b); this.adjacency.get(b).add(a); }
  bfs(start) { if (!this.adjacency.has(start)) return []; const queue = [start], visited = new Set([start]), order = []; for (let index = 0; index < queue.length; index++) { const vertex = queue[index]; order.push(vertex); for (const next of this.adjacency.get(vertex)) if (!visited.has(next)) { visited.add(next); queue.push(next); } } return order; }
  dfs(start) { const visited = new Set(), order = []; const visit = vertex => { visited.add(vertex); order.push(vertex); for (const next of this.adjacency.get(vertex) || []) if (!visited.has(next)) visit(next); }; if (this.adjacency.has(start)) visit(start); return order; }
}

const defaultServices = [
  { id: 1, name: "Dental Consultation", category: "Consultation", price: 500, description: "Initial oral examination and professional dental assessment." },
  { id: 2, name: "Oral Prophylaxis", category: "Cleaning", price: 800, description: "Professional cleaning to remove plaque and tartar buildup." },
  { id: 3, name: "Tooth Extraction", category: "Restorative", price: 1500, description: "Careful removal of a tooth when clinically necessary." },
  { id: 4, name: "Dental Filling", category: "Restorative", price: 1200, description: "Treatment to restore a tooth affected by decay." },
  { id: 5, name: "Teeth Whitening", category: "Cosmetic", price: 2500, description: "A cosmetic procedure to brighten the appearance of teeth." },
  { id: 6, name: "Dental X-ray", category: "Consultation", price: 700, description: "Dental imaging to help assess teeth and surrounding structures." }
];
const seedState = () => ({
  patients: [
    { id: 1001, name: "Alexandra Reyes", age: 22, contact: "0917 123 4567", email: "alexandra@email.com" },
    { id: 1002, name: "Benjamin Cruz", age: 25, contact: "0918 234 5678", email: "benjamin@email.com" },
    { id: 1003, name: "Camille Santos", age: 20, contact: "0919 345 6789", email: "camille@email.com" }
  ],
  services: defaultServices,
  appointments: [
    { id: 2001, queueId: "Q-001", patientId: 1001, serviceId: 1, dentist: "Dr. Santos", date: todayISO(), time: "09:00", status: "Serving", notes: "Initial consultation" },
    { id: 2002, queueId: "Q-002", patientId: 1002, serviceId: 2, dentist: "Dr. Reyes", date: todayISO(), time: "09:30", status: "Approved", notes: "" },
    { id: 2003, queueId: "Q-003", patientId: 1003, serviceId: 4, dentist: "Dr. Santos", date: todayISO(), time: "10:00", status: "Pending", notes: "" }
  ],
  histories: [{ id: 3001, patientId: 1001, service: "Dental Consultation", dentist: "Dr. Santos", date: todayISO(), notes: "Initial assessment completed." }],
  nextQueue: 4
});
function loadState() { try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)); if (saved && Array.isArray(saved.patients) && Array.isArray(saved.appointments)) return { ...seedState(), ...saved, services: saved.services?.length ? saved.services : defaultServices }; } catch (error) { console.warn("Could not load saved project data:", error); } return seedState(); }
let state = loadState();
let undoStack = new Stack();
let activeQueueIds = new Set();
let waitingQueue = new Queue();
let patientTree = new BinarySearchTree();
let serviceGraph = new Graph();
let toastTimer;
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function notify(message) { const toast = $("#toast"); toast.textContent = message; toast.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 2600); }
function patientById(id) { return state.patients.find(patient => Number(patient.id) === Number(id)); }
function serviceById(id) { return state.services.find(service => Number(service.id) === Number(id)); }
function appointmentById(id) { return state.appointments.find(appointment => Number(appointment.id) === Number(id)); }
function rebuildStructures() {
  waitingQueue = new Queue(); activeQueueIds = new Set(); patientTree = new BinarySearchTree(); serviceGraph = new Graph();
  state.appointments.filter(item => item.status === "Approved").sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)).forEach(item => { waitingQueue.enqueue(item); activeQueueIds.add(item.queueId); });
  state.appointments.filter(item => item.status === "Serving").forEach(item => activeQueueIds.add(item.queueId));
  state.patients.forEach(patient => patientTree.insert(patient));
  const categories = [...new Set(state.services.map(service => service.category))]; categories.forEach(category => serviceGraph.addVertex(category));
  for (let index = 0; index < categories.length - 1; index++) serviceGraph.addEdge(categories[index], categories[index + 1]);
  if (categories.length > 2) serviceGraph.addEdge(categories[0], categories[2]);
}
function statusPill(status) { return `<span class="status ${status.toLowerCase()}">${escapeHTML(status)}</span>`; }
function patientName(id) { return patientById(id)?.name || "Unknown patient"; }
function serviceName(id) { return serviceById(id)?.name || "Unknown service"; }
function setPage(page) {
  $$(".page").forEach(section => section.classList.toggle("active", section.id === `page-${page}`));
  $$(".nav-link[data-page]").forEach(button => button.classList.toggle("active", button.dataset.page === page));
  const titles = { dashboard: "Dashboard", appointments: "Appointments", queue: "Queue management", patients: "Patient records", services: "Dental services", history: "Visit history", dsa: "DSA Laboratory" };
  $("#topTitle").textContent = titles[page] || "Dashboard"; $("#sidebar").classList.remove("open");
  if (page === "dsa") renderDSA(); else renderAll();
}
function renderStats() {
  const today = state.appointments.filter(item => item.date === todayISO());
  const stats = [
    ["Total patients", state.patients.length, "♙", "Registered patient records"],
    ["Today's appointments", today.length, "▦", "Schedules for today"],
    ["Waiting in queue", waitingQueue.size(), "≋", "Approved appointments"],
    ["Completed visits", state.appointments.filter(item => item.status === "Completed").length, "✓", "Successfully completed"]
  ];
  $("#dashboardStats").innerHTML = stats.map(([label, value, icon, foot]) => `<div class="stat-card"><div class="stat-top"><span>${label}</span><span class="stat-icon">${icon}</span></div><div class="stat-value">${value}</div><div class="stat-foot">${foot}</div></div>`).join("");
}
function renderDashboard() {
  const current = state.appointments.filter(item => ["Serving", "Approved"].includes(item.status)).sort((a, b) => a.status === "Serving" ? -1 : b.status === "Serving" ? 1 : `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)).slice(0, 4);
  $("#dashboardQueue").innerHTML = current.length ? current.map(item => `<div class="queue-preview-item"><span class="queue-number">${escapeHTML(item.queueId)}</span><span><b>${escapeHTML(patientName(item.patientId))}</b><small>${escapeHTML(serviceName(item.serviceId))}</small></span>${statusPill(item.status)}</div>`).join("") : `<div class="empty-state">No patients in the active queue.</div>`;
  const recent = [...state.appointments].sort((a, b) => b.id - a.id).slice(0, 5);
  $("#dashboardAppointments").innerHTML = recent.length ? recent.map(item => `<tr><td><b>${escapeHTML(item.queueId)}</b></td><td>${escapeHTML(patientName(item.patientId))}</td><td>${escapeHTML(serviceName(item.serviceId))}</td><td>${dateLabel(item.date)}</td><td>${statusPill(item.status)}</td></tr>`).join("") : `<tr><td colspan="5" class="empty-state">No appointments yet.</td></tr>`;
}
function renderAppointments() {
  const query = ($("#appointmentSearch")?.value || "").toLowerCase(); const filter = $("#appointmentFilter")?.value || "All";
  const items = [...state.appointments].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)).filter(item => (filter === "All" || item.status === filter) && `${patientName(item.patientId)} ${item.queueId} ${serviceName(item.serviceId)}`.toLowerCase().includes(query));
  $("#appointmentsTable").innerHTML = items.length ? items.map(item => { const actions = item.status === "Pending" ? `<button class="action-btn" data-action="approve" data-id="${item.id}">Approve</button>` : item.status === "Approved" ? `<button class="action-btn" data-action="cancel" data-id="${item.id}">Cancel</button>` : item.status === "Serving" ? `<button class="action-btn" data-action="complete" data-id="${item.id}">Complete</button>` : "—"; return `<tr><td><b>${escapeHTML(item.queueId)}</b></td><td>${escapeHTML(patientName(item.patientId))}</td><td>${escapeHTML(serviceName(item.serviceId))}</td><td>${escapeHTML(item.dentist)}</td><td>${dateLabel(item.date)} · ${escapeHTML(item.time)}</td><td>${statusPill(item.status)}</td><td>${actions}</td></tr>`; }).join("") : `<tr><td colspan="7" class="empty-state">No matching appointments found.</td></tr>`;
}
function renderQueue() {
  rebuildStructures(); const serving = state.appointments.find(item => item.status === "Serving"); const waiting = waitingQueue.toArray();
  $("#queueStats").innerHTML = `<div class="queue-stat"><small>NOW SERVING</small><b>${serving ? escapeHTML(serving.queueId) : "—"}</b></div><div class="queue-stat"><small>WAITING PATIENTS</small><b>${waiting.length}</b></div><div class="queue-stat"><small>ACTIVE QUEUE IDS · HASHSET</small><b>${activeQueueIds.size}</b></div>`;
  $("#queueList").innerHTML = waiting.length ? waiting.map((item, index) => `<div class="queue-row"><span class="queue-number">${escapeHTML(item.queueId)}</span><span><b>${escapeHTML(patientName(item.patientId))}</b><small>${escapeHTML(serviceName(item.serviceId))}</small></span><span class="queue-meta"><b>#${index + 1} in line</b><small>${escapeHTML(item.time)} · ${escapeHTML(item.dentist)}</small></span>${statusPill("Approved")}</div>`).join("") : `<div class="empty-state"><b>The waiting line is clear.</b>No approved appointments are waiting.</div>`;
  $("#servingPanel").innerHTML = serving ? `<div class="serving-content"><div><div class="eyebrow">CURRENTLY IN SERVICE</div><h3>${escapeHTML(serving.queueId)} · ${escapeHTML(patientName(serving.patientId))}</h3><p>${escapeHTML(serviceName(serving.serviceId))} with ${escapeHTML(serving.dentist)}</p></div><button class="btn btn-primary" data-action="complete" data-id="${serving.id}">Mark completed ✓</button></div>` : `<div class="serving-content"><div><div class="eyebrow">CURRENTLY IN SERVICE</div><h3>No patient is being served</h3><p>Call the next approved patient when the clinic is ready.</p></div><button class="btn btn-primary" id="callNextInline">Call next →</button></div>`;
  $("#undoButton").disabled = undoStack.isEmpty();
}
function renderPatients() {
  const query = ($("#patientSearch")?.value || "").toLowerCase(); const patients = state.patients.filter(patient => `${patient.name} ${patient.id}`.toLowerCase().includes(query));
  $("#patientCount").textContent = `${state.patients.length} registered`; $("#patientGrid").innerHTML = patients.length ? patients.map(patient => `<article class="patient-card"><div class="patient-card-head"><div class="patient-initial">${escapeHTML(patient.name.split(" ").map(part => part[0]).slice(0, 2).join("").toUpperCase())}</div><div><h3>${escapeHTML(patient.name)}</h3><small>PATIENT #${patient.id}</small></div></div><div class="patient-details">Age: ${patient.age}<br>Contact: ${escapeHTML(patient.contact)}<br>Email: ${escapeHTML(patient.email || "Not provided")}</div></article>`).join("") : `<div class="empty-state">No patient records match your search.</div>`;
}
function renderServices() {
  const symbols = ["✚", "✧", "⌁", "◇", "✦", "▧"];
  $("#serviceGrid").innerHTML = state.services.map((service, index) => `<article class="service-card"><div class="service-symbol">${symbols[index % symbols.length]}</div><small>${escapeHTML(service.category.toUpperCase())}</small><h3>${escapeHTML(service.name)}</h3><p>${escapeHTML(service.description)}</p><div class="service-price">${money(service.price)}</div></article>`).join("");
}
function renderHistory() {
  const list = new LinkedList(); [...state.histories].sort((a, b) => b.id - a.id).forEach(visit => list.append(visit));
  $("#historyCount").textContent = `${list.length} visits`; const items = list.toArray();
  $("#historyTimeline").innerHTML = items.length ? items.map((visit, index) => `<div class="timeline-item"><div class="timeline-track"><span class="timeline-dot"></span>${index < items.length - 1 ? `<span class="timeline-line"></span>` : ""}</div><div class="timeline-content"><b>${escapeHTML(patientName(visit.patientId))} · ${escapeHTML(visit.service)}</b><p>${dateLabel(visit.date)} · ${escapeHTML(visit.dentist)}</p><p>${escapeHTML(visit.notes || "Visit completed.")}</p></div></div>`).join("") : `<div class="empty-state">No completed visits have been recorded yet.</div>`;
}
function renderSelectOptions() {
  $("#appointmentPatient").innerHTML = state.patients.map(patient => `<option value="${patient.id}">${escapeHTML(patient.name)}</option>`).join("");
  $("#appointmentService").innerHTML = state.services.map(service => `<option value="${service.id}">${escapeHTML(service.name)} — ${money(service.price)}</option>`).join("");
}
function renderAll() { rebuildStructures(); renderStats(); renderDashboard(); renderAppointments(); renderQueue(); renderPatients(); renderServices(); renderHistory(); renderSelectOptions(); }
function pushUndo(action) { undoStack.push(action); $("#undoButton").disabled = false; }
function approveAppointment(id) { const item = appointmentById(id); if (!item || item.status !== "Pending") return; pushUndo({ type: "status", id, previous: item.status }); item.status = "Approved"; saveState(); renderAll(); notify(`${item.queueId} approved and added to the queue.`); }
function cancelAppointment(id) { const item = appointmentById(id); if (!item || !["Pending", "Approved"].includes(item.status)) return; pushUndo({ type: "status", id, previous: item.status }); item.status = "Cancelled"; saveState(); renderAll(); notify(`${item.queueId} cancelled.`); }
function completeAppointment(id) { const item = appointmentById(id); if (!item || item.status !== "Serving") return; pushUndo({ type: "complete", id, historyLength: state.histories.length }); item.status = "Completed"; state.histories.push({ id: makeId(), patientId: item.patientId, service: serviceName(item.serviceId), dentist: item.dentist, date: todayISO(), notes: item.notes || "Appointment completed." }); saveState(); renderAll(); notify(`${item.queueId} marked as completed.`); }
function callNext() { if (state.appointments.some(item => item.status === "Serving")) { notify("Complete the current appointment before calling the next patient."); return; } rebuildStructures(); const next = waitingQueue.dequeue(); if (!next) { notify("There are no approved patients waiting."); return; } pushUndo({ type: "status", id: next.id, previous: "Approved" }); next.status = "Serving"; saveState(); renderAll(); notify(`${next.queueId} is now being served.`); }
function undoLastAction() { const action = undoStack.pop(); if (!action) { notify("There is no action to undo."); return; } const item = appointmentById(action.id); if (!item) return; if (action.type === "complete") { item.status = "Serving"; state.histories.length = action.historyLength; } else item.status = action.previous; saveState(); renderAll(); notify("Last action was undone."); }
function addAppointment(formData) { const queueNumber = state.nextQueue++; const appointment = { id: makeId(), queueId: `Q-${String(queueNumber).padStart(3, "0")}`, patientId: Number(formData.patientId), serviceId: Number(formData.serviceId), dentist: formData.dentist, date: formData.date, time: formData.time, status: "Pending", notes: formData.notes }; state.appointments.push(appointment); saveState(); renderAll(); notify(`${appointment.queueId} created with Pending status.`); }
function addPatient(formData) { const patient = { id: Math.max(1000, ...state.patients.map(item => Number(item.id))) + 1, ...formData }; state.patients.push(patient); saveState(); renderAll(); notify("Patient record added."); }
function addService(formData) { state.services.push({ id: makeId(), ...formData }); saveState(); renderAll(); notify("Dental service added."); }

// Interactive DSA laboratory configuration and isolated demonstration data.
const labInfo = {
  array: { title: "Array", description: "A collection of elements stored in indexed positions.", index: "STRUCTURE 01 / 07", complexity: "ACCESS O(1)", icon: "▤", concept: "Indexed storage", conceptText: "Each element occupies a numbered position called an index. This allows direct access without scanning every item.", application: "Appointment records", applicationText: "The application stores appointment records in an array so it can display, filter, and sort schedules.", tip: "Array indexes start at zero. The first element is at index 0.", rows: [["Access", "O(1)"], ["Search", "O(n)"], ["Insert at end", "O(1)*"], ["Sort", "O(n log n)" ]] },
  linked: { title: "Linked List", description: "A sequence of nodes where each node points to the next node.", index: "STRUCTURE 02 / 07", complexity: "TRAVERSE O(n)", icon: "⇢", concept: "Connected nodes", conceptText: "Each node stores data and a reference to the next node. Nodes do not need to sit next to each other in memory.", application: "Patient visit history", applicationText: "Completed visits can be represented as connected records and traversed in sequence to display a patient's timeline.", tip: "To reach a later node, start at the head and follow next references.", rows: [["Access by position", "O(n)"], ["Search", "O(n)"], ["Insert at head", "O(1)"], ["Traverse", "O(n)" ]] },
  hash: { title: "HashSet", description: "A collection that stores unique values and prevents duplicates.", index: "STRUCTURE 03 / 07", complexity: "LOOKUP O(1)*", icon: "#", concept: "Unique membership", conceptText: "A hash set uses hashing to manage values. Adding a value that already exists does not create another copy.", application: "Active queue IDs", applicationText: "The project uses a Set to track active queue identifiers and prevent the same queue ID from being added twice.", tip: "A Set stores values only once. Adding an existing value leaves its size unchanged.", rows: [["Add", "O(1)*"], ["Has / lookup", "O(1)*"], ["Delete", "O(1)*"], ["Uniqueness", "Built-in" ]] },
  stack: { title: "Stack", description: "A last-in, first-out collection: the newest item is removed first.", index: "STRUCTURE 04 / 07", complexity: "PUSH / POP O(1)", icon: "▥", concept: "Last in, first out", conceptText: "A stack adds and removes elements from one end called the top. The most recently added element is the first one removed.", application: "Undo actions", applicationText: "The admin undo feature stores reversible actions on a stack. Undo restores the most recent action first.", tip: "Think of a stack of trays: the top tray is the first one you can take.", rows: [["Push", "O(1)"], ["Pop", "O(1)"], ["Peek", "O(1)"], ["Search", "O(n)" ]] },
  queue: { title: "Queue", description: "A first-in, first-out collection processed in arrival order.", index: "STRUCTURE 05 / 07", complexity: "ENQUEUE O(1)", icon: "⇥", concept: "First in, first out", conceptText: "New elements join at the rear. Processing removes the element at the front, preserving arrival order.", application: "Patient waiting line", applicationText: "Approved appointments enter the waiting queue. The next patient called is the earliest approved patient in line.", tip: "The front leaves first; new entries join at the rear.", rows: [["Enqueue", "O(1)"], ["Dequeue", "O(1)*"], ["Peek", "O(1)"], ["Search", "O(n)" ]] },
  tree: { title: "Binary Search Tree", description: "A hierarchical structure ordered by key values for efficient lookup.", index: "STRUCTURE 06 / 07", complexity: "SEARCH O(log n)*", icon: "⌘", concept: "Ordered hierarchy", conceptText: "For each node, smaller keys go left and larger keys go right. Searching follows only one branch at each comparison.", application: "Patient ID lookup", applicationText: "Patient records are inserted by numeric patient ID. The search follows left or right branches to locate a matching ID.", tip: "A balanced BST can search in O(log n); a highly skewed tree can degrade to O(n).", rows: [["Search", "O(log n)*"], ["Insert", "O(log n)*"], ["Inorder", "O(n)"], ["Worst case", "O(n)" ]] },
  graph: { title: "Graph", description: "A set of vertices connected by edges to represent relationships.", index: "STRUCTURE 07 / 07", complexity: "BFS / DFS O(V + E)", icon: "◉", concept: "Connected relationships", conceptText: "Vertices represent entities and edges represent connections. Traversal algorithms explore the reachable vertices.", application: "Service categories", applicationText: "Dental service categories are modeled as connected vertices. BFS and DFS demonstrate how related categories can be explored.", tip: "BFS explores level by level; DFS follows one path as far as possible before backtracking.", rows: [["Add vertex", "O(1)*"], ["Add edge", "O(1)*"], ["BFS", "O(V + E)"], ["DFS", "O(V + E)" ]] }
};
let currentStructure = "array";
let demo = {};
function resetDemoData() {
  demo = {
    array: state.appointments.slice(0, 5).map(item => ({ label: item.queueId, name: patientName(item.patientId), date: item.date })),
    linked: ["Consultation", "Cleaning", "Dental X-ray", "Filling"],
    hash: new Set(["Q-001", "Q-002", "Q-003"]),
    stack: ["Approve Q-001", "Call Q-001", "Open patient record"],
    queue: ["Q-001", "Q-002", "Q-003", "Q-004"],
    tree: state.patients.map(patient => ({ id: Number(patient.id), name: patient.name })),
    graph: [...serviceGraph.adjacency.keys()]
  };
}
function addLog(message, step = null) { const log = $("#executionLog"); if (log.querySelector(".log-empty")) log.innerHTML = ""; const number = step ?? log.children.length + 1; log.insertAdjacentHTML("beforeend", `<p><b>STEP ${String(number).padStart(2, "0")}</b>${escapeHTML(message)}</p>`); log.scrollTop = log.scrollHeight; $("#stepCounter").textContent = `${log.children.length} STEP${log.children.length === 1 ? "" : "S"}`; }
function setLogReady() { $("#executionLog").innerHTML = `<p class="log-empty">Run an operation to see its execution steps here.</p>`; $("#stepCounter").textContent = "READY"; }
function visualWrap(content) { return `<div class="visual-inner">${content}</div>`; }
function renderArrayVisual(highlight = -1) { $("#visualStage").innerHTML = visualWrap(demo.array.length ? demo.array.map((item, index) => `<div class="array-cell ${index === highlight ? "highlight" : ""}"><div class="array-value">${escapeHTML(item.label)}</div><span class="array-index">index ${index}</span></div>`).join("") : `<span class="visual-node">Empty array</span>`); }
function renderLinkedVisual() { const items = demo.linked.map((item, index) => `<div class="linked-node"><div class="visual-node">${escapeHTML(item)}<small>node ${index + 1}</small></div>${index < demo.linked.length - 1 ? `<span class="visual-arrow">→</span>` : `<span class="visual-arrow">∅</span>`}</div>`).join(""); $("#visualStage").innerHTML = visualWrap(`<span class="queue-label">HEAD</span>${items || `<span class="visual-node">NULL</span>`}`); }
function renderHashVisual(last = "") { const values = [...demo.hash]; $("#visualStage").innerHTML = visualWrap(values.map(value => `<div class="hash-node"><div class="visual-node ${value === last ? "active-node" : ""}">${escapeHTML(value)}<small>unique key</small></div></div>`).join("") + `<div class="visual-node" style="border-style:dashed;opacity:.55">+ add</div>`); }
function renderStackVisual() { const items = demo.stack; $("#visualStage").innerHTML = visualWrap(`<div class="stack-visual">${items.length ? items.map((item, index) => `<div class="visual-node ${index === items.length - 1 ? "active-node" : ""}">${escapeHTML(item)}${index === items.length - 1 ? "<small>TOP</small>" : ""}</div>`).join("") : `<div class="visual-node">Empty</div>`}<div class="stack-base"></div><span class="queue-label">BOTTOM</span></div>`); }
function renderQueueVisual(highlight = "") { const items = demo.queue; $("#visualStage").innerHTML = visualWrap(`<span class="queue-label">FRONT →</span>${items.map((item, index) => `<div class="queue-node"><div class="visual-node ${item === highlight ? "active-node" : ""}">${escapeHTML(item)}<small>${index === 0 ? "FRONT" : index === items.length - 1 ? "REAR" : "WAITING"}</small></div></div>`).join("") || `<div class="visual-node">Queue empty</div>`}<span class="queue-label">← REAR</span>`); }
function renderTreeVisual(path = [], found = null) {
  const nodes = []; const edges = []; const place = (node, x, y, dx) => { if (!node) return; const key = String(node.value.id); nodes.push({ key, x, y, name: node.value.name.split(" ")[0] }); if (node.left) { edges.push([x, y, x - dx, y + 62]); place(node.left, x - dx, y + 62, dx / 1.7); } if (node.right) { edges.push([x, y, x + dx, y + 62]); place(node.right, x + dx, y + 62, dx / 1.7); } };
  place(patientTree.root, 250, 28, 105); const edgeMarkup = edges.map(([x1, y1, x2, y2]) => `<line class="tree-edge" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`).join(""); const nodeMarkup = nodes.map(node => `<g><circle class="tree-circle ${path.some(item => String(item.id) === node.key) ? "found" : ""}" cx="${node.x}" cy="${node.y}" r="19"/><text class="tree-text" x="${node.x}" y="${node.y}">${node.key.slice(-3)}</text></g>`).join("");
  $("#visualStage").innerHTML = `<svg class="tree-svg" viewBox="0 0 500 190" role="img" aria-label="Binary search tree visualization">${edgeMarkup}${nodeMarkup}</svg>`;
}
function renderGraphVisual(order = []) {
  const vertices = [...serviceGraph.adjacency.keys()]; const positions = vertices.map((name, index) => { const angle = -Math.PI / 2 + (Math.PI * 2 * index / Math.max(vertices.length, 1)); return { name, x: 250 + Math.cos(angle) * 155, y: 95 + Math.sin(angle) * 65 }; }); const lookup = new Map(positions.map(point => [point.name, point])); const edges = [];
  for (const [from, neighbors] of serviceGraph.adjacency) for (const to of neighbors) if (from < to) { const a = lookup.get(from), b = lookup.get(to); edges.push(`<line class="graph-edge" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`); }
  const nodes = positions.map(point => `<g><circle class="graph-circle ${order.includes(point.name) ? "visited" : ""}" cx="${point.x}" cy="${point.y}" r="27"/><text class="graph-text" x="${point.x}" y="${point.y}">${escapeHTML(point.name.length > 10 ? point.name.slice(0, 9) + "…" : point.name)}</text></g>`).join(""); $("#visualStage").innerHTML = `<svg class="graph-svg" viewBox="0 0 500 190" role="img" aria-label="Dental service category graph">${edges.join("")}${nodes}</svg>`;
}
function renderVisual() { if (currentStructure === "array") renderArrayVisual(); if (currentStructure === "linked") renderLinkedVisual(); if (currentStructure === "hash") renderHashVisual(); if (currentStructure === "stack") renderStackVisual(); if (currentStructure === "queue") renderQueueVisual(); if (currentStructure === "tree") renderTreeVisual(); if (currentStructure === "graph") renderGraphVisual(); }
function field(label, id, placeholder = "", type = "text") { return `<div class="control-field"><label for="${id}">${label}</label><input id="${id}" type="${type}" placeholder="${placeholder}"></div>`; }
function opButton(label, action, secondary = false) { return `<button class="op-btn ${secondary ? "secondary" : ""}" data-demo-action="${action}">${label}</button>`; }
function selectField(label, id, options) { return `<div class="control-field"><label for="${id}">${label}</label><select id="${id}">${options.map(option => `<option value="${escapeHTML(option)}">${escapeHTML(option)}</option>`).join("")}</select></div>`; }
function renderControls() {
  const controls = {
    array: `${field("QUEUE ID", "arrayValue", "e.g. Q-009")}${opButton("＋ Add item", "array-add")}${opButton("Sort by queue ID", "array-sort", true)}${field("INDEX", "arrayIndex", "e.g. 0", "number")}${opButton("Access index", "array-access", true)}`,
    linked: `${field("VISIT / SERVICE", "linkedValue", "e.g. Whitening")}${opButton("＋ Append node", "linked-add")}${opButton("Traverse list", "linked-traverse", true)}${opButton("Remove last", "linked-remove", true)}`,
    hash: `${field("QUEUE ID", "hashValue", "e.g. Q-005")}${opButton("＋ Add unique ID", "hash-add")}${opButton("Check duplicate", "hash-check", true)}${opButton("Clear set", "hash-clear", true)}`,
    stack: `${field("ACTION", "stackValue", "e.g. Approve Q-005")}${opButton("Push action", "stack-push")}${opButton("Pop / Undo", "stack-pop", true)}${opButton("Peek top", "stack-peek", true)}`,
    queue: `${field("QUEUE ID", "queueValue", "e.g. Q-005")}${opButton("＋ Enqueue", "queue-add")}${opButton("Dequeue next", "queue-remove", true)}${opButton("Peek front", "queue-peek", true)}`,
    tree: `${field("PATIENT ID", "treeValue", "e.g. 1002", "number")}${opButton("Search patient", "tree-search")}${opButton("Inorder traversal", "tree-inorder", true)}`,
    graph: `${selectField("START CATEGORY", "graphStart", [...serviceGraph.adjacency.keys()])}${opButton("Run BFS", "graph-bfs")}${opButton("Run DFS", "graph-dfs", true)}`
  };
  $("#operationControls").innerHTML = controls[currentStructure] || "";
}
function selectStructure(key) { currentStructure = key; const info = labInfo[key]; $$(".structure-tab").forEach(tab => tab.classList.toggle("active", tab.dataset.structure === key)); $("#structureIndex").textContent = info.index; $("#structureTitle").textContent = info.title; $("#structureDescription").textContent = info.description; $("#structureComplexity").textContent = info.complexity; $("#conceptIcon").textContent = info.icon; $("#conceptHeading").textContent = info.concept; $("#conceptText").textContent = info.conceptText; $("#applicationHeading").textContent = info.application; $("#applicationText").textContent = info.applicationText; $("#quickTip").textContent = info.tip; $("#complexityRows").innerHTML = info.rows.map(([label, value]) => `<div class="complexity-row"><span>${label}</span><b>${value}</b></div>`).join(""); setLogReady(); renderControls(); renderVisual(); }
function renderDSA() { rebuildStructures(); resetDemoData(); selectStructure(currentStructure); }
function runDemoAction(action) {
  const value = id => $(`#${id}`)?.value.trim() || "";
  switch (action) {
    case "array-add": { const item = value("arrayValue"); if (!item) return notify("Enter a queue ID first."); demo.array.push({ label: item, name: "Demo record", date: todayISO() }); renderArrayVisual(demo.array.length - 1); addLog(`Inserted ${item} at index ${demo.array.length - 1}.`); addLog(`Array length is now ${demo.array.length}.`); break; }
    case "array-sort": { demo.array.sort((a, b) => a.label.localeCompare(b.label)); renderArrayVisual(); addLog("Compared queue ID values and sorted the array in ascending order."); addLog("The updated array is displayed in sorted order."); break; }
    case "array-access": { const index = Number(value("arrayIndex")); if (!Number.isInteger(index) || index < 0 || index >= demo.array.length) return notify("Enter a valid array index."); renderArrayVisual(index); addLog(`Accessed index ${index} directly.`); addLog(`Value at index ${index} is ${demo.array[index].label}.`); break; }
    case "linked-add": { const item = value("linkedValue"); if (!item) return notify("Enter a visit or service name."); demo.linked.push(item); renderLinkedVisual(); addLog(`Created a new node containing ${item}.`); addLog("Linked the previous tail node to the new node."); break; }
    case "linked-traverse": { renderLinkedVisual(); addLog("Start at the head node."); demo.linked.forEach((item, index) => addLog(`Visit node ${index + 1}: ${item}.`)); addLog("Reached the end reference (NULL). Traversal complete."); break; }
    case "linked-remove": { if (!demo.linked.length) return notify("The linked list is already empty."); const removed = demo.linked.pop(); renderLinkedVisual(); addLog(`Removed the tail value ${removed} in this demo.`); addLog("The new final node now points to NULL."); break; }
    case "hash-add": { const item = value("hashValue"); if (!item) return notify("Enter a queue ID first."); if (demo.hash.has(item)) { renderHashVisual(item); addLog(`HashSet already contains ${item}. Duplicate insertion was rejected.`); notify("Duplicate blocked — this ID already exists."); } else { demo.hash.add(item); renderHashVisual(item); addLog(`Checked membership: ${item} was not present.`); addLog(`Inserted ${item}. Set size is now ${demo.hash.size}.`); } break; }
    case "hash-check": { const item = value("hashValue"); if (!item) return notify("Enter a queue ID to check."); const exists = demo.hash.has(item); renderHashVisual(exists ? item : ""); addLog(`${item} ${exists ? "exists" : "does not exist"} in the HashSet.`); break; }
    case "hash-clear": { demo.hash.clear(); renderHashVisual(); addLog("Cleared all values from the demonstration HashSet."); break; }
    case "stack-push": { const item = value("stackValue"); if (!item) return notify("Enter an action to push."); demo.stack.push(item); renderStackVisual(); addLog(`Pushed '${item}' onto the top of the stack.`); addLog(`Stack size is now ${demo.stack.length}.`); break; }
    case "stack-pop": { if (!demo.stack.length) { addLog("Pop failed: the stack is empty (underflow)."); return notify("The stack is empty."); } const item = demo.stack.pop(); renderStackVisual(); addLog(`Popped '${item}' from the top of the stack.`); addLog("This follows Last-In, First-Out order."); break; }
    case "stack-peek": { const item = demo.stack.at(-1); addLog(item ? `Peek returns '${item}' without removing it.` : "The stack is empty; there is no top item."); break; }
    case "queue-add": { const item = value("queueValue"); if (!item) return notify("Enter a queue ID first."); demo.queue.push(item); renderQueueVisual(); addLog(`Enqueued ${item} at the rear of the queue.`); addLog(`Queue size is now ${demo.queue.length}.`); break; }
    case "queue-remove": { if (!demo.queue.length) { addLog("Dequeue failed: the queue is empty."); return notify("The queue is empty."); } const item = demo.queue.shift(); renderQueueVisual(); addLog(`Dequeued ${item} from the front of the queue.`); addLog("The next waiting patient moves to the front."); break; }
    case "queue-peek": { addLog(demo.queue.length ? `Front item is ${demo.queue[0]}. It remains in the queue.` : "The queue is empty."); break; }
    case "tree-search": { const id = value("treeValue"); if (!id) return notify("Enter a patient ID."); const result = patientTree.search(Number(id)); renderTreeVisual(result.path, result.found); addLog(`Start at root patient ID ${patientTree.root?.value.id ?? "—"}.`); result.path.forEach(node => addLog(`Compare ${id} with ${node.id}: ${Number(id) === node.id ? "match found" : Number(id) < node.id ? "search left" : "search right"}.`)); addLog(result.found ? `Found patient: ${result.found.name} (ID ${result.found.id}).` : `Patient ID ${id} was not found.`); break; }
    case "tree-inorder": { const ordered = patientTree.inorder(); renderTreeVisual(); addLog("Traverse left subtree, visit node, then traverse right subtree."); addLog(`Patient IDs in ascending order: ${ordered.map(patient => patient.id).join(" → ") || "(empty)"}.`); break; }
    case "graph-bfs": case "graph-dfs": { const start = value("graphStart"); const order = action === "graph-bfs" ? serviceGraph.bfs(start) : serviceGraph.dfs(start); renderGraphVisual(order); addLog(`${action === "graph-bfs" ? "Breadth-first" : "Depth-first"} traversal starts at ${start}.`); order.forEach((vertex, index) => addLog(`Visit ${vertex} (${index + 1} of ${order.length}).`)); addLog(`Traversal order: ${order.join(" → ") || "none"}.`); break; }
  }
}

function openModal(id) { $("#" + id).classList.add("open"); }
function closeModal(backdrop) { backdrop.classList.remove("open"); }
function initEvents() {
  $$(".nav-link[data-page]").forEach(button => button.addEventListener("click", () => setPage(button.dataset.page)));
  $$('[data-go]').forEach(button => button.addEventListener("click", () => setPage(button.dataset.go)));
  $$('[data-open-modal]').forEach(button => button.addEventListener("click", () => openModal(button.dataset.openModal)));
  $$('[data-close-modal]').forEach(button => button.addEventListener("click", () => closeModal(button.closest(".modal-backdrop"))));
  $$(".modal-backdrop").forEach(backdrop => backdrop.addEventListener("click", event => { if (event.target === backdrop) closeModal(backdrop); }));
  $("#menuToggle").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
  $("#appointmentSearch").addEventListener("input", renderAppointments); $("#appointmentFilter").addEventListener("change", renderAppointments); $("#patientSearch").addEventListener("input", renderPatients);
  $("#appointmentForm").addEventListener("submit", event => { event.preventDefault(); const data = { patientId: $("#appointmentPatient").value, serviceId: $("#appointmentService").value, dentist: $("#appointmentDentist").value.trim(), date: $("#appointmentDate").value, time: $("#appointmentTime").value, notes: $("#appointmentNotes").value.trim() }; if (data.date < todayISO()) return notify("Appointment date cannot be in the past."); addAppointment(data); event.target.reset(); closeModal($("#appointmentModal")); });
  $("#patientForm").addEventListener("submit", event => { event.preventDefault(); addPatient({ name: $("#patientName").value.trim(), age: Number($("#patientAge").value), contact: $("#patientContact").value.trim(), email: $("#patientEmail").value.trim() }); event.target.reset(); closeModal($("#patientModal")); });
  $("#serviceForm").addEventListener("submit", event => { event.preventDefault(); addService({ name: $("#serviceName").value.trim(), category: $("#serviceCategory").value.trim(), price: Number($("#servicePrice").value), description: $("#serviceDescription").value.trim() }); event.target.reset(); closeModal($("#serviceModal")); });
  document.addEventListener("click", event => { const actionButton = event.target.closest("[data-action]"); if (!actionButton) return; const { action, id } = actionButton.dataset; if (action === "approve") approveAppointment(id); if (action === "cancel") cancelAppointment(id); if (action === "complete") completeAppointment(id); });
  $("#callNextButton").addEventListener("click", callNext); $("#queueList").addEventListener("click", () => {}); $("#servingPanel").addEventListener("click", event => { if (event.target.id === "callNextInline") callNext(); }); $("#undoButton").addEventListener("click", undoLastAction);
  $$(".structure-tab").forEach(tab => tab.addEventListener("click", () => selectStructure(tab.dataset.structure)));
  $("#operationControls").addEventListener("click", event => { const button = event.target.closest("[data-demo-action]"); if (button) runDemoAction(button.dataset.demoAction); });
  $("#resetDemo").addEventListener("click", () => { resetDemoData(); selectStructure(currentStructure); notify("Demonstration reset."); });
}
function init() { $("#todayLabel").textContent = new Date().toLocaleDateString("en-PH", { weekday: "short", month: "short", day: "numeric", year: "numeric" }); $("#appointmentDate").min = todayISO(); initEvents(); renderAll(); renderDSA(); }
document.addEventListener("DOMContentLoaded", init);


/* ===== DSA Lab extensions (array search, animated traversal/BFS/DFS, BST insert, shortcuts) ===== */
(() => {
  const STEP = 650;
  let timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  const cancel = () => { timers.forEach(clearTimeout); timers = []; };

  // Stop running animations whenever the user switches structure or resets the demo.
  const baseSelect = selectStructure;
  selectStructure = key => { cancel(); baseSelect(key); };

  // Extra controls.
  const baseControls = renderControls;
  renderControls = () => {
    baseControls();
    const extra = {
      array: `${field("SEARCH VALUE", "arraySearchValue", "e.g. Q-002")}${opButton("Search value", "array-search", true)}`,
      tree: `${field("NEW PATIENT ID", "treeInsertValue", "e.g. 1004", "number")}${opButton("＋ Insert patient", "tree-insert")}`
    }[currentStructure];
    if (extra) $("#operationControls").insertAdjacentHTML("beforeend", extra);
  };

  // Linked list: HEAD / TAIL tags and a highlighted current node.
  renderLinkedVisual = (active = -1) => {
    const list = demo.linked, last = list.length - 1;
    const nodes = list.map((item, i) => {
      const tag = list.length === 1 ? "HEAD · TAIL" : i === 0 ? "HEAD" : i === last ? "TAIL" : `node ${i + 1}`;
      return `<div class="linked-node"><div class="visual-node ${i === active ? "active-node" : ""}">${escapeHTML(item)}<small>${tag}</small></div><span class="visual-arrow">${i < last ? "→" : "∅"}</span></div>`;
    }).join("");
    $("#visualStage").innerHTML = visualWrap(nodes || `<span class="visual-node">NULL<small>empty list</small></span>`);
  };

  // Tree: grow the canvas so deeper levels are not clipped.
  const baseTree = renderTreeVisual;
  renderTreeVisual = (path, found) => {
    baseTree(path, found);
    const svg = $(".tree-svg");
    const ys = svg ? [...svg.querySelectorAll("circle")].map(c => Number(c.getAttribute("cy"))) : [];
    if (!ys.length) return;
    const height = Math.max(190, Math.max(...ys) + 34);
    svg.setAttribute("viewBox", `0 0 500 ${height}`); svg.style.height = `${height}px`;
  };

  const baseRun = runDemoAction;
  runDemoAction = action => {
    const val = id => $(`#${id}`)?.value.trim() || "";
    switch (action) {
      case "array-search": {
        const target = val("arraySearchValue"); if (!target) return notify("Enter a value to search for.");
        cancel(); setLogReady();
        const list = demo.array; if (!list.length) { renderArrayVisual(); return addLog("The array is empty, so there is nothing to search."); }
        const hit = list.findIndex(item => item.label.toLowerCase() === target.toLowerCase());
        const end = hit >= 0 ? hit : list.length - 1;
        addLog(`Linear search for ${target}, starting at index 0.`);
        for (let i = 0; i <= end; i++) later(() => { renderArrayVisual(i); addLog(`Compare index ${i} (${list[i].label}) with ${target}: ${i === hit ? "match" : "no match"}.`); }, STEP * (i + 1));
        later(() => {
          if (hit < 0) renderArrayVisual();
          addLog(hit >= 0 ? `Found ${target} at index ${hit} after ${hit + 1} comparison(s).` : `${target} not found after ${list.length} comparisons. Worst case is O(n).`);
        }, STEP * (end + 2));
        return;
      }
      case "linked-traverse": {
        cancel(); setLogReady();
        const list = demo.linked; if (!list.length) { renderLinkedVisual(); return addLog("The list is empty: head is NULL."); }
        addLog("Start at the head node.");
        list.forEach((item, i) => later(() => { renderLinkedVisual(i); addLog(`Visit node ${i + 1}: ${item}.`); }, STEP * (i + 1)));
        later(() => { renderLinkedVisual(); addLog("Reached the end reference (NULL). Traversal complete."); }, STEP * (list.length + 1));
        return;
      }
      case "tree-insert": {
        const id = Number(val("treeInsertValue"));
        if (!Number.isInteger(id) || id <= 0) return notify("Enter a positive whole number for the patient ID.");
        cancel(); setLogReady();
        const { found, path } = patientTree.search(id);
        if (found) { renderTreeVisual(path, found); addLog(`Patient ID ${id} already exists (${found.name}). Duplicate keys are rejected.`); return notify("That patient ID already exists."); }
        path.forEach(node => addLog(`Compare ${id} with ${node.id}: go ${id < node.id ? "left" : "right"}.`));
        patientTree.insert({ id, name: "New patient" });
        renderTreeVisual([...path, { id }]);
        const parent = path[path.length - 1];
        addLog(parent ? `Found an empty ${id < parent.id ? "left" : "right"} slot under ${parent.id}. Inserted ${id}.` : `The tree was empty, so ${id} becomes the root.`);
        addLog("Demo only: this insert is not saved to patient records. Reset restores the real tree.");
        return;
      }
      case "graph-bfs": case "graph-dfs": {
        const bfs = action === "graph-bfs", start = val("graphStart");
        const order = bfs ? serviceGraph.bfs(start) : serviceGraph.dfs(start);
        cancel(); setLogReady(); renderGraphVisual([]);
        addLog(bfs ? `Breadth-first search from ${start}: visit neighbors level by level (uses a queue).` : `Depth-first search from ${start}: follow one path as deep as possible, then backtrack.`);
        order.forEach((vertex, i) => later(() => { renderGraphVisual(order.slice(0, i + 1)); addLog(`Visit ${vertex} (${i + 1} of ${order.length}).`); }, STEP * (i + 1)));
        later(() => addLog(`Traversal order: ${order.join(" → ") || "none"}.`), STEP * (order.length + 1));
        return;
      }
      default: cancel(); baseRun(action);
    }
  };

  // Keyboard and mobile conveniences.
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") { $$(".modal-backdrop.open").forEach(closeModal); $("#sidebar").classList.remove("open"); }
    if (event.key === "Enter" && event.target.tagName === "INPUT" && event.target.closest("#operationControls")) {
      const next = event.target.closest(".control-field")?.nextElementSibling;
      if (next?.classList.contains("op-btn")) { event.preventDefault(); next.click(); }
    }
  });
  document.addEventListener("click", event => {
    const sidebar = $("#sidebar");
    if (sidebar.classList.contains("open") && !event.target.closest("#sidebar, #menuToggle")) sidebar.classList.remove("open");
  });
})();
