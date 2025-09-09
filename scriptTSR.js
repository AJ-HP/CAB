document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM fully loaded and parsed"); // Log when DOM is ready

    // --- START: Textarea Auto-Resize Logic ---
    const allTextareas = document.querySelectorAll('textarea');

    allTextareas.forEach(textarea => {
        // Set a property to prevent re-triggering if an update is programmatic
        textarea.isResizing = false;

        function autoResize() {
            if (textarea.isResizing) return; // Prevent recursion if updateReleaseVersionInConclusion triggers input
            textarea.isResizing = true;

            // Temporarily reduce height to ensure scrollHeight is calculated correctly if text is deleted
            textarea.style.height = 'auto';
            // Set the height to the scroll height, adding a pixel or two for padding/border if necessary
            // For most browsers, scrollHeight is sufficient.
            textarea.style.height = textarea.scrollHeight + 'px';

            textarea.isResizing = false;
        }

        textarea.addEventListener('input', autoResize, false);

        // Initial resize for any pre-filled textareas
        // (especially for #conclusionText or if loaded from storage)
        if (textarea.value) {
            autoResize();
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
        const version = releaseVersionInput ? releaseVersionInput.value.trim() : '[Insert Release Version Number/Name]';
        console.log("Release version input value:", releaseVersionInput ? releaseVersionInput.value : 'null');
        console.log("Trimmed version:", version);

        if (conclusionTextarea) {
            let currentConclusionText = conclusionTextarea.value;
            console.log("Current conclusion text:", currentConclusionText);

            const versionRegex = /Release\s+\[Insert Release Version Number\/Name\]|Release\s+([\w.-]*)/i;
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
        return value === '' || value === placeholder;
    }

    // Function to check if a section's inputs have actual content (not just placeholder)
    function hasActualContent(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return false; // Return false if section doesn't exist

        const inputs = section.querySelectorAll('input[type="text"], input[type="date"], textarea');
        let hasContent = false;
        inputs.forEach(input => {
            if (!isInputActuallyEmpty(input)) {
                hasContent = true;
            }
        });
        return hasContent;
    }

    // Initial check and collapse empty sections on load
    sectionHeaders.forEach(header => {
        const targetId = header.dataset.target;
        const targetContent = document.getElementById(targetId);

        // Only collapse Functional Risks, Security, and Performance if empty
        if (['functionalRisksContent', 'securityConcernsContent', 'performanceImprovementsContent'].includes(targetId) && targetContent) {
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
                    // Only toggle collapse for the relevant sections
                    if (['functionalRisksContent', 'securityConcernsContent', 'performanceImprovementsContent'].includes(parentSectionContent.id)) {
                        if (!hasActualContent(parentSectionContent.id)) {
                            // If section becomes empty, collapse it (optional, might be annoying)
                            // parentSectionContent.classList.add('collapsed');
                            // header.querySelector('.toggle-icon').innerHTML = '&#9658;';
                        } else {
                            // If content is added, ensure it's not collapsed
                            parentSectionContent.classList.remove('collapsed');
                            const toggleIcon = header.querySelector('.toggle-icon');
                            if (toggleIcon) toggleIcon.innerHTML = '&#9660;';
                        }
                    }
                }
            }
        });
    });

    // Logic before printing
    window.addEventListener('beforeprint', () => {
        console.log("Before print event triggered."); // Log before print

        // --- START: Ensure textareas are fully expanded for print ---
        allTextareas.forEach(textarea => {
            // Ensure the textarea shows all its content
            textarea.style.height = 'auto'; // Reset height
            textarea.style.height = textarea.scrollHeight + 'px'; // Set to scroll height
            textarea.style.overflowY = 'hidden'; // Hide scrollbar for printing if any
        });
        // --- END: Ensure textareas are fully expanded for print ---


        document.querySelectorAll('.section-content').forEach(content => {
            // Ensure all sections are expanded for printing
            content.classList.remove('collapsed');
            content.style.maxHeight = 'none'; // Ensure max-height is removed for print

            const sectionId = content.id;
            const messageElement = content.querySelector('.no-content-message');
            const inputs = content.querySelectorAll('input[type="text"], textarea'); // Only text/textarea for N/A logic

            let sectionHadAnyActualContent = false; // Flag to track if the *entire section* had any actual content

            inputs.forEach(input => {
                if (isInputActuallyEmpty(input)) {
                    // If individual input is empty, set N/A and style for print
                    input._originalValue = input.value; // Store original value
                    input._originalDisplay = input.style.display; // Store original display
                    input._originalReadOnly = input.readOnly; // Store original readOnly state
                    input._originalBorder = input.style.border;
                    input._originalBgColor = input.style.backgroundColor;
                    input._originalBoxShadow = input.style.boxShadow;
                    input._originalColor = input.style.color;
                    input._originalHeight = input.style.height; // Store height
                    input._originalMinHeight = input.style.minHeight; // Store minHeight
                    input._originalOverflowY = input.style.overflowY; // Store overflowY


                    input.value = "N/A";
                    input.readOnly = true;
                    input.classList.add('print-na-input'); // Add class for N/A styling
                    input.style.display = ''; // Ensure it's visible if it was hidden
                    if (input.tagName.toLowerCase() === 'textarea') {
                        input.style.height = 'auto'; // Let N/A take minimal space
                        input.style.minHeight = 'auto';
                        input.style.overflowY = 'hidden';
                    }
                } else {
                    sectionHadAnyActualContent = true; // Mark section as having content
                    // Ensure it's not read-only or styled as N/A from a previous print
                    input.readOnly = false;
                    input.classList.remove('print-na-input');
                    input.style.display = ''; // Ensure it's visible
                    if (input.tagName.toLowerCase() === 'textarea') {
                        // Ensure height is set to show all content for print
                        input.style.height = 'auto';
                        input.style.height = input.scrollHeight + 'px';
                        input.style.overflowY = 'hidden';
                    }
                }
            });

            // Handle the main section's "No content" message if the *entire section* is empty
            if (['functionalRisksContent', 'securityConcernsContent', 'performanceImprovementsContent', 'conclusionContent'].includes(sectionId)) {
                if (!sectionHadAnyActualContent) { // If the entire section is truly empty
                    let sectionName = '';
                    if (sectionId === 'functionalRisksContent') sectionName = 'Functional Risks';
                    else if (sectionId === 'securityConcernsContent') sectionName = 'Security Concerns';
                    else if (sectionId === 'performanceImprovementsContent') sectionName = 'Performance Improvements';
                    else if (sectionId === 'conclusionContent') sectionName = 'Conclusion';

                    const releaseVersion = releaseVersionInput ? releaseVersionInput.value.trim() : '[Release Version]';
                    const message = `No ${sectionName} identified for Release ${releaseVersion}.`;

                    if (messageElement) {
                        messageElement.textContent = message;
                        messageElement.style.display = 'block';
                        console.log(`Added "No content" message to ${sectionId}`); // Log message addition
                    }
                    // Hide all inputs within this entirely empty section, as the main message covers it
                    inputs.forEach(input => {
                        input.style.display = 'none';
                    });
                } else {
                    // If the section *does* have some content, hide the main "No content" message
                    if (messageElement) {
                        messageElement.style.display = 'none';
                    }
                    // Inputs are already handled in the loop above
                }
            }
        });
    });

    // Logic after printing
    window.addEventListener('afterprint', () => {
        console.log("After print event triggered."); // Log after print

        document.querySelectorAll('.section-content').forEach(content => {
            // Remove added messages and restore display
            const messageElement = content.querySelector('.no-content-message');
            const inputs = content.querySelectorAll('input[type="text"], textarea'); // Only text/textarea for N/A logic

            if (messageElement) {
                messageElement.style.display = 'none'; // Hide the message again
                console.log(`Removed "No content" message from ${content.id}`); // Log message removal
            }
            inputs.forEach(input => {
                // Restore original state if stored
                if (input._originalValue !== undefined) {
                    input.value = input._originalValue;
                    input.readOnly = input._originalReadOnly;
                    input.style.display = input._originalDisplay;
                    input.classList.remove('print-na-input'); // Remove N/A styling class
                    input.style.border = input._originalBorder; // Restore original border
                    input.style.backgroundColor = input._originalBgColor; // Restore original background
                    input.style.boxShadow = input._originalBoxShadow; // Restore original shadow
                    input.style.color = input._originalColor; // Restore original color
                    if (input.tagName.toLowerCase() === 'textarea') {
                        input.style.height = input._originalHeight; // Restore original height
                        input.style.minHeight = input._originalMinHeight; // Restore original minHeight
                        input.style.overflowY = input._originalOverflowY; // Restore original overflowY
                        // Trigger auto-resize again to adjust to original content
                        if (typeof input.dispatchEvent === 'function') {
                            input.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
                        }
                    }
                }
                // For textareas that were not empty, also re-trigger resize
                else if (input.tagName.toLowerCase() === 'textarea') {
                    if (typeof input.dispatchEvent === 'function') {
                        input.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
                    }
                }
            });

            // Restore max-height for collapsing functionality
            content.style.maxHeight = '1000px'; // Or whatever your default expanded max-height is

        });

        // Re-apply collapsed state after printing
        sectionHeaders.forEach(header => {
            const targetId = header.dataset.target;
            const targetContent = document.getElementById(targetId);
            // Re-collapse sections that were empty initially (only Functional Risks, Security, Performance)
            if (['functionalRisksContent', 'securityConcernsContent', 'performanceImprovementsContent'].includes(targetId) && targetContent) {
                if (!hasActualContent(targetId)) { // Check if section still has NO actual content
                    targetContent.classList.add('collapsed');
                    const toggleIcon = header.querySelector('.toggle-icon');
                    if (toggleIcon) toggleIcon.innerHTML = '&#9658;'; // Right arrow
                    console.log(`Re-collapsed ${targetId} after print.`); // Log re-collapse
                }
            }
        });
    });
});