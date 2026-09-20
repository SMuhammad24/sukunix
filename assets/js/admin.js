/**
 * Sukunix Executive Admin Panel Logic
 * Author: Sukunix Senior Leadership
 */

(function () {
  'use strict';

  // State Management
  const STATE = {
    token: localStorage.getItem('sukunix_admin_token') || null,
    admin: null,
    activeTab: 'tab-bookings',
    bookings: [],
    inquiries: [],
    stats: null,
    bookingsSearch: '',
    bookingsStatus: 'all',
    inquiriesSearch: '',
    inquiriesStatus: 'all'
  };

  // DOM Elements
  const elAuthView = document.getElementById('auth-view');
  const elDashboardView = document.getElementById('dashboard-view');
  const elLoginForm = document.getElementById('login-form');
  const elAdminEmail = document.getElementById('admin-email');
  const elAdminPassword = document.getElementById('admin-password');
  const elBtnLogin = document.getElementById('btn-login');
  const elAuthAlert = document.getElementById('auth-alert');
  const elBtnTogglePw = document.getElementById('btn-toggle-pw');
  const elBtnLogout = document.getElementById('btn-logout');
  const elBtnRefresh = document.getElementById('btn-refresh');
  const elBtnExportCsv = document.getElementById('btn-export-csv');
  const elLiveClock = document.getElementById('live-clock');

  // KPI Elements
  const elKpiInquiriesTotal = document.getElementById('kpi-inquiries-total');
  const elKpiInquiriesNew = document.getElementById('kpi-inquiries-new');
  const elKpiInquiriesContacted = document.getElementById('kpi-inquiries-contacted');
  const elKpiBookingsTotal = document.getElementById('kpi-bookings-total');
  const elKpiBookingsScheduled = document.getElementById('kpi-bookings-scheduled');
  const elKpiBookingsCompleted = document.getElementById('kpi-bookings-completed');
  const elKpiDepositsInr = document.getElementById('kpi-deposits-inr');
  const elKpiDepositsUsd = document.getElementById('kpi-deposits-usd');
  const elKpiStorageEngine = document.getElementById('kpi-storage-engine');
  const elKpiStorageStatus = document.getElementById('kpi-storage-status');

  // Tables & Badges
  const elBookingsTableBody = document.getElementById('bookings-table-body');
  const elInquiriesTableBody = document.getElementById('inquiries-table-body');
  const elTabBadgeBookings = document.getElementById('tab-badge-bookings');
  const elTabBadgeInquiries = document.getElementById('tab-badge-inquiries');

  // Search & Filter
  const elBookingsSearch = document.getElementById('bookings-search');
  const elBookingsStatusFilter = document.getElementById('bookings-status-filter');
  const elInquiriesSearch = document.getElementById('inquiries-search');
  const elInquiriesStatusFilter = document.getElementById('inquiries-status-filter');

  // Modal
  const elInquiryModal = document.getElementById('inquiry-modal');
  const elModalInquiryTitle = document.getElementById('modal-inquiry-title');
  const elModalInquiryContent = document.getElementById('modal-inquiry-content');
  const elModalInquiryFooter = document.getElementById('modal-inquiry-footer');
  const elBtnCloseInquiryModal = document.getElementById('btn-close-inquiry-modal');

  // Toast Container
  const elToastContainer = document.getElementById('toast-container');

  // Helper: Show Toast Notification
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✓' : '⚠️'}</span>
      <span>${escapeHtml(message)}</span>
    `;
    elToastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // Helper: Escape HTML entities to prevent Stored / Reflected XSS
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Helper: Sanitize URLs to prevent javascript: or data: pseudoprotocol XSS
  function sanitizeUrl(url) {
    if (!url) return '#';
    const trimmed = String(url).trim();
    // Allow only safe web and communication schemes
    if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) {
      return trimmed
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }
    return '#';
  }

  // Live Clock
  function updateLiveClock() {
    if (elLiveClock) {
      const now = new Date();
      elLiveClock.textContent = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }) + ' UTC';
    }
  }
  setInterval(updateLiveClock, 1000);
  updateLiveClock();

  // Password visibility toggle
  if (elBtnTogglePw && elAdminPassword) {
    elBtnTogglePw.addEventListener('click', () => {
      const isPw = elAdminPassword.getAttribute('type') === 'password';
      elAdminPassword.setAttribute('type', isPw ? 'text' : 'password');
    });
  }

  // Support http://localhost:3000/admin, VS Code Live Server (port 5500, 5501, etc.), and file:///
  const isLocalDevServer = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '3000';
  const API_BASE = (window.location.protocol === 'file:' || isLocalDevServer) ? 'http://localhost:3000' : '';

  // API Client with Auth Header
  async function apiFetch(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    if (STATE.token) {
      headers['Authorization'] = `Bearer ${STATE.token}`;
    }

    try {
      const targetUrl = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
      const response = await fetch(targetUrl, {
        ...options,
        headers
      });

      if (response.status === 401 && !endpoint.includes('/login')) {
        // Expired or invalid token on protected endpoints
        logout();
        throw new Error('Your administrative session has expired. Please log in again.');
      }

      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    } catch (err) {
      const isConnError = err.message && (err.message.includes('fetch') || err.message.includes('Failed to fetch') || err.message.includes('NetworkError'));
      const errorMsg = isConnError
        ? 'Cannot connect to Sukunix backend server (http://localhost:3000). Please ensure "npm start" or "node server.js" is running.'
        : err.message;
      return { ok: false, error: errorMsg };
    }
  }

  // Initial Authentication Check
  async function initAuth() {
    if (!STATE.token) {
      showAuthView();
      return;
    }

    const res = await apiFetch('/api/admin/me');
    if (res.ok && res.data && res.data.success) {
      STATE.admin = res.data.admin;
      showDashboardView();
      loadAllDashboardData();
    } else {
      logout();
    }
  }

  function showAuthView() {
    elAuthView.style.display = 'flex';
    elDashboardView.style.display = 'none';
    if (elAdminEmail) elAdminEmail.focus();
  }

  function showDashboardView() {
    elAuthView.style.display = 'none';
    elDashboardView.style.display = 'flex';

    if (STATE.admin) {
      const elAdminDisplayName = document.getElementById('admin-display-name');
      const elAdminDisplayEmail = document.getElementById('admin-display-email');
      const elAdminAvatar = document.getElementById('admin-avatar');

      if (elAdminDisplayName) elAdminDisplayName.textContent = STATE.admin.name || 'Sukunix Admin';
      if (elAdminDisplayEmail) elAdminDisplayEmail.textContent = STATE.admin.email;
      if (elAdminAvatar) elAdminAvatar.textContent = (STATE.admin.email || 'SK').slice(0, 2).toUpperCase();
    }
  }

  function logout() {
    STATE.token = null;
    STATE.admin = null;
    localStorage.removeItem('sukunix_admin_token');
    showAuthView();
    showToast('Signed out of administrative session.', 'success');
  }

  // Login Form Submission
  if (elLoginForm) {
    elLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = elAdminEmail.value.trim();
      const password = elAdminPassword.value;

      if (!email || !password) return;

      // Loading state
      elBtnLogin.disabled = true;
      elBtnLogin.querySelector('.btn-text').style.display = 'none';
      elBtnLogin.querySelector('.btn-spinner').style.display = 'inline-block';
      elAuthAlert.style.display = 'none';

      const res = await apiFetch('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      elBtnLogin.disabled = false;
      elBtnLogin.querySelector('.btn-text').style.display = 'inline-block';
      elBtnLogin.querySelector('.btn-spinner').style.display = 'none';

      if (res.ok && res.data && res.data.success) {
        STATE.token = res.data.token;
        STATE.admin = res.data.admin;
        localStorage.setItem('sukunix_admin_token', res.data.token);
        showDashboardView();
        loadAllDashboardData();
        showToast('Welcome back, Sukunix Administrator!', 'success');
      } else {
        const msg = (res.data && res.data.error) || res.error || 'Authentication failed. Please verify credentials.';
        elAuthAlert.textContent = msg;
        elAuthAlert.style.display = 'block';
      }
    });
  }

  if (elBtnLogout) {
    elBtnLogout.addEventListener('click', logout);
  }

  // Load All Dashboard Data
  async function loadAllDashboardData() {
    await Promise.all([
      fetchStats(),
      fetchBookings(),
      fetchInquiries(),
      fetchTelemetry()
    ]);
  }

  // Fetch Telemetry & Health
  async function fetchTelemetry() {
    try {
      const res = await fetch(`${API_BASE}/api/health`);
      if (res.ok) {
        const h = await res.json();
        const elTelDb = document.getElementById('tel-db-status');
        const elTelUptime = document.getElementById('tel-uptime');
        if (elTelDb) {
          elTelDb.innerHTML = h.database?.connected
            ? '<span class="text-emerald">Connected (Active Replica)</span>'
            : '<span class="text-amber">Offline (Using Resilient JSON Storage)</span>';
        }
        if (elTelUptime) {
          const hours = Math.floor(h.uptime / 3600);
          const mins = Math.floor((h.uptime % 3600) / 60);
          elTelUptime.textContent = `${hours}h ${mins}m running`;
        }
      }
    } catch (e) {
      console.warn('Telemetry poll error:', e);
    }
  }

  // Fetch Stats
  async function fetchStats() {
    const res = await apiFetch('/api/admin/stats');
    if (res.ok && res.data && res.data.success) {
      const s = res.data.stats;
      STATE.stats = s;

      if (elKpiInquiriesTotal) elKpiInquiriesTotal.textContent = s.inquiries?.total || 0;
      if (elKpiInquiriesNew) elKpiInquiriesNew.textContent = `${s.inquiries?.new || 0} New`;
      if (elKpiInquiriesContacted) elKpiInquiriesContacted.textContent = `${s.inquiries?.contacted || 0} Contacted`;

      if (elKpiBookingsTotal) elKpiBookingsTotal.textContent = s.bookings?.total || 0;
      if (elKpiBookingsScheduled) elKpiBookingsScheduled.textContent = `${s.bookings?.scheduled || 0} Scheduled`;
      if (elKpiBookingsCompleted) elKpiBookingsCompleted.textContent = `${s.bookings?.completed || 0} Completed`;

      if (elKpiDepositsInr) elKpiDepositsInr.textContent = `₹${(s.bookings?.totalDepositInr || 0).toLocaleString()}`;
      if (elKpiDepositsUsd) elKpiDepositsUsd.textContent = `$${s.bookings?.totalDepositUsd || 0} USD`;

      if (elKpiStorageEngine) {
        elKpiStorageEngine.textContent = s.source === 'mongodb' ? 'MongoDB' : 'Local JSON';
      }
      if (elKpiStorageStatus) {
        elKpiStorageStatus.textContent = s.source === 'mongodb' ? 'Live Cloud Atlas' : 'Local Fail-Safe';
      }
    }
  }

  // Fetch Bookings
  async function fetchBookings() {
    const params = new URLSearchParams({
      search: STATE.bookingsSearch,
      status: STATE.bookingsStatus
    });

    const res = await apiFetch(`/api/admin/bookings?${params.toString()}`);
    if (res.ok && res.data && res.data.success) {
      STATE.bookings = res.data.bookings || [];
      if (elTabBadgeBookings) elTabBadgeBookings.textContent = res.data.total || 0;
      renderBookingsTable(STATE.bookings);
    }
  }

  // Render Bookings Table
  function renderBookingsTable(bookings) {
    if (!elBookingsTableBody) return;

    if (bookings.length === 0) {
      elBookingsTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="table-loading">
            No consultation bookings found matching your search/filter criteria.
          </td>
        </tr>
      `;
      return;
    }

    elBookingsTableBody.innerHTML = bookings.map(b => {
      const bookingId = String(b._id || b.bookingRef || '').replace(/[^a-zA-Z0-9_-]/g, '');
      const clientName = escapeHtml(b.client?.name || 'Anonymous');
      const clientEmail = escapeHtml(b.client?.email || '');
      const clientPhone = escapeHtml(b.client?.whatsapp || '');
      const clientCompany = escapeHtml(b.client?.company || 'Confidential');
      const cleanPhone = (b.client?.whatsapp || '').replace(/[^0-9]/g, '');

      const slotDate = escapeHtml(b.slot?.dateFormatted || b.slot?.date || '--');
      const slotTime = escapeHtml(b.slot?.time || '--');
      const slotTz = escapeHtml(b.slot?.timezone || 'IST');

      const depositAmount = b.deposit?.currency === 'USD' ? `$${b.deposit.amount || 19}` : `₹${b.deposit?.amount || 499}`;
      const depositStatus = b.deposit?.status || 'paid';

      const meetingStatus = b.meeting?.status || 'scheduled';
      const zoomLink = b.meeting?.zoomLink || '';
      const safeZoomLink = sanitizeUrl(zoomLink);
      const meetingId = b.meeting?.meetingId || '';
      const passcode = b.meeting?.passcode || '';

      const createdAt = b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '--';

      // WhatsApp Chat link with pre-filled greeting
      const waText = encodeURIComponent(`Hi ${b.client?.name || ''}, this is Sukunix Engineering Leadership regarding your booked architecture consultation session scheduled for ${slotDate} at ${slotTime} (${slotTz}). Zoom Link: ${zoomLink}`);
      const safeWaUrl = cleanPhone ? sanitizeUrl(`https://wa.me/${cleanPhone}?text=${waText}`) : '#';
      const safeMailtoUrl = sanitizeUrl(`mailto:${encodeURIComponent(clientEmail)}?subject=Sukunix Architecture Discovery Consultation (${encodeURIComponent(b.bookingRef || '')})`);

      return `
        <tr id="row-booking-${bookingId}">
          <td>
            <div class="cell-primary cell-mono">${escapeHtml(b.bookingRef || 'SKX')}</div>
            <div class="cell-sub">${createdAt}</div>
          </td>
          <td>
            <div class="cell-primary">${clientName}</div>
            <div class="cell-sub">${clientEmail}</div>
            <div class="cell-sub">${clientPhone} • <span class="text-dim">${clientCompany}</span></div>
          </td>
          <td>
            <div class="cell-primary">${slotDate}</div>
            <div class="cell-sub">${slotTime} (${slotTz})</div>
          </td>
          <td>
            <div class="cell-primary">${depositAmount}</div>
            <span class="status-pill status-${depositStatus === 'paid' ? 'scheduled' : 'new'}">${depositStatus}</span>
          </td>
          <td>
            ${zoomLink ? `
              <div class="cell-primary">
                <a href="${safeZoomLink}" target="_blank" rel="noopener noreferrer" class="text-blue" style="text-decoration:none; font-weight:600;">
                  Join Zoom ↗
                </a>
              </div>
              <div class="cell-sub cell-mono">ID: ${escapeHtml(meetingId)}</div>
              <div class="cell-sub cell-mono">Pass: ${escapeHtml(passcode)}</div>
            ` : '<span class="cell-sub">No Zoom Link</span>'}
          </td>
          <td>
            <select class="status-dropdown" onchange="window.adminChangeBookingStatus('${bookingId}', this.value)">
              <option value="scheduled" ${meetingStatus === 'scheduled' ? 'selected' : ''}>Scheduled</option>
              <option value="completed" ${meetingStatus === 'completed' ? 'selected' : ''}>Completed</option>
              <option value="rescheduled" ${meetingStatus === 'rescheduled' ? 'selected' : ''}>Rescheduled</option>
              <option value="cancelled" ${meetingStatus === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </td>
          <td class="text-right">
            <div class="action-btn-group">
              ${cleanPhone ? `
                <a href="${safeWaUrl}" target="_blank" rel="noopener noreferrer" class="action-btn wa" title="Chat with Client on WhatsApp">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                  </svg>
                </a>
              ` : ''}
              <a href="${safeMailtoUrl}" class="action-btn" title="Send Work Email">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </a>
              <button class="action-btn del" onclick="window.adminDeleteBooking('${bookingId}')" title="Delete Consultation Record">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Fetch Inquiries
  async function fetchInquiries() {
    const params = new URLSearchParams({
      search: STATE.inquiriesSearch,
      status: STATE.inquiriesStatus
    });

    const res = await apiFetch(`/api/admin/inquiries?${params.toString()}`);
    if (res.ok && res.data && res.data.success) {
      STATE.inquiries = res.data.inquiries || [];
      if (elTabBadgeInquiries) elTabBadgeInquiries.textContent = res.data.total || 0;
      renderInquiriesTable(STATE.inquiries);
    }
  }

  // Render Inquiries Table
  function renderInquiriesTable(inquiries) {
    if (!elInquiriesTableBody) return;

    if (inquiries.length === 0) {
      elInquiriesTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="table-loading">
            No client project inquiries found matching your criteria.
          </td>
        </tr>
      `;
      return;
    }

    elInquiriesTableBody.innerHTML = inquiries.map(i => {
      const inquiryId = String(i._id || '').replace(/[^a-zA-Z0-9_-]/g, '');
      const clientName = escapeHtml(i.name || 'Anonymous');
      const clientEmail = escapeHtml(i.email || '');
      const service = escapeHtml(i.service || 'Software Engineering');
      const budget = escapeHtml(i.budget || '$25k - $75k');
      const status = i.status || 'new';
      const messagePreview = escapeHtml(i.message ? (i.message.length > 55 ? i.message.substring(0, 55) + '...' : i.message) : 'No message provided');
      const dateFormatted = i.createdAt ? new Date(i.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '--';
      const safeMailtoUrl = sanitizeUrl(`mailto:${encodeURIComponent(clientEmail)}?subject=Sukunix Engineering - Regarding your ${encodeURIComponent(i.service || 'project inquiry')}`);

      return `
        <tr id="row-inquiry-${inquiryId}">
          <td>
            <div class="cell-primary">${dateFormatted}</div>
            <div class="cell-sub cell-mono">${escapeHtml(i.ipAddress || '')}</div>
          </td>
          <td>
            <div class="cell-primary">${clientName}</div>
            <div class="cell-sub">${clientEmail}</div>
          </td>
          <td>
            <div class="cell-primary">${service}</div>
          </td>
          <td>
            <span class="status-pill status-new">${budget}</span>
          </td>
          <td>
            <select class="status-dropdown" onchange="window.adminChangeInquiryStatus('${inquiryId}', this.value)">
              <option value="new" ${status === 'new' ? 'selected' : ''}>New</option>
              <option value="contacted" ${status === 'contacted' ? 'selected' : ''}>Contacted</option>
              <option value="qualified" ${status === 'qualified' ? 'selected' : ''}>Qualified</option>
              <option value="proposal_sent" ${status === 'proposal_sent' ? 'selected' : ''}>Proposal Sent</option>
              <option value="closed" ${status === 'closed' ? 'selected' : ''}>Closed</option>
              <option value="archived" ${status === 'archived' ? 'selected' : ''}>Archived</option>
            </select>
          </td>
          <td>
            <span class="cell-sub" style="cursor: pointer; text-decoration: underline;" onclick="window.adminOpenInquiryModal('${inquiryId}')" title="Click to view full message">
              ${messagePreview}
            </span>
          </td>
          <td class="text-right">
            <div class="action-btn-group">
              <button class="action-btn" onclick="window.adminOpenInquiryModal('${inquiryId}')" title="Read Full Lead Details">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
              <a href="${safeMailtoUrl}" class="action-btn" title="Reply via Work Email">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </a>
              <button class="action-btn del" onclick="window.adminDeleteInquiry('${inquiryId}')" title="Delete Inquiry">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Global Action Handlers (exposed on window)
  window.adminChangeBookingStatus = async function (id, status) {
    const res = await apiFetch(`/api/admin/bookings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ meetingStatus: status })
    });

    if (res.ok && res.data && res.data.success) {
      showToast(`Consultation status changed to "${status}"`, 'success');
      fetchStats();
    } else {
      showToast('Failed to update consultation status.', 'error');
    }
  };

  window.adminDeleteBooking = async function (id) {
    if (!confirm('Are you sure you want to delete this consultation record? This cannot be undone.')) return;

    const res = await apiFetch(`/api/admin/bookings/${id}`, { method: 'DELETE' });
    if (res.ok && res.data && res.data.success) {
      showToast('Consultation record deleted successfully.', 'success');
      const row = document.getElementById(`row-booking-${id}`);
      if (row) row.remove();
      fetchStats();
    } else {
      showToast('Failed to delete booking record.', 'error');
    }
  };

  window.adminChangeInquiryStatus = async function (id, status) {
    const res = await apiFetch(`/api/admin/inquiries/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });

    if (res.ok && res.data && res.data.success) {
      showToast(`Lead status updated to "${status}"`, 'success');
      fetchStats();
    } else {
      showToast('Failed to update inquiry status.', 'error');
    }
  };

  window.adminDeleteInquiry = async function (id) {
    if (!confirm('Are you sure you want to delete this inquiry lead? This cannot be undone.')) return;

    const res = await apiFetch(`/api/admin/inquiries/${id}`, { method: 'DELETE' });
    if (res.ok && res.data && res.data.success) {
      showToast('Inquiry lead deleted successfully.', 'success');
      const row = document.getElementById(`row-inquiry-${id}`);
      if (row) row.remove();
      fetchStats();
    } else {
      showToast('Failed to delete inquiry lead.', 'error');
    }
  };

  window.adminOpenInquiryModal = function (id) {
    const inquiry = STATE.inquiries.find(i => String(i._id) === String(id));
    if (!inquiry) return;

    elModalInquiryTitle.textContent = `Inquiry from ${inquiry.name}`;
    elModalInquiryContent.innerHTML = `
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px;">
        <div>
          <label style="font-size:11px; color:var(--adm-text-dim); text-transform:uppercase; font-weight:600;">Client Name</label>
          <div style="font-weight:600; color:#fff; font-size:14px;">${escapeHtml(inquiry.name)}</div>
        </div>
        <div>
          <label style="font-size:11px; color:var(--adm-text-dim); text-transform:uppercase; font-weight:600;">Work Email</label>
          <div><a href="${sanitizeUrl(`mailto:${encodeURIComponent(inquiry.email || '')}`)}" style="color:var(--adm-blue);">${escapeHtml(inquiry.email)}</a></div>
        </div>
        <div>
          <label style="font-size:11px; color:var(--adm-text-dim); text-transform:uppercase; font-weight:600;">Requested Service</label>
          <div style="color:#fff;">${escapeHtml(inquiry.service || 'Software Engineering')}</div>
        </div>
        <div>
          <label style="font-size:11px; color:var(--adm-text-dim); text-transform:uppercase; font-weight:600;">Budget Allocation</label>
          <div><span class="status-pill status-new">${escapeHtml(inquiry.budget || 'Not specified')}</span></div>
        </div>
      </div>

      <div style="margin-bottom: 16px;">
        <label style="font-size:11px; color:var(--adm-text-dim); text-transform:uppercase; font-weight:600; display:block; margin-bottom:6px;">Project Description / Architecture Need</label>
        <div style="background:rgba(11, 17, 32, 0.8); border:1px solid var(--adm-border); border-radius:8px; padding:14px; font-size:13.5px; line-height:1.6; color:#cbd5e1; white-space:pre-wrap;">${escapeHtml(inquiry.message || 'No project description attached.')}</div>
      </div>

      <div style="font-size:11.5px; color:var(--adm-text-dim); display:flex; justify-content:space-between;">
        <span>IP: ${escapeHtml(inquiry.ipAddress || 'Unknown')}</span>
        <span>Submitted: ${new Date(inquiry.createdAt).toLocaleString()}</span>
      </div>
    `;

    const safeReplyMail = sanitizeUrl(`mailto:${encodeURIComponent(inquiry.email || '')}?subject=Sukunix Engineering - Regarding your project inquiry`);
    elModalInquiryFooter.innerHTML = `
      <a href="${safeReplyMail}" class="btn btn-primary btn-sm">
        Reply via Email
      </a>
      <button class="btn btn-outline btn-sm" onclick="document.getElementById('inquiry-modal').style.display='none'">
        Close
      </button>
    `;

    elInquiryModal.style.display = 'flex';
  };

  // Close Modal
  if (elBtnCloseInquiryModal) {
    elBtnCloseInquiryModal.addEventListener('click', () => {
      elInquiryModal.style.display = 'none';
    });
  }

  if (elInquiryModal) {
    elInquiryModal.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-backdrop')) {
        elInquiryModal.style.display = 'none';
      }
    });
  }

  // Refresh Button
  if (elBtnRefresh) {
    elBtnRefresh.addEventListener('click', async () => {
      showToast('Refreshing live telemetry and tables...', 'success');
      await loadAllDashboardData();
    });
  }

  // Export CSV Button
  if (elBtnExportCsv) {
    elBtnExportCsv.addEventListener('click', () => {
      const type = STATE.activeTab === 'tab-bookings' ? 'bookings' : 'inquiries';
      const url = `${API_BASE}/api/admin/export/${type}?token=${encodeURIComponent(STATE.token)}`;
      window.open(url, '_blank');
      showToast(`Exporting ${type} as CSV...`, 'success');
    });
  }

  // Tab Switching
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      STATE.activeTab = targetTab;

      // Update button active class
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update pane active class
      document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.toggle('active', pane.id === targetTab);
      });
    });
  });

  // Debounce search inputs
  let bookingsSearchTimeout;
  if (elBookingsSearch) {
    elBookingsSearch.addEventListener('input', (e) => {
      clearTimeout(bookingsSearchTimeout);
      bookingsSearchTimeout = setTimeout(() => {
        STATE.bookingsSearch = e.target.value.trim();
        fetchBookings();
      }, 300);
    });
  }

  if (elBookingsStatusFilter) {
    elBookingsStatusFilter.addEventListener('change', (e) => {
      STATE.bookingsStatus = e.target.value;
      fetchBookings();
    });
  }

  let inquiriesSearchTimeout;
  if (elInquiriesSearch) {
    elInquiriesSearch.addEventListener('input', (e) => {
      clearTimeout(inquiriesSearchTimeout);
      inquiriesSearchTimeout = setTimeout(() => {
        STATE.inquiriesSearch = e.target.value.trim();
        fetchInquiries();
      }, 300);
    });
  }

  if (elInquiriesStatusFilter) {
    elInquiriesStatusFilter.addEventListener('change', (e) => {
      STATE.inquiriesStatus = e.target.value;
      fetchInquiries();
    });
  }

  // Start Auth Check on Page Load
  initAuth();
})();
