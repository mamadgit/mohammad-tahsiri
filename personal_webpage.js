document.addEventListener("DOMContentLoaded", function() {
// ==========================================
//#region INITIALIZATION & DOM ELEMENTS
// ==========================================
  gsap.registerPlugin(ScrollTrigger);
  const collapsibles = document.querySelectorAll(".collapsible-btn");
  const toggleAllBtn = document.querySelector(".expandall");
  const siteHeader = document.querySelector(".site-header");
  const projectBox = document.querySelector(".project-box");
  // const ProjectItem = document.querySelector(".project-item");
  const CollpsibleCntnt = document.querySelector(".collapsible-content");
  const Project = document.querySelector(".projects");
//#endregion

// ==========================================
//#region    STATE MANAGEMENT
// ==========================================
  let collapsibleTrigger = null; // Holds the active GSAP ScrollTrigger instance
  let CurrentlyOpen = null;      // Tracks the currently expanded { button, content } pair
  let triggerMap = new Map();    // Stores btn -> ScrollTrigger pairs 
  let isBatchOpening = false;
  let isAccordionClick = false;
  let lastScroll = 0;
  let isAccordionOpen = false; //Variable to cause a delay between executing functions and prevent crahsing
  let isAccordionSwap = false; //Variable to establish connection between two seperate functions (i.e., Disappear site-header upon opening second button)
//#endregion

// ==========================================
//#region  MOBILE HEADER SCROLL VISIBILITY
// ==========================================
  if (siteHeader) {
    const mm = gsap.matchMedia();
    mm.add("(max-width: 786px)", () => {
      let ignoreNextUpdate = false; // <-- flag
      const threshold = 10;

      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', () => {
          ignoreNextUpdate = true; // <-- ignore the next scroll update after any hash click
          siteHeader.classList.add('is-invisible');
          lastScroll = window.scrollY; // <-- reset reference point
        });
      });
      // Header visibilty upon direction of scroll
      ScrollTrigger.create({
        onUpdate: (self) => {        
          const current = self.scroll();
          const delta = current - lastScroll;
          const JmpThrsh = window.innerHeight * 0.5;
          // <-- skip the update right after a hash click
          if(ignoreNextUpdate){
            ignoreNextUpdate = false;
            lastScroll = current;
            return;
          }
          
          if(Math.abs(delta) > JmpThrsh){
            //isAccordionAnimating: variable that determines button closing.
            if (window.isAccordionAnimating) {
              siteHeader.classList.add('is-invisible');//Make it invisible
            } else {
              siteHeader.classList.remove('is-invisible'); //Make it visible
            }
            lastScroll = current;
            return;
          }

          if(Math.abs(delta) < threshold){
            return;
          }

          if (delta > 0){
            siteHeader.classList.add('is-invisible'); // Scrolling down, hide it
          } else {
            // Only show the header on normal scroll ups IF the accordion (button closing) isn't animating
            if (!window.isAccordionAnimating && !window.isAccordionOpen) {
               siteHeader.classList.remove('is-invisible');//Make it visible
            }
          }
          lastScroll = current;
        }
      });
    });
  }
//#endregion

