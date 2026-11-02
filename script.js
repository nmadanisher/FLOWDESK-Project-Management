/* ============================================================
   FlowDesk – script.js
   All app logic: routing, CRUD, local storage, UI helpers
   Humanized + bug-fixed version
============================================================ */

// ─────────────────────────────────────────────────────────────
// 1. STATE
// ─────────────────────────────────────────────────────────────
let state = {
  projects: [],
  tasks:    [],
  members:  [],
  theme:    'dark',
  currentPage: 'dashboard',
  dragTaskId: null,
  // Fixed: store stable member task/project counts so they don't change on every render
  memberStats: {},
};

// ─────────────────────────────────────────────────────────────
// 2. LOCAL STORAGE
// ─────────────────────────────────────────────────────────────
function saveState() {
  localStorage.setItem('flowdesk_state', JSON.stringify(state));
}

function loadState() {
  const saved = localStorage.getItem('flowdesk_state');
  if (saved) {
    try {
      state = { ...state, ...JSON.parse(saved) };
    } catch (e) {
      console.warn('Failed to parse saved state, seeding fresh data.');
      seedDemoData();
    }
  } else {
    seedDemoData();
  }
}

// ─────────────────────────────────────────────────────────────
// 3. DEMO DATA
// ─────────────────────────────────────────────────────────────
function seedDemoData() {
  state.projects = [
    { id: uid(), name: 'Website Redesign',    desc: 'Complete overhaul of the marketing site with new brand.',          status: 'active',    deadline: '2025-08-30', color: '#3b82f6', createdAt: Date.now() },
    { id: uid(), name: 'Mobile App v2',       desc: 'Native iOS & Android app for our main product suite.',             status: 'active',    deadline: '2025-09-15', color: '#8b5cf6', createdAt: Date.now() },
    { id: uid(), name: 'API Refactor',        desc: 'Migrate REST endpoints to GraphQL and improve performance.',       status: 'on-hold',   deadline: '2025-10-01', color: '#f59e0b', createdAt: Date.now() },
    { id: uid(), name: 'Design System',       desc: 'Atomic component library for cross-team consistency.',             status: 'completed', deadline: '2025-07-01', color: '#10b981', createdAt: Date.now() },
    { id: uid(), name: 'Analytics Dashboard', desc: 'Real-time data visualization for the business intelligence team.', status: 'active',    deadline: '2025-09-20', color: '#ef4444', createdAt: Date.now() },
    { id: uid(), name: 'SEO Overhaul',        desc: 'Technical SEO improvements and content strategy rollout.',         status: 'active',    deadline: '2025-08-10', color: '#ec4899', createdAt: Date.now() },
  ];

  const p = state.projects;
  state.tasks = [
    { id: uid(), title: 'Wireframe homepage',      desc: 'Create low-fi wireframes for all breakpoints.',       status: 'done',       priority: 'high',   projectId: p[0].id, due: '2025-07-20', createdAt: Date.now() },
    { id: uid(), title: 'Design hero section',     desc: 'Craft an eye-catching hero with animation.',          status: 'done',       priority: 'high',   projectId: p[0].id, due: '2025-07-22', createdAt: Date.now() },
    { id: uid(), title: 'Build nav component',     desc: 'Sticky responsive navbar with dropdowns.',            status: 'inprogress', priority: 'medium', projectId: p[0].id, due: '2025-08-01', createdAt: Date.now() },
    { id: uid(), title: 'Set up CI/CD pipeline',   desc: 'GitHub Actions for automated testing and deployment.',status: 'inprogress', priority: 'high',   projectId: p[1].id, due: '2025-08-05', createdAt: Date.now() },
    { id: uid(), title: 'Write API documentation', desc: 'Swagger docs for all new endpoints.',                 status: 'todo',       priority: 'medium', projectId: p[2].id, due: '2025-09-01', createdAt: Date.now() },
    { id: uid(), title: 'User testing sessions',   desc: 'Schedule 10 usability tests with real users.',        status: 'todo',       priority: 'high',   projectId: p[1].id, due: '2025-08-20', createdAt: Date.now() },
    { id: uid(), title: 'Fix auth token refresh',  desc: 'Token expiry bug causing random logouts.',            status: 'todo',       priority: 'high',   projectId: p[2].id, due: '2025-07-30', createdAt: Date.now() },
    { id: uid(), title: 'Color token audit',       desc: 'Ensure all design tokens match brand guidelines.',    status: 'done',       priority: 'low',    projectId: p[3].id, due: '2025-06-30', createdAt: Date.now() },
    { id: uid(), title: 'Add dark mode support',   desc: 'Implement CSS variables for themeable components.',   status: 'done',       priority: 'medium', projectId: p[3].id, due: '2025-07-01', createdAt: Date.now() },
    { id: uid(), title: 'Integrate chart library', desc: 'Add Recharts or D3 for data visualizations.',         status: 'inprogress', priority: 'medium', projectId: p[4].id, due: '2025-08-15', createdAt: Date.now() },
    { id: uid(), title: 'Keyword research',        desc: 'Identify 200+ target keywords by volume.',            status: 'todo',       priority: 'low',    projectId: p[5].id, due: '2025-08-05', createdAt: Date.now() },
  ];

  state.members = [
    { id: uid(), name: 'Alex Johnson',  email: 'alex@flowdesk.io',   role: 'Project Manager',  seed: 'FlowDesk' },
    { id: uid(), name: 'Sarah Chen',    email: 'sarah@flowdesk.io',  role: 'UI/UX Designer',   seed: 'Sarah'    },
    { id: uid(), name: 'Marcus Wright', email: 'marcus@flowdesk.io', role: 'Full-Stack Dev',   seed: 'Marcus'   },
    { id: uid(), name: 'Priya Nair',    email: 'priya@flowdesk.io',  role: 'Backend Engineer', seed: 'Priya'    },
    { id: uid(), name: 'Tom Reeves',    email: 'tom@flowdesk.io',    role: 'QA Engineer',      seed: 'Tom'      },
    { id: uid(), name: 'Leila Hassan',  email: 'leila@flowdesk.io',  role: 'Data Scientist',   seed: 'Leila'    },
  ];

  // Bug fix: generate stable member stats once, not randomly each render
  state.memberStats = {};
  state.members.forEach(m => {
    state.memberStats[m.id] = {
      projects: Math.floor(Math.random() * 5) + 2,
      tasks:    Math.floor(Math.random() * 20) + 5,
    };
  });

  saveState();
}

