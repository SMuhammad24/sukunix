/**
 * SUKUNIX.COM - INTERACTIVE PROJECT SCOPE & COST ESTIMATOR
 * Official brochure-aligned package calculator (Basic, Advance, Premium)
 */

(function () {
  'use strict';

  // Preset Definitions matching Sukunix Official Brochure
  const presets = {
    basic: {
      name: 'Basic Plan',
      platform: 'static',
      design: 'minimal',
      features: [],
      timeline: 'standard',
      priceDisplay: '₹25,000 – ₹40,000',
      weeksDisplay: '2 - 3 Weeks Delivery',
      serviceValue: 'Basic Plan (₹25,000 - ₹40,000)'
    },
    advance: {
      name: 'Advance Plan',
      platform: 'dynamic',
      design: 'advanced_ux',
      features: ['cms', 'dashboard', 'rbac', 'cloud_pods'],
      timeline: 'standard',
      priceDisplay: '₹60,000 – ₹95,000',
      weeksDisplay: '4 - 6 Weeks Delivery',
      serviceValue: 'Advance Plan (₹60,000 - ₹95,000)'
    },
    premium: {
      name: 'Premium Plan',
      platform: 'enterprise',
      design: 'immersive_3d',
      features: ['three_js', 'ai_marketing', 'cloud_pods', 'dashboard', 'rbac', 'encryption'],
      timeline: 'standard',
      priceDisplay: '₹1,80,000 – ₹3,00,000+',
      weeksDisplay: '8 - 12 Weeks Delivery',
      serviceValue: 'Premium Plan (₹1,80,000 - ₹3,00,000+)'
    }
  };

  // Base state (Defaults to Advance Plan - Most Popular)
  const estimatorState = {
    currentPreset: 'advance',
    platform: 'dynamic',
    platformPrice: 50000,
    platformWeeks: 4,
    platformName: '5–15 Dynamic Pages',

    design: 'advanced_ux',
    designMultiplier: 1.2,
    designName: 'Modern UI/UX Design',

    features: {
      cms: { selected: true, price: 10000, weeks: 1, name: 'Blog or Custom CMS Integration' },
      dashboard: { selected: true, price: 14000, weeks: 1.5, name: 'User Login & Dashboard System' },
      rbac: { selected: true, price: 8000, weeks: 1, name: 'Role-Based Access Control' },
      encryption: { selected: false, price: 8000, weeks: 0.5, name: 'Advanced Data Encryption' },
      cloud_pods: { selected: true, price: 12000, weeks: 1, name: 'Cloud Pods Tracking Tool' },
      three_js: { selected: false, price: 40000, weeks: 3, name: 'WebGL / Three.js 3D Animations' },
      ai_marketing: { selected: false, price: 25000, weeks: 2, name: 'AI-Powered Marketing Analytics' }
    },

    timeline: 'standard',
    timelineMultiplier: 1.0,
    timelineName: 'Standard Agile Cadence'
  };

  const platforms = {
    static: { price: 25000, weeks: 2, name: '5–15 Static Pages' },
    dynamic: { price: 50000, weeks: 4, name: '5–15 Dynamic Pages' },
    fullstack: { price: 80000, weeks: 6, name: 'Web App + User Dashboard' },
    enterprise: { price: 150000, weeks: 9, name: 'Unlimited Pages & Custom Dashboards' }
  };

  const designs = {
    minimal: { multiplier: 1.0, name: 'Modern Minimalistic 2D Design' },
    advanced_ux: { multiplier: 1.2, name: 'Modern UI/UX Design' },
    immersive_3d: { multiplier: 1.45, name: 'Fully Immersive 3D Web Experience' }
  };

  const timelines = {
    standard: { multiplier: 1.0, name: 'Standard Agile Cadence' },
    accelerated: { multiplier: 1.15, name: 'Accelerated Delivery' },
    rush: { multiplier: 1.3, name: 'Priority Sprint' }
  };

  function formatCurrencyINR(val) {
    return '₹' + Math.round(val).toLocaleString('en-IN');
  }

  function calculateEstimate() {
    const costDisplay = document.getElementById('estimate-cost-display');
    const weeksDisplay = document.getElementById('estimate-weeks-display');
    const breakdownPlatform = document.getElementById('breakdown-platform');
    const breakdownDesign = document.getElementById('breakdown-design');
    const breakdownFeaturesCount = document.getElementById('breakdown-features-count');
    const breakdownTimeline = document.getElementById('breakdown-timeline');

    // If matches an exact preset without custom alterations
    if (estimatorState.currentPreset && presets[estimatorState.currentPreset]) {
      const p = presets[estimatorState.currentPreset];
      if (costDisplay) costDisplay.textContent = p.priceDisplay;
      if (weeksDisplay) weeksDisplay.textContent = p.weeksDisplay;
    } else {
      // Dynamic Custom Calculation
      let featureCost = 0;
      let featureWeeks = 0;

      Object.keys(estimatorState.features).forEach(key => {
        const feat = estimatorState.features[key];
        if (feat.selected) {
          featureCost += feat.price;
          featureWeeks += feat.weeks;
        }
      });

      const baseTotal = (estimatorState.platformPrice + featureCost) * estimatorState.designMultiplier;
      const finalMin = baseTotal * estimatorState.timelineMultiplier;
      const finalMax = Math.round(finalMin * 1.38 / 1000) * 1000;
      const minRounded = Math.round(finalMin / 1000) * 1000;

      let totalWeeks = Math.max(2, Math.round((estimatorState.platformWeeks + featureWeeks) / estimatorState.timelineMultiplier));

      if (costDisplay) {
        costDisplay.textContent = `${formatCurrencyINR(minRounded)} – ${formatCurrencyINR(finalMax)}`;
      }
      if (weeksDisplay) {
        weeksDisplay.textContent = `${totalWeeks} - ${totalWeeks + 2} Weeks Delivery`;
      }
    }

    if (breakdownPlatform) {
      breakdownPlatform.textContent = estimatorState.platformName;
    }
    if (breakdownDesign) {
      breakdownDesign.textContent = estimatorState.designName;
    }
    if (breakdownFeaturesCount) {
      const selectedCount = Object.values(estimatorState.features).filter(f => f.selected).length;
      breakdownFeaturesCount.textContent = `${selectedCount} Modules Selected`;
    }
    if (breakdownTimeline) {
      breakdownTimeline.textContent = estimatorState.timelineName;
    }
  }

  function applyPreset(presetKey) {
    if (!presets[presetKey]) return;
    const p = presets[presetKey];
    estimatorState.currentPreset = presetKey;

    // Highlight preset pill
    document.querySelectorAll('.preset-pill').forEach(pill => {
      pill.classList.toggle('active', pill.getAttribute('data-preset') === presetKey);
    });

    // Set platform
    if (platforms[p.platform]) {
      estimatorState.platform = p.platform;
      estimatorState.platformPrice = platforms[p.platform].price;
      estimatorState.platformWeeks = platforms[p.platform].weeks;
      estimatorState.platformName = platforms[p.platform].name;
      document.querySelectorAll('[data-estimator="platform"]').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-value') === p.platform);
      });
    }

    // Set design
    if (designs[p.design]) {
      estimatorState.design = p.design;
      estimatorState.designMultiplier = designs[p.design].multiplier;
      estimatorState.designName = designs[p.design].name;
      document.querySelectorAll('[data-estimator="design"]').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-value') === p.design);
      });
    }

    // Set timeline
    if (timelines[p.timeline]) {
      estimatorState.timeline = p.timeline;
      estimatorState.timelineMultiplier = timelines[p.timeline].multiplier;
      estimatorState.timelineName = timelines[p.timeline].name;
      document.querySelectorAll('[data-estimator="timeline"]').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-value') === p.timeline);
      });
    }

    // Set features
    Object.keys(estimatorState.features).forEach(key => {
      const shouldSelect = p.features.includes(key);
      estimatorState.features[key].selected = shouldSelect;
      const checkbox = document.querySelector(`input[data-estimator="feature"][value="${key}"]`);
      if (checkbox) {
        checkbox.checked = shouldSelect;
        const parentCard = checkbox.closest('.checkbox-card');
        if (parentCard) parentCard.classList.toggle('checked', shouldSelect);
      }
    });

    calculateEstimate();
  }

  window.setEstimatorPreset = function (presetKey) {
    applyPreset(presetKey);
    const estimatorSection = document.getElementById('estimator');
    if (estimatorSection) {
      estimatorSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  function initEstimator() {
    // Preset Buttons
    const presetPills = document.querySelectorAll('.preset-pill');
    presetPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const key = pill.getAttribute('data-preset');
        if (key === 'custom') {
          estimatorState.currentPreset = null;
          presetPills.forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          calculateEstimate();
        } else if (presets[key]) {
          applyPreset(key);
        }
      });
    });

    // Platform Buttons
    const platformBtns = document.querySelectorAll('[data-estimator="platform"]');
    platformBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        platformBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const key = btn.getAttribute('data-value');
        if (platforms[key]) {
          estimatorState.platform = key;
          estimatorState.platformPrice = platforms[key].price;
          estimatorState.platformWeeks = platforms[key].weeks;
          estimatorState.platformName = platforms[key].name;
          // Switch to custom preset
          estimatorState.currentPreset = null;
          document.querySelectorAll('.preset-pill').forEach(p => p.classList.remove('active'));
          const customPill = document.querySelector('.preset-pill[data-preset="custom"]');
          if (customPill) customPill.classList.add('active');
          calculateEstimate();
        }
      });
    });

    // Design Buttons
    const designBtns = document.querySelectorAll('[data-estimator="design"]');
    designBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        designBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const key = btn.getAttribute('data-value');
        if (designs[key]) {
          estimatorState.design = key;
          estimatorState.designMultiplier = designs[key].multiplier;
          estimatorState.designName = designs[key].name;
          estimatorState.currentPreset = null;
          document.querySelectorAll('.preset-pill').forEach(p => p.classList.remove('active'));
          const customPill = document.querySelector('.preset-pill[data-preset="custom"]');
          if (customPill) customPill.classList.add('active');
          calculateEstimate();
        }
      });
    });

    // Timeline Buttons
    const timelineBtns = document.querySelectorAll('[data-estimator="timeline"]');
    timelineBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        timelineBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const key = btn.getAttribute('data-value');
        if (timelines[key]) {
          estimatorState.timeline = key;
          estimatorState.timelineMultiplier = timelines[key].multiplier;
          estimatorState.timelineName = timelines[key].name;
          estimatorState.currentPreset = null;
          document.querySelectorAll('.preset-pill').forEach(p => p.classList.remove('active'));
          const customPill = document.querySelector('.preset-pill[data-preset="custom"]');
          if (customPill) customPill.classList.add('active');
          calculateEstimate();
        }
      });
    });

    // Feature Checkboxes
    const featureCheckboxes = document.querySelectorAll('[data-estimator="feature"]');
    featureCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const key = e.target.value;
        const parentCard = e.target.closest('.checkbox-card');
        if (estimatorState.features[key]) {
          estimatorState.features[key].selected = e.target.checked;
          if (parentCard) {
            parentCard.classList.toggle('checked', e.target.checked);
          }
          estimatorState.currentPreset = null;
          document.querySelectorAll('.preset-pill').forEach(p => p.classList.remove('active'));
          const customPill = document.querySelector('.preset-pill[data-preset="custom"]');
          if (customPill) customPill.classList.add('active');
          calculateEstimate();
        }
      });
    });

    // Book Consultation for this configured plan button
    const bookConfiguredBtn = document.getElementById('book-configured-plan');
    if (bookConfiguredBtn) {
      bookConfiguredBtn.addEventListener('click', () => {
        const costText = document.getElementById('estimate-cost-display')?.textContent || 'Custom Scope';
        let planLabel = 'Custom Plan (' + costText + ')';
        if (estimatorState.currentPreset && presets[estimatorState.currentPreset]) {
          planLabel = presets[estimatorState.currentPreset].serviceValue;
        }

        const serviceSelect = document.getElementById('bk-service');
        if (serviceSelect) {
          let found = false;
          for (let i = 0; i < serviceSelect.options.length; i++) {
            if (serviceSelect.options[i].value.includes(planLabel.split(' ')[0])) {
              serviceSelect.selectedIndex = i;
              found = true;
              break;
            }
          }
          if (!found) {
            const opt = new Option(planLabel, planLabel, true, true);
            serviceSelect.add(opt);
          }
        }

        if (window.openConsultationBooking) {
          window.openConsultationBooking();
        } else {
          const modal = document.getElementById('booking-modal');
          if (modal) modal.classList.add('active');
        }
      });
    }

    // Apply to Inquiry Form button
    const applyBtn = document.getElementById('apply-estimate-to-form');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        const contactSection = document.getElementById('contact');
        const messageInput = document.getElementById('project-message');
        const serviceSelect = document.getElementById('project-service');

        if (serviceSelect) {
          if (estimatorState.platform === 'static') serviceSelect.value = 'software';
          else if (estimatorState.platform === 'dynamic') serviceSelect.value = 'software';
          else if (estimatorState.platform === 'fullstack') serviceSelect.value = 'software';
          else if (estimatorState.platform === 'enterprise') serviceSelect.value = 'cloud';
        }

        const selectedFeaturesList = Object.values(estimatorState.features)
          .filter(f => f.selected)
          .map(f => f.name)
          .join(', ') || 'Standard Core Features';

        const costText = document.getElementById('estimate-cost-display')?.textContent || '₹60,000 – ₹95,000';
        const timelineText = document.getElementById('estimate-weeks-display')?.textContent || '4-6 Weeks Delivery';

        let planTitle = 'Custom Architecture Scope';
        if (estimatorState.currentPreset && presets[estimatorState.currentPreset]) {
          planTitle = presets[estimatorState.currentPreset].name;
        }

        if (messageInput) {
          messageInput.value = `[Sukunix Plan Selection: ${planTitle}]\nEstimated Price: ${costText}\nEstimated Timeline: ${timelineText}\nSelected Architecture: ${estimatorState.platformName}\nDesign Fidelity: ${estimatorState.designName}\nIncluded Modules: ${selectedFeaturesList}\n\nProject Overview / Requirements:\n`;
        }

        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth' });
          if (window.showToast) {
            window.showToast(`${planTitle} details applied to your message form.`, 'success');
          }
        }
      });
    }

    // Initialize with default preset (Advance Plan)
    applyPreset('advance');
  }

  document.addEventListener('DOMContentLoaded', initEstimator);
})();
