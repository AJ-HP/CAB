
const userStoryEl = document.getElementById('userStory');
const acceptanceCriteriaEl = document.getElementById('acceptanceCriteria');
const generateBtn = document.getElementById('generateBtn');
const loadingEl = document.getElementById('loading');
const retryStatusEl = document.getElementById('retryStatus');
const resultsEl = document.getElementById('results');
const resultsContainerEl = document.getElementById('resultsContainer');
const messageBox = document.getElementById('messageBox');

// Configuration constants
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff in milliseconds
const REQUEST_TIMEOUT = 30000; // 30 seconds
const MAX_PROMPT_LENGTH = 10000; // Soft limit for prompt length

// Utility function for delays
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Display a custom message box instead of an alert
function showMessage(text, duration = 3000) {
    messageBox.textContent = text;
    messageBox.classList.add('show');
    setTimeout(() => {
        messageBox.classList.remove('show');
    }, duration);
}

// Display retry status (persistent until cleared)
function showRetryStatus(text) {
    if (retryStatusEl) {
        retryStatusEl.textContent = text;
        retryStatusEl.style.display = 'block';
    }
}

// Clear retry status
function clearRetryStatus() {
    if (retryStatusEl) {
        retryStatusEl.textContent = '';
        retryStatusEl.style.display = 'none';
    }
}

// Categorize error and return user-friendly message
function categorizeError(error, response) {
    console.debug('[Error Categorization]', { error, response });
    
    // Network/timeout errors
    if (error.name === 'AbortError') {
        return {
            message: 'Request timed out. The service may be slow. Please try again.',
            isRetryable: true,
            category: 'timeout'
        };
    }
    
    if (!response) {
        return {
            message: 'Connection failed. Check your internet connection.',
            isRetryable: true,
            category: 'network'
        };
    }
    
    // HTTP status code errors
    const status = response.status;
    
    if (status === 400) {
        return {
            message: 'Invalid input data. Please check your user story and acceptance criteria.',
            isRetryable: false,
            category: 'bad_request'
        };
    }
    
    if (status === 429) {
        return {
            message: 'API rate limit reached. Please wait a moment and try again.',
            isRetryable: true,
            category: 'rate_limit'
        };
    }
    
    if (status >= 500 && status < 600) {
        return {
            message: 'AI service temporarily unavailable. Retrying...',
            isRetryable: true,
            category: 'server_error'
        };
    }
    
    // Generic client error
    if (status >= 400 && status < 500) {
        return {
            message: `Client error (${status}). Please check your input.`,
            isRetryable: false,
            category: 'client_error'
        };
    }
    
    // Unknown error
    return {
        message: 'An unexpected error occurred. Please try again.',
        isRetryable: true,
        category: 'unknown'
    };
}