function uid() {
  return Math.random().toString(36).slice(2, 11);
}

// ─────────────────────────────────────────────────────────────
// 4. ROUTING
// ─────────────────────────────────────────────────────────────
const PAGE_TITLES = {
  dashboard: 'Dashboard',
  projects:  'Projects',
  tasks:     'Tasks',
  team:      'Team',
  profile:   'Profile',
  settings:  'Settings',
};

function navigate(page) {
  document.querySelectorAll('.inner-page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + page);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });

  document.getElementById('page-title').textContent = PAGE_TITLES[page] || page;
  state.currentPage = page;

  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('open');

  renderPage(page);
}

function renderPage(page) {
  switch (page) {
    case 'dashboard': renderDashboard(); break;
    case 'projects':  renderProjects();  break;
    case 'tasks':     renderKanban();    break;
    case 'team':      renderTeam();      break;
    case 'profile':   renderProfile();   break;
  }
}

// ─────────────────────────────────────────────────────────────
// 5. AUTH (demo)
// ─────────────────────────────────────────────────────────────
function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value.trim();

  if (!email || !pass) {
    showToast('Please fill in all fields', 'error');
    return;
  }

  const loginPage = document.getElementById('page-login');
  loginPage.style.transition = 'opacity 0.4s ease';
  loginPage.style.opacity = '0';

  setTimeout(() => {
    loginPage.classList.remove('active');
    document.getElementById('app').classList.remove('hidden');
    lucide.createIcons();
    navigate('dashboard');
    showToast('Welcome back! 👋', 'success');
  }, 400);
}

function doLogout() {
  document.getElementById('app').classList.add('hidden');
  const loginPage = document.getElementById('page-login');
  loginPage.classList.add('active');
  loginPage.style.opacity = '1';
  showToast('Logged out successfully', 'info');
}

