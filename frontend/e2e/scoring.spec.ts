import { test, expect } from '@playwright/test';

test.describe('Match Scoring', () => {
  test('should allow score entry and update display', async ({ page }) => {
    // Assume a tournament with ID 1 exists and has matches
    // Adjust the URL based on your actual routing
    await page.goto('/tournaments/1');

    // Find the first match card (adjust selector if needed)
    const matchCard = page.locator('.MuiCard-root').first(); // Crude selector, refine if possible
    
    // Find player names within this specific match card to ensure context
    const player1Name = await matchCard.locator('text=/Player 1 Name/').textContent(); // Replace with actual selector/text
    const player2Name = await matchCard.locator('text=/Player 2 Name/').textContent(); // Replace with actual selector/text
    
    // Find score displays within the match card
    const scoreDisplayP1 = matchCard.locator('h3').nth(0); // Assuming first H3 is P1 score
    const scoreDisplayP2 = matchCard.locator('h3').nth(1); // Assuming second H3 is P2 score

    // Initial check
    await expect(scoreDisplayP1).toHaveText('0');
    await expect(scoreDisplayP2).toHaveText('0');

    // --- Test Add Point Button --- 
    // const addPointButtonP1 = matchCard.locator('button:has-text("Add Point")').nth(0);
    // await addPointButtonP1.click();
    // await expect(scoreDisplayP1).toHaveText('1'); // This depends on component updating without full page reload

    // --- Test Direct Score Input --- 
    // Click score to enable input
    await scoreDisplayP1.click();
    const inputP1 = matchCard.locator('input[type="number"]').nth(0);
    await inputP1.fill('5');
    await inputP1.press('Enter'); // Or blur: await page.locator('body').click(); 
    
    // Check if score updated after Enter/Blur
    await expect(scoreDisplayP1).toHaveText('5');

    // Click P2 score
    await scoreDisplayP2.click();
    const inputP2 = matchCard.locator('input[type="number"]').nth(0); // It should be the first one again after P1 input disappears
    await inputP2.fill('11');
    await inputP2.press('Enter');
    await expect(scoreDisplayP2).toHaveText('11');

    // --- Test Set Completion (Example) ---
    // Add more points to P2 to win the set (11-5)
    await scoreDisplayP2.click();
    const inputP2Again = matchCard.locator('input[type="number"]').nth(0);
    await inputP2Again.fill('11');
    await inputP2Again.press('Enter'); // Set should complete

    // After set completion, scores should reset to 0 for the next set
    // Use waitFor to handle potential delay in state update/re-render
    await expect(scoreDisplayP1).toHaveText('0'); 
    await expect(scoreDisplayP2).toHaveText('0');
    
    // Check if the completed set appears in the table
    const completedSetsTable = matchCard.locator('table');
    await expect(completedSetsTable).toBeVisible();
    // Check for the specific scores in the first row (adjust selectors)
    const firstRow = completedSetsTable.locator('tbody tr').first();
    await expect(firstRow.locator('td').nth(1)).toHaveText('5'); // P1 Score in completed set
    await expect(firstRow.locator('td').nth(2)).toHaveText('11'); // P2 Score
    await expect(firstRow.locator('td').nth(3)).toContainText(player2Name!); // Winner name
  });
}); 