// ==========================================
//#region    UTILITY FUNCTIONS
// ==========================================
  function Transition(element){
    element.addEventListener("transitionend", function(e){
      if(e.propertyName === "max-height"){
        ScrollTrigger.refresh();
      }
    }, { once: true });
  }

  const portfolioVersionHistory = [
    { hash: "18835cb", date: "2026-04-13", message: "Update index.html", lane: "branch" },
    { hash: "71e7de7", date: "2026-04-16", message: "Update index.html", lane: "branch" },
    { hash: "707a181", date: "2026-04-16", message: "Add files via upload", lane: "branch" },
    { hash: "5ac774f", date: "2026-04-18", message: "Update index.html", lane: "branch" },
    { hash: "554dbc2", date: "2026-04-22", message: "Update index.html", lane: "branch" },
    { hash: "4d41ec8", date: "2026-04-22", message: "Refine personal introduction in index.html", lane: "branch" },
    { hash: "4fef544", date: "2026-05-02", message: "Update personal_webpage.css", lane: "branch" },
    { hash: "5840777", date: "2026-05-02", message: "Update personal_webpage.css", lane: "branch" },
    { hash: "ff21c3e", date: "2026-05-05", message: "Merge local project with GitHub repo", lane: "main", isMerge: true },
    { hash: "c98cd98", date: "2026-05-06", message: "Update", lane: "main" },
    { hash: "9764aff", date: "2026-05-06", message: "Update", lane: "main" },
    { hash: "3c710e1", date: "2026-05-06", message: "Update", lane: "main" },
    { hash: "b8a9c29", date: "2026-05-06", message: "Update", lane: "main" },
    { hash: "c6d082f", date: "2026-05-14", message: "Fixed interface issue of AppendChild by changing container", lane: "main" },
    { hash: "8b67e45", date: "2026-05-14", message: "Fixed UI of Sort button for mobile screen", lane: "main" },
    { hash: "0d94c75", date: "2026-05-14", message: "Small UI update for sort button on mobile", lane: "main" },
    { hash: "da9191c", date: "2026-05-14", message: "Small Update to button", lane: "main" },
    { hash: "fa7ec6f", date: "2026-05-15", message: "Small Update", lane: "main" },
  ];

  function initVersionHistoryGraphs() {
    const graphs = document.querySelectorAll('[data-version-history="personal-portfolio"]');

    graphs.forEach((graph) => {
      const track = graph.querySelector(".version-history__track");
      if (!track) return;

      const commitUrlBase = `https://github.com/${graph.dataset.repo}/commit/`;
      const spacing = 220;
      const startX = 56;
      const mainY = 58;
      const branchY = 156;
      const commits = portfolioVersionHistory.map((commit, index) => ({
        ...commit,
        x: startX + index * spacing,
        y: commit.lane === "branch" ? branchY : mainY,
      }));

      const firstBranch = commits.find((commit) => commit.lane === "branch");
      const lastBranch = [...commits].reverse().find((commit) => commit.lane === "branch");
      const mergeCommit = commits.find((commit) => commit.isMerge);
      const lastMain = [...commits].reverse().find((commit) => commit.lane === "main");
      const trackWidth = commits[commits.length - 1].x + spacing;
      const trackHeight = 310;

      track.innerHTML = "";
      track.style.width = `${trackWidth}px`;
      track.style.height = `${trackHeight}px`;

      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "version-history__lines");
      svg.setAttribute("viewBox", `0 0 ${trackWidth} ${trackHeight}`);
      svg.setAttribute("aria-hidden", "true");

      if (mergeCommit && lastMain) {
        const mainLine = document.createElementNS("http://www.w3.org/2000/svg", "path");
        mainLine.setAttribute("class", "version-history__line version-history__line--main");
        mainLine.setAttribute("d", `M ${mergeCommit.x} ${mainY} H ${lastMain.x}`);
        svg.appendChild(mainLine);
      }

      if (firstBranch && lastBranch && mergeCommit) {
        const branchLine = document.createElementNS("http://www.w3.org/2000/svg", "path");
        branchLine.setAttribute("class", "version-history__line version-history__line--branch");
        branchLine.setAttribute(
          "d",
          `M ${firstBranch.x} ${branchY} H ${lastBranch.x} C ${lastBranch.x + 72} ${branchY}, ${mergeCommit.x - 86} ${mainY}, ${mergeCommit.x} ${mainY}`
        );
        svg.appendChild(branchLine);
      }

      track.appendChild(svg);

      commits.forEach((commit) => {
        const node = document.createElement("a");
        node.className = `version-node version-node--${commit.lane}${commit.isMerge ? " version-node--merge" : ""}`;
        node.href = `${commitUrlBase}${commit.hash}`;
        node.target = "_blank";
        node.rel = "noopener noreferrer";
        node.style.setProperty("--node-x", `${commit.x}px`);
        node.style.setProperty("--node-y", `${commit.y}px`);
        node.setAttribute("aria-label", `${commit.date}: ${commit.message}`);

        const dot = document.createElement("span");
        dot.className = "version-node__dot";

        const label = document.createElement("span");
        label.className = "version-node__label";

        const date = document.createElement("span");
        date.className = "version-node__date";
        date.textContent = commit.date;

        const hash = document.createElement("span");
        hash.className = "version-node__hash";
        hash.textContent = commit.hash;

        const message = document.createElement("span");
        message.className = "version-node__message";
        message.textContent = commit.message;

        label.append(date, hash, message);
        node.append(dot, label);
        track.appendChild(node);
      });
    });
  }

  initVersionHistoryGraphs();