// ─────────────────────────────────────────────────────────────
// 6. DASHBOARD
// ─────────────────────────────────────────────────────────────
function renderDashboard() {
  // Date
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  // Update greeting dynamically
  const headline = document.querySelector('#page-dashboard .page-headline');
  if (headline) {
    const nameSpan = document.getElementById('dash-name');
    const nameText = nameSpan ? nameSpan.textContent : 'Alex';
    headline.innerHTML = `${greeting}, <span id="dash-name">${nameText}</span> ${hour < 12 ? '👋' : hour < 18 ? '☀️' : '🌙'}`;
  }

  const dateEl = document.getElementById('dash-date');
  if (dateEl) {
    dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  // Stats
  const done    = state.tasks.filter(t => t.status === 'done').length;
  const pending = state.tasks.filter(t => t.status !== 'done').length;
  animateCount('stat-projects', state.projects.length);
  animateCount('stat-done',     done);
  animateCount('stat-pending',  pending);
  animateCount('stat-members',  state.members.length);

  // Recent projects (last 4)
  const recent = [...state.projects].sort((a, b) => b.createdAt - a.createdAt).slice(0, 4);
  const dashProj = document.getElementById('dash-projects');
  if (!dashProj) return;

  if (recent.length === 0) {
    dashProj.innerHTML = '<p style="color:var(--text-muted);font-size:13px;text-align:center;padding:20px">No projects yet. Create your first one!</p>';
  } else {
    dashProj.innerHTML = recent.map(p => {
      const tasks = state.tasks.filter(t => t.projectId === p.id);
      const doneT = tasks.filter(t => t.status === 'done').length;
      const pct   = tasks.length ? Math.round(doneT / tasks.length * 100) : 0;
      return `
        <div class="project-mini-card" onclick="navigate('projects')">
          <div class="proj-color-dot" style="background:${p.color}"></div>
          <div class="proj-mini-info">
            <div class="proj-mini-name">${esc(p.name)}</div>
            <div class="proj-mini-meta">${tasks.length} task${tasks.length !== 1 ? 's' : ''} · ${statusLabel(p.status)}</div>
          </div>
          <div class="proj-mini-progress">
            <span class="prog-pct">${pct}%</span>
            <div class="progress-bar-wrap" style="width:70px">
              <div class="progress-bar-fill" style="width:${pct}%;background:${p.color}"></div>
            </div>
          </div>
        </div>`;
    }).join('');
  }

  // Task overview
  const todo       = state.tasks.filter(t => t.status === 'todo').length;
  const inprogress = state.tasks.filter(t => t.status === 'inprogress').length;
  const total      = state.tasks.length || 1;

  const taskOv = document.getElementById('dash-task-overview');
  if (taskOv) {
    taskOv.innerHTML = `
      <div class="task-ov-row">
        <div class="task-ov-dot" style="background:var(--text-muted)"></div>
        <span class="task-ov-label">To Do</span>
        <span class="task-ov-count">${todo}</span>
        <div class="task-ov-bar">
          <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${todo / total * 100}%;background:var(--text-muted)"></div></div>
        </div>
      </div>
      <div class="task-ov-row">
        <div class="task-ov-dot" style="background:var(--amber)"></div>
        <span class="task-ov-label">In Progress</span>
        <span class="task-ov-count">${inprogress}</span>
        <div class="task-ov-bar">
          <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${inprogress / total * 100}%;background:var(--amber)"></div></div>
        </div>
      </div>
      <div class="task-ov-row">
        <div class="task-ov-dot" style="background:var(--green)"></div>
        <span class="task-ov-label">Done</span>
        <span class="task-ov-count">${done}</span>
        <div class="task-ov-bar">
          <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${done / total * 100}%;background:var(--green)"></div></div>
        </div>
      </div>`;
  }

  // Team progress — use stable percentages, not random each render
  const stableProgress = [88, 74, 92, 61, 83];
  const tp = document.getElementById('dash-team-progress');
  if (!tp) return;

  if (state.members.length === 0) {
    tp.innerHTML = '<p style="color:var(--text-muted);font-size:13px;text-align:center;padding:20px">No team members yet.</p>';
    return;
  }

  tp.innerHTML = state.members.slice(0, 5).map((m, i) => {
    const pct = stableProgress[i] !== undefined ? stableProgress[i] : 70;
    return `
      <div class="team-prog-row">
        <div class="team-prog-avatar"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${m.seed}" alt="${esc(m.name)}" /></div>
        <div class="team-prog-info">
          <div class="team-prog-name">${esc(m.name)}</div>
          <div class="team-prog-role">${esc(m.role)}</div>
        </div>
        <div class="team-prog-right">
          <div class="team-prog-pct">${pct}%</div>
          <div class="progress-bar-wrap" style="width:90px"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
        </div>
      </div>`;
  }).join('');
}

// Smooth number counter
function animateCount(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  const current = parseInt(el.textContent) || 0;
  if (current === target) return;
  let start = 0;
  const duration = 600;
  const startTime = performance.now();
  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// ─────────────────────────────────────────────────────────────
// 7. PROJECTS
// ─────────────────────────────────────────────────────────────
let projectFilter = 'all';
let projectSearch = '';

function renderProjects(filter, search) {
  if (filter !== undefined) projectFilter = filter;
  if (search  !== undefined) projectSearch = search;

  let list = [...state.projects];
  if (projectFilter !== 'all') list = list.filter(p => p.status === projectFilter);
  if (projectSearch) {
    const q = projectSearch.toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(q) || (p.desc || '').toLowerCase().includes(q));
  }

  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  if (list.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <i data-lucide="briefcase"></i>
        <h3>No projects found</h3>
        <p>Try changing the filter, or create a new project.</p>
      </div>`;
    lucide.createIcons();
    return;
  }

  grid.innerHTML = list.map((p, idx) => {
    const tasks = state.tasks.filter(t => t.projectId === p.id);
    const doneT = tasks.filter(t => t.status === 'done').length;
    const pct   = tasks.length ? Math.round(doneT / tasks.length * 100) : 0;
    const dl    = p.deadline
      ? new Date(p.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'No deadline';

    return `
      <div class="project-card" style="--proj-color:${p.color}; animation-delay:${idx * 0.05}s">
        <div class="proj-card-top">
          <div>
            <div class="proj-card-name">${esc(p.name)}</div>
            <div class="proj-card-desc">${esc(p.desc || '')}</div>
          </div>
          <div class="proj-card-actions">
            <button class="proj-action-btn" onclick="event.stopPropagation(); editProject('${p.id}')"><i data-lucide="pencil"></i></button>
            <button class="proj-action-btn del" onclick="event.stopPropagation(); confirmDelete('project','${p.id}')"><i data-lucide="trash-2"></i></button>
          </div>
        </div>
        <span class="proj-card-status status-${p.status}">${statusLabel(p.status)}</span>
        <div class="proj-card-progress">
          <div class="proj-prog-header">
            <span>Progress</span>
            <span class="proj-prog-pct">${pct}%</span>
          </div>
          <div class="progress-bar-wrap">
            <div class="progress-bar-fill" style="width:${pct}%;background:${p.color}"></div>
          </div>
        </div>
        <div class="proj-card-footer">
          <span class="proj-deadline"><i data-lucide="calendar"></i>${dl}</span>
          <span class="proj-task-count">${tasks.length} task${tasks.length !== 1 ? 's' : ''}</span>
        </div>
      </div>`;
  }).join('');

  lucide.createIcons();
}

function filterProjects(val, btn) {
  document.querySelectorAll('#project-filter-tabs .filter-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderProjects(val);
}

function searchProjects(val) { renderProjects(undefined, val); }

function statusLabel(s) {
  return { active: 'Active', completed: 'Completed', 'on-hold': 'On Hold' }[s] || s;
}

// ── Modals ──
function openModal(id) {
  document.getElementById('modal-overlay').classList.add('open');
  const modal = document.getElementById(id);
  if (!modal) return;

  // Reset display before animating
  modal.style.display = 'flex';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => modal.classList.add('open'));
  });
  lucide.createIcons();

  if (id === 'modal-add-task') populateProjectSelect();
}

function closeAllModals() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.querySelectorAll('.modal').forEach(m => {
    m.classList.remove('open');
    setTimeout(() => {
      if (!m.classList.contains('open')) m.style.display = 'none';
    }, 280);
  });
}

// Color picker
document.addEventListener('click', e => {
  if (e.target.classList.contains('cpick')) {
    document.querySelectorAll('.cpick').forEach(c => c.classList.remove('active'));
    e.target.classList.add('active');
  }
});

function getSelectedColor() {
  const active = document.querySelector('.cpick.active');
  return active ? active.dataset.color : '#3b82f6';
}

function saveProject() {
  const name     = document.getElementById('proj-name').value.trim();
  const desc     = document.getElementById('proj-desc').value.trim();
  const status   = document.getElementById('proj-status').value;
  const deadline = document.getElementById('proj-deadline').value;
  const color    = getSelectedColor();
  const editId   = document.getElementById('edit-project-id').value;

  if (!name) { showToast('Project name is required', 'error'); return; }

  if (editId) {
    const proj = state.projects.find(p => p.id === editId);
    if (proj) Object.assign(proj, { name, desc, status, deadline, color });
    showToast('Project updated!', 'success');
  } else {
    state.projects.push({ id: uid(), name, desc, status, deadline, color, createdAt: Date.now() });
    showToast('Project created! 🎉', 'success');
  }

  saveState();
  closeAllModals();
  resetProjectForm();
  renderProjects();
  if (state.currentPage === 'dashboard') renderDashboard();
}

function editProject(id) {
  const p = state.projects.find(proj => proj.id === id);
  if (!p) return;

  document.getElementById('modal-project-title').textContent = 'Edit Project';
  document.getElementById('edit-project-id').value  = id;
  document.getElementById('proj-name').value        = p.name;
  document.getElementById('proj-desc').value        = p.desc || '';
  document.getElementById('proj-status').value      = p.status;
  document.getElementById('proj-deadline').value    = p.deadline || '';

  document.querySelectorAll('.cpick').forEach(c => {
    c.classList.toggle('active', c.dataset.color === p.color);
  });

  openModal('modal-add-project');
}

function resetProjectForm() {
  document.getElementById('modal-project-title').textContent = 'New Project';
  document.getElementById('edit-project-id').value = '';
  document.getElementById('proj-name').value        = '';
  document.getElementById('proj-desc').value        = '';
  document.getElementById('proj-status').value      = 'active';
  document.getElementById('proj-deadline').value    = new Date().toISOString().split('T')[0];
  document.querySelectorAll('.cpick').forEach((c, i) => c.classList.toggle('active', i === 0));
}

// ─────────────────────────────────────────────────────────────
// 8. TASKS / KANBAN
// ─────────────────────────────────────────────────────────────
function renderKanban() {
  ['todo', 'inprogress', 'done'].forEach(status => {
    const tasks = state.tasks.filter(t => t.status === status);
    const countEl = document.getElementById('count-' + status);
    const container = document.getElementById('cards-' + status);
    if (!countEl || !container) return;

    countEl.textContent = tasks.length;

    if (tasks.length === 0) {
      container.innerHTML = '<p style="font-size:12px;color:var(--text-muted);text-align:center;padding:24px 0">No tasks here</p>';
      return;
    }

    container.innerHTML = tasks.map(t => buildTaskCard(t)).join('');
  });

  lucide.createIcons();
}

function buildTaskCard(t) {
  const proj   = state.projects.find(p => p.id === t.projectId);
  const dueStr = t.due ? new Date(t.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
  const projTag = proj
    ? `<span class="task-proj-tag" style="border-color:${proj.color}40;color:${proj.color}">${esc(proj.name)}</span>`
    : '';

  return `
    <div class="task-card"
      draggable="true"
      data-id="${t.id}"
      ondragstart="dragStart(event,'${t.id}')"
      ondragend="dragEnd(event)">
      <div class="task-card-top">
        <span class="task-card-title">${esc(t.title)}</span>
        <div class="task-card-actions">
          <button class="task-act-btn" onclick="editTask('${t.id}')"><i data-lucide="pencil"></i></button>
          <button class="task-act-btn del" onclick="confirmDelete('task','${t.id}')"><i data-lucide="trash-2"></i></button>
        </div>
      </div>
      ${t.desc ? `<p class="task-card-desc">${esc(t.desc)}</p>` : ''}
      <div class="task-card-footer">
        <span class="task-priority priority-${t.priority}">${t.priority}</span>
        ${dueStr ? `<span class="task-due"><i data-lucide="calendar"></i>${dueStr}</span>` : ''}
        ${projTag}
      </div>
    </div>`;
}

function populateProjectSelect() {
  const sel = document.getElementById('task-project-input');
  if (!sel) return;
  sel.innerHTML = '<option value="">— No project —</option>' +
    state.projects.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('');
}

function saveTask() {
  const title     = document.getElementById('task-title-input').value.trim();
  const desc      = document.getElementById('task-desc-input').value.trim();
  const status    = document.getElementById('task-status-input').value;
  const priority  = document.getElementById('task-priority-input').value;
  const projectId = document.getElementById('task-project-input').value;
  const due       = document.getElementById('task-due-input').value;
  const editId    = document.getElementById('edit-task-id').value;

  if (!title) { showToast('Task title is required', 'error'); return; }

  if (editId) {
    const task = state.tasks.find(t => t.id === editId);
    if (task) Object.assign(task, { title, desc, status, priority, projectId, due });
    showToast('Task updated!', 'success');
  } else {
    state.tasks.push({ id: uid(), title, desc, status, priority, projectId, due, createdAt: Date.now() });
    showToast('Task added!', 'success');
  }

  saveState();
  closeAllModals();
  resetTaskForm();
  renderKanban();
  if (state.currentPage === 'dashboard') renderDashboard();
}

function editTask(id) {
  const t = state.tasks.find(task => task.id === id);
  if (!t) return;

  document.getElementById('modal-task-title').textContent  = 'Edit Task';
  document.getElementById('edit-task-id').value            = id;
  document.getElementById('task-title-input').value        = t.title;
  document.getElementById('task-desc-input').value         = t.desc || '';
  document.getElementById('task-status-input').value       = t.status;
  document.getElementById('task-priority-input').value     = t.priority;
  document.getElementById('task-due-input').value          = t.due || '';

  openModal('modal-add-task');

  // Bug fix: set project AFTER select is populated (populateProjectSelect runs in openModal)
  requestAnimationFrame(() => {
    const sel = document.getElementById('task-project-input');
    if (sel) sel.value = t.projectId || '';
  });
}

function resetTaskForm() {
  document.getElementById('modal-task-title').textContent = 'New Task';
  document.getElementById('edit-task-id').value           = '';
  document.getElementById('task-title-input').value       = '';
  document.getElementById('task-desc-input').value        = '';
  document.getElementById('task-due-input').value         = '';
  document.getElementById('task-status-input').value      = 'todo';
  document.getElementById('task-priority-input').value    = 'medium';
}

function quickAddTask(status) {
  resetTaskForm();
  document.getElementById('task-status-input').value = status;
  openModal('modal-add-task');
}

// ── Drag & Drop ──
function dragStart(e, taskId) {
  state.dragTaskId = taskId;
  e.dataTransfer.effectAllowed = 'move';
  setTimeout(() => {
    const el = document.querySelector(`.task-card[data-id="${taskId}"]`);
    if (el) el.classList.add('dragging');
  }, 0);
}

function dragEnd(e) {
  e.target.classList.remove('dragging');
  document.querySelectorAll('.kanban-col').forEach(c => c.classList.remove('drag-over'));
}

function allowDrop(e) {
  e.preventDefault();
  document.querySelectorAll('.kanban-col').forEach(c => c.classList.remove('drag-over'));
  e.currentTarget.classList.add('drag-over');
}

function dropTask(e, newStatus) {
  e.preventDefault();
  document.querySelectorAll('.kanban-col').forEach(c => c.classList.remove('drag-over'));
  if (!state.dragTaskId) return;

  const task = state.tasks.find(t => t.id === state.dragTaskId);
  if (task && task.status !== newStatus) {
    task.status = newStatus;
    saveState();
    renderKanban();
    showToast(`Moved to ${statusLabel2(newStatus)}`, 'success');
  }
  state.dragTaskId = null;
}

function statusLabel2(s) {
  return { todo: 'To Do', inprogress: 'In Progress', done: 'Done' }[s] || s;
}

// ─────────────────────────────────────────────────────────────
// 9. TEAM
// ─────────────────────────────────────────────────────────────
function renderTeam() {
  const grid = document.getElementById('team-grid');
  if (!grid) return;

  if (state.members.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <i data-lucide="users"></i>
        <h3>No team members</h3>
        <p>Add your first team member to get started.</p>
      </div>`;
    lucide.createIcons();
    return;
  }

  grid.innerHTML = state.members.map((m, idx) => {
    // Bug fix: use stable memberStats instead of Math.random() on every render
    const stats = state.memberStats && state.memberStats[m.id]
      ? state.memberStats[m.id]
      : { projects: 3, tasks: 10 };

    return `
      <div class="member-card" style="animation-delay:${idx * 0.06}s">
        <button class="member-del-btn" onclick="confirmDelete('member','${m.id}')"><i data-lucide="trash-2"></i></button>
        <div class="member-avatar">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${m.seed}" alt="${esc(m.name)}" />
        </div>
        <div class="member-name">${esc(m.name)}</div>
        <div class="member-role">${esc(m.role)}</div>
        <div class="member-email">${esc(m.email)}</div>
        <div class="member-stats">
          <div class="mstat"><span class="mstat-val">${stats.projects}</span><span class="mstat-label">Projects</span></div>
          <div class="mstat"><span class="mstat-val">${stats.tasks}</span><span class="mstat-label">Tasks</span></div>
        </div>
      </div>`;
  }).join('');

  lucide.createIcons();
}

function saveMember() {
  const name  = document.getElementById('member-name').value.trim();
  const email = document.getElementById('member-email').value.trim();
  const role  = document.getElementById('member-role').value.trim();

  if (!name) { showToast('Name is required', 'error'); return; }

  const newMember = { id: uid(), name, email, role, seed: name.replace(/\s+/g, '') };
  state.members.push(newMember);

  // Assign stable stats for new member
  if (!state.memberStats) state.memberStats = {};
  state.memberStats[newMember.id] = {
    projects: Math.floor(Math.random() * 3) + 1,
    tasks:    Math.floor(Math.random() * 10) + 2,
  };

  saveState();
  closeAllModals();
  document.getElementById('member-name').value  = '';
  document.getElementById('member-email').value = '';
  document.getElementById('member-role').value  = '';
  renderTeam();
  showToast('Member added! 👥', 'success');
}

// ─────────────────────────────────────────────────────────────
// 10. PROFILE
// ─────────────────────────────────────────────────────────────
function renderProfile() {
  const fname = document.getElementById('prof-firstname').value.trim();
  const lname = document.getElementById('prof-lastname').value.trim();
  const fullName = [fname, lname].filter(Boolean).join(' ') || 'Alex Johnson';
  const role  = document.getElementById('prof-role').value.trim() || 'Project Manager';

  const nameDisplay = document.getElementById('profile-name-display');
  const roleDisplay = document.getElementById('profile-role-display');
  if (nameDisplay) nameDisplay.textContent = fullName;
  if (roleDisplay) roleDisplay.textContent = role;

  const pstatProj = document.getElementById('pstat-projects');
  const pstatTask = document.getElementById('pstat-tasks');
  if (pstatProj) pstatProj.textContent = state.projects.length;
  if (pstatTask) pstatTask.textContent = state.tasks.length;
}

function saveProfile() {
  const fname = document.getElementById('prof-firstname').value.trim();
  const lname = document.getElementById('prof-lastname').value.trim();
  const role  = document.getElementById('prof-role').value.trim();

  const fullName = [fname, lname].filter(Boolean).join(' ');
  const nameDisplay = document.getElementById('profile-name-display');
  const roleDisplay = document.getElementById('profile-role-display');
  if (nameDisplay) nameDisplay.textContent = fullName || 'Alex Johnson';
  if (roleDisplay) roleDisplay.textContent = role || 'Project Manager';

  // Update dashboard greeting name
  const dashName = document.getElementById('dash-name');
  if (dashName) dashName.textContent = fname || 'Alex';

  saveState();
  showToast('Profile saved! ✅', 'success');
}

// ─────────────────────────────────────────────────────────────
// 11. CONFIRM DELETE
// ─────────────────────────────────────────────────────────────
function confirmDelete(type, id) {
  const messages = {
    project: 'Delete this project? All associated tasks will remain.',
    task:    'Delete this task permanently?',
    member:  'Remove this team member?',
  };
  document.getElementById('confirm-text').textContent = messages[type] || 'Are you sure?';

  const btn = document.getElementById('confirm-action-btn');
  // Remove old listener to prevent stacking
  btn.replaceWith(btn.cloneNode(true));
  const newBtn = document.getElementById('confirm-action-btn');

  newBtn.onclick = () => {
    if (type === 'project') {
      state.projects = state.projects.filter(p => p.id !== id);
      saveState(); renderProjects(); renderDashboard();
      showToast('Project deleted', 'info');
    }
    if (type === 'task') {
      state.tasks = state.tasks.filter(t => t.id !== id);
      saveState(); renderKanban(); renderDashboard();
      showToast('Task deleted', 'info');
    }
    if (type === 'member') {
      state.members = state.members.filter(m => m.id !== id);
      saveState(); renderTeam(); renderDashboard();
      showToast('Member removed', 'info');
    }
    closeAllModals();
  };

  openModal('modal-confirm');
}

// ─────────────────────────────────────────────────────────────
// 12. SETTINGS
// ─────────────────────────────────────────────────────────────
function applySettingTheme(checkbox) {
  const theme = checkbox.checked ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);

  // Sync topbar icon
  const icon = document.getElementById('theme-icon');
  if (icon) {
    icon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
    lucide.createIcons();
  }

  state.theme = theme;
  saveState();
}

