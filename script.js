document.addEventListener('DOMContentLoaded', () => {

  // --- Header Scroll Animation (Collapse based on Scroll Direction - High Performance) ---
  const navbarWrapper = document.querySelector('.navbar-wrapper');
  let lastScrollY = window.scrollY;
  let isScrolledState = false;
  let isScrollTicking = false;

  function handleNavbarScroll() {
    if (!navbarWrapper) {
      isScrollTicking = false;
      return;
    }
    
    const currentScrollY = window.scrollY;
    const scrollDifference = currentScrollY - lastScrollY;

    // 1. Ignore tiny scrolls (jitter protection for finger tremors / momentum bounce)
    if (Math.abs(scrollDifference) < 6 && currentScrollY > 15) {
      isScrollTicking = false;
      return;
    }

    if (currentScrollY <= 15) {
      // Always show full name at the very top of the page
      if (isScrolledState) {
        isScrolledState = false;
        navbarWrapper.classList.remove('scrolled');
      }
    } else if (currentScrollY > lastScrollY) {
      // Scrolling Down -> Show TR (collapse)
      if (!isScrolledState) {
        isScrolledState = true;
        navbarWrapper.classList.add('scrolled');
      }
    } else if (currentScrollY < lastScrollY) {
      // Scrolling Up -> Show Full Name (expand)
      if (isScrolledState) {
        isScrolledState = false;
        navbarWrapper.classList.remove('scrolled');
      }
    }

    lastScrollY = currentScrollY;
    isScrollTicking = false;
  }

  window.addEventListener('scroll', () => {
    if (!isScrollTicking) {
      window.requestAnimationFrame(handleNavbarScroll);
      isScrollTicking = true;
    }
  }, { passive: true });

  handleNavbarScroll(); // Initial run

  // --- Scroll-based Entrance Animations ---
  const animElements = document.querySelectorAll('.anim-fade-up');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  animElements.forEach(el => observer.observe(el));

  // Initialize Supabase Client
  const { createClient } = supabase;
  const supabaseUrl = 'https://tfrnnoixqhvuswccwedp.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmcm5ub2l4cWh2dXN3Y2N3ZWRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNDg0MzMsImV4cCI6MjA5NDkyNDQzM30.soFudCdmnLchYNLht4HDWjd9skng-KJm1ppzRO1jGkM';
  const supabaseClient = createClient(supabaseUrl, supabaseKey);

  // --- Waitlist Form Logic ---
  const waitlistForm = document.getElementById('waitlist-form');
  const waitlistEmail = document.getElementById('waitlist-email');
  const formMessage = document.getElementById('form-message');

  waitlistForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = waitlistEmail.value.trim();
    
    if (!validateEmail(email)) {
      showMessage('Please enter a valid email address.', 'error');
      return;
    }

    showMessage('Adding you to our priority queue...', 'loading');
    
    try {
      const { error } = await supabaseClient.from("waitlist").insert([{ email }]);
      
      if (error) {
        if (error.code === "23505" || error.message?.toLowerCase().includes("unique")) {
          showMessage("You're already on our exclusive waitlist! 🎉", 'success');
          waitlistEmail.value = '';
        } else {
          showMessage(error.message || 'Something went wrong. Please try again.', 'error');
        }
        return;
      }

      // Store in LocalStorage as a local backup
      try {
        const waitlist = JSON.parse(localStorage.getItem('thunderreply_waitlist') || '[]');
        if (!waitlist.includes(email)) {
          waitlist.push(email);
          localStorage.setItem('thunderreply_waitlist', JSON.stringify(waitlist));
        }
      } catch (err) {
        console.error('LocalStorage unavailable:', err);
      }

      showMessage("Success! You've joined the waitlist. We will notify you soon! 🚀", 'success');
      waitlistEmail.value = '';
    } catch (err) {
      console.error('Waitlist submission error:', err);
      showMessage('Network error. Please check your connection and try again.', 'error');
    }
  });

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function showMessage(text, type) {
    formMessage.textContent = text;
    formMessage.className = 'form-message ' + type;
    
    if (type === 'success' || type === 'error') {
      setTimeout(() => {
        formMessage.style.opacity = '0';
        setTimeout(() => {
          formMessage.textContent = '';
          formMessage.style.opacity = '1';
          formMessage.className = 'form-message';
        }, 300);
      }, 5000);
    }
  }

  // --- Upgraded Interactive Demo Logic ---
  const keywordData = {
    LINK: {
      symbol: '⚡',
      title: 'ThunderReply Waitlist Pro',
      desc: 'Get 3 months of Pro tier completely free. Unlimited campaign flows, zero delay.',
      perk: '3 Months Free Pro Tier waitlist access',
      btnText: 'Activate Free Pro Tier'
    },
    PRICE: {
      symbol: '💰',
      title: 'Lifetime Price Lock',
      desc: "Lock in early bird pricing forever. Save 40% on monthly subscriptions as long as you're active.",
      perk: 'Lifetime subscription rate lock',
      btnText: 'Claim Lifetime Lock'
    },
    COURSE: {
      symbol: '📚',
      title: 'Instagram DM Masterclass',
      desc: 'Get our step-by-step masterclass syllabus & comment strategy guide sent straight to your inbox.',
      perk: 'Early Pioneer Masterclass guide',
      btnText: 'Download Syllabus PDF'
    },
    DEFAULT: {
      symbol: '🎁',
      title: 'Custom Waitlist Reward',
      desc: 'Special pre-launch rewards match for rules. Locked for priority waitlist members.',
      perk: 'Special pre-launch campaign match',
      btnText: 'Unlock Waitlist Reward'
    }
  };

  const sparkPath = document.getElementById('spark-path');

  // Device view screens
  const screenReels = document.getElementById('screen-reels');
  const screenDm = document.getElementById('screen-dm');
  
  // Reels elements
  const commentsSheet = document.getElementById('comments-sheet');
  const mockCommentTypingText = document.getElementById('mock-comment-typing-text');
  const commentsInputBar = document.querySelector('.comments-input-bar');
  const postCommentBtn = document.getElementById('post-comment-btn');
  const sheetCommentsList = document.getElementById('sheet-comments-list');
  const reelsCommentIconBtn = document.getElementById('reels-comment-icon-btn');
  const sheetCloseBtn = document.getElementById('sheet-close-btn');

  // DM elements
  const chatViewport = document.getElementById('chat-viewport');
  const refCommentText = document.getElementById('ref-comment-text');
  const inboundCommentText = document.getElementById('inbound-comment-text');
  const typingIndicator = document.getElementById('typing-indicator');
  const outboundBubble = document.getElementById('outbound-bubble');
  
  // DM Rich Card Campaign elements
  const dmCardTitle = document.getElementById('dm-card-title');
  const dmCardDesc = document.getElementById('dm-card-desc');
  const dmCardCtaBtn = document.getElementById('dm-card-cta-btn');
  const dmCardImage = document.getElementById('dm-card-image');
  const outboundTagSpan = document.getElementById('outbound-tag-span');

  // Notifications
  const iosNotification = document.getElementById('ios-notification');

  // External controls
  const btnResetSimulator = document.getElementById('btn-reset-simulator');
  const chatBackBtn = document.getElementById('chat-back-btn');

  // Suggested Pills inside Comments Sheet
  const commentSuggestedPills = document.querySelectorAll('.comment-suggested-pill');

  // Like and Coach Mark elements
  const reelsLikeBtn = document.getElementById('reels-like-btn');
  const likeHeartPopup = document.getElementById('like-heart-popup');
  const reelsCoachMark = document.getElementById('reels-coach-mark');

  // Success Modal
  const demoSuccessModal = document.getElementById('demo-success-modal');
  const demoSuccessClose = document.getElementById('demo-success-close');
  const demoSuccessConfirmBtn = document.getElementById('demo-success-confirm-btn');
  const demoSuccessPerkText = document.getElementById('demo-success-perk-text');

  let activeTimeouts = [];
  let isSimulating = false;
  let activeKeyword = 'LINK';
  let isLiked = false;

  function clearActiveSimulation() {
    activeTimeouts.forEach(clearTimeout);
    activeTimeouts = [];
    isSimulating = false;
    if (sparkPath) sparkPath.classList.remove('animating');
    if (commentsInputBar) commentsInputBar.classList.remove('typing');
    if (iosNotification) iosNotification.classList.remove('show');
  }

  function resetDeviceState() {
    // Show reels, hide others
    if (screenReels) screenReels.classList.remove('hidden');
    if (screenDm) screenDm.classList.add('hidden');
    
    // Close comments panel
    if (commentsSheet) commentsSheet.classList.remove('open');
    
    // Clear mock typing comment field
    if (mockCommentTypingText) {
      mockCommentTypingText.textContent = 'Add a comment...';
      mockCommentTypingText.classList.add('placeholder');
    }
    
    // Clear user-added comments
    if (sheetCommentsList) {
      const userComments = sheetCommentsList.querySelectorAll('.user-posted-comment');
      userComments.forEach(el => el.remove());
    }
    
    // Deactivate comments Post button
    if (postCommentBtn) postCommentBtn.classList.remove('active');
    
    // Hide typing indicator and outbound bubbles
    if (typingIndicator) typingIndicator.style.display = 'none';
    if (outboundBubble) outboundBubble.style.display = 'none';
    
    // Hide push banner
    if (iosNotification) iosNotification.classList.remove('show');

    // Reset Like and Coach Mark states
    isLiked = false;
    if (reelsLikeBtn) {
      reelsLikeBtn.classList.remove('liked');
      const countSpan = reelsLikeBtn.querySelector('.like-count');
      if (countSpan) countSpan.textContent = '4.2K';
    }
    if (reelsCoachMark) {
      reelsCoachMark.classList.remove('hidden');
    }
  }

  function triggerLike(showHeart) {
    if (!isLiked) {
      isLiked = true;
      if (reelsLikeBtn) {
        reelsLikeBtn.classList.add('liked');
        const countSpan = reelsLikeBtn.querySelector('.like-count');
        if (countSpan) countSpan.textContent = '4.3K';
      }
    }
    
    if (showHeart && likeHeartPopup) {
      likeHeartPopup.classList.remove('pop');
      void likeHeartPopup.offsetWidth; // Reflow
      likeHeartPopup.classList.add('pop');
      setTimeout(() => {
        likeHeartPopup.classList.remove('pop');
      }, 800);
    }
  }

  function toggleLike() {
    if (isLiked) {
      isLiked = false;
      if (reelsLikeBtn) {
        reelsLikeBtn.classList.remove('liked');
        const countSpan = reelsLikeBtn.querySelector('.like-count');
        if (countSpan) countSpan.textContent = '4.2K';
      }
    } else {
      triggerLike(true);
    }
  }

  function runSimulation(keyword) {
    // 1. Terminate any active simulation
    clearActiveSimulation();

    // Hide coach mark during simulation run
    if (reelsCoachMark) reelsCoachMark.classList.add('hidden');
    
    // Inline mini-reset: clean up DM/comments state without toggling builder
    if (mockCommentTypingText) {
      mockCommentTypingText.textContent = 'Add a comment...';
      mockCommentTypingText.classList.add('placeholder');
    }
    if (sheetCommentsList) {
      sheetCommentsList.querySelectorAll('.user-posted-comment').forEach(el => el.remove());
    }
    if (postCommentBtn) postCommentBtn.classList.remove('active');
    if (typingIndicator) typingIndicator.style.display = 'none';
    if (outboundBubble) outboundBubble.style.display = 'none';
    if (iosNotification) iosNotification.classList.remove('show');
    
    // Make sure Reels screen is active
    if (screenDm) screenDm.classList.add('hidden');
    if (screenReels) screenReels.classList.remove('hidden');
    
    isSimulating = true;
    activeKeyword = keyword;
    
    // 2. Fetch data payload matching keyword
    const data = keywordData[keyword] || {
      symbol: '🎁',
      title: `Campaign Match: #${keyword}`,
      desc: `Custom pre-launch automation match for keyword #${keyword}.`,
      perk: `Custom reward slot for #${keyword}`,
      btnText: 'Unlock Reward Perk'
    };

    // Update text assets ahead of execution
    if (refCommentText) refCommentText.textContent = `"#${keyword}"`;
    if (inboundCommentText) inboundCommentText.textContent = `"#${keyword}"`;
    if (outboundTagSpan) outboundTagSpan.textContent = `#${keyword}`;
    
    // Update Rich DM Card details
    if (dmCardTitle) dmCardTitle.textContent = data.title;
    if (dmCardDesc) dmCardDesc.textContent = data.desc;
    if (dmCardCtaBtn) {
      dmCardCtaBtn.querySelector('span').textContent = data.btnText;
    }
    if (dmCardImage) {
      dmCardImage.querySelector('.dm-image-icon').textContent = data.symbol;
    }

    // --- TIMELINE SIMULATION SEQUENCE ---

    // A. Ensure comment panel is open (should already be open, but fallback)
    const t1 = setTimeout(() => {
      if (commentsSheet) commentsSheet.classList.add('open');
    }, 100);
    activeTimeouts.push(t1);

    // B. Start typing the comment after 400ms
    const commentString = `#${keyword}`;
    let charIdx = 0;
    
    const t2 = setTimeout(() => {
      if (mockCommentTypingText) {
        mockCommentTypingText.textContent = '';
        mockCommentTypingText.classList.remove('placeholder');
      }
      if (commentsInputBar) commentsInputBar.classList.add('typing');
      
      const typeInterval = setInterval(() => {
        if (charIdx < commentString.length) {
          if (mockCommentTypingText) {
            mockCommentTypingText.textContent += commentString.charAt(charIdx);
          }
          charIdx++;
        } else {
          clearInterval(typeInterval);
          if (postCommentBtn) postCommentBtn.classList.add('active');
          
          // C. Click Post and append comment after 300ms
          const t3 = setTimeout(() => {
            if (commentsInputBar) commentsInputBar.classList.remove('typing');
            
            // Append comment to list
            if (sheetCommentsList) {
              const newComment = document.createElement('div');
              newComment.className = 'mock-comment user-posted-comment';
              newComment.style.animation = 'bubble-intro 0.4s ease forwards';
              newComment.innerHTML = `
                <div class="comment-avatar">💬</div>
                <div class="comment-content">
                  <span class="comment-user">you</span>
                  <span class="comment-text">#${keyword}</span>
                  <div class="comment-meta">1s  &bull;  Reply</div>
                </div>
              `;
              sheetCommentsList.appendChild(newComment);
              // scroll list to bottom
              sheetCommentsList.scrollTop = sheetCommentsList.scrollHeight;
            }
            
            // Clear input box
            if (mockCommentTypingText) {
              mockCommentTypingText.textContent = 'Add a comment...';
              mockCommentTypingText.classList.add('placeholder');
            }
            if (postCommentBtn) postCommentBtn.classList.remove('active');

            // D. Slide down iOS Push Notification banner after 650ms
            const t4 = setTimeout(() => {
              if (iosNotification) {
                // Update push content
                iosNotification.querySelector('.notification-body').textContent = 
                  `Sent you a DM matching your comment: "Hey! Tap to claim your waitlist access..."`;
                iosNotification.classList.add('show');
              }

              // E. Auto-click Notification banner after 1.8s
              const t5 = setTimeout(() => {
                if (iosNotification) iosNotification.classList.remove('show');
                if (commentsSheet) commentsSheet.classList.remove('open');
                
                // Transition views: Reels → DM
                if (screenReels) screenReels.classList.add('hidden');
                if (screenDm) screenDm.classList.remove('hidden');

                // F. Show typing dots indicator in chat thread
                if (typingIndicator) typingIndicator.style.display = 'flex';
                if (chatViewport) chatViewport.scrollTop = chatViewport.scrollHeight;

                // G. Deliver Rich DM Response after 1.2s
                const t6 = setTimeout(() => {
                  if (typingIndicator) typingIndicator.style.display = 'none';
                  if (outboundBubble) {
                    outboundBubble.style.display = 'block';
                    // force bubble re-entrance animation
                    outboundBubble.style.animation = 'none';
                    void outboundBubble.offsetHeight; // reflow
                    outboundBubble.style.animation = '';
                  }
                  if (chatViewport) chatViewport.scrollTop = chatViewport.scrollHeight;
                  
                  isSimulating = false;
                }, 1200);
                activeTimeouts.push(t6);

              }, 1800);
              activeTimeouts.push(t5);

            }, 650);
            activeTimeouts.push(t4);

          }, 300);
          activeTimeouts.push(t3);
        }
      }, 120);
    }, 400);
    activeTimeouts.push(t2);
  }

  // Suggested Comment Pills Click Handlers
  commentSuggestedPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const keyword = pill.getAttribute('data-word');
      runSimulation(keyword);
    });
  });

  if (btnResetSimulator) {
    btnResetSimulator.addEventListener('click', () => {
      clearActiveSimulation();
      resetDeviceState();
    });
  }

  if (chatBackBtn) {
    chatBackBtn.addEventListener('click', () => {
      clearActiveSimulation();
      if (screenDm) screenDm.classList.add('hidden');
      if (screenReels) screenReels.classList.remove('hidden');
      if (commentsSheet) commentsSheet.classList.remove('open');
    });
  }

  // Double-click to like on the entire Reels screen
  if (screenReels) {
    screenReels.addEventListener('dblclick', (e) => {
      if (e.target.closest('#comments-sheet')) return;
      triggerLike(true);
    });
  }

  // Single click on Reels sidebar heart button
  if (reelsLikeBtn) {
    reelsLikeBtn.addEventListener('click', () => {
      toggleLike();
    });
  }

  // Click on coach mark: delay single click action to check if double click occurs
  if (reelsCoachMark) {
    let coachMarkClickTimeout;
    reelsCoachMark.addEventListener('click', (e) => {
      if (e.detail === 2) {
        // Double click: cancel the single click comment-drawer toggle.
        // The dblclick bubbles up to screenReels which handles the liking.
        clearTimeout(coachMarkClickTimeout);
        return;
      }
      
      // Single click: show comment drawer after a short delay
      coachMarkClickTimeout = setTimeout(() => {
        reelsCoachMark.classList.add('hidden');
        if (commentsSheet) commentsSheet.classList.add('open');
      }, 200);
    });
  }

  if (reelsCommentIconBtn) {
    reelsCommentIconBtn.addEventListener('click', () => {
      if (commentsSheet) {
        commentsSheet.classList.toggle('open');
        if (reelsCoachMark) reelsCoachMark.classList.add('hidden');
      }
    });
  }

  if (sheetCloseBtn) {
    sheetCloseBtn.addEventListener('click', () => {
      if (commentsSheet) commentsSheet.classList.remove('open');
    });
  }

  // Push notification click switches to DM immediately
  if (iosNotification) {
    iosNotification.addEventListener('click', () => {
      clearActiveSimulation();
      iosNotification.classList.remove('show');
      if (commentsSheet) commentsSheet.classList.remove('open');
      if (screenReels) screenReels.classList.add('hidden');
      if (screenDm) screenDm.classList.remove('hidden');
      // show delivery immediately since they tapped the notification
      if (typingIndicator) typingIndicator.style.display = 'none';
      if (outboundBubble) outboundBubble.style.display = 'block';
    });
  }

  // Success Modal
  function showSuccessModal() {
    const data = keywordData[activeKeyword] || keywordData.DEFAULT;
    if (demoSuccessPerkText) {
      demoSuccessPerkText.textContent = data.perk;
    }
    if (demoSuccessModal) {
      demoSuccessModal.classList.add('is-active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeSuccessModal() {
    if (demoSuccessModal) {
      demoSuccessModal.classList.remove('is-active');
      document.body.style.overflow = '';
    }
  }

  if (dmCardCtaBtn) {
    dmCardCtaBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showSuccessModal();
    });
  }

  if (demoSuccessClose) {
    demoSuccessClose.addEventListener('click', closeSuccessModal);
  }

  if (demoSuccessConfirmBtn) {
    demoSuccessConfirmBtn.addEventListener('click', () => {
      closeSuccessModal();
      // Scroll to waitlist form
      const waitlistSection = document.getElementById('waitlist-section');
      if (waitlistSection) {
        waitlistSection.scrollIntoView({ behavior: 'smooth' });
        // focus email input
        setTimeout(() => {
          const emailInput = document.getElementById('waitlist-email');
          if (emailInput) emailInput.focus();
        }, 800);
      }
    });
  }

  // Also click background backdrop to closeSuccessModal
  if (demoSuccessModal) {
    const demoSuccessBackdrop = demoSuccessModal.querySelector('.legal-modal-backdrop');
    if (demoSuccessBackdrop) {
      demoSuccessBackdrop.addEventListener('click', closeSuccessModal);
    }
  }


  // --- Waitlist Perks Stacked Deck logic ---
  const deckCards = document.querySelectorAll('.deck-card');
  const decoCards = document.querySelectorAll('.deck-deco-card');
  const prevBtn = document.getElementById('prev-deck-btn');
  const nextBtn = document.getElementById('next-deck-btn');
  const indicator = document.getElementById('deck-indicator');

  let activeIndex = 0;
  const totalCards = deckCards.length;
  let isSwiping = false;

  // Render the deck layout based on the active index
  function updateDeck() {
    deckCards.forEach((card, i) => {
      // Clear styles and states
      card.classList.remove('active', 'swiped-left', 'swiped-right');
      
      // Compute stack index relative to active index
      const indexInStack = (i - activeIndex + totalCards) % totalCards;

      if (indexInStack !== 0) {
        card.classList.remove('flipped');
      }

      if (indexInStack === 0) {
        card.classList.add('active');
        card.style.transform = 'translate3d(0, 0, 0) rotate(0deg) scale(1)';
        card.style.opacity = '1';
        card.style.zIndex = '100';
      } else {
        // Stacking style behind active card
        const scale = 1 - indexInStack * 0.055;
        const translateY = indexInStack * 12;
        // Alternating rotations for fanned look
        const rotate = indexInStack % 2 === 0 ? -4 * indexInStack : 4 * indexInStack;
        const translateX = indexInStack % 2 === 0 ? -8 : 8;

        card.style.transform = `translate3d(${translateX}px, ${translateY}px, -${indexInStack * 50}px) rotate(${rotate}deg) scale(${scale})`;
        card.style.opacity = (1 - indexInStack * 0.25).toString();
        card.style.zIndex = (90 - indexInStack).toString();
      }

      // Pre-load text elements on active and next-in-line card, hide on deeper ones
      const textElements = card.querySelectorAll('.card-statement, .card-tag, .know-more-btn, .card-details-title, .card-details-desc, .back-to-front-btn');
      if (indexInStack === 0 || indexInStack === 1) {
        textElements.forEach(el => {
          el.style.opacity = '1';
          el.style.pointerEvents = indexInStack === 0 ? 'auto' : 'none';
        });
      } else {
        textElements.forEach(el => {
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
        });
      }
    });

    // Update dynamic rotations on decorative background cards (fan elements)
    decoCards.forEach((deco, idx) => {
      const baseAngles = [-12, 15, -6, 9, -18, 21];
      const newAngle = baseAngles[idx] + (activeIndex * 4);
      deco.style.transform = `rotate(${newAngle}deg) scale(${0.94 + idx * 0.006})`;
    });

    // Update indicator text
    if (indicator) {
      indicator.textContent = 'swipe';
    }
  }

  function nextCard() {
    if (isSwiping) return;
    isSwiping = true;

    const currentCard = deckCards[activeIndex];
    currentCard.classList.add('swiped-left');

    setTimeout(() => {
      activeIndex = (activeIndex + 1) % totalCards;
      updateDeck();
      setTimeout(() => {
        isSwiping = false;
      }, 100);
    }, 300);
  }

  function prevCard() {
    if (isSwiping) return;
    isSwiping = true;

    activeIndex = (activeIndex - 1 + totalCards) % totalCards;
    updateDeck();

    setTimeout(() => {
      isSwiping = false;
    }, 400);
  }

  // Hook up event listeners
  if (nextBtn) nextBtn.addEventListener('click', nextCard);
  if (prevBtn) prevBtn.addEventListener('click', prevCard);
  // Handle card click and 3D flipping listeners
  deckCards.forEach((card) => {
    const knowMoreBtn = card.querySelector('.know-more-btn');
    const backBtn = card.querySelector('.back-to-front-btn');

    if (knowMoreBtn) {
      knowMoreBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Stop click from cycling deck
        card.classList.add('flipped');
      });
    }

    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Stop click from cycling deck
        card.classList.remove('flipped');
      });
    }

    card.addEventListener('click', (e) => {
      // Only flip card if it's the active card and we didn't click a button inside
      if (card.classList.contains('active') && !e.target.closest('button')) {
        card.classList.toggle('flipped');
      }
    });
  });
  // Touch Swipe gestures support
  let touchStartX = 0;
  let touchCurrentX = 0;
  let dragStarted = false;

  const deckContainer = document.getElementById('perks-deck');
  if (deckContainer) {
    deckContainer.addEventListener('touchstart', (e) => {
      const activeCard = deckCards[activeIndex];
      if (isSwiping || activeCard.classList.contains('flipped')) return;
      
      touchStartX = e.touches[0].clientX;
      touchCurrentX = 0; // Reset to 0 to distinguish taps from swipes
      dragStarted = true;
      activeCard.style.transition = 'none'; // disable transition while dragging
    }, { passive: true });

    deckContainer.addEventListener('touchmove', (e) => {
      if (!dragStarted) return;
      touchCurrentX = e.touches[0].clientX;
      const diff = touchCurrentX - touchStartX;
      
      if (Math.abs(diff) > 10) {
        const activeCard = deckCards[activeIndex];
        activeCard.style.transform = `translate3d(${diff}px, 0, 0) rotate(${diff * 0.06}deg) scale(1)`;
      }
    }, { passive: true });

    deckContainer.addEventListener('touchend', (e) => {
      if (!dragStarted) return;
      dragStarted = false;
      
      const activeCard = deckCards[activeIndex];
      activeCard.style.transition = ''; // restore transition

      // If touchCurrentX is still 0, no touchmove occurred (this was a tap)
      if (touchCurrentX === 0) {
        activeCard.style.transform = 'translate3d(0, 0, 0) rotate(0deg) scale(1)';
        return;
      }

      const diff = touchCurrentX - touchStartX;
      const threshold = 100;

      if (diff > threshold) {
        // Swipe right (prev)
        activeCard.classList.add('swiped-right');
        setTimeout(() => {
          prevCard();
        }, 150);
      } else if (diff < -threshold) {
        // Swipe left (next)
        activeCard.classList.add('swiped-left');
        setTimeout(() => {
          nextCard();
        }, 150);
      } else {
        // Reset card rotation/position
        activeCard.style.transform = 'translate3d(0, 0, 0) rotate(0deg) scale(1)';
      }
      touchStartX = 0;
      touchCurrentX = 0;
    }, { passive: true });
  }

  // Initialize deck state
  updateDeck();

  // Pre-load simulator on page load
  resetDeviceState();

  // --- Legal Modals Logic ---
  const termsModal = document.getElementById('terms-modal');
  const privacyModal = document.getElementById('privacy-modal');
  
  const openTermsBtns = document.querySelectorAll('#open-terms, #menu-terms');
  const openPrivacyBtns = document.querySelectorAll('#open-privacy, #menu-privacy');
  
  const closeTermsBtns = termsModal ? termsModal.querySelectorAll('.legal-modal-close, .close-btn') : [];
  const closePrivacyBtns = privacyModal ? privacyModal.querySelectorAll('.legal-modal-close, .close-btn') : [];
  
  const termsBackdrop = termsModal ? termsModal.querySelector('.legal-modal-backdrop') : null;
  const privacyBackdrop = privacyModal ? privacyModal.querySelector('.legal-modal-backdrop') : null;

  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('is-active');
    document.body.style.overflow = 'hidden'; // Prevent background page scrolling
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('is-active');
    document.body.style.overflow = ''; // Restore background page scrolling
  }

  openTermsBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(termsModal);
    });
  });

  openPrivacyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(privacyModal);
    });
  });

  closeTermsBtns.forEach(btn => {
    btn.addEventListener('click', () => closeModal(termsModal));
  });

  closePrivacyBtns.forEach(btn => {
    btn.addEventListener('click', () => closeModal(privacyModal));
  });

  if (termsBackdrop) {
    termsBackdrop.addEventListener('click', () => closeModal(termsModal));
  }

  if (privacyBackdrop) {
    privacyBackdrop.addEventListener('click', () => closeModal(privacyModal));
  }

  // --- Dropdown Menu Logic ---
  const menuBtn = document.querySelector('.nav-menu-btn');
  const dropdownMenu = document.querySelector('.nav-dropdown-menu');
  const dropdownLinks = document.querySelectorAll('.dropdown-link');

  if (menuBtn && dropdownMenu) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = dropdownMenu.classList.toggle('is-active');
      menuBtn.classList.toggle('is-active', isActive);
    });

    // Close menu when clicking any dropdown link
    dropdownLinks.forEach(link => {
      link.addEventListener('click', () => {
        dropdownMenu.classList.remove('is-active');
        menuBtn.classList.remove('is-active');
      });
    });

    // Close menu when clicking outside the navbar
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.navbar-wrapper')) {
        dropdownMenu.classList.remove('is-active');
        menuBtn.classList.remove('is-active');
      }
    });
  }

  // ESC key support to close any open modal or menu
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal(termsModal);
      closeModal(privacyModal);
      if (dropdownMenu) dropdownMenu.classList.remove('is-active');
      if (menuBtn) menuBtn.classList.remove('is-active');
    }
  });
});
