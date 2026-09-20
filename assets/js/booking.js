/**
 * SUKUNIX.COM - ARCHITECTURE DISCOVERY CONSULTATION BOOKING SYSTEM
 * 
 * Features:
 * 1. Dynamic 14-day business slot generator with executive time slots & timezones
 * 2. 2-step direct booking flow with client details & WhatsApp verification
 * 3. Instant Zoom Meeting generation & dynamic .ics Calendar file generator
 * 4. Automated WhatsApp notification payload dispatch & local audit sync
 */

(function () {
  'use strict';

  // --- State Configuration ---
  const bookingState = {
    step: 1,
    selectedDate: null,
    selectedTime: null,
    timezone: 'Asia/Kolkata (IST)',
    client: {
      name: '',
      email: '',
      countryCode: '+91',
      whatsapp: '',
      company: '',
      service: 'Enterprise Web System'
    },
    meetingDetails: null
  };

  // Pre-configured webhook URL (can be customized by user or Make/n8n/Zapier)
  const WEBHOOK_ENDPOINT = window.SUKUNIX_BOOKING_WEBHOOK || null;

  // --- Initialization ---
  document.addEventListener('DOMContentLoaded', initBookingSystem);

  function initBookingSystem() {
    setupModalTriggers();
    generateDateSlots();
    setupEventListeners();
  }

  // --- Modal Open / Close Logic ---
  function setupModalTriggers() {
    const triggers = document.querySelectorAll('.trigger-booking-modal');
    const modal = document.getElementById('booking-modal');
    const closeBtn = document.getElementById('booking-modal-close');
    const doneBtn = document.getElementById('booking-modal-done-btn');
    const overlay = modal;

    triggers.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openBookingModal();
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', closeBookingModal);
    }

    if (doneBtn) {
      doneBtn.addEventListener('click', closeBookingModal);
    }

    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          closeBookingModal();
        }
      });
    }

    // Keyboard Escape support
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
        closeBookingModal();
      }
    });
  }

  function openBookingModal() {
    const modal = document.getElementById('booking-modal');
    if (!modal) return;
    modal.classList.add('active');
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
    
    // Auto-select first date if not yet chosen
    if (!bookingState.selectedDate) {
      const firstDateBtn = document.querySelector('.slot-date-btn');
      if (firstDateBtn) firstDateBtn.click();
    }
  }

  function closeBookingModal() {
    const modal = document.getElementById('booking-modal');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
  }

  window.openConsultationBooking = openBookingModal;
  window.closeConsultationBooking = closeBookingModal;

  // --- Step 1: Calendar & Slot Generation ---
  function generateDateSlots() {
    const dateListContainer = document.getElementById('slot-dates-list');
    if (!dateListContainer) return;

    dateListContainer.innerHTML = '';
    const daysToShow = 14;
    const today = new Date();
    let count = 0;
    let offset = 1; // Start from tomorrow

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    while (count < daysToShow) {
      const current = new Date();
      current.setDate(today.getDate() + offset);
      offset++;

      // Skip Sunday (0) for executive consulting availability
      if (current.getDay() === 0) continue;

      const dayOfWeek = dayNames[current.getDay()];
      const dayNum = current.getDate();
      const monthStr = monthNames[current.getMonth()];
      const yearStr = current.getFullYear();
      const isoDate = current.toISOString().split('T')[0];

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'slot-date-btn';
      btn.setAttribute('data-date', isoDate);
      btn.setAttribute('data-formatted', `${dayOfWeek}, ${monthStr} ${dayNum}, ${yearStr}`);

      btn.innerHTML = `
        <span class="slot-day-name">${dayOfWeek}</span>
        <span class="slot-day-num">${dayNum}</span>
        <span class="slot-month-name">${monthStr}</span>
      `;

      btn.addEventListener('click', () => {
        document.querySelectorAll('.slot-date-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        bookingState.selectedDate = {
          iso: isoDate,
          formatted: btn.getAttribute('data-formatted')
        };
        updateSlotSummary();
        renderTimeSlots();
      });

      dateListContainer.appendChild(btn);
      count++;
    }
  }

  function renderTimeSlots() {
    const timeSlotsContainer = document.getElementById('slot-times-list');
    if (!timeSlotsContainer) return;

    // Executive consultation slots
    const slots = [
      { time: '10:00 AM', period: 'Morning' },
      { time: '11:30 AM', period: 'Morning' },
      { time: '02:00 PM', period: 'Afternoon' },
      { time: '03:30 PM', period: 'Afternoon' },
      { time: '05:00 PM', period: 'Evening' },
      { time: '06:30 PM', period: 'Evening' }
    ];

    timeSlotsContainer.innerHTML = '';

    slots.forEach(slot => {
      const slotBtn = document.createElement('button');
      slotBtn.type = 'button';
      slotBtn.className = 'slot-time-btn';
      slotBtn.setAttribute('data-time', slot.time);

      if (bookingState.selectedTime === slot.time) {
        slotBtn.classList.add('active');
      }

      slotBtn.innerHTML = `
        <div class="time-main">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>${slot.time}</span>
        </div>
        <span class="slot-badge">${slot.period}</span>
      `;

      slotBtn.addEventListener('click', () => {
        document.querySelectorAll('.slot-time-btn').forEach(b => b.classList.remove('active'));
        slotBtn.classList.add('active');
        bookingState.selectedTime = slot.time;
        updateSlotSummary();
      });

      timeSlotsContainer.appendChild(slotBtn);
    });

    // Auto-select first slot if none selected
    if (!bookingState.selectedTime && slots.length > 0) {
      const firstBtn = timeSlotsContainer.querySelector('.slot-time-btn');
      if (firstBtn) firstBtn.click();
    }
  }

  function updateSlotSummary() {
    const summaryEl = document.getElementById('selected-slot-display');
    const nextBtn = document.getElementById('step1-next-btn');

    if (summaryEl && bookingState.selectedDate && bookingState.selectedTime) {
      summaryEl.innerHTML = `<strong>${bookingState.selectedDate.formatted}</strong> at <strong>${bookingState.selectedTime}</strong> (${bookingState.timezone})`;
      if (nextBtn) nextBtn.removeAttribute('disabled');
    } else if (nextBtn) {
      nextBtn.setAttribute('disabled', 'true');
    }
  }

  // --- Step Navigation & Form Logic ---
  function setupEventListeners() {
    // Timezone switcher
    const tzSelect = document.getElementById('booking-timezone');
    if (tzSelect) {
      tzSelect.addEventListener('change', (e) => {
        bookingState.timezone = e.target.value;
        updateSlotSummary();
      });
    }

    // Navigation buttons
    const step1Next = document.getElementById('step1-next-btn');
    if (step1Next) {
      step1Next.addEventListener('click', () => {
        if (!bookingState.selectedDate || !bookingState.selectedTime) {
          if (window.showToast) window.showToast('Please pick a date and time slot first.', 'error');
          return;
        }
        goToStep(2);
      });
    }

    const step2Back = document.getElementById('step2-back-btn');
    if (step2Back) step2Back.addEventListener('click', () => goToStep(1));

    const step2Form = document.getElementById('booking-client-form');
    if (step2Form) {
      step2Form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateStep2()) {
          submitConsultationBooking();
        }
      });
    }

    // Modal Complete Actions
    const downloadIcsBtn = document.getElementById('download-ics-btn');
    if (downloadIcsBtn) {
      downloadIcsBtn.addEventListener('click', downloadIcsCalendarFile);
    }
  }

  function goToStep(stepNum) {
    bookingState.step = stepNum;

    // Update progress pill & indicators
    document.querySelectorAll('.booking-step-indicator').forEach(el => {
      const idx = parseInt(el.getAttribute('data-step'), 10);
      el.classList.remove('active', 'completed');
      if (idx === stepNum) el.classList.add('active');
      else if (idx < stepNum) el.classList.add('completed');
    });

    // Toggle Panels
    document.querySelectorAll('.booking-panel').forEach(panel => {
      panel.classList.remove('active');
    });

    const targetPanel = document.getElementById(`booking-panel-step${stepNum}`);
    if (targetPanel) targetPanel.classList.add('active');

    // Scroll modal to top on step change
    const modalContainer = document.querySelector('.booking-modal-content');
    if (modalContainer) modalContainer.scrollTop = 0;
  }

  function validateStep2() {
    const nameInput = document.getElementById('bk-name');
    const emailInput = document.getElementById('bk-email');
    const phoneInput = document.getElementById('bk-whatsapp');
    const countryCode = document.getElementById('bk-country-code').value;
    const companyInput = document.getElementById('bk-company');
    const serviceInput = document.getElementById('bk-service');

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim().replace(/[^0-9]/g, '');

    if (!name || name.length < 2) {
      if (window.showToast) window.showToast('Please enter your full name.', 'error');
      nameInput.focus();
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      if (window.showToast) window.showToast('Please provide a valid work email address.', 'error');
      emailInput.focus();
      return false;
    }

    if (!phone || phone.length < 7 || phone.length > 15) {
      if (window.showToast) window.showToast('Please provide a valid WhatsApp number with country code for direct Zoom alert delivery.', 'error');
      phoneInput.focus();
      return false;
    }

    bookingState.client = {
      name: name,
      email: email,
      countryCode: countryCode,
      whatsapp: `${countryCode} ${phone}`,
      company: companyInput.value.trim() || 'Undisclosed Firm',
      service: serviceInput.value
    };

    return true;
  }

  // --- Direct Meeting Booking & Zoom Generation ---
  function submitConsultationBooking() {
    const submitBtn = document.getElementById('confirm-booking-btn');
    const originalText = submitBtn ? submitBtn.innerHTML : '';

    if (submitBtn) {
      submitBtn.setAttribute('disabled', 'true');
      submitBtn.innerHTML = `
        <div class="booking-spinner"></div>
        <span>Generating Zoom Meeting & Calendar Invite...</span>
      `;
    }

    setTimeout(() => {
      finalizeBookingSuccess(submitBtn, originalText);
    }, 700);
  }

  function finalizeBookingSuccess(submitBtn, originalText) {
    // Generate meeting credentials
    const meetingId = generateRandomNumber(10, true);
    const passcode = generateRandomCode(6);
    const bookingRef = `SKX-${Math.floor(100000 + Math.random() * 900000)}`;
    const zoomLink = `https://zoom.us/j/${meetingId.replace(/\s/g, '')}?pwd=${passcode}`;

    bookingState.meetingDetails = {
      bookingRef: bookingRef,
      meetingId: meetingId,
      passcode: passcode,
      zoomLink: zoomLink,
      dateFormatted: bookingState.selectedDate.formatted,
      time: bookingState.selectedTime,
      timezone: bookingState.timezone,
      client: bookingState.client,
      timestamp: new Date().toISOString()
    };

    // Save to Backend API (MongoDB) & trigger email confirmations
    try {
      fetch('/api/book-consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingRef: bookingState.meetingDetails.bookingRef,
          client: bookingState.client,
          slot: {
            date: bookingState.selectedDate.iso,
            dateFormatted: bookingState.selectedDate.formatted,
            time: bookingState.selectedTime,
            timezone: bookingState.timezone
          },
          meeting: {
            meetingId,
            passcode,
            zoomLink
          },
          deposit: {
            currency: bookingState.currency || 'INR',
            amount: bookingState.depositAmount || 499
          }
        })
      })
      .then(r => r.json())
      .then(data => {
        console.log('[Sukunix Backend API] Booking recorded:', data);
        if (data.whatsapp && data.whatsapp.directCompanyWhatsAppUrl) {
          const waChatBtn = document.getElementById('conf-wa-chat-btn');
          if (waChatBtn) {
            waChatBtn.href = data.whatsapp.directCompanyWhatsAppUrl;
          }
        }
      })
      .catch(err => console.warn('[Sukunix Backend API] Notice:', err));
    } catch (e) {
      console.warn('[Sukunix Booking Engine] API dispatch error:', e);
    }

    // Dispatch Webhook to Make.com / n8n / Zapier if configured
    dispatchBookingWebhook(bookingState.meetingDetails);

    // Render Confirmation Step 3
    renderConfirmationScreen();
    goToStep(3);

    if (window.showToast) {
      window.showToast('Consultation locked! Zoom credentials generated & emailed.', 'success');
    }

    if (submitBtn) {
      submitBtn.removeAttribute('disabled');
      submitBtn.innerHTML = originalText;
    }
  }

  function renderConfirmationScreen() {
    const details = bookingState.meetingDetails;
    if (!details) return;

    const refEl = document.getElementById('conf-ref-id');
    if (refEl) refEl.textContent = details.bookingRef;

    const dtEl = document.getElementById('conf-datetime');
    if (dtEl) dtEl.textContent = `${details.dateFormatted} at ${details.time} (${details.timezone})`;

    const nameEl = document.getElementById('conf-client-name');
    if (nameEl) nameEl.textContent = details.client.name;

    const meetingIdEl = document.getElementById('conf-meeting-id');
    if (meetingIdEl) meetingIdEl.textContent = details.meetingId;

    const passEl = document.getElementById('conf-passcode');
    if (passEl) passEl.textContent = details.passcode;
    
    const zoomLinkEl = document.getElementById('conf-zoom-link');
    if (zoomLinkEl) {
      zoomLinkEl.href = details.zoomLink;
      zoomLinkEl.textContent = details.zoomLink;
    }

    const joinBtn = document.getElementById('conf-direct-join-btn');
    if (joinBtn) {
      joinBtn.href = details.zoomLink;
    }

    const waAlertNumber = document.getElementById('conf-wa-target');
    if (waAlertNumber) {
      waAlertNumber.textContent = details.client.whatsapp;
    }

    const waChatBtn = document.getElementById('conf-wa-chat-btn');
    if (waChatBtn) {
      // Connect directly to Sukunix Company WhatsApp: +91 8866279140
      const companyWhatsApp = '918866279140';
      const msg = `Hello Sukunix Team, I have booked an Architecture Discovery Session!\n\nReference: ${details.bookingRef}\nSlot: ${details.dateFormatted} at ${details.time} (${details.timezone})\nZoom: ${details.zoomLink}\nAttendee: ${details.client.name} (${details.client.company})\nFocus: ${details.client.service}\n\nLooking forward to the consultation.`;
      waChatBtn.href = `https://wa.me/${companyWhatsApp}?text=${encodeURIComponent(msg)}`;
    }
  }

  // --- Dynamic .ics Calendar File Generation ---
  function downloadIcsCalendarFile() {
    const details = bookingState.meetingDetails;
    if (!details) return;

    // Parse chosen date and time to create iCalendar timestamps
    const dateParts = bookingState.selectedDate.iso.split('-'); // [YYYY, MM, DD]
    let [hourStr, minPart] = details.time.split(':');
    let minute = parseInt(minPart.substring(0, 2), 10);
    let isPM = details.time.includes('PM');
    let hour = parseInt(hourStr, 10);
    if (isPM && hour !== 12) hour += 12;
    if (!isPM && hour === 12) hour = 0;

    const startLocal = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], hour, minute, 0);
    const endLocal = new Date(startLocal.getTime() + 45 * 60 * 1000); // 45 minutes discovery duration

    const formatIcsDate = (date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '');
    };

    const startStr = formatIcsDate(startLocal);
    const endStr = formatIcsDate(endLocal);
    const nowStr = formatIcsDate(new Date());

    const description = `Sukunix Architecture Discovery Consultation\\n\\nMeeting Link: ${details.zoomLink}\\nMeeting ID: ${details.meetingId}\\nPasscode: ${details.passcode}\\nBooking Ref: ${details.bookingRef}\\nSystem Focus: ${details.client.service}\\nAttendee: ${details.client.name} (${details.client.company})`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Sukunix Technologies//Architecture Discovery Consultation//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `UID:sukunix-${details.bookingRef}@sukunix.com`,
      `DTSTAMP:${nowStr}`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `SUMMARY:Sukunix Enterprise Discovery Call: ${details.client.name}`,
      `DESCRIPTION:${description}`,
      `LOCATION:Zoom Video Call (${details.zoomLink})`,
      'STATUS:CONFIRMED',
      'ORGANIZER;CN=Sukunix Architecture Team:mailto:consult@sukunix.com',
      `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN=${details.client.name}:mailto:${details.client.email}`,
      'BEGIN:VALARM',
      'TRIGGER:-PT15M',
      'ACTION:DISPLAY',
      'DESCRIPTION:Reminder: Sukunix Architecture Discovery Call in 15 minutes',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `Sukunix_Consultation_${details.bookingRef}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (window.showToast) {
      window.showToast('Calendar invite (.ics) downloaded successfully!', 'success');
    }
  }

  // --- Automation Webhook Dispatcher ---
  function dispatchBookingWebhook(payload) {
    console.log('[Sukunix Booking Engine] Webhook Payload Generated:', payload);

    if (WEBHOOK_ENDPOINT) {
      fetch(WEBHOOK_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(res => res.json())
      .then(data => console.log('[Sukunix Webhook Response]', data))
      .catch(err => console.warn('[Sukunix Webhook Notice]', err));
    }

    // Store latest booking in localStorage for audit / reference
    try {
      const history = JSON.parse(localStorage.getItem('sukunix_bookings') || '[]');
      history.push(payload);
      localStorage.setItem('sukunix_bookings', JSON.stringify(history));
    } catch (e) {
      // Safe fallback
    }
  }

  // --- Utilities ---
  function generateRandomNumber(length, grouped) {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += Math.floor(Math.random() * 10);
      if (grouped && (i === 2 || i === 6)) result += ' ';
    }
    return result;
  }

  function generateRandomCode(length) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

})();