//#endregion

// ==========================================
//#region    FILTER/SORT BUTTON
// ==========================================
  const sortToggleBtn = document.querySelector('.sort-toggle-btn');
  const sortMenu = document.querySelector('.sort-menu');
  const sortOptions = document.querySelectorAll('.sort-option');
  const projectItems = document.querySelectorAll('.project-item');
  const container = document.querySelector('.contain');//We use a arbitrary class contain as the container because textfonts has attributes, it messes with the layout to be use as a container

  // 1. Toggle dropdown menu
  sortToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation(); 
      sortMenu.classList.toggle('show');
  });

  // 2. Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
      if (!sortMenu.contains(e.target) && e.target !== sortToggleBtn) {
          sortMenu.classList.remove('show');
      }
  });

  // 3. Handle Sorting
  sortOptions.forEach(btn => {
      btn.addEventListener('click', () => {
          // Update active state
          sortOptions.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          sortMenu.classList.remove('show'); // Hide menu

          const sortBy = btn.getAttribute('data-sort'); 
          const itemsArray = Array.from(projectItems);

          itemsArray.sort((a, b) => {
              const catA = a.getAttribute('data-category'); // e.g., 'projects' or 'research'
              const catB = b.getAttribute('data-category');
              
              // Using corrected data-original-order
              const orderA = parseInt(a.getAttribute('data-original-order'), 10);
              const orderB = parseInt(b.getAttribute('data-original-order'), 10);

              if (sortBy === 'research') {
                  if (catA === 'research' && catB !== 'research') return -1;
                  if (catA !== 'research' && catB === 'research') return 1;
                  return orderA - orderB; 
              } 
              else if (sortBy === 'project') {
                  // Note: checks against 'projects' based on your data-category HTML
                  if (catA === 'projects' && catB !== 'projects') return -1;
                  if (catA !== 'projects' && catB === 'projects') return 1;
                  return orderA - orderB;
              } 
              else {
                  // 'all' / Default
                  return orderA - orderB;
              }
          });

          // Re-append items to DOM
          itemsArray.forEach(item => {
              container.appendChild(item);
          });

          // Refresh ScrollTrigger to recalculate heights and pin positions
          if (typeof ScrollTrigger !== "undefined") {
              ScrollTrigger.refresh();
          }
      });
  });
//#endregion