// Enhanced API call function with retry logic, timeout, and error categorization
async function callGeminiApi(prompt, onRetry = null) {
    const netlifyFunctionUrl = 'https://velvety-mermaid-9eae77.netlify.app/.netlify/functions/generate';
    const startTime = performance.now();
    
    console.debug('[API Call] Starting request', {
        timestamp: new Date().toISOString(),
        promptLength: prompt.length,
        endpoint: netlifyFunctionUrl
    });

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        let response = null;
        const attemptStartTime = performance.now();
        
        try {
            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
            
            console.debug(`[API Call] Attempt ${attempt + 1}/${MAX_RETRIES + 1}`, {
                timestamp: new Date().toISOString()
            });
            
            // Make the fetch request with timeout
            response = await fetch(netlifyFunctionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt: prompt }),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            const attemptDuration = performance.now() - attemptStartTime;
            console.debug('[API Call] Response received', {
                status: response.status,
                duration: `${attemptDuration.toFixed(0)}ms`,
                attempt: attempt + 1
            });
            
            if (!response.ok) {
                // Parse error response
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    errorData = { error: 'Unknown error' };
                }
                
                const errorInfo = categorizeError(new Error(errorData.error), response);
                
                console.debug('[API Call] Error response', {
                    status: response.status,
                    errorData,
                    category: errorInfo.category,
                    isRetryable: errorInfo.isRetryable,
                    attempt: attempt + 1
                });
                
                // Only retry if error is retryable and we have attempts left
                if (!errorInfo.isRetryable || attempt >= MAX_RETRIES) {
                    throw new Error(errorInfo.message);
                }
                
                // Wait before retry with exponential backoff
                const delay = RETRY_DELAYS[attempt] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
                console.debug(`[API Call] Retrying after ${delay}ms`, { attempt: attempt + 1 });
                
                if (onRetry) {
                    onRetry(attempt + 1, MAX_RETRIES + 1, errorInfo.message);
                }
                
                await sleep(delay);
                continue; // Retry
            }
            
            // Success - parse and return data
            const data = await response.json();
            const totalDuration = performance.now() - startTime;
            
            console.debug('[API Call] Success', {
                totalDuration: `${totalDuration.toFixed(0)}ms`,
                attempts: attempt + 1,
                responseLength: data.text ? data.text.length : 0
            });
            
            return data.text;
            
        } catch (error) {
            const attemptDuration = performance.now() - attemptStartTime;
            
            console.debug('[API Call] Exception caught', {
                error: error.message,
                errorName: error.name,
                attempt: attempt + 1,
                duration: `${attemptDuration.toFixed(0)}ms`
            });
            
            const errorInfo = categorizeError(error, response);
            
            // Only retry if error is retryable and we have attempts left
            if (!errorInfo.isRetryable || attempt >= MAX_RETRIES) {
                console.error('[API Call] Final failure', {
                    totalDuration: `${(performance.now() - startTime).toFixed(0)}ms`,
                    totalAttempts: attempt + 1,
                    error: error.message,
                    category: errorInfo.category
                });
                throw new Error(errorInfo.message);
            }
            
            // Wait before retry with exponential backoff
            const delay = RETRY_DELAYS[attempt] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
            console.debug(`[API Call] Retrying after ${delay}ms`, { 
                attempt: attempt + 1,
                reason: errorInfo.message 
            });
            
            if (onRetry) {
                onRetry(attempt + 1, MAX_RETRIES + 1, errorInfo.message);
            }
            
            await sleep(delay);
        }
    }
    
    // This should never be reached, but just in case
    throw new Error('Failed to generate test cases after multiple attempts.');
}

async function generateTestCases() {
    const userStory = userStoryEl.value.trim();
    const acceptanceCriteria = acceptanceCriteriaEl.value.trim();

    if (!userStory || !acceptanceCriteria) {
        showMessage('Please enter both a user story and acceptance criteria.', 5000);
        return;
    }

    const systemPrompt = "You are an experienced software tester. You will receive a user story and its acceptance criteria. Your task is to generate a comprehensive set of test cases in Gherkin syntax (Given, When, Then). Ensure you cover both positive scenarios (happy paths) and negative or edge-case scenarios.";

    const userQuery = `User Story:\n${userStory}\n\nAcceptance Criteria:\n${acceptanceCriteria}\n\nNote: The response should only contain the test cases in Gherkin syntax, without any additional preamble or explanation.`;

    // Combine the system prompt and user query to send to your Netlify function
    const fullPrompt = `${systemPrompt}\n\n${userQuery}`;
    
    // Prompt length validation with soft reject
    if (fullPrompt.length > MAX_PROMPT_LENGTH) {
        const confirmMessage = `Your input is very long (${fullPrompt.length} characters) and may fail. Continue anyway?`;
        if (!confirm(confirmMessage)) {
            console.debug('[Validation] User cancelled due to long prompt', { length: fullPrompt.length });
            return;
        }
        console.debug('[Validation] User confirmed long prompt', { length: fullPrompt.length });
    }

    loadingEl.style.display = 'block';
    generateBtn.disabled = true;
    resultsContainerEl.classList.add('hidden');
    clearRetryStatus();
    
    console.debug('[Generate] Starting test case generation', {
        timestamp: new Date().toISOString(),
        promptLength: fullPrompt.length
    });

    try {
        // Pass retry callback to show status updates
        const generatedText = await callGeminiApi(fullPrompt, (attempt, maxAttempts, reason) => {
            showRetryStatus(`Retrying attempt ${attempt + 1} of ${maxAttempts}... (${reason})`);
        });

        resultsEl.textContent = generatedText || "No response generated. Please try again.";
        resultsContainerEl.classList.remove('hidden');
        clearRetryStatus();
        
        console.debug('[Generate] Success', {
            timestamp: new Date().toISOString(),
            resultLength: generatedText ? generatedText.length : 0
        });

    } catch (error) {
        console.error('[Generate] Final error:', error);
        showMessage(error.message, 5000);
        resultsEl.textContent = "An error occurred. Please try again later.";
        resultsContainerEl.classList.remove('hidden');
        clearRetryStatus();

    } finally {
        loadingEl.style.display = 'none';
        generateBtn.disabled = false;
    }
}

generateBtn.addEventListener('click', generateTestCases);