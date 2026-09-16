/**
 * SUKUNIX.COM - INTERACTIVE PROJECT SCOPE & COST ESTIMATOR
 * Clean, transparent estimation calculation
 */

(function () {
  'use strict';

  // Base state
  const estimatorState = {
    platform: 'webapp',
    platformPrice: 8500,
    platformWeeks: 6,
    platformName: 'Custom Web Application',

    design: 'bespoke',
    designMultiplier: 1.25,
    designName: 'Custom Design System',

    features: {
      auth: { selected: true, price: 1500, weeks: 1, name: 'Authentication & User Roles' },
      ai: { selected: false, price: 3500, weeks: 2, name: 'AI / Intelligent Automation' },
      payments: { selected: false, price: 2000, weeks: 1.5, name: 'Payment & Invoicing Gateway' },
      realtime: { selected: false, price: 1800, weeks: 1, name: 'Real-Time Notifications & Sync' },
      devops: { selected: true, price: 2200, weeks: 1, name: 'Automated CI/CD & Cloud Setup' }
    },

    timeline: 'standard',
    timelineMultiplier: 1.0,
    timelineName: 'Standard Agile Cadence'
  };

  const platforms = {
    webapp: { price: 8500, weeks: 6, name: 'Custom Web Application' },
    mobile: { price: 9500, weeks: 7, name: 'Mobile App' },
    ai: { price: 12500, weeks: 8, name: 'AI / Data System' },
    enterprise: { price: 16000, weeks: 10, name: 'Cloud Infrastructure' }
  };

  const designs = {
    standard: { multiplier: 1.0, name: 'Standard Clean UI' },
    bespoke: { multiplier: 1.25, name: 'Custom Design System' },
    premium: { multiplier: 1.5, name: 'Enterprise Polish' }
  };

  const timelines = {
    standard: { multiplier: 1.0, name: 'Standard Agile Cadence' },
    accelerated: { multiplier: 1.25, name: 'Accelerated Delivery' },
    rush: { multiplier: 1.5, name: 'Priority Sprint' }
  };

  function formatCurrency(val) {
    return '$' + Math.round(val).toLocaleString('en-US');
  }

  function calculateEstimate() {
    let featureCost = 0;
    let featureWeeks = 0;

    Object.keys(estimatorState.features).forEach(key => {
      const feat = estimatorState.features[key];
      if (feat.selected) {
        featureCost += feat.price;
        featureWeeks += feat.weeks;
      }
    });

    const subtotal = (estimatorState.platformPrice + featureCost) * estimatorState.designMultiplier;
    const finalMin = subtotal * estimatorState.timelineMultiplier;
    const finalMax = finalMin * 1.35;

    let totalWeeks = Math.max(3, Math.round((estimatorState.platformWeeks + featureWeeks) / (estimatorState.timelineMultiplier === 1.5 ? 1.5 : (estimatorState.timelineMultiplier === 1.25 ? 1.25 : 1.0))));

    // Update DOM
    const costDisplay = document.getElementById('estimate-cost-display');
    const weeksDisplay = document.getElementById('estimate-weeks-display');
    const breakdownPlatform = document.getElementById('breakdown-platform');
    const breakdownDesign = document.getElementById('breakdown-design');
    const breakdownFeaturesCount = document.getElementById('breakdown-features-count');
    const breakdownTimeline = document.getElementById('breakdown-timeline');

    if (costDisplay) {
      costDisplay.textContent = `${formatCurrency(finalMin)} – ${formatCurrency(finalMax)}`;
    }
    if (weeksDisplay) {
      weeksDisplay.textContent = `${totalWeeks} - ${totalWeeks + 2} Weeks`;
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

  function initEstimator() {
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
          calculateEstimate();
        }
      });
    });

    // Apply to Inquiry Form button
    const applyBtn = document.getElementById('apply-estimate-to-form');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        const contactSection = document.getElementById('contact');
        const messageInput = document.getElementById('project-message');
        const serviceSelect = document.getElementById('project-service');

        if (serviceSelect) {
          if (estimatorState.platform === 'webapp') serviceSelect.value = 'software';
          else if (estimatorState.platform === 'mobile') serviceSelect.value = 'mobile';
          else if (estimatorState.platform === 'ai') serviceSelect.value = 'ai';
          else if (estimatorState.platform === 'enterprise') serviceSelect.value = 'cloud';
        }

        const selectedFeaturesList = Object.values(estimatorState.features)
          .filter(f => f.selected)
          .map(f => f.name)
          .join(', ');

        const costText = document.getElementById('estimate-cost-display')?.textContent || '$15,000+';
        const timelineText = document.getElementById('estimate-weeks-display')?.textContent || '6-8 Weeks';

        if (messageInput) {
          messageInput.value = `[Estimator Scope Pre-fill]\nScope: ${estimatorState.platformName}\nDesign: ${estimatorState.designName}\nDelivery: ${timelineText}\nSelected Modules: ${selectedFeaturesList}\nBudget Range: ${costText}\n\nProject details:\n`;
        }

        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth' });
          if (window.showToast) {
            window.showToast('Project scope applied to your inquiry form.', 'success');
          }
        }
      });
    }

    calculateEstimate();
  }

  document.addEventListener('DOMContentLoaded', initEstimator);
})();