function applyCompact(checkbox) {
  document.getElementById('app').classList.toggle('compact', checkbox.checked);
}

function clearAllData() {
  if (!confirm('This will delete ALL your data. Continue?')) return;
  localStorage.removeItem('flowdesk_state');
  state.projects     = [];
  state.tasks        = [];
  state.members      = [];
  state.memberStats  = {};
  saveState();
  renderPage(state.currentPage);
  showToast('All data cleared', 'info');
}

// ─────────────────────────────────────────────────────────────
// 13. THEME TOGGLE (topbar)
// ─────────────────────────────────────────────────────────────
function toggleTheme() {
  const isDark   = document.documentElement.getAttribute('data-theme') === 'dark';
  const newTheme = isDark ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);

  const icon = document.getElementById('theme-icon');
  if (icon) {
    icon.setAttribute('data-lucide', newTheme === 'dark' ? 'sun' : 'moon');
    lucide.createIcons();
  }

  // Bug fix: sync settings toggle properly
  const settingToggle = document.getElementById('setting-dark');
  if (settingToggle) settingToggle.checked = (newTheme === 'dark');

  state.theme = newTheme;
  saveState();
}

// ─────────────────────────────────────────────────────────────
// 14. SIDEBAR (mobile)
// ─────────────────────────────────────────────────────────────
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const isOpen  = sidebar.classList.contains('open');
  sidebar.classList.toggle('open', !isOpen);
  overlay.classList.toggle('open', !isOpen);
}