// ==========================================
//#region  CORE ACCORDION FUNCTIONS
// ==========================================
  
  /** Creates a pinning effect for the active collapsible button.
   * The button stays pinned to the top of the viewport while its content scrolls past.
   * 
   * @param {HTMLElement} btn - The collapsible button element.
   * @param {HTMLElement} content - The content wrapper corresponding to the button.
   */
  
  function ActivateTrigger(btn, content) {
    // If this button already has a trigger in the Map, do nothing.
    if (triggerMap.has(btn)) return;
      // 2. STOP HERE if the screen is wider than 786px (Desktop)
  if (window.innerWidth > 786) return; 
    // Only run the global safety kill during individual interaction
    if(!isBatchOpening && collapsibleTrigger){
      collapsibleTrigger.kill(true);
      collapsibleTrigger = null;
    }
    // Pin the button to the top. Unpin when the bottom of the content reaches the top of the viewport.
    collapsibleTrigger = ScrollTrigger.create({
      trigger: btn,
      start: "top top",
      endTrigger: content,
      end: () => "+=" + content.scrollHeight, // Dynamically calculates end point based on content height
      pin: true,
      pinSpacing: false,        // Prevents GSAP from adding extra padding below the pinned element
      invalidateOnRefresh: true, // Forces recalculation of start/end values on window resize

      onLeaveBack: () => {

      if (isAccordionClick) return; 
      if (CurrentlyOpen && CurrentlyOpen.button === btn) {
        CloseCurrent();
      }
    }
    });
    
    collapsibleTrigger.refresh();
    // Use a map to store objects: the key btn and its values trigger & content
    triggerMap.set(btn, {trigger: collapsibleTrigger, content});
  }
  /**
   * Closes the currently active collapsible, removes its pin, 
   * and resets the viewport to the button's natural position.
   */
  function CloseCurrent() {
    window.isAccordionOpen = false;
    if (!CurrentlyOpen) return;
    const { button, content } = CurrentlyOpen;

    //Remove the pinning effect
    if (collapsibleTrigger) {
      collapsibleTrigger.kill(true);
      collapsibleTrigger = null;
    }
    //Remove the button from the map so it can be re-pinned later
    triggerMap.delete(button); 

    //Prevent viewport jumping/getting lost by scrolling the user back to the button
    button.scrollIntoView({ block: "start" });

    //Reset DOM states to collapse the content
    button.classList.remove("active");
    content.style.maxHeight = null;
    
    CurrentlyOpen = null;
    //Notify GSAP that the DOM layout has changed so it can update all page markers
    setTimeout(() => {
    // ActivateTrigger(this, content);
    ScrollTrigger.refresh();
    }, 100); 
  }
//#endregion

// ==========================================
//#region INDIVIDUAL EXPAND/COLLAPSE LOGIC
// ==========================================
  function IndivClick() {
    collapsibles.forEach(function(btn, index) {
      btn.dataset.index = index; 
      btn.addEventListener("click", function() {

        isAccordionClick = true; //ENGAGE THE LOCK: Stop the scroll trigger from firing

        window.isAccordionAnimating = true; // <--- 1. LOCK THE HEADER HERE
        document.documentElement.classList.add('disable-scroll-padding');
        
        const btnIndex = parseInt(this.dataset.index);
        const content = this.nextElementSibling;
        const isOpening = !this.classList.contains("active");

        if (isOpening && CurrentlyOpen && CurrentlyOpen.button !== this) {
          CloseCurrent();
        }
        if (isOpening) {
          this.classList.add("active");
          content.style.maxHeight = content.scrollHeight + "px";

          CurrentlyOpen = { button: this, content };
          window.isAccordionOpen = true; // <--- ADD THIS: Tell the header it's open
          setTimeout(() => {
            ActivateTrigger(this, content);
            ScrollTrigger.refresh();
            //RELEASE THE LOCK: Animation is done, safe to detect scrolls again
            //Also reset lastScroll so it doesn't calculate a massive jump
            lastScroll = ScrollTrigger.maxScroll(window) ? window.scrollY : lastScroll;
            isAccordionClick = false; 
            window.isAccordionAnimating = false; // <--- 2. UNLOCK HEADER (Opening finished)
            document.documentElement.classList.remove('disable-scroll-padding'); // <--- Turn it back on!
          }, 400); 
        } else {
          CloseCurrent();
          window.isAccordionOpen = false; // <--- ADD THIS: Tell the header it's closed
          //RELEASE THE LOCK for the closing scenario too
          setTimeout(() => {
             lastScroll = ScrollTrigger.maxScroll(window) ? window.scrollY : lastScroll;
             isAccordionClick = false;
            window.isAccordionAnimating = false; // <--- 2. UNLOCK HEADER (Opening finished)
            document.documentElement.classList.remove('disable-scroll-padding'); // <--- Turn it back on!
          }, 400);
        }
      });
    });
  }
  IndivClick();
