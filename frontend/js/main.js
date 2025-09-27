import { setupMenuNavigation, renderMenu } from './menu.js';
import { APPS_SCRIPT_URL } from './config.js';

// Global state
let currentUser = null;
let currentToken = null;

// Authentication functions
async function checkAuthentication() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  if (!token || !user) {
    redirectToLogin();
    return false;
  }
  
  try {
    currentToken = token;
    currentUser = JSON.parse(user);
    
    // Update user info display
    updateUserDisplay();
    
    // Render menu based on user role
    renderMenu(currentUser.role);
    
    return true;
  } catch (error) {
    console.error('Authentication error:', error);
    redirectToLogin();
    return false;
  }
}

function redirectToLogin() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

function updateUserDisplay() {
  const userNameEl = document.getElementById('userName');
  const userRoleEl = document.getElementById('userRole');
  
  if (userNameEl && currentUser) {
    userNameEl.textContent = currentUser.fullName || currentUser.id;
  }
  
  if (userRoleEl && currentUser) {
    userRoleEl.textContent = currentUser.role || 'user';
  }
}

// API functions
async function fetchWithAuth(url, options = {}) {
  const defaultOptions = {
    headers: {
      'Authorization': `Bearer ${currentToken}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  };
  
  return fetch(url, { ...defaultOptions, ...options });
}

async function fetchBalance() {
  try {
    if (!currentUser || !currentToken) return;
    
    const response = await fetch(`${APPS_SCRIPT_URL}?action=getAccountSummary&token=${currentToken}&accountId=${currentUser.id}`);
    const result = await response.json();
    
    if (result.status === 'success' && result.data) {
      const balance = result.data.currentBalance || 0;
      updateBalanceDisplay(balance);
    }
  } catch (error) {
    console.error('Error fetching balance:', error);
  }
}

function updateBalanceDisplay(balance) {
  const balanceEl = document.getElementById('currentBalance');
  if (balanceEl) {
    balanceEl.textContent = `$${balance.toFixed(2)}`;
  }
  
  // Update dashboard balance if on dashboard
  const totalBalanceEl = document.getElementById('totalBalance');
  if (totalBalanceEl) {
    totalBalanceEl.textContent = `$${balance.toFixed(2)}`;
  }
}

async function fetchTradingHistory() {
  try {
    if (!currentUser || !currentToken) return [];
    
    const response = await fetch(`${APPS_SCRIPT_URL}?action=getTradingHistory&token=${currentToken}&accountId=${currentUser.id}`);
    const result = await response.json();
    
    if (result.status === 'success' && result.data) {
      return result.data.trades || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching trading history:', error);
    return [];
  }
}

async function fetchDashboardData() {
  try {
    const trades = await fetchTradingHistory();
    
    // Calculate statistics
    const totalTrades = trades.length;
    const winningTrades = trades.filter(trade => parseFloat(trade['กำไร_ขาดทุนรายวัน_USD']) > 0).length;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades * 100).toFixed(1) : 0;
    
    // Update dashboard
    const totalTradesEl = document.getElementById('totalTrades');
    const winRateEl = document.getElementById('winRate');
    
    if (totalTradesEl) totalTradesEl.textContent = totalTrades;
    if (winRateEl) winRateEl.textContent = `${winRate}%`;
    
    // Update recent trades
    updateRecentTrades(trades.slice(-5)); // Last 5 trades
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }
}

function updateRecentTrades(trades) {
  const recentTradesEl = document.getElementById('recentTrades');
  if (!recentTradesEl) return;
  
  if (trades.length === 0) {
    recentTradesEl.innerHTML = '<p class="text-gray-500">No recent trades found.</p>';
    return;
  }
  
  const tradesHTML = trades.map(trade => {
    const profit = parseFloat(trade['กำไร_ขาดทุนรายวัน_USD']);
    const isProfit = profit > 0;
    
    return `
      <div class="flex justify-between items-center p-3 bg-gray-50 rounded border">
        <div>
          <span class="font-medium">${trade['Trade_Date']}</span>
          <span class="text-sm text-gray-600 ml-2">${trade['หมายเหตุ'] || 'No notes'}</span>
        </div>
        <span class="font-semibold ${isProfit ? 'text-green-600' : 'text-red-600'}">
          ${isProfit ? '+' : ''}$${profit.toFixed(2)}
        </span>
      </div>
    `;
  }).join('');
  
  recentTradesEl.innerHTML = tradesHTML;
}

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication first
  const isAuthenticated = await checkAuthentication();
  if (!isAuthenticated) return;
  
  // Setup navigation
  setupMenuNavigation();
  
  // Load initial data
  await fetchBalance();
  
  // Load dashboard by default
  setTimeout(() => {
    fetchDashboardData();
  }, 500);

});