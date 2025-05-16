import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';

async function automateChatbot() {
    // Set up Chrome options
    const options = new chrome.Options();
    // options.addArguments('--headless'); // Uncomment to run in headless mode

    // Initialize the WebDriver
    const driver: WebDriver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        // Navigate to the application
        await driver.get('http://localhost:3000');

        // Wait for the chat interface to load
        await driver.wait(until.elementLocated(By.css('input[placeholder="Ask a health-related question..."]')), 10000);

        // Find the input field and send a message
        const inputField = await driver.findElement(By.css('input[placeholder="Ask a health-related question..."]'));
        await inputField.sendKeys('Hello, I need help with my health concerns');

        // Find and click the send button
        const sendButton = await driver.findElement(By.css('button.bg-green-500'));
        await sendButton.click();

        // Wait for the response (either the message or the loading indicator)
        await driver.wait(until.elementLocated(By.css('.bg-gray-800.text-white')), 10000);

        // Wait a bit for the response to load
        await driver.sleep(2000);

        // Get all messages
        const messages = await driver.findElements(By.css('.bg-gray-800.text-white'));
        const lastMessage = messages[messages.length - 1];
        const response = await lastMessage.getText();
        console.log('Bot response:', response);

        // Add a small delay to see the response
        await driver.sleep(2000);

    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        // Close the browser
        await driver.quit();
    }
}

// Run the automation
automateChatbot().catch(console.error); 