//#endregion

// ==========================================
//#region EXPAND ALL / COLLAPSE ALL LOGIC
// ==========================================
  if (toggleAllBtn) {
    toggleAllBtn.addEventListener("click", function() {
      const label = this.textContent.trim().toLowerCase(); // Normalize for safe comparison
      
      // ✅ EXPAND ALL
      if (label === "expand all") {
        isBatchOpening = true;
        collapsibles.forEach(function(btn) {
          if (!btn.classList.contains("active")) { // Skip already open ones
            btn.classList.add("active");
            const content = btn.nextElementSibling;
            content.style.maxHeight = content.scrollHeight + "px";
            if (typeof Transition === 'function') Transition(content);
            ActivateTrigger(btn, content);
          }
        });
        // Refresh ScrollTrigger ONCE after all buttons are expanded and transitions finish
        setTimeout(() => ScrollTrigger.refresh(), 400);
        this.textContent = "Collapse all"; // Update text
        return;
      }
      // ✅ COLLAPSE ALL
      if (label === "collapse all") {
        // Loop through all currently open buttons
        collapsibles.forEach(function(btn) {
          if (btn.classList.contains("active")) {
            btn.classList.remove("active"); // Close visually
            let content;
            const entry = triggerMap.get(btn);
            if (entry) {
              // MOBILE: GSAP mutated the DOM with a pin-spacer. 
              // We MUST use the safely stored reference.
              content = entry.content;
              // Kill trigger and revert DOM mutations
              if (entry.trigger) entry.trigger.kill(true);
              triggerMap.delete(btn);
            } else {
              // DESKTOP: No ScrollTrigger, DOM is untouched.
              content = btn.nextElementSibling;
            }
            // Close the content using the correct reference
            if (content) {
              content.style.maxHeight = null;
              if (typeof Transition === 'function') Transition(content);
            }
          }
        });
        // Refresh ScrollTrigger ONCE after all buttons are collapsed
        setTimeout(() => ScrollTrigger.refresh(), 400);
        this.textContent = "Expand all"; // Reset state
      }
    });
  }
//#endregion

// ==========================================
//#region DYNAMIC HEADER HEIGHT CALCULATION
// ==========================================
  function updateHeaderHeight() { // Defining the function of header-height variable
    const height = siteHeader.offsetHeight;
    document.documentElement.style.setProperty('--header-height', height + 'px');
  }
  const mm = gsap.matchMedia();
  mm.add("(min-width: 786px)", () => {//Ignore calculating header height for mobile screens, so the section can be at top when navigated to
  updateHeaderHeight();
  window.addEventListener('resize', updateHeaderHeight);//For when the URl bar in mobile browser disappears due to scrolling
    // GSAP calls this when the condition no longer matches
    return () => {
        window.removeEventListener('resize', updateHeaderHeight);//When it reappears
    };
  });
  // });
  // Make the function adaptable to header height change (due to screen change)
//#endregion

// ==========================================
//#region MOBILE MENU NAVIGATION
// ==========================================
  const menuToggle = document.querySelector('#mobile-menu');
  const navLinks = document.querySelector('#nav-links');
  const navItems = document.querySelectorAll('.nav a');
  // Toggle the popup and hamburger animation
  menuToggle.addEventListener('click', () => {
      // menuToggle.classList.toggle('is-active');
      navLinks.classList.toggle('active');

      // Optional: Prevent background scrolling when menu is open
      if (navLinks.classList.contains('active')) {
          document.body.style.overflow = 'hidden';
      } else {
          document.body.style.overflow = '';
      }
  });
  // Close the popup smoothly when a link is clicked
  navItems.forEach(item => {
      item.addEventListener('click', () => {
          // menuToggle.classList.remove('is-active');
          navLinks.classList.remove('active');
          document.body.style.overflow = ''; // Restore scrolling
      });
  });
//#endregion
});
