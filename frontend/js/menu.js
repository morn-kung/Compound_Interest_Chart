export const userMenus = [
  { id: 'dashboard', label: '📊 Dashboard', permission: 'read', icon: '📊' },
  { id: 'compound', label: '🚀 Compound Planner', permission: 'read', icon: '🚀' },
  { id: 'trading', label: '✍️ Trading Journal', permission: 'read', icon: '✍️' },
  { id: 'history', label: '📈 Trading History', permission: 'read', icon: '📈' },
];

export const adminMenus = [
  { id: 'admin', label: '⚙️ Admin Panel', action: 'getAdminData', permission: 'CRUD', icon: '⚙️' },
  { id: 'users', label: '👥 User Management', action: 'getUsersData', permission: 'CRUD', icon: '👥' },
  { id: 'reports', label: '📊 Reports', action: 'getReports', permission: 'CRUD', icon: '📊' },
];

export const authMenus = [
  { id: 'profile', label: '👤 Profile', permission: 'read', icon: '👤' },
  { id: 'logout', label: '🚪 Logout', action: 'logout', permission: 'read', icon: '🚪' },
];

export const allMenus = [
  ...userMenus,
  ...adminMenus,
  ...authMenus,
];

export function getMenusByPermission(userRole) {
  if (userRole === 'admin') {
    return [...userMenus, ...adminMenus, ...authMenus];
  }
  return [...userMenus, ...authMenus];
}

export function setupMenuNavigation() {
  const menuContainer = document.getElementById('menu');
  if (!menuContainer) {
    console.error('Menu container not found');
    return;
  }
  
  menuContainer.addEventListener('click', (event) => {
    const button = event.target.closest('[data-menu-id]');
    if (button) {
      const menuId = button.dataset.menuId;
      loadContent(menuId);
      updateActiveMenu(button);
    }
  });
}

export function renderMenu(userRole = 'user') {
  const menuContainer = document.getElementById('menu');
  if (!menuContainer) return;
  
  const menus = getMenusByPermission(userRole);
  
  const menuHTML = menus.map(menu => `
    <button 
      data-menu-id="${menu.id}" 
      class="menu-item px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-blue-100 hover:text-blue-700 ${menu.id === 'dashboard' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}"
    >
      ${menu.icon} ${menu.label}
    </button>
  `).join('');
  
  menuContainer.innerHTML = `
    <div class="flex flex-wrap gap-2 p-4 bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      ${menuHTML}
    </div>
  `;
}

function updateActiveMenu(activeButton) {
  const menuButtons = document.querySelectorAll('.menu-item');
  menuButtons.forEach(button => {
    button.classList.remove('bg-blue-100', 'text-blue-700');
    button.classList.add('text-gray-600');
  });
  
  activeButton.classList.remove('text-gray-600');
  activeButton.classList.add('bg-blue-100', 'text-blue-700');
}

function loadContent(menuId) {
  const contentContainer = document.getElementById('content');
  if (!contentContainer) {
    console.error('Content container not found');
    return;
  }
  
  // Show loading state
  contentContainer.innerHTML = '<div class="text-center py-8"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div><p class="mt-2 text-gray-600">Loading...</p></div>';
  
  // Load content based on menu
  setTimeout(() => {
    switch (menuId) {
      case 'dashboard':
        loadDashboard();
        break;
      case 'compound':
        loadCompoundPlanner();
        break;
      case 'trading':
        loadTradingJournal();
        break;
      case 'history':
        loadTradingHistory();
        break;
      case 'admin':
        loadAdminPanel();
        break;
      case 'users':
        loadUserManagement();
        break;
      case 'reports':
        loadReports();
        break;
      case 'profile':
        loadProfile();
        break;
      case 'logout':
        handleLogout();
        break;
      default:
        contentContainer.innerHTML = '<div class="text-center py-8"><h2 class="text-xl font-semibold text-gray-700">Page Not Found</h2><p class="text-gray-500">The requested page could not be found.</p></div>';
    }
  }, 300);
}

// Content loading functions (will be implemented)
function loadDashboard() {
  document.getElementById('content').innerHTML = `
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-gray-800">📊 Dashboard</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 class="text-lg font-semibold text-gray-700 mb-2">Total Balance</h3>
          <p id="totalBalance" class="text-3xl font-bold text-green-600">$0.00</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 class="text-lg font-semibold text-gray-700 mb-2">Total Trades</h3>
          <p id="totalTrades" class="text-3xl font-bold text-blue-600">0</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 class="text-lg font-semibold text-gray-700 mb-2">Win Rate</h3>
          <p id="winRate" class="text-3xl font-bold text-purple-600">0%</p>
        </div>
      </div>
      <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-700 mb-4">Recent Trades</h3>
        <div id="recentTrades" class="space-y-2">
          <p class="text-gray-500">Loading recent trades...</p>
        </div>
      </div>
    </div>
  `;
}

function loadCompoundPlanner() {
  document.getElementById('content').innerHTML = `
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-gray-800">🚀 Compound Planner</h2>
      <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
        <p class="text-gray-600 mb-4">Calculate compound interest growth for your trading capital.</p>
        <p class="text-blue-600">This feature will be implemented soon...</p>
      </div>
    </div>
  `;
}

function loadTradingJournal() {
  document.getElementById('content').innerHTML = `
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-gray-800">✍️ Trading Journal</h2>
      <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
        <p class="text-gray-600 mb-4">Record and manage your daily trading activities.</p>
        <p class="text-blue-600">This feature will be implemented soon...</p>
      </div>
    </div>
  `;
}

function loadTradingHistory() {
  document.getElementById('content').innerHTML = `
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-gray-800">📈 Trading History</h2>
      <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
        <p class="text-gray-600 mb-4">View your complete trading history and performance.</p>
        <p class="text-blue-600">This feature will be implemented soon...</p>
      </div>
    </div>
  `;
}

function loadAdminPanel() {
  document.getElementById('content').innerHTML = `
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-gray-800">⚙️ Admin Panel</h2>
      <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
        <p class="text-gray-600 mb-4">Administrative tools and system management.</p>
        <p class="text-blue-600">Admin features will be implemented soon...</p>
      </div>
    </div>
  `;
}

function loadUserManagement() {
  document.getElementById('content').innerHTML = `
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-gray-800">👥 User Management</h2>
      <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
        <p class="text-gray-600 mb-4">Manage user accounts and permissions.</p>
        <p class="text-blue-600">User management will be implemented soon...</p>
      </div>
    </div>
  `;
}

function loadReports() {
  document.getElementById('content').innerHTML = `
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-gray-800">📊 Reports</h2>
      <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
        <p class="text-gray-600 mb-4">Generate and view trading reports and analytics.</p>
        <p class="text-blue-600">Reports will be implemented soon...</p>
      </div>
    </div>
  `;
}

function loadProfile() {
  document.getElementById('content').innerHTML = `
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-gray-800">👤 Profile</h2>
      <div class="bg-white p-6 rounded-lg shadow border border-gray-200">
        <p class="text-gray-600 mb-4">Manage your profile and account settings.</p>
        <p class="text-blue-600">Profile management will be implemented soon...</p>
      </div>
    </div>
  `;
}

function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
  }
}