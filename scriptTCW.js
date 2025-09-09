
const userStoryEl = document.getElementById('userStory');
const acceptanceCriteriaEl = document.getElementById('acceptanceCriteria');
const generateBtn = document.getElementById('generateBtn');
const loadingEl = document.getElementById('loading');
const resultsEl = document.getElementById('results');
const resultsContainerEl = document.getElementById('resultsContainer');
const messageBox = document.getElementById('messageBox');

// Display a custom message box instead of an alert
function showMessage(text, duration = 3000) {
    messageBox.textContent = text;
    messageBox.classList.add('show');
    setTimeout(() => {
        messageBox.classList.remove('show');
    }, duration);
}

// This is the new function that will make the secure API call
async function callGeminiApi(prompt) {
    // You MUST update this URL with your actual Netlify site name
    const netlifyFunctionUrl = 'https://velvety-mermaid-9eae77.netlify.app/.netlify/functions/generate';

    try {
        const response = await fetch(netlifyFunctionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: prompt })
        });

        if (!response.ok) {
            // If the server returns an error, we'll parse it here
            const errorData = await response.json();
            throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.error}`);
        }

        const data = await response.json();
        return data.text; // The Netlify Function returns the text in a 'text' property

    } catch (error) {
        console.error("Error calling serverless function:", error);
        throw new Error("Failed to generate test cases. Check the console for details.");
    }
}

async function generateTestCases() {
    const userStory = userStoryEl.value.trim();
    const acceptanceCriteria = acceptanceCriteriaEl.value.trim();

    if (!userStory || !acceptanceCriteria) {
        showMessage('Please enter both a user story and acceptance criteria.', 5000);
        return;
    }

    loadingEl.style.display = 'block';
    generateBtn.disabled = true;
    resultsContainerEl.classList.add('hidden');

    const systemPrompt = "You are an experienced software tester. You will receive a user story and its acceptance criteria. Your task is to generate a comprehensive set of test cases in Gherkin syntax (Given, When, Then). Ensure you cover both positive scenarios (happy paths) and negative or edge-case scenarios.";

    const userQuery = `User Story:\n${userStory}\n\nAcceptance Criteria:\n${acceptanceCriteria}\n\nNote: The response should only contain the test cases in Gherkin syntax, without any additional preamble or explanation.`;

    // Combine the system prompt and user query to send to your Netlify function
    const fullPrompt = `${systemPrompt}\n\n${userQuery}`;

    try {
        const generatedText = await callGeminiApi(fullPrompt);

        resultsEl.textContent = generatedText || "No response generated. Please try again.";
        resultsContainerEl.classList.remove('hidden');

    } catch (error) {
        console.error("Error generating content:", error);
        showMessage(error.message, 5000);
        resultsEl.textContent = "An error occurred. Please try again later.";
        resultsContainerEl.classList.remove('hidden');

    } finally {
        loadingEl.style.display = 'none';
        generateBtn.disabled = false;
    }
}

generateBtn.addEventListener('click', generateTestCases);