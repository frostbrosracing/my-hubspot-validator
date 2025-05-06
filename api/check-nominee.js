// File: api/check-nominee.js

export default async function handler(req, res) {
  // Check if the method is POST
  if (req.method === 'POST') {
    try {
      const { email } = req.body;  // Extract the email from the request body

      // Perform your nominee eligibility check based on the email here
      // Example: check if the email is in your list and eligible
      const isEligible = await checkNomineeEligibility(email); // Replace with your logic

      if (isEligible) {
        return res.status(200).json({ valid: true }); // Send valid response
      } else {
        return res.status(200).json({ valid: false }); // Send invalid response
      }
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ error: 'Internal Server Error' }); // Handle server errors
    }
  } else {
    // If the method is not POST, respond with 405 Method Not Allowed
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}

// Example of a function to check eligibility
async function checkNomineeEligibility(email) {
  // Perform your logic here to check the eligibility
  // For example, querying the database, checking against a list, etc.
  return true; // Assuming true for this example
}