// ─────────────────────────────────────────────────────────────
// 15. GLOBAL SEARCH
// ─────────────────────────────────────────────────────────────
function handleSearch(val) {
  if (!val.trim()) return;
  navigate('projects');
  const filterInput = document.querySelector('.filter-search input');
  if (filterInput) filterInput.value = val;
  searchProjects(val);
}

// ─────────────────────────────────────────────────────────────
// 16. TOAST
// ─────────────────────────────────────────────────────────────
const TOAST_ICONS = {
  success: 'check-circle',
  error:   'alert-circle',
  info:    'info',
};

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i data-lucide="${TOAST_ICONS[type] || 'info'}" class="toast-icon"></i><span>${esc(message)}</span>`;
  container.appendChild(toast);
  lucide.createIcons();

  setTimeout(() => {
    toast.classList.add('out');
    setTimeout(() => toast.remove(), 280);
  }, 3000);
}

// ─────────────────────────────────────────────────────────────
// 17. XSS HELPER
// ─────────────────────────────────────────────────────────────
function esc(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// ─────────────────────────────────────────────────────────────
// 18. NAV CLICK HANDLERS
// ─────────────────────────────────────────────────────────────
document.querySelectorAll('.nav-item[data-page]').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    navigate(item.dataset.page);
  });
});

// Close modal on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeAllModals();
});

// ─────────────────────────────────────────────────────────────
// 19. INIT
// ─────────────────────────────────────────────────────────────
function init() {
  loadState();

  // Apply saved theme
  const theme = state.theme || 'dark';
  document.documentElement.setAttribute('data-theme', theme);

  // Sync topbar icon
  const icon = document.getElementById('theme-icon');
  if (icon) icon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');

  // Sync settings dark toggle
  const settingToggle = document.getElementById('setting-dark');
  if (settingToggle) settingToggle.checked = (theme === 'dark');

  // Default dates
  const today = new Date().toISOString().split('T')[0];
  const projDL  = document.getElementById('proj-deadline');
  const taskDue = document.getElementById('task-due-input');
  if (projDL)  projDL.value  = today;
  if (taskDue) taskDue.value = today;

  // Ensure memberStats exists for any existing members without stats
  if (!state.memberStats) state.memberStats = {};
  state.members.forEach(m => {
    if (!state.memberStats[m.id]) {
      state.memberStats[m.id] = {
        projects: Math.floor(Math.random() * 5) + 2,
        tasks:    Math.floor(Math.random() * 20) + 5,
      };
    }
  });

  // Init icons
  lucide.createIcons();
}

document.addEventListener('DOMContentLoaded', init);
