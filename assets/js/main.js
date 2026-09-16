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

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        const tabKey = tab.getAttribute('data-tab');
        if (snippets[tabKey]) {
          codePane.innerHTML = snippets[tabKey];
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

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('client-name');
      const emailInput = document.getElementById('client-email');
      const submitBtn = form.querySelector('button[type="submit"]');

      if (!nameInput.value.trim() || !emailInput.value.trim()) {
        window.showToast('Please provide your name and work email.', 'error');
        return;
      }

      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Submitting Inquiry...</span>`;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        window.showToast('Thank you. Your inquiry has been received. An engineering director will contact you within one business day.', 'success');
        form.reset();
      }, 900);
    });
  }

  // -------------------------------------------------------------------------
  // 8. Initialize on DOM Ready
  // -------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initCodeSandbox();
    initCaseStudiesFilter();
    initCaseStudyModal();
    initFaqAccordion();
    initContactForm();
  });
})();
