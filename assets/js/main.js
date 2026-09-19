/**
 * SUKUNIX.COM - ENTERPRISE PROFESSIONAL SCRIPTS
 * Clean, high-performance, interactive modules
 */

(function () {
  'use strict';

  // -------------------------------------------------------------------------
  // 1. Toast Notification System
  // -------------------------------------------------------------------------
  window.showToast = function (message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';

    let iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    if (type === 'success') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    }

    toast.innerHTML = `${iconSvg} <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 4000);
  };

  // -------------------------------------------------------------------------
  // 2. Navigation & Active Link Spy
  // -------------------------------------------------------------------------
  function initNavigation() {
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileOverlay = document.getElementById('mobile-overlay');
    const mobileClose = document.getElementById('mobile-close');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
      const sections = document.querySelectorAll('section[id]');
      const scrollPos = window.scrollY + 130;

      sections.forEach((current) => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop;
        const sectionId = current.getAttribute('id');

        if (scrollPos > sectionTop && scrollPos <= sectionTop + sectionHeight) {
          navLinks.forEach((link) => {
            if (link.getAttribute('href') === `#${sectionId}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    });

    function openMobileMenu() {
      mobileMenu?.classList.add('open');
      mobileOverlay?.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
      mobileMenu?.classList.remove('open');
      mobileOverlay?.classList.remove('active');
      document.body.style.overflow = '';
    }

    mobileToggle?.addEventListener('click', openMobileMenu);
    mobileClose?.addEventListener('click', closeMobileMenu);
    mobileOverlay?.addEventListener('click', closeMobileMenu);

    document.querySelectorAll('.mobile-nav-links .nav-link').forEach((link) => {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  // -------------------------------------------------------------------------
  // 3. Interactive Code Sandbox Tabs in Hero
  // -------------------------------------------------------------------------
  function initCodeSandbox() {
    const tabs = document.querySelectorAll('.sandbox-tab');
    const codePane = document.getElementById('sandbox-code');
    if (!codePane || !tabs.length) return;

    const snippets = {
      go: `<span class="code-keyword">package</span> main

<span class="code-keyword">import</span> (
    <span class="code-str">"context"</span>
    <span class="code-str">"github.com/sukunix/engine"</span>
)

<span class="code-comment">// ProcessSettlement executes zero-loss atomic verification</span>
<span class="code-keyword">func</span> <span class="code-fn">ProcessSettlement</span>(ctx context.Context, tx *engine.Transaction) (*engine.Receipt, error) {
    ledger := engine.<span class="code-fn">NewLedgerPool</span>(<span class="code-num">12000</span>)
    <span class="code-keyword">if</span> err := ledger.<span class="code-fn">VerifyIdempotency</span>(tx.ID); err != nil {
        <span class="code-keyword">return</span> nil, err
    }
    receipt := ledger.<span class="code-fn">CommitAtomicMultiAZ</span>(ctx, tx)
    <span class="code-keyword">return</span> receipt, nil <span class="code-comment">// Latency: 12.4ms</span>
}`,

      tf: `<span class="code-keyword">module</span> <span class="code-str">"sukunix_eks_cluster"</span> {
  source          = <span class="code-str">"terraform-aws-modules/eks/aws"</span>
  version         = <span class="code-str">"20.8.4"</span>
  cluster_name    = <span class="code-str">"prod-sukunix-mesh"</span>
  cluster_version = <span class="code-str">"1.29"</span>

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  eks_managed_node_groups = {
    compute_nodes = {
      instance_types = [<span class="code-str">"c6i.2xlarge"</span>]
      min_size       = <span class="code-num">6</span>
      max_size       = <span class="code-num">64</span>
      desired_size   = <span class="code-num">12</span>
    }
  }
}`,

      py: `<span class="code-keyword">from</span> fastapi <span class="code-keyword">import</span> FastAPI
<span class="code-keyword">from</span> sukunix.ai <span class="code-keyword">import</span> VectorRAGPipeline

app = <span class="code-fn">FastAPI</span>(title=<span class="code-str">"Sukunix Enterprise Neural Search"</span>)
rag = <span class="code-fn">VectorRAGPipeline</span>(model=<span class="code-str">"text-embedding-3-large"</span>)

<span class="code-keyword">@app.post</span>(<span class="code-str">"/api/v1/query"</span>)
<span class="code-keyword">async def</span> <span class="code-fn">query_knowledge_base</span>(prompt: str, tenant_id: str):
    <span class="code-comment"># Enforce zero-leakage enterprise RBAC context</span>
    docs = <span class="code-keyword">await</span> rag.<span class="code-fn">search_hybrid</span>(prompt, tenant=tenant_id, top_k=<span class="code-num">5</span>)
    answer = <span class="code-keyword">await</span> rag.<span class="code-fn">generate_grounded_answer</span>(prompt, context=docs)
    <span class="code-keyword">return</span> {<span class="code-str">"status"</span>: <span class="code-str">"verified"</span>, <span class="code-str">"answer"</span>: answer.text}`
    };

    const telemetryPane = document.querySelector('.sandbox-telemetry-pane');
    const cliPane = document.getElementById('sandbox-cli');

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        const tabKey = tab.getAttribute('data-tab');
        if (tabKey === 'cli') {
          codePane.style.display = 'none';
          if (telemetryPane) telemetryPane.style.display = 'none';
          if (cliPane) {
            cliPane.style.display = 'flex';
            const cliInput = document.getElementById('cli-input');
            if (cliInput) setTimeout(() => cliInput.focus(), 60);
          }
        } else {
          if (cliPane) cliPane.style.display = 'none';
          codePane.style.display = 'block';
          if (telemetryPane) telemetryPane.style.display = 'flex';
          if (snippets[tabKey]) {
            codePane.innerHTML = snippets[tabKey];
          }
        }
      });
    });
  }

  // -------------------------------------------------------------------------
  // 4. Case Studies Filter Logic
  // -------------------------------------------------------------------------
  function initCaseStudiesFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const caseCards = document.querySelectorAll('.case-card');

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const category = btn.getAttribute('data-filter');

        caseCards.forEach((card) => {
          const cardCategory = card.getAttribute('data-category');
          if (category === 'all' || cardCategory === category) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // -------------------------------------------------------------------------
  // 5. Interactive Case Study Deep-Dive Modal
  // -------------------------------------------------------------------------
  function initCaseStudyModal() {
    const modal = document.getElementById('case-study-modal');
    const closeBtn = document.getElementById('modal-close');
    const modalTag = document.getElementById('modal-tag');
    const modalTitle = document.getElementById('modal-title');
    const modalChallenge = document.getElementById('modal-challenge');
    const modalSolution = document.getElementById('modal-solution');
    const modalMetrics = document.getElementById('modal-metrics');
    const modalCta = document.getElementById('modal-cta');

    const caseData = {
      apexpay: {
        tag: 'FINTECH & BANKING INFRASTRUCTURE',
        title: 'ApexPay: High-Throughput Global Settlement Engine',
        challenge: 'ApexPay was processing $40M daily volume across 3 continents using a legacy monolithic database that suffered from transaction race conditions and reconciliation timeouts during peak market open hours.',
        metrics: [
          { val: '12,000+ TPS', desc: 'Peak Throughput' },
          { val: '99.999%', desc: 'SLA Availability' },
          { val: '-64%', desc: 'Settlement Cost' }
        ],
        solution: 'Sukunix re-architected the payment core into an asynchronous, distributed Go event pipeline with Redis Cluster caching, idempotent PostgreSQL ledgers, and zero-trust cryptographic verification on AWS KMS.'
      },
      cognitiveops: {
        tag: 'ENTERPRISE AI & VECTOR SEARCH',
        title: 'CognitiveOps: Enterprise Knowledge Intelligence via RAG',
        challenge: 'Research analysts spent 4.2 hours daily searching across 5 million internal documents, contracts, and regulatory filings stored in disparate silos without semantic cross-referencing.',
        metrics: [
          { val: '10x Faster', desc: 'Research Speed' },
          { val: '98.4%', desc: 'Answer Accuracy' },
          { val: '500k+', desc: 'Monthly Queries' }
        ],
        solution: 'Engineered an enterprise-grade Retrieval-Augmented Generation (RAG) system utilizing Qdrant vector clustering, hybrid lexical search, strict multi-tenant access controls, and automated citation verification.'
      },
      hyperscale: {
        tag: 'CLOUD MIGRATION & DEVOPS',
        title: 'HyperScale: Kubernetes Multi-Region Cloud Migration',
        challenge: 'HyperScale Logistics faced 4-hour maintenance windows and brittle deployments that disrupted automated fulfillment for 1,200 fleet warehouses across North America.',
        metrics: [
          { val: '42% Saved', desc: 'Cloud Infrastructure' },
          { val: '0 Minutes', desc: 'Deployment Downtime' },
          { val: '4x Speed', desc: 'Release Frequency' }
        ],
        solution: 'Migrated 48 legacy services to AWS EKS with Terraform Infrastructure-as-Code, blue/green automated canary deployments via ArgoCD, and proactive observability with Prometheus and Datadog.'
      },
      carestream: {
        tag: 'HEALTHTECH & TELEMEDICINE',
        title: 'CareStream: HIPAA-Compliant Telehealth Consultation Suite',
        challenge: 'CareStream required a secure, zero-latency WebRTC video platform capable of handling HIPAA audit compliance, electronic health record (EHR) synchronization, and e-prescriptions on mobile.',
        metrics: [
          { val: '100% Pass', desc: 'HIPAA Security Audit' },
          { val: '350k+', desc: 'Active Patients' },
          { val: '4.9 / 5', desc: 'App Store Rating' }
        ],
        solution: 'Engineered end-to-end encrypted WebRTC audio/video consultations paired with cross-platform React Native apps, HL7 FHIR database interoperability, and automated digital prescription signing.'
      }
    };

    document.querySelectorAll('[data-modal]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-modal');
        const data = caseData[key];
        if (data) {
          modalTag.textContent = data.tag;
          modalTitle.textContent = data.title;
          modalChallenge.textContent = data.challenge;
          modalSolution.textContent = data.solution;

          modalMetrics.innerHTML = data.metrics.map(m => `
            <div>
              <div style="font-size: 1.4rem; font-weight: 800; color: #090d1a;">${m.val}</div>
              <div style="font-size: 0.75rem; color: #64748b; font-weight: 600; margin-top: 2px;">${m.desc}</div>
            </div>
          `).join('');

          modal.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      });
    });

    function closeModal() {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }

    closeBtn?.addEventListener('click', closeModal);
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    modalCta?.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });
  }

  // -------------------------------------------------------------------------
  // 6. FAQ Accordion Logic
  // -------------------------------------------------------------------------
  function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach((item) => {
      const questionBtn = item.querySelector('.faq-question');
      questionBtn?.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach((other) => other.classList.remove('active'));
        if (!isActive) {
          item.classList.add('active');
        }
      });
    });
  }

  // -------------------------------------------------------------------------
  // 7. Contact Form Handler
  // -------------------------------------------------------------------------
  function initContactForm() {
    const form = document.getElementById('consultation-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('client-name');
      const emailInput = document.getElementById('client-email');
      const serviceInput = document.getElementById('project-service');
      const budgetInput = document.getElementById('project-budget');
      const messageInput = document.getElementById('project-message');
      const submitBtn = form.querySelector('button[type="submit"]');

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';

      if (!name || !email) {
        if (window.showToast) window.showToast('Please provide your name and work email.', 'error');
        return;
      }

      const originalHtml = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span style="display:inline-flex; align-items:center; gap:8px;">
          <svg class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 0.8s linear infinite;">
            <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="12"></circle>
          </svg>
          <span>Dispatching to Engineering Pod...</span>
        </span>
      `;

      try {
        const payload = {
          name,
          email,
          service: serviceInput ? serviceInput.options[serviceInput.selectedIndex].text : 'Enterprise Software Development',
          budget: budgetInput ? budgetInput.options[budgetInput.selectedIndex].text : '$25,000 – $75,000',
          message: messageInput ? messageInput.value.trim() : ''
        };

        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok && data.success) {
          if (window.showToast) {
            window.showToast('Inquiry received! Our engineering team will review and contact you within one business day.', 'success');
          }
          form.reset();
        } else {
          const errMsg = data.error || 'Unable to dispatch inquiry. Please try again or email infosukunix@gmail.com';
          if (window.showToast) window.showToast(errMsg, 'error');
        }
      } catch (networkErr) {
        console.warn('[Contact Form] Network fetch fallback:', networkErr);
        if (window.showToast) {
          window.showToast('Inquiry noted. If urgent, please WhatsApp us at +91 8866279140 or email infosukunix@gmail.com', 'info');
        }
        form.reset();
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHtml;
      }
    });
  }

  // -------------------------------------------------------------------------
  // 8. Footer Interactive & Back to Top
  // -------------------------------------------------------------------------
  function initFooterInteractions() {
    const backToTopBtn = document.getElementById('footer-back-to-top');
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
  }

  // -------------------------------------------------------------------------
  // 9. Interactive Sukunix CLI Terminal Engine
  // -------------------------------------------------------------------------
  function initCliTerminal() {
    const cliInput = document.getElementById('cli-input');
    const stdout = document.getElementById('cli-stdout');
    const chips = document.querySelectorAll('.cli-chip');
    if (!cliInput || !stdout) return;

    const history = [];
    let historyIdx = -1;

    function appendLine(html, type = 'info') {
      const line = document.createElement('div');
      line.className = `cli-line cli-${type}`;
      line.innerHTML = html;
      stdout.appendChild(line);
      stdout.scrollTop = stdout.scrollHeight;
    }

    function echoCommand(cmd) {
      appendLine(
        `<span class="cli-user">sukunix</span><span class="cli-at">@</span><span class="cli-host">prod-mesh</span><span class="cli-colon">:</span><span class="cli-path">~</span><span class="cli-dollar">$</span> <span class="cli-cmd-text">${escapeHtml(cmd)}</span>`,
        'prompt-echo'
      );
    }

    function escapeHtml(str) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function executeCommand(rawCmd) {
      const cmd = rawCmd.trim();
      if (!cmd) return;

      history.push(cmd);
      historyIdx = history.length;
      echoCommand(cmd);

      const normalized = cmd.toLowerCase();

      if (normalized === 'clear' || normalized === 'cls') {
        stdout.innerHTML = '';
        return;
      }

      if (normalized === 'help' || normalized === '?') {
        appendLine(
          `<div><strong>Available Sukunix Developer Commands:</strong><br>
          &bull; <span class="cli-info">sukunix deploy</span> - Simulate high-throughput AWS EKS cluster deployment<br>
          &bull; <span class="cli-info">sukunix audit</span> - Run automated SOC2/HIPAA security &amp; p99 latency scan<br>
          &bull; <span class="cli-info">sukunix estimate</span> - Calculate architectural scope &amp; sprint timelines<br>
          &bull; <span class="cli-info">sukunix book-call</span> - Open Senior Architect Discovery Consultation modal<br>
          &bull; <span class="cli-info">sukunix status</span> - Telemetry health check of all microservice pods<br>
          &bull; <span class="cli-info">clear</span> - Clear terminal output buffer</div>`,
          'info'
        );
        return;
      }

      if (normalized.startsWith('sukunix deploy') || normalized === 'deploy') {
        appendLine(`<span class="cli-info">⚡ Initializing multi-region Kubernetes deployment pipeline...</span>`, 'info');
        setTimeout(() => {
          appendLine(`✔ Connecting to AWS EKS cluster (us-east-1, eu-central-1)...`, 'success');
        }, 220);
        setTimeout(() => {
          appendLine(`✔ Provisioning 64 high-throughput distributed worker pods &bull; Auto-scale: Active`, 'success');
        }, 500);
        setTimeout(() => {
          appendLine(`✔ Zero-loss database replica verification (PostgreSQL Multi-AZ): PASS`, 'success');
        }, 780);
        setTimeout(() => {
          appendLine(`✔ Global Cloudflare Edge Proxy routed &bull; Core latency: <strong>11.8ms</strong>`, 'success');
          appendLine(`🚀 <strong style="color:#38bdf8;">DEPLOYMENT COMPLETE:</strong> Production cluster 100% operational with 0 downtime.`, 'info');
        }, 1050);
        return;
      }

      if (normalized.startsWith('sukunix audit') || normalized === 'audit') {
        appendLine(`<span class="cli-info">🛡️ Starting automated enterprise security &amp; performance audit...</span>`, 'info');
        setTimeout(() => {
          appendLine(`✔ TLS 1.3 Strict Transport Security &amp; mTLS Mesh: <strong>PASS</strong>`, 'success');
        }, 220);
        setTimeout(() => {
          appendLine(`✔ Zero-Trust IAM &amp; Secret Vault Encryption (AES-256): <strong>PASS</strong>`, 'success');
        }, 500);
        setTimeout(() => {
          appendLine(`✔ OWASP Top-10 &amp; SQL Injection Attack Vector Scan: <strong>0 Vulnerabilities Found</strong>`, 'success');
        }, 780);
        setTimeout(() => {
          appendLine(`✔ p99 Latency SLA benchmark (100k simulated requests): <strong>14.2ms</strong>`, 'success');
          appendLine(`🏆 <strong style="color:#4ade80;">SECURITY AUDIT RESULT:</strong> Enterprise Grade A+ &bull; SOC2 / HIPAA Compliant.`, 'success');
        }, 1050);
        return;
      }

      if (normalized.startsWith('sukunix estimate') || normalized === 'estimate') {
        appendLine(`<span class="cli-info">📊 Running Sukunix Algorithmic Scope Estimator...</span>`, 'info');
        setTimeout(() => {
          appendLine(`<div><strong>Architectural Delivery Estimates:</strong><br>
          &bull; Distributed Microservices &amp; API Mesh: <strong>4 &ndash; 6 Weeks</strong><br>
          &bull; Cloud Infrastructure &amp; Multi-AZ CI/CD: <strong>2 &ndash; 3 Weeks</strong><br>
          &bull; AI / Vector RAG Pipeline Integration: <strong>3 &ndash; 4 Weeks</strong><br>
          &bull; Team: 1 Senior Principal Architect + 3 Dedicated Staff Pod Engineers<br>
          💡 <em>Tip: Use 'sukunix book-call' or click the estimator to lock your sprint slot.</em></div>`, 'info');
        }, 350);
        return;
      }

      if (normalized.startsWith('sukunix book') || normalized === 'book') {
        appendLine(`<span class="cli-info">📅 Launching Senior Architect Discovery Consultation Portal...</span>`, 'info');
        setTimeout(() => {
          appendLine(`✔ Zoom credentials generated &bull; Opening schedule modal...`, 'success');
          const modalTrigger = document.querySelector('.trigger-booking-modal');
          if (modalTrigger) modalTrigger.click();
        }, 400);
        return;
      }

      if (normalized.startsWith('sukunix status') || normalized === 'status') {
        appendLine(
          `<div><strong>Production Health Telemetry (Live us-east-1):</strong><br>
          &bull; Status: <span class="cli-success">Operational (0 Incidents)</span><br>
          &bull; Uptime SLA: <span class="cli-success">99.994%</span><br>
          &bull; Active Pods: <span class="cli-info">128 Healthy Containers</span><br>
          &bull; Current Throughput: <span class="cli-info">12,480 TPS</span><br>
          &bull; p99 Core Latency: <span class="cli-success">12.4ms</span></div>`,
          'info'
        );
        return;
      }

      appendLine(
        `<span class="cli-warn">sukunix: command not found: "${escapeHtml(cmd)}". Type 'help' to see available commands.</span>`,
        'warn'
      );
    }

    cliInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = cliInput.value;
        cliInput.value = '';
        executeCommand(val);
      } else if (e.key === 'ArrowUp') {
        if (history.length > 0 && historyIdx > 0) {
          historyIdx--;
          cliInput.value = history[historyIdx];
        }
      } else if (e.key === 'ArrowDown') {
        if (historyIdx < history.length - 1) {
          historyIdx++;
          cliInput.value = history[historyIdx];
        } else {
          historyIdx = history.length;
          cliInput.value = '';
        }
      }
    });

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const cmd = chip.getAttribute('data-cmd');
        if (cmd) {
          cliInput.value = cmd;
          executeCommand(cmd);
          cliInput.value = '';
          cliInput.focus();
        }
      });
    });

    // Quick launch button from Hero CTA actions
    const heroOpenCliBtn = document.getElementById('hero-open-cli');
    if (heroOpenCliBtn) {
      heroOpenCliBtn.addEventListener('click', () => {
        const cliTab = document.querySelector('.sandbox-tab[data-tab="cli"]');
        if (cliTab) {
          cliTab.click();
          const sandbox = document.querySelector('.hero-sandbox');
          if (sandbox) {
            sandbox.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          setTimeout(() => {
            if (cliInput) cliInput.focus();
          }, 350);
        }
      });
    }
  }

  // -------------------------------------------------------------------------
  // 10. Interactive Mouse Spotlight / Flashlight Hover Physics
  // -------------------------------------------------------------------------
  function initSpotlightEffect() {
    const cards = document.querySelectorAll(
      '.spotlight-card, .service-card, .case-card, .tech-column, .stat-item, .hero-sandbox'
    );

    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });

      card.addEventListener('mouseleave', () => {
        card.style.setProperty('--mouse-x', '-999px');
        card.style.setProperty('--mouse-y', '-999px');
      });
    });
  }

  // -------------------------------------------------------------------------
  // 11. Interactive 3D Cyber Particle Mesh / Tech Globe Canvas
  // -------------------------------------------------------------------------
  function init3DHeroCanvas() {
    const canvas = document.getElementById('hero-3d-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;
    let isVisible = true;

    function resize() {
      const hero = canvas.parentElement;
      width = hero.offsetWidth;
      height = hero.offsetHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    }

    resize();
    window.addEventListener('resize', resize);

    // 3D Globe Fibonacci Distribution
    const count = 160;
    const points = [];
    const radius = Math.min(width, height) * 0.44;

    for (let i = 0; i < count; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      points.push({
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(phi),
        pulse: Math.random() * Math.PI * 2,
        isHub: Math.random() > 0.85
      });
    }

    let rotY = 0;
    let rotX = 0.2;
    let targetRotY = 0;
    let targetRotX = 0;

    const heroSection = canvas.parentElement;
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      targetRotY = nx * 0.8;
      targetRotX = -ny * 0.5;
    });

    heroSection.addEventListener('mouseleave', () => {
      targetRotY = 0;
      targetRotX = 0;
    });

    // Visibility Observer to conserve GPU/CPU
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      }, { threshold: 0.1 });
      observer.observe(heroSection);
    }

    function render() {
      if (isVisible) {
        ctx.clearRect(0, 0, width, height);

        rotY += 0.003 + (targetRotY - (rotY % (Math.PI * 2))) * 0.02;
        rotX += (targetRotX + 0.15 - rotX) * 0.03;

        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);

        const cx = width * 0.5;
        const cy = height * 0.42;
        const fov = 750;

        // Project 3D points
        const projected = [];
        for (let i = 0; i < points.length; i++) {
          const p = points[i];

          // Rotate Y
          const x1 = p.x * cosY + p.z * sinY;
          const z1 = -p.x * sinY + p.z * cosY;

          // Rotate X
          const y1 = p.y * cosX - z1 * sinX;
          const z2 = p.y * sinX + z1 * cosX;

          const scale = fov / (fov + z2 + radius);
          const px = cx + x1 * scale;
          const py = cy + y1 * scale;

          // Depth opacity
          const alpha = Math.max(0.05, Math.min(0.85, (z2 + radius) / (radius * 2)));

          projected.push({
            x: px,
            y: py,
            z: z2,
            scale: scale,
            alpha: alpha,
            isHub: p.isHub,
            pulse: p.pulse
          });
        }

        // Draw connecting 3D lines
        const maxDist = 82;
        ctx.lineWidth = 0.8;
        for (let i = 0; i < projected.length; i++) {
          const p1 = projected[i];
          if (p1.z < -radius * 0.5) continue;

          for (let j = i + 1; j < projected.length; j++) {
            const p2 = projected[j];
            if (p2.z < -radius * 0.5) continue;

            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const d = Math.sqrt(dx * dx + dy * dy);

            if (d < maxDist) {
              const lineAlpha = (1 - d / maxDist) * Math.min(p1.alpha, p2.alpha) * 0.32;
              ctx.strokeStyle = `rgba(56, 189, 248, ${lineAlpha})`;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }

        // Draw 3D nodes
        for (let i = 0; i < projected.length; i++) {
          const p = projected[i];
          p.pulse += 0.05;

          const baseSize = p.isHub ? 3.5 : 2.2;
          const size = baseSize * p.scale;

          ctx.beginPath();
          ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
          if (p.isHub) {
            ctx.fillStyle = `rgba(56, 189, 248, ${p.alpha})`;
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 8;
          } else {
            ctx.fillStyle = `rgba(37, 99, 235, ${p.alpha * 0.7})`;
            ctx.shadowBlur = 0;
          }
          ctx.fill();

          if (p.isHub && p.alpha > 0.4) {
            const pulseRadius = size + (Math.sin(p.pulse) * 0.5 + 0.5) * 8;
            const pulseAlpha = (1 - (pulseRadius - size) / 8) * p.alpha * 0.35;
            ctx.beginPath();
            ctx.arc(p.x, p.y, pulseRadius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(74, 222, 128, ${pulseAlpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
        ctx.shadowBlur = 0;
      }
      requestAnimationFrame(render);
    }

    render();
  }

  // -------------------------------------------------------------------------
  // 12. Interactive 3D Perspective Card Tilt Physics
  // -------------------------------------------------------------------------
  function init3DTiltPhysics() {
    const tiltCards = document.querySelectorAll(
      '.service-card, .case-card, .tech-column, .hero-sandbox'
    );

    tiltCards.forEach((card) => {
      let isHovered = false;

      card.addEventListener('mouseenter', () => {
        isHovered = true;
      });

      card.addEventListener('mousemove', (e) => {
        if (!isHovered) return;
        const rect = card.getBoundingClientRect();
        const cardX = e.clientX - rect.left;
        const cardY = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const deltaX = (cardX - centerX) / centerX;
        const deltaY = (cardY - centerY) / centerY;

        const maxTilt = card.classList.contains('hero-sandbox') ? 3.5 : 6.5;
        const rotX = -deltaY * maxTilt;
        const rotY = deltaX * maxTilt;

        card.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-4px) scale3d(1.012, 1.012, 1.012)`;
      });

      card.addEventListener('mouseleave', () => {
        isHovered = false;
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale3d(1, 1, 1)';
      });
    });
  }

  // -------------------------------------------------------------------------
  // 13. Scroll-Triggered Animated Counter Numbers (Metrics)
  // -------------------------------------------------------------------------
  function initCounterAnimation() {
    const counterElements = document.querySelectorAll('[data-counter]');
    if (!counterElements.length) return;

    function formatNumber(value, decimals, useComma) {
      let str = value.toFixed(decimals);
      if (useComma) {
        const parts = str.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        str = parts.join('.');
      }
      return str;
    }

    function animateCounter(el) {
      if (el.getAttribute('data-animated') === 'true') return;
      el.setAttribute('data-animated', 'true');
      el.classList.add('counting');

      const target = parseFloat(el.getAttribute('data-target') || '0');
      const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
      const prefix = el.getAttribute('data-prefix') || '';
      const suffix = el.getAttribute('data-suffix') || '';
      const useComma = el.getAttribute('data-format') === 'comma';
      const duration = parseInt(el.getAttribute('data-duration') || '1600', 10);

      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Smooth cubic ease out: 1 - (1 - t)^3
        const ease = 1 - Math.pow(1 - progress, 3);
        const currentVal = target * ease;

        el.textContent = prefix + formatNumber(currentVal, decimals, useComma) + suffix;

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.textContent = prefix + formatNumber(target, decimals, useComma) + suffix;
          el.classList.remove('counting');
          el.classList.add('count-done');
        }
      }

      requestAnimationFrame(update);
    }

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              obs.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.15,
          rootMargin: '0px 0px -20px 0px'
        }
      );

      counterElements.forEach((el) => observer.observe(el));
    } else {
      counterElements.forEach(animateCounter);
    }
  }

  // -------------------------------------------------------------------------
  // 14. Initialize on DOM Ready
  // -------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initCodeSandbox();
    initCliTerminal();
    initCounterAnimation();
    initSpotlightEffect();
    init3DHeroCanvas();
    init3DTiltPhysics();
    initCaseStudiesFilter();
    initCaseStudyModal();
    initFaqAccordion();
    initContactForm();
    initFooterInteractions();
  });
})();
