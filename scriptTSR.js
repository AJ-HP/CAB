document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM fully loaded and parsed"); // Log when DOM is ready

    // --- START: Demo Smoke Tests Data ---
    // Edit this object to update platform smoke tests
    const smokeTestsData = {
        "My Gateway (MGW)": [
            "Login",
            "Register new employee",
            "Upload a document (Records of Care)",
            "Policy document links",
            "Cancel/change an appointment",
            "Viewing a report (Documents Tab)"
        ],
        "Client Portal": [
            "Log in",
            "Generate and submit both a referral and a questionnaire (Prerequisite to GW2 Item 2)",
            "View documents and reports",
            "Re-refer a rejected referral"
        ],
        "Gateway 2 (GW2)": [
            "Log in",
            "Both triage and screening cases can be created (Client Portal Item 2 to be done first)",
            "Cases Lists, sorting and filtering (larger client)",
            "Publishing report (outcome)",
            "Booking an appointment (1 or more types)",
            "Closing a case (tidy up created test cases)"
        ],
        "Gateway Platform (GWP)": [
            "TBC"
        ],
        "Workplace Support (WPS)": [
            "TBC"
        ],
        "Customer Management Module (CMM)": [
            "Log in",
            "Do the Tabs load correctly",
            "Add availability to a clinician"
        ],
        "Gateway For Professionals (G4P)": [
            "TBC"
        ],
        "Gateway For Finance (G4F)": [
            "Login in to the system",
            "Login out from the system",
            "Check visibility and accessibility of the clients and backing sheets",
            "Check access to the Client configuration ",
            "Check the Sage product list",
            "Import base case fee, action fee and others fees from GW2",
            "Sorting fees by Div/Loc/Dep or types of fee group",
            "Amend/ Move and Approved of the fee",
            "Download the backing sheet"
        ]
    };

    // --- Initialize Demo Smoke Tests Dropdown ---
    const platformSelect = document.getElementById('platformSelect');
    const smokeTestsList = document.getElementById('smokeTestsList');

    if (platformSelect && smokeTestsList) {
        // Populate dropdown with platform names
        Object.keys(smokeTestsData).forEach(platform => {
            const option = document.createElement('option');
            option.value = platform;
            option.textContent = platform;
            platformSelect.appendChild(option);
        });

        // Handle platform selection
        platformSelect.addEventListener('change', function() {
            const selectedPlatform = this.value;
            smokeTestsList.innerHTML = '';

            if (selectedPlatform && smokeTestsData[selectedPlatform]) {
                const platformHeader = document.createElement('h5');
                platformHeader.className = 'smoke-test-platform-header';
                platformHeader.textContent = selectedPlatform;
                smokeTestsList.appendChild(platformHeader);

                const testList = document.createElement('ul');
                testList.className = 'smoke-test-items';
                smokeTestsData[selectedPlatform].forEach(test => {
                    const listItem = document.createElement('li');
                    listItem.textContent = test;
                    testList.appendChild(listItem);
                });
                smokeTestsList.appendChild(testList);

                // Auto-expand section when platform is selected
                const demoSection = document.getElementById('demoSmokeTestsContent');
                if (demoSection) {
                    demoSection.classList.remove('collapsed');
                    const header = document.querySelector('.section-header[data-target="demoSmokeTestsContent"]');
                    if (header) {
                        const toggleIcon = header.querySelector('.toggle-icon');
                        if (toggleIcon) toggleIcon.innerHTML = '&#9660;';
                    }
                }
            }
        });
    }
    // --- END: Demo Smoke Tests Logic ---

    // --- START: Textarea Auto-Resize Logic ---
    const allTextareas = document.querySelectorAll('textarea');

    // Shared auto-resize function that can be called on any textarea
    function autoResizeTextarea(textarea) {
        if (!textarea || textarea.isResizing) return;
        textarea.isResizing = true;

        // Store current scroll position to prevent page jump
        const scrollTop = window.pageYOffset;

        // Reset height to auto to get accurate scrollHeight
        textarea.style.height = 'auto';
        
        // Calculate the content height
        const computedStyle = window.getComputedStyle(textarea);
        const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
        const paddingBottom = parseFloat(computedStyle.paddingBottom) || 0;
        const borderTop = parseFloat(computedStyle.borderTopWidth) || 0;
        const borderBottom = parseFloat(computedStyle.borderBottomWidth) || 0;
        
        // Get the scroll height (content height)
        let contentHeight = textarea.scrollHeight;
        
        // Ensure minimum height of 60px for empty or small textareas (during editing)
        const minHeight = 60;
        const newHeight = Math.max(contentHeight, minHeight);
        
        textarea.style.height = newHeight + 'px';

        // Restore scroll position
        window.scrollTo(0, scrollTop);
        
        textarea.isResizing = false;
    }

    allTextareas.forEach(textarea => {
        textarea.isResizing = false;

        textarea.addEventListener('input', function() {
            autoResizeTextarea(this);
        }, false);

        // Initial resize for any pre-filled textareas
        if (textarea.value) {
            // Use setTimeout to ensure DOM is fully rendered
            setTimeout(() => autoResizeTextarea(textarea), 0);
        }
    });
    // --- END: Textarea Auto-Resize Logic ---


    const sectionHeaders = document.querySelectorAll('.section-header');
    console.log("Found section headers:", sectionHeaders.length); // Log number of headers found

    const releaseVersionInput = document.getElementById('releaseVersion');
    const conclusionTextarea = document.getElementById('conclusionText');
    const reportDateInput = document.getElementById('reportDate'); // Get the date input


    // Function to set today's date
    function setTodayDate() {
        if (reportDateInput) {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
            const day = String(today.getDate()).padStart(2, '0');
            reportDateInput.value = `${year}-${month}-${day}`;
            console.log("Report date set to today:", reportDateInput.value);
        } else {
            console.error("Report date input not found.");
        }
    }

    // Call setTodayDate on page load
    setTodayDate();


    // Function to update release version in the conclusion text
    function updateReleaseVersionInConclusion() {
        console.log("updateReleaseVersionInConclusion called");
        const version = releaseVersionInput ? releaseVersionInput.value.trim() : '';
        console.log("Release version input value:", releaseVersionInput ? releaseVersionInput.value : 'null');
        console.log("Trimmed version:", version);

        // Skip replacement if version is empty to preserve the placeholder
        if (!version) {
            console.log("Version is empty, skipping replacement.");
            return;
        }

        if (conclusionTextarea) {
            let currentConclusionText = conclusionTextarea.value;
            console.log("Current conclusion text:", currentConclusionText);

            // Regex to match the placeholder or any existing version (capture everything up to " is deemed")
            const versionRegex = /Release\s+\[Insert Release Version Number\/Name\]|Release\s+.+?(?=\s+is deemed)/i;
            conclusionTextarea.value = currentConclusionText.replace(versionRegex, `Release ${version}`);
            console.log("Conclusion text after replacing version:", conclusionTextarea.value);

            // Manually trigger resize for conclusionTextarea after its content changes
            if (typeof conclusionTextarea.dispatchEvent === 'function') {
                conclusionTextarea.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
            }
        } else {
            console.error("Conclusion textarea not found.");
        }
    }

    // Add event listener to update release version in conclusion when release version input changes
    if (releaseVersionInput) {
        releaseVersionInput.addEventListener('input', updateReleaseVersionInConclusion);
        console.log("Event listener added to releaseVersionInput");
    } else {
        console.error("releaseVersionInput not found, event listener not added.");
    }


    // Initial update of release version in conclusion on page load, only if necessary elements exist
    if (releaseVersionInput && conclusionTextarea) {
        updateReleaseVersionInConclusion(); // This will now also trigger the resize
        console.log("Initial updateReleaseVersionInConclusion called.");
    } else {
        console.error("Required input elements for initial conclusion update not found on DOM load."); // Log if elements are missing
    }


    // Add click listeners to section headers for collapsing
    sectionHeaders.forEach(header => {
        header.addEventListener('click', function () {
            console.log('Header clicked:', this.textContent); // Log to check if click is registered
            const targetId = this.dataset.target;
            const targetContent = document.getElementById(targetId);
            const toggleIcon = this.querySelector('.toggle-icon');

            if (targetContent) { // Check if target content element exists
                console.log('Target content found:', targetContent.id); // Log if target content is found
                targetContent.classList.toggle('collapsed');
                console.log('Class toggled. Current classes:', targetContent.classList); // Log classes after toggle

                if (targetContent.classList.contains('collapsed')) {
                    if (toggleIcon) toggleIcon.innerHTML = '&#9658;'; // Right arrow
                } else {
                    if (toggleIcon) toggleIcon.innerHTML = '&#9660;'; // Down arrow
                }
            } else {
                console.error('Target content not found for:', targetId); // Log error if target content is not found
            }
        });
    });

    // Function to check if an individual input/textarea has actual content (not just placeholder)
    function isInputActuallyEmpty(inputElement) {
        if (!inputElement) return true; // Treat non-existent input as empty
        const value = inputElement.value.trim();
        const placeholder = inputElement.placeholder ? inputElement.placeholder.trim() : '';
        // Also check if the content is just "N/A" (which can happen after a print -> restore -> print cycle)
        return value === '' || value === placeholder || value.toLowerCase() === 'n/a';
    }

    // Function to check if a section's inputs have actual content (not just placeholder)
    function hasActualContent(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return false; // Return false if section doesn't exist

        // Special handling for Demo Smoke Tests section
        if (sectionId === 'demoSmokeTestsContent') {
            const platformSelect = section.querySelector('#platformSelect');
            return platformSelect && platformSelect.value !== '';
        }

        const inputs = section.querySelectorAll('input[type="text"], input[type="date"], textarea');
        let hasContent = false;
        inputs.forEach(input => {
            // Check if input has any content that is not its placeholder or "N/A"
            if (!isInputActuallyEmpty(input)) {
                hasContent = true;
            }
        });
        return hasContent;
    }

    // List of sections that should collapse if empty on initial load
    const optionalSections = [
        'functionalRisksContent', 
        'securityConcernsContent', 
        'performanceImprovementsContent',
        'aiImpactContent', 
        'notTestedContent',
        'demoSmokeTestsContent'
    ];

    // Initial check and collapse empty sections on load
    sectionHeaders.forEach(header => {
        const targetId = header.dataset.target;
        const targetContent = document.getElementById(targetId);

        if (optionalSections.includes(targetId) && targetContent) {
            if (!hasActualContent(targetId)) { // Check if section *doesn't* have actual content
                targetContent.classList.add('collapsed');
                const toggleIcon = header.querySelector('.toggle-icon');
                if (toggleIcon) toggleIcon.innerHTML = '&#9658;'; // Right arrow
                console.log(`Initial collapse: ${targetId} is empty and collapsed.`); // Log initial collapse
            }
        }
    });

    // Add event listeners to input fields to check section emptiness on input
    document.querySelectorAll('.section-content textarea, .section-content input[type="text"], .section-content input[type="date"]').forEach(input => {
        input.addEventListener('input', function () {
            // Find the parent section content div
            let parentSectionContent = this.closest('.section-content');
            if (parentSectionContent) {
                let header = document.querySelector(`.section-header[data-target="${parentSectionContent.id}"]`);
                if (header) {
                    // Only apply auto-expand logic to optional sections when content is added
                    if (optionalSections.includes(parentSectionContent.id)) {
                        if (hasActualContent(parentSectionContent.id)) {
                            // If content is added, ensure it's not collapsed
                            parentSectionContent.classList.remove('collapsed');
                            const toggleIcon = header.querySelector('.toggle-icon');
                            if (toggleIcon) toggleIcon.innerHTML = '&#9660;';
                        } 
                        // Note: We don't re-collapse if content is deleted, as that can be annoying during editing.
                    }
                }
            }
        });
    });

    // List of sections that should have a "No Content" message on print if empty
    const sectionsForPrintNA = [
        'functionalRisksContent', 
        'securityConcernsContent', 
        'performanceImprovementsContent', 
        'aiImpactContent', 
        'notTestedContent',
        'demoSmokeTestsContent',
        'conclusionContent'
    ];


    // Logic before printing
    window.addEventListener('beforeprint', () => {
        console.log("Before print event triggered. Transforming to presentation mode."); 

        // 1. --- Collect ALL inputs/textareas for transformation ---
        const allTransformableInputs = [
            // Top fields
            ...document.querySelectorAll('.top-fields input[type="text"], .top-fields input[type="date"]'),
            // Section fields
            ...document.querySelectorAll('.section-content input[type="text"], .section-content textarea')
        ];
        
        let sectionHadAnyActualContentMap = {};

        // 2. --- Transform all inputs/textareas to presentation mode ---
        allTransformableInputs.forEach(input => {
            const isInputEmpty = isInputActuallyEmpty(input);
            const parentSection = input.closest('.section-content');
            
            // Store original values/styles for afterprint restoration
            input._originalValue = input.value; 
            input._originalReadOnly = input.readOnly;
            input._originalDisplay = input.style.display;
            input._originalHeight = input.style.height; 
            input._originalMinHeight = input.style.minHeight; 
            input._originalOverflowY = input.style.overflowY; 
            

            // Apply presentation mode settings to ALL fields
            input.readOnly = true;

            if (isInputEmpty) {
                // For empty inputs, set N/A value and apply N/A styling class
                input.value = "N/A";
                input.classList.add('print-na-input'); 
            } else {
                // For filled inputs, ensure no N/A styling class is present
                input.classList.remove('print-na-input');
                
                // Track content presence for section-level messages
                if (parentSection) {
                   sectionHadAnyActualContentMap[parentSection.id] = true;
                }
            }

            // Size textareas to their exact content height for printing
            if (input.tagName.toLowerCase() === 'textarea') {
                input.style.minHeight = 'auto';
                input.style.height = 'auto';
                input.style.overflowY = 'visible';
                
                // Force layout recalculation
                void input.offsetHeight;
                
                // Set to exact content height (no minimum)
                const scrollHeight = input.scrollHeight;
                input.style.height = scrollHeight + 'px';
            }
        });

        // Special handling for Demo Smoke Tests section - check if platform is selected
        const demoSmokeTestsPlatformSelect = document.getElementById('platformSelect');
        if (demoSmokeTestsPlatformSelect && demoSmokeTestsPlatformSelect.value !== '') {
            sectionHadAnyActualContentMap['demoSmokeTestsContent'] = true;
        }


        // 3. --- Handle Section Expansion and "No Content" Messages ---
        document.querySelectorAll('.section-content').forEach(content => {
            // Ensure all sections are expanded for printing
            content.classList.remove('collapsed');
            content.style.maxHeight = 'none'; 

            const sectionId = content.id;
            const messageElement = content.querySelector('.no-content-message');

            // Find all inputs that belong to THIS section only
            const sectionInputs = content.querySelectorAll('input[type="text"], textarea');

            // Handle the main section's "No content" message if the *entire section* is empty
            if (sectionsForPrintNA.includes(sectionId)) {
                if (!sectionHadAnyActualContentMap[sectionId]) { 
                    
                    // Logic for generating section name for the message
                    let sectionName = '';
                    if (sectionId === 'functionalRisksContent') sectionName = 'Functional Risks';
                    else if (sectionId === 'securityConcernsContent') sectionName = 'Security Concerns';
                    else if (sectionId === 'performanceImprovementsContent') sectionName = 'Performance Improvements';
                    else if (sectionId === 'aiImpactContent') sectionName = 'AI Impact';
                    else if (sectionId === 'notTestedContent') sectionName = 'Untested Items';
                    else if (sectionId === 'demoSmokeTestsContent') sectionName = 'Demo Smoke Tests';
                    else if (sectionId === 'conclusionContent') sectionName = 'Conclusion';

                    const releaseVersion = releaseVersionInput ? releaseVersionInput.value.trim() : '[Release Version]';
                    const message = `No ${sectionName} identified for Release ${releaseVersion}.`;

                    if (messageElement) {
                        messageElement.textContent = message;
                        messageElement.style.display = 'block';
                    }
                    // Hide all inputs within this entirely empty section, as the main message covers it
                    sectionInputs.forEach(input => {
                        input.style.display = 'none';
                    });
                } else {
                    // If the section *does* have some content, hide the main "No content" message
                    if (messageElement) {
                        messageElement.style.display = 'none';
                    }
                }
            }
        });
    });

    // Logic after printing
    window.addEventListener('afterprint', () => {
        console.log("After print event triggered. Restoring form mode.");

        // 1. --- Collect ALL inputs/textareas that were transformed ---
        const allTransformableInputs = [
            ...document.querySelectorAll('.top-fields input[type="text"], .top-fields input[type="date"]'),
            ...document.querySelectorAll('.section-content input[type="text"], .section-content textarea')
        ];

        // 2. --- Restore all inputs/textareas ---
        allTransformableInputs.forEach(input => {
            // Restore original state if stored
            if (input._originalValue !== undefined) {
                input.value = input._originalValue;
                input.readOnly = input._originalReadOnly;
                input.style.display = input._originalDisplay;
                input.classList.remove('print-na-input'); // Remove N/A styling class

                if (input.tagName.toLowerCase() === 'textarea') {
                    input.style.height = input._originalHeight; 
                    input.style.minHeight = input._originalMinHeight; 
                    input.style.overflowY = input._originalOverflowY; 
                    
                    // Re-apply auto-resize to restore proper height
                    setTimeout(() => {
                        input.style.height = 'auto';
                        const minHeight = 60;
                        const newHeight = Math.max(input.scrollHeight, minHeight);
                        input.style.height = newHeight + 'px';
                    }, 0);
                }
            }
        });

        // 3. --- Restore Section Content and Collapse State ---
        document.querySelectorAll('.section-content').forEach(content => {
            // Remove added messages and restore display
            const messageElement = content.querySelector('.no-content-message');
            
            if (messageElement) {
                messageElement.style.display = 'none'; 
            }
            
            // Restore max-height for collapsing functionality
            content.style.maxHeight = '1000px';

        });

        // Re-apply collapsed state after printing
        sectionHeaders.forEach(header => {
            const targetId = header.dataset.target;
            const targetContent = document.getElementById(targetId);
            
            // Re-collapse sections that were empty initially (only optional sections)
            if (optionalSections.includes(targetId) && targetContent) {
                if (!hasActualContent(targetId)) { // Check if section still has NO actual content
                    targetContent.classList.add('collapsed');
                    const toggleIcon = header.querySelector('.toggle-icon');
                    if (toggleIcon) toggleIcon.innerHTML = '&#9658;'; // Right arrow
                }
            }
        });
    });